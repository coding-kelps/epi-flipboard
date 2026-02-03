import dagster as dg
import os
from unittest import mock

def test_definitions_load():
    env_vars = {
        "S3_ACCESS_KEY_ID": "test",
        "S3_ACCESS_SECRET_KEY": "test",
        "POSTGRES_USER": "test",
        "POSTGRES_PASSWORD": "test",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "test",
        "QDRANT_HOST": "localhost",
        "QDRANT_PORT": "6333",
        "OPENAI_API_KEY": "test"
    }
    
    with mock.patch.dict(os.environ, env_vars):
        from epiflipboard_aggregator.definitions import defs
        assert isinstance(defs, dg.Definitions)
