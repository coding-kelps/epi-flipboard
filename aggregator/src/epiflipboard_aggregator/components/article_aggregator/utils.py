from datetime import datetime, timezone
from dateutil import parser as date_parser
from feedparser import FeedParserDict


def parse_datetime(value: str) -> datetime | None:
	if not value:
		return None
	try:
		return date_parser.parse(value).astimezone(timezone.utc)
	except Exception:
		return None


def extract_image(entry: FeedParserDict) -> str | None:
	if 'media_content' in entry:
		return entry.media_content[0].get('url')
	if 'links' in entry:
		for link in entry.links:
			if link.get('type', '').startswith('image'):
				return link.get('href')
	return None
