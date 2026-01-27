import dagster as dg
import feedparser
import html
import numpy as np
import pandas as pd
import re
import requests
import uuid
from dagster_aws.s3 import S3PickleIOManager
from dagster_openai import OpenAIResource
from dagster_qdrant import QdrantResource
from lxml import etree
from pydantic import Field
from qdrant_client.models import VectorParams, Distance, PointStruct, QueryRequest
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict

from epiflipboard_aggregator.resources import PostgreSQLResource, SentenceTransformerResource
from epiflipboard_aggregator.components.article_aggregator.config import (
	S3IOManagerConfig,
	Sources,
	PostgreSQLConfig,
	QdrantConfig,
	SentenceTransformerConfig,
	OpenAIConfig,
)
from epiflipboard_aggregator.components.article_aggregator.utils import (
	parse_datetime,
	extract_image,
)


class ArticleAggregatorComponent(dg.Component, dg.Model, dg.Resolvable):
	"""Aggregator of articles from public RSS feed."""

	automation_cron: str | None = Field(
		description='The cron defining the component execution automation.',
		default=None,
	)
	s3_io_manager: S3IOManagerConfig = Field(
		description='Configuration of the S3 I/O Manager',
	)
	sources: Sources = Field(
		description='List of RSS feed sources.',
	)
	max_article_per_feed: int = Field(
		default=5,
		description='Maximum number of article to fetch by RSS feed.',
	)
	article_tag_similarity_threshold: float = Field(
		default=0.90,
		description="""
			The maximum computed cosine similarity score that a generated
			article tag should have to any other tag to be recorded.
		""",
	)
	postgresql: PostgreSQLConfig = Field(
		description='Configuration of the PostgreSQL client.',
	)
	openai: OpenAIConfig = Field(
		description='Configuration of the OpenAI client.',
	)
	sentence_transformer: SentenceTransformerConfig = Field(
		description='Configuration of the text-to-embedding model.',
	)
	qdrant: QdrantConfig = Field(
		description='Configuration of the Qdrant client.',
	)

	@classmethod
	def get_spec(cls) -> dg.ComponentTypeSpec:
		return dg.ComponentTypeSpec(
			description=cls.__doc__,
			owners=['contact@kelps.org', 'guilhem.sante@kelps.org'],
			tags=['articles', 'rss'],
		)

	def build_defs(self, context: dg.ComponentLoadContext) -> dg.Definitions:
		@dg.asset(
			kinds={'Python'},
			group_name='EpiFlipBoard',
			code_version='0.2.0',
			description="""
        Dictionnary of raw RSS feed entries by source.
			""",
			tags={
				'stage': 'fetching',
			},
			metadata={
				'schema': {
					'type': 'mapping',
					'key_schema': {
						'type': 'string',
						'description': 'Dynamically assigned from the RSS feed name',
					},
					'value_schema': {
						'type': 'array',
						'item_schema': {
							'id': 'Entry identifier (guid/id)',
							'title': 'Entry title',
							'link': 'Canonical entry URL',
							'published': 'Publication timestamp',
							'updated': 'Last update timestamp',
							'summary': 'Short text summary',
							'media_content': {
								'type': 'array',
								'item_schema': {
									'url': 'associated media content URL',
								},
							},
						},
					},
				},
				'metadata': {
					'nb_entries': 'The number of fetched RSS feed entries',
					'nb_rss_feeds': 'The number of unique RSS feed used as sources',
					'entries_rss_feeds_dist': 'A dictionnary couting the number of RSS feed entries fetched by feed',
				},
			},
		)
		def raw_rss_feed_entries(
			context: dg.AssetExecutionContext,
		) -> Dict[str, List[feedparser.FeedParserDict]]:
			for name, source in self.sources.items():
				context.log.info(
					f'download partition corresponding OPML file from URL: {source.opml_url}'
				)
				try:
					response = requests.get(source.opml_url, timeout=15)
					response.raise_for_status()

					parser = etree.XMLParser(recover=True)
					opml = etree.fromstring(response.content, parser)
				except Exception:
					return dg.Failure(
						description=f'Failed to download source {name} OPML file from given URL: {source.opml_url}'
					)

				# Parse OPML file to retrieve listed RSS feeds.
				feeds = {
					outline.attrib['title']: outline.attrib['xmlUrl']
					for outline in opml.findall('.//outline')
					if 'xmlUrl' in outline.attrib
				}

				context.log.info(f'total rss feeds retrieved from OPML: {len(feeds)}')

				feeds_entries = {}
				entries_dist = {key: 0 for key in feeds}

				for feed_name, feed_url in feeds.items():
					context.log.info(f'retrieving articles from: {feed_name}')

					feed = feedparser.parse(feed_url)

					for entry in feed.entries[: self.max_article_per_feed]:
						if feed_name in feeds_entries:
							feeds_entries[feed_name].append(entry)
						else:
							feeds_entries[feed_name] = [entry]

						entries_dist[feed_name] += 1

			return dg.MaterializeResult(
				value=feeds_entries,
				metadata={
					'nb_entries': sum([v for _, v in entries_dist.items()]),
					'nb_rss_feeds': len(entries_dist),
					'entries_rss_feeds_dist': entries_dist,
				},
			)

		@dg.asset(
			kinds={'Pandas'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Formated Pandas DataFrame of parsed articles.
			""",
			tags={
				'stage': 'fetching',
			},
			metadata={
				'columns': {
					'title': 'Title of the article',
					'authors': 'List of article authors name',
					'description': 'Text description of the article',
					'publisher': 'Article publisher name',
					'published_at': 'Timestamp of the article publication',
					'original_url': 'Canonical URL of the article',
					'image_url': 'Optional URL of the associated article image',
				},
				'metadata': {
					'nb_articles': 'Number of parsed article in the asset',
					'nb_parsing_fail': 'Number of parsing fails that excluded RSS entries from the asset',
					'failed_parsing_dist': 'Dictionnary of parsing fail distribution by RSS feed',
				},
			},
		)
		def parsed_articles(
			context: dg.AssetExecutionContext,
			raw_rss_feed_entries: Dict[str, List[feedparser.FeedParserDict]],
		) -> pd.DataFrame:
			articles = []

			failed_parsing_dist = {
				key: 0 for key in raw_rss_feed_entries.keys()
			}

			for feed_name, feed_entries in raw_rss_feed_entries.items():
				for entry in feed_entries:
					title = entry.get('title')
					original_url = entry.get('link')

					if not title or not original_url:
						context.log.warning(f'failed to parse article from source: {feed_name}')
						continue

					authors = [a.get('name') for a in entry.get('authors', [])]
					description = entry.get('summary') or entry.get('description')

					if description:
						description = html.unescape(re.sub(r'<p>|</p>', '', description))

					published_at = parse_datetime(
						entry.get('published') or entry.get('updated')
					)
					image_url = extract_image(entry)

					articles.append(
						{
							'title': title,
							'authors': authors,
							'description': description,
							'publisher': feed_name,
							'published_at': published_at,
							'original_url': original_url,
							'image_url': image_url,
						}
					)

			return dg.MaterializeResult(
				value=pd.DataFrame(articles),
				metadata={
					'nb_articles': len(articles),
					'nb_parsing_fail': sum([v for _, v in failed_parsing_dist.items()]),
					'failed_parsing_dist': failed_parsing_dist,
				},
			)

		@dg.asset(
			kinds={'PostgreSQL'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Database Table of article publishers.
			""",
			tags={
				'stage': 'article_loading',
			},
			metadata={
				'columns': {
					'publisher_id': 'Unique identifier for each publisher',
					'name': 'Name advertised by the publisher (must be unique)',
					'display_name': 'Optional human-readable display name for the publisher (must be unique)',
					'image_url': 'Optional URL to the publisher logo',
				},
				'primary_key': ['publisher_id'],
				'metadata': {
					'row_count': 'The number of rows in the table',
				},
			},
		)
		def publishers(
			context: dg.AssetExecutionContext,
			postgresql: PostgreSQLResource,
			parsed_articles: pd.DataFrame,
		):
			publisher_df = parsed_articles[['publisher']]

			data = list(publisher_df.itertuples(index=False, name=None))

			with postgresql.get_connection() as conn:
				with conn.cursor() as cur:
					cur.execute(f"""
						CREATE TABLE IF NOT EXISTS publishers (
						  publisher_id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
						  name TEXT NOT NULL UNIQUE,
						  display_name TEXT UNIQUE,
						  image_url TEXT
						);
								 
						COMMENT ON TABLE publishers IS 'Stores article publishers information for article sourcing purposes';

						COMMENT ON COLUMN publishers.publisher_id IS 'Primary key: unique identifier for each publisher';
						COMMENT ON COLUMN publishers.name IS 'Name advertised by the publisher (must be unique)';
						COMMENT ON COLUMN publishers.display_name IS 'Optional human-readable display name for the publisher (must be unique)';
						COMMENT ON COLUMN publishers.image_url IS 'Optional URL to the publisher logo';
					""")

					cur.executemany(
						f"""
					  INSERT INTO publishers (
							name
					  )
					  VALUES (
					    %s
					  )
					  ON CONFLICT (name)
						DO UPDATE SET name = EXCLUDED.name
						RETURNING publisher_id
					  """,
						data,
					)

					cur.execute(f'SELECT COUNT(*) FROM publishers')
					row_count = cur.fetchone()[0]

				conn.commit()

			return dg.MaterializeResult(
				metadata={
					'row_count': row_count,
				},
			)

		@dg.asset(
			kinds={'PostgreSQL'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        PostgreSQL table of articles.
			""",
			tags={
				'stage': 'article_loading',
			},
			metadata={
				'columns': {
					'article_id': 'Unique identifier for each article',
					'title': 'Title of the article',
					'description': 'Optional description of the article',
					'authors': 'Optional list of authors of the article',
					'original_url': 'URL of the article (must be unique)',
					'image_url': 'Optional URL to the article image',
					'publisher_id': 'Identifier of the article publisher',
					'published_at': 'Timestamp of the article publication',
					'created_at': 'Timestamp of the article registration to the table',
				},
				'primary_key': ['article_id'],
				'metadata': {
					'row_count': 'The number of rows in the table',
				},
			},
			deps=[publishers],
		)
		def articles(
			context: dg.AssetExecutionContext,
			postgresql: PostgreSQLResource,
			parsed_articles: pd.DataFrame,
		):
			articles_df = parsed_articles[
				[
					'title',
					'description',
					'authors',
					'original_url',
					'image_url',
					'publisher',
					'published_at',
				]
			]

			with postgresql.get_connection() as conn:
				with conn.cursor() as cur:
					cur.execute(f'SELECT name, publisher_id FROM publishers')
					publisher_map = dict(cur.fetchall())

					articles_df['publisher_id'] = articles_df['publisher'].map(publisher_map)
					articles_df = articles_df.drop(columns=['publisher'])

					if articles_df['publisher_id'].isna().any():
						raise dg.Failure(description=f'Unknown publisher(s) found')

					cur.execute(
						f"""
						CREATE TABLE IF NOT EXISTS articles (
						  article_id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
						  title TEXT NOT NULL,
							description TEXT,
							authors TEXT[],
							original_url TEXT UNIQUE,
						  image_url TEXT,
							publisher_id BIGINT NOT NULL REFERENCES publishers(publisher_id) ON DELETE CASCADE,
							published_at TIMESTAMPTZ NOT NULL,
							created_at TIMESTAMPTZ NOT NULL DEFAULT now()
						);
								 
						COMMENT ON TABLE articles IS 'Stores articles and related informations';

						COMMENT ON COLUMN articles.article_id IS 'Primary key: unique identifier for each article';
						COMMENT ON COLUMN articles.title IS 'Title of the article';
						COMMENT ON COLUMN articles.description  IS 'Optional description of the article';
						COMMENT ON COLUMN articles.authors IS 'Optional list of authors of the article';
						COMMENT ON COLUMN articles.original_url IS 'URL of the article (must be unique)';
						COMMENT ON COLUMN articles.image_url IS 'Optional URL to the article image';
						COMMENT ON COLUMN articles.publisher_id IS 'Identifier of the article publisher';
						COMMENT ON COLUMN articles.published_at IS 'Timestamp of the article publication';
						COMMENT ON COLUMN articles.created_at IS 'Timestamp of the article registration to the table';
					"""
					)

					data = list(articles_df.itertuples(index=False, name=None))

					cur.executemany(
						f"""
					  INSERT INTO articles (
							title,
					    description,
					    authors,
					    original_url,
					    image_url,
					    published_at,
							publisher_id
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
						data,
					)

					cur.execute(f'SELECT COUNT(*) FROM articles')
					row_count = cur.fetchone()[0]

				conn.commit()

			return dg.MaterializeResult(
				metadata={
					'row_count': row_count,
				},
			)

		@dg.asset(
			kinds={'Pandas'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Pandas DataFrame of LLM-generated tags from articles.
			""",
			tags={
				'stage': 'tagging',
			},
			metadata={
				'columns': {
					'tag_name': 'name of the article tag',
					'article_original_url': 'URL of the article (must be unique)',
				},
				'metadata': {
					'nb_generated_tags': 'The number of generated tags in the asset',
				},
			},
		)
		def generated_tags(
			context: dg.AssetExecutionContext,
			openai: OpenAIResource,
			parsed_articles: pd.DataFrame,
		) -> pd.DataFrame:
			articles_df = parsed_articles[['title', 'description', 'original_url']]

			generated_tags = []

			system_prompt = (
				'You are an assistant that generates concise topical tags for news articles. '
				'Return exactly three short tags (1–3 words each) in English, in lowercase, and separated by commas. '
				'Use general, broad topics rather than specific variations. '
				'Avoid redundant or overly specific tags. '
				'Do not include any extra text.'
			)

			with openai.get_client(context) as client:
				for idx, row in articles_df.iterrows():
					if idx % 10 == 0:
						context.log.info(f'tag generation {idx}/{len(articles_df)}')

					try:
						user_prompt = (
							f'Article title:\n{row["title"]}\n\n'
							f'Article description:\n{row["description"]}'
						)

						response = client.chat.completions.create(
							model=self.openai.model_name,
							messages=[
								{'role': 'system', 'content': system_prompt},
								{'role': 'user', 'content': user_prompt},
							],
						)

						raw_tags = response.choices[0].message.content.strip()
						tags = [t.strip() for t in raw_tags.split(',') if t.strip()]
						generated_tags.append(tags)

					except Exception as e:
						context.log.warning(
							f'failed to generate tags for article (id: {row["original_url"]}): {e}'
						)
						generated_tags.append([])
						continue

			articles_df['tags'] = generated_tags
			tags_df = (
				articles_df.explode('tags')
				.rename(columns={'tags': 'tag_name', 'original_url': 'article_original_url'})
				.drop(columns=['title', 'description'])
			)

			return dg.MaterializeResult(
				value=tags_df,
				metadata={
					'nb_generated_tags': len(generated_tags),
				},
			)

		@dg.asset(
			kinds={'Pandas'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Pandas DataFrame of LLM-generated article tags with embedding vectors.
			""",
			tags={
				'stage': 'tagging',
			},
			metadata={
				'columns': {
					'tag_name': 'Name of the article tag',
					'tag_embedding': 'Model produced embedding of the tag name',
					'article_original_url': 'URL of the article used to generate tag',
				},
				'metadata': {},
			},
		)
		def embedded_generated_tags(
			context: dg.AssetExecutionContext,
			sentence_transformer: SentenceTransformerResource,
			generated_tags: pd.DataFrame,
		) -> pd.DataFrame:
			tag_df = generated_tags

			tag_embeddings = []

			for _, row in tag_df.iterrows():
				embedding = sentence_transformer.encode(row['tag_name'])

				tag_embeddings.append(embedding)

			tag_df['tag_embedding'] = tag_embeddings

			return dg.MaterializeResult(
				value=tag_df,
				metadata={},
			)

		@dg.asset(
			kinds={'Pandas'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Pandas DataFrame of article tags where similar tags were merged.
			""",
			tags={
				'stage': 'tagging',
			},
			metadata={
				'columns': {
					'tag_name': 'Name of the article tag',
					'tag_embedding': 'Model produced embedding of the tag name',
					'articles_original_url': 'list of related articles URL',
				},
				'metadata': {
					'nb_merged_tag': 'Number of tag merging made',
				},
			},
		)
		def deduplicated_generated_tags(
			context: dg.AssetExecutionContext,
			embedded_generated_tags: pd.DataFrame,
		) -> pd.DataFrame:
			tag_df = embedded_generated_tags
			tag_embeddings = np.vstack(tag_df['tag_embedding'].values)
			sim_matrix = cosine_similarity(tag_embeddings)

			n = len(tag_df)

			visited = set()
			clusters = []

			for i in range(n):
				if i in visited:
					continue

				stack = [i]
				cluster = set()

				while stack:
					j = stack.pop()
					if j in visited:
						continue
					visited.add(j)
					cluster.add(j)

					neighbors = np.where(sim_matrix[j] > self.article_tag_similarity_threshold)[0]
					for k in neighbors:
						if k not in visited:
							stack.append(k)

				clusters.append(cluster)

			merged_rows = []

			for cluster in clusters:
				cluster_df = tag_df.iloc[list(cluster)]

				merged_rows.append(
					{
						'tag_name': cluster_df.iloc[0]['tag_name'],
						'tag_embedding': cluster_df.iloc[0]['tag_embedding'],
						'articles_original_url': cluster_df['article_original_url'].tolist(),
					}
				)

			merged_df = pd.DataFrame(merged_rows)

			return dg.MaterializeResult(
				value=merged_df,
				metadata={
					'nb_merged_tag': (n - len(merged_df)),
				},
			)

		@dg.asset(
			kinds={'Pandas'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Pandas DataFrame of article tags coupled with found duplicate
        within the tag vector database collection.
			""",
			tags={
				'stage': 'tagging',
			},
			metadata={
				'columns': {
					'tag_name': 'Name of the article tag',
					'tag_embedding': 'Model produced embedding of the tag name',
					'articles_original_url': 'list of related articles URL',
					'duplicate_tag': 'Optional tag name of a similar tag from the vector database if found',
				},
				'metadata': {
					'nb_duplicate_tag': 'Number of duplicate tag found in vector database',
				},
			},
		)
		def generated_tags_with_database_duplicate(
			context: dg.AssetExecutionContext,
			qdrant: QdrantResource,
			deduplicated_generated_tags: pd.DataFrame,
		) -> pd.DataFrame:
			tag_df = deduplicated_generated_tags

			with qdrant.get_client() as client:
				if not client.collection_exists('tag_embeddings'):
					tag_df['duplicate_tag'] = None

					return dg.MaterializeResult(
						value=tag_df,
						metadata={
							'nb_duplicate_tag': 0,
						},
					)
				else:
					duplicate_tags = []
					duplicate_tag_counter = 0

					result = client.query_batch_points(
						collection_name='tag_embeddings',
						requests=[
							QueryRequest(
								query=row['tag_embedding'],
								score_threshold=self.article_tag_similarity_threshold,
								limit=1,
								with_payload=True,
							)
							for _, row in tag_df.iterrows()
						],
					)

					duplicate_tags = [
						response.points[0].payload['tag_name'] if response.points else None
						for response in result
					]

					tag_df['duplicate_tag'] = duplicate_tags

					return dg.MaterializeResult(
						value=tag_df,
						metadata={
							'nb_duplicate_tag': duplicate_tag_counter,
						},
					)

		@dg.asset(
			kinds={'PostgreSQL'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        PostgreSQL table of article tags.
			""",
			tags={
				'stage': 'loading',
			},
			metadata={
				'columns': {
					'tag_id': 'Unique identifier for each article',
					'name': 'Name of the tag (must be unique)',
					'created_at': 'Timestamp of the article registration to the table',
				},
				'primary_key': ['tag_id'],
				'metadata': {
					'row_count': 'The number of rows in the table',
				},
			},
		)
		def tags(
			context: dg.AssetExecutionContext,
			postgresql: PostgreSQLResource,
			generated_tags_with_database_duplicate: pd.DataFrame,
		):
			tag_df = generated_tags_with_database_duplicate
			unique_tag_df = tag_df[tag_df['duplicate_tag'].isna()][['tag_name']]
			data = list(unique_tag_df.itertuples(index=False, name=None))

			with postgresql.get_connection() as conn:
				with conn.cursor() as cur:
					cur.execute(
						f"""
						CREATE TABLE IF NOT EXISTS tags (
						  tag_id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
						  name TEXT UNIQUE NOT NULL,
							created_at TIMESTAMPTZ NOT NULL DEFAULT now()
						);
								 
						COMMENT ON TABLE tags IS 'Stores articles tag for article categorization and search purposes';

						COMMENT ON COLUMN tags.tag_id IS 'Primary key: unique identifier for each article';
						COMMENT ON COLUMN tags.name IS 'Name of the tag (must be unique)';
						COMMENT ON COLUMN tags.created_at IS 'Timestamp of the article registration to the table';
					"""
					)

					cur.executemany(
						f"""
					  INSERT INTO tags (
							name
					  )
					  VALUES (
					    %s
					  )
					  ON CONFLICT (name) DO NOTHING
					  """,
						data,
					)

					cur.execute(f'SELECT COUNT(*) FROM tags')
					row_count = cur.fetchone()[0]

				conn.commit()

			return dg.MaterializeResult(
				metadata={
					'row_count': row_count,
				},
			)

		@dg.asset(
			kinds={'Qdrant'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        Qdrant collection of article tag embeddings.
        Used for semantic search for article tag duplication mitigation
			""",
			tags={
				'stage': 'tagging',
			},
			metadata={
				'payload': {
					'tag_name': 'Name of the tag',
				},
				'metadata': {
					'points_count': 'The number points in the collection',
				},
			},
		)
		def tag_embeddings(
			context: dg.AssetExecutionContext,
			qdrant: QdrantResource,
			sentence_transformer: SentenceTransformerResource,
			generated_tags_with_database_duplicate: pd.DataFrame,
		) -> dg.MaterializeResult:
			tag_df = generated_tags_with_database_duplicate
			unique_tag_df = tag_df[tag_df['duplicate_tag'].isna()][['tag_name', 'tag_embedding']]

			with qdrant.get_client() as client:
				if not client.collection_exists('tag_embeddings'):
					embedding_size = sentence_transformer.get_sentence_embedding_dimension()

					if not embedding_size:
						raise dg.Failure(
							description="""
								Cannot create Qdrant collection as sentence transformer model
								embedding size is unknown.
							""",
						)

					client.create_collection(
						collection_name='tag_embeddings',
						vectors_config=VectorParams(size=embedding_size, distance=Distance.COSINE),
						metadata={
							'description': 'Collection for article tag embeddings',
							'version': '1.0',
							'purpose': 'semantic search for article tag duplication mitigation',
						},
					)

				client.upload_points(
					collection_name='tag_embeddings',
					points=[
						PointStruct(
							id=uuid.uuid4(),
							vector=row['tag_embedding'],
							payload={
								'tag_name': row['tag_name'],
							},
						)
						for _, row in unique_tag_df.iterrows()
					],
				)

				points_count = client.get_collection('tag_embeddings').points_count

			return dg.MaterializeResult(
				metadata={
					'points_count': points_count,
				},
			)

		@dg.asset(
			kinds={'PostgreSQL'},
			group_name='EpiFlipBoard',
			code_version='0.1.0',
			description="""
        PostgreSQL table of article and tag relations.
			""",
			tags={
				'stage': 'tagging',
			},
			metadata={
				'columns': {
					'article_id': 'identifier of the article',
					'tag_id': 'identifier of the tag',
				},
				'primary_key': ['article_id', 'tag_id'],
				'metadata': {
					'row_count': 'The number of rows in the table',
				},
			},
			deps=[
				articles,
				tags,
			],
		)
		def article_tag(
			context: dg.AssetExecutionContext,
			postgresql: PostgreSQLResource,
			generated_tags_with_database_duplicate: pd.DataFrame,
		):
			article_tag_df = generated_tags_with_database_duplicate

			with postgresql.get_connection() as conn:
				with conn.cursor() as cur:
					cur.execute("""
						CREATE TABLE IF NOT EXISTS article_tag (
								article_id BIGINT NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
								tag_id BIGINT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
								PRIMARY KEY (article_id, tag_id)
						);
	
						COMMENT ON TABLE article_tag IS 'Stores article and tag relations';
						COMMENT ON COLUMN article_tag.article_id IS 'Primary key: identifier of the article';
						COMMENT ON COLUMN article_tag.tag_id IS 'Primary key: identifier of the tag';
					""")

					tag_names = article_tag_df['tag_name'].unique().tolist()
					cur.execute(
						"""
						SELECT name, tag_id
						FROM tags
						WHERE name = ANY(%s)
					""",
						(tag_names,),
					)
					tag_lookup = dict(cur.fetchall())

					all_urls = set()
					for urls in article_tag_df['articles_original_url']:
						all_urls.update(urls)

					cur.execute(
						"""
						SELECT original_url, article_id
						FROM articles
						WHERE original_url = ANY(%s)
					""",
						(list(all_urls),),
					)
					article_lookup = dict(cur.fetchall())

					data = []

					for _, row in article_tag_df.iterrows():
						tag_name = row['tag_name']
						tag_id = tag_lookup.get(tag_name)

						for original_url in row['articles_original_url']:
							article_id = article_lookup.get(original_url)

							if article_id and tag_id:
								data.append((article_id, tag_id))

					cur.executemany(
						"""
						INSERT INTO article_tag (
							article_id,
							tag_id
						)
						VALUES (
							%s,
							%s
						)
						ON CONFLICT DO NOTHING
						""",
						data,
					)

					cur.execute('SELECT COUNT(*) FROM article_tag')
					row_count = cur.fetchone()[0]

				conn.commit()

			return dg.MaterializeResult(
				metadata={
					'row_count': row_count,
				},
			)

		return dg.Definitions(
			assets=[
				raw_rss_feed_entries,
				parsed_articles,
				publishers,
				articles,
				generated_tags,
				embedded_generated_tags,
				deduplicated_generated_tags,
				generated_tags_with_database_duplicate,
				tags,
				tag_embeddings,
				article_tag,
			],
			resources={
				'io_manager': S3PickleIOManager(
					s3_resource=self.s3_io_manager.s3,
					s3_bucket=self.s3_io_manager.bucket,
					s3_prefix=self.s3_io_manager.prefix,
				),
				'postgresql': PostgreSQLResource(
					config=self.postgresql,
				),
				'openai': OpenAIResource(
					api_key=self.openai.api_key,
				),
				'sentence_transformer': SentenceTransformerResource(
					config=self.sentence_transformer,
				),
				'qdrant': QdrantResource(
					config=self.qdrant,
				),
			},
			schedules=[
				dg.ScheduleDefinition(
					job=dg.define_asset_job(
						name='epi_flipboard_ingestion',
						selection='*',
					),
					cron_schedule=self.automation_cron,
				)
			]
			if self.automation_cron
			else None,
		)
