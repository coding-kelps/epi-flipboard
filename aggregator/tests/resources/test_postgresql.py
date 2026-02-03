from unittest.mock import MagicMock, patch

import dagster as dg

from epiflipboard_aggregator.resources import (
  PostgreSQLConfig,
  PostgreSQLResource,
)


def make_config(**overrides):
    defaults = dict(
        username="test_user",
        password="test_password",
        host="localhost",
        port=5432,
        db_name="test_db",
    )
    defaults.update(overrides)
    return PostgreSQLConfig(**defaults)


def test_postgresql_config_defaults():
    config = PostgreSQLConfig(
        username="user",
        password="pass",
        host="localhost",
        db_name="db",
    )

    assert config.username == "user"
    assert config.password == "pass"
    assert config.host == "localhost"
    assert config.db_name == "db"
    assert config.port == 5432


def test_postgresql_resource_initialization():
    config = make_config()
    resource = PostgreSQLResource(config=config)

    assert isinstance(resource, dg.ConfigurableResource)
    assert resource.config == config


@patch("psycopg.connect")
def test_get_connection_calls_psycopg_connect_with_correct_conninfo(
    mock_connect,
):
    mock_connection = MagicMock()
    mock_connect.return_value = mock_connection

    config = make_config(
        username="alice",
        password="secret",
        host="db.example.com",
        port=6543,
        db_name="analytics",
    )

    resource = PostgreSQLResource(config=config)
    conn = resource.get_connection()

    expected_conninfo = (
        "postgresql://alice:secret@db.example.com:6543/analytics"
    )

    mock_connect.assert_called_once_with(conninfo=expected_conninfo)
    assert conn is mock_connection


@patch("psycopg.connect")
def test_get_connection_uses_default_port_when_not_provided(
    mock_connect,
):
    mock_connect.return_value = MagicMock()

    config = PostgreSQLConfig(
        username="user",
        password="pass",
        host="localhost",
        db_name="db",
    )

    resource = PostgreSQLResource(config=config)
    resource.get_connection()

    expected_conninfo = (
        "postgresql://user:pass@localhost:5432/db"
    )

    mock_connect.assert_called_once_with(conninfo=expected_conninfo)
