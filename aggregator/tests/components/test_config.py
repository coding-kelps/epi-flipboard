import os
import tempfile
import dagster as dg
from epiflipboard_aggregator.components.article_aggregator.config import (
    resolve_maybe_file,
    resolve_sources,
    SourceConfig,
    SourceProperties,
)

def test_resolve_maybe_file_string():
    assert resolve_maybe_file(None, "plain_string") == "plain_string"

def test_resolve_maybe_file_path():
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
        f.write("secret_content")
        f_path = f.name
    
    try:
        resolved = resolve_maybe_file(None, f"file://{f_path}")
        assert resolved == "secret_content"
    finally:
        os.remove(f_path)

def test_resolve_sources():
    configs = [
        SourceConfig(name="Source1", opml_url="http://url1"),
        SourceConfig(name="Source2", opml_url="http://url2"),
    ]
    
    resolved = resolve_sources(None, configs)
    
    assert len(resolved) == 2
    assert "Source1" in resolved
    assert resolved["Source1"] == SourceProperties(opml_url="http://url1")
    assert "Source2" in resolved
