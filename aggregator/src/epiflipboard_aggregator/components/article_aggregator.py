import dagster as dg
import feedparser
import requests
from dagster import AssetExecutionContext
from datetime import datetime, timezone
from dateutil import parser as date_parser
from lxml import etree
from typing import List

from epiflipboard_aggregator.resources import PostgreSQLResource

def parse_datetime(value: str) -> datetime | None:
	if not value:
		return None
	try:
		return date_parser.parse(value).astimezone(timezone.utc)
	except Exception:
		return None

def extract_image(entry: feedparser.FeedParserDict) -> str | None:
  if "media_content" in entry:
    return entry.media_content[0].get("url")
  if "links" in entry:
    for link in entry.links:
      if link.get("type", "").startswith("image"):
        return link.get("href")
  return None

class ArticleAggregatorComponent(dg.Component, dg.Model, dg.Resolvable):
	"""Aggregator of articles from public RSS feed.

	Attributes:
			opml_urls (List[str]): A list of URLs pointing to OPML files to download articles from.
			max_article_per_feed (int): The maximum number of articles to download from each RSS feed.
	    table_name (str): The name of the created PostgreSQL table. Default is ``"article"``.
	    db_username (str): The username for the PostgreSQL authentication.
	    db_password (str): The password for the PostgreSQL authentication.
	    db_host (str): The host of the PostgreSQL database.
	    db_port (str): The opened port of the PostgreSQL database.
	    db_db (str): The name of the PostgreSQL database.
	"""

	opml_urls: List[str]
	max_article_per_feed: int = 5
	articles_table_name: str = 'articles'
	publishers_table_name: str = 'publishers'
	db_username: str
	db_password: str
	db_host: str
	db_port: str | int
	db_name: str

	@classmethod
	def get_spec(cls) -> dg.ComponentTypeSpec:
		return dg.ComponentTypeSpec(
			description=cls.__doc__,
			owners=['contact@kelps.org', 'guilhem.sante@kelps.org'],
			tags=['articles', 'rss', 'postgresql'],
		)

	def build_defs(self, context: dg.ComponentLoadContext) -> dg.Definitions:
		partitioning = dg.StaticPartitionsDefinition(self.opml_urls)

		@dg.asset(
			kinds={'python'},
			group_name='aggregation',
			code_version='0.2.0',
			description="""
        Loads articles to database from RSS sources.
      """,
			partitions_def=partitioning,
		)
		def aggregate_articles(
			context: AssetExecutionContext,
			postgresql: PostgreSQLResource,
		) -> dg.MaterializeResult:
			opml_url = context.partition_key

			try:
				response = requests.get(opml_url, timeout=15)
				response.raise_for_status()

				parser = etree.XMLParser(recover=True)
				opml = etree.fromstring(response.content, parser)
			except Exception:
				return dg.Failure(
					description="Failed to download OPML file from given URL"
				)

			feeds = {
        outline.attrib["title"]: outline.attrib["xmlUrl"]
        for outline in opml.findall(".//outline")
        if "xmlUrl" in outline.attrib
			}

			article_counter = {key: 0 for key in feeds}

			context.log.info(f"total rss feeds retrieved from OPML: {len(feeds)}")


			for feed_name, feed_url in feeds.items():
				context.log.info(f"retrieving articles from: {feed_name}")

				feed = feedparser.parse(feed_url)

				with postgresql.get_connection() as conn:
					with conn.cursor() as cur:
						cur.execute(
						  f"""
						  INSERT INTO {self.publishers_table_name} (
								name
						  )
						  VALUES (
						    %(name)s
						  )
						  ON CONFLICT (name)
							DO UPDATE SET name = EXCLUDED.name
							RETURNING publisher_id
						  """,
						  {
						    "name": feed_name,
						  }
						)
						publisher_id = cur.fetchone()[0]

						articles = []

						for entry in feed.entries[:self.max_article_per_feed]:
							title = entry.get("title")
							original_url = entry.get("link")

							if not title or not original_url:
								continue
							
							authors = [a.get("name") for a in entry.get("authors", [])]
							description = (
								entry.get("summary") or
								entry.get("description")
							)
							published_at = parse_datetime(
								entry.get("published") or entry.get("updated")
							)
							image_url = extract_image(entry)

							articles.append((title, authors, description, publisher_id, published_at, original_url, image_url))

						cur.executemany(
						  f"""
						  INSERT INTO {self.articles_table_name} (
								title,
						    authors,
						    description,
								publisher_id,
						    published_at,
						    original_url,
						    image_url
						  )
						  VALUES (
						    %s,
						    %s,
						    %s,
						    %s,
						    %s,
						    %s,
						    %s
						  )
						  ON CONFLICT (original_url) DO NOTHING
						  """,
							articles,
						)

					article_counter[feed_name] = len(articles)

					conn.commit()
			
			return dg.MaterializeResult(
				metadata={
					"sources": article_counter,
					"total": sum([v for _, v in article_counter.items()]),
				},
			)

		return dg.Definitions(
			assets=[
				aggregate_articles,
			],
			resources={
				'postgresql': PostgreSQLResource(
					username=self.db_username,
					password=self.db_password,
					host=self.db_host,
					port=str(self.db_port),
					db_name=self.db_name,
				),
			},
		)
