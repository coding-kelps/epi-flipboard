import dagster as dg
import psycopg
from pydantic import Field


class PostgreSQLConfig(dg.Config):
	username: str = Field(
		description='The username for the PostgreSQL authentication.',
	)
	password: str = Field(
		description='The password for the PostgreSQL authentication.',
	)
	host: str = Field(
		description='The address of the postgreSQL server.',
	)
	port: int = Field(
		default=5432,
		description='The connecting port of the postgreSQL server.',
	)
	db_name: str = Field(
		description='The name of the database to connect to within the postgreSQL server.',
	)


class PostgreSQLResource(dg.ConfigurableResource):
	"""
	A Dagster resource wrapper for interacting with a PostgreSQL database.
	"""

	config: PostgreSQLConfig = Field(
		description=(
			"""Parameters to set up connection to a PostgreSQL database.
			"""
		),
	)

	def get_connection(self) -> psycopg.Connection:
		return psycopg.connect(
			conninfo=f'postgresql://{self.config.username}:{self.config.password}@{self.config.host}:{self.config.port}/{self.config.db_name}',
		)
