import dagster as dg
from pydantic import Field
from typing import Annotated, Dict, List, NamedTuple
from dagster_aws.s3 import S3Resource
from dagster_qdrant import QdrantConfig as QdrantResourceConfig

from epiflipboard_aggregator.resources import (
	PostgreSQLConfig as PostgreSQLResourceConfig,
	SentenceTransformerConfig as SentenceTransformerResourceConfig,
)


def resolve_maybe_file(context: dg.ResolutionContext, raw: str) -> str:
	if raw.startswith('file://'):
		with open(raw[7:], 'r') as file:
			return file.read().rstrip()
	else:
		return raw


StringOrFile = Annotated[
	str,
	dg.Resolver(resolve_maybe_file, model_field_type=str),
]


class SourceConfig(dg.Config, dg.Resolvable):
	"""
	SourceConfig defines the Dagster component a RSS feed source
	config attribute definition interface.
	"""

	name: str = Field(
		description='Name of the RSS feed source',
	)
	opml_url: str = Field(
		description='URL to fetch the OPML file.',
	)


class SourceProperties(NamedTuple):
	"""
	SourceProperties is the internal component structure representing
	a RSS feed source.
	"""

	opml_url: str


def resolve_sources(context: dg.ResolutionContext, source_configs: List[SourceConfig]):
	sources = {}

	for source_config in source_configs:
		sources[source_config.name] = SourceProperties(
			opml_url=source_config.opml_url,
		)

	return sources


Sources = Annotated[
	Dict[str, SourceProperties], dg.Resolver(resolve_sources, model_field_type=List[SourceConfig])
]


class S3Config(S3Resource, dg.Resolvable):
	aws_access_key_id: StringOrFile | None = Field(
		description='Access Key ID to access bucket',
		default=None,
	)
	aws_secret_access_key: StringOrFile | None = Field(
		description='Access Key Secret to access bucket',
		default=None,
	)
	aws_session_token: StringOrFile | None = Field(
		description='Session token to access bucket',
		default=None,
	)


class S3IOManagerConfig(dg.Config, dg.Resolvable):
	"""
	S3Config defines the Dagster S3 I/O Manager configuration.
	"""

	bucket: str = Field(description='Name of the S3 bucket.')
	prefix: str = Field(
		description='Filepath prefix of the stored artifacts in the S3 buckets by the I/O Manager',
		default='dagster',
	)
	s3: S3Config = Field(
		description='Properties of the S3 bucket connection',
	)


class PostgreSQLConfig(PostgreSQLResourceConfig, dg.Resolvable):
	username: StringOrFile = Field(
		description="""
			The username for the PostgreSQL authentication. It can
			either be defined as a raw string or as a filepath prefixed by "file://" leading to
			the file containing the secret value.
		""",
	)
	password: StringOrFile = Field(
		description="""
			The password for the PostgreSQL authentication. It can
			either be defined as a raw string or as a filepath prefixed by "file://" leading to
			the file containing the secret value.
		""",
	)


class OpenAIConfig(dg.Config, dg.Resolvable):
	model_name: str = Field(description='OpenAI model name.')
	api_key: StringOrFile = Field(
		description="""
			OpenAI API token. It can either be defined as a raw string or
			as a filepath prefixed by "file://" leading to the file containing
			the secret value.
		"""
	)


class SentenceTransformerConfig(SentenceTransformerResourceConfig, dg.Resolvable):
	pass


class QdrantConfig(QdrantResourceConfig, dg.Resolvable):
	pass
