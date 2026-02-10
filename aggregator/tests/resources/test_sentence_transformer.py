import numpy as np
import pytest
from unittest.mock import MagicMock, patch

from epiflipboard_aggregator.resources import (
	SentenceTransformerConfig,
	SentenceTransformerResource,
)

# Well-known model with minimal size.
TESTING_MODEL = {
	'name': 'sentence-transformers/all-MiniLM-L6-v2',
	'output_size': 384,
}


@pytest.fixture
def mock_sentence_transformer():
	mock_model = MagicMock()
	mock_model.get_sentence_embedding_dimension.return_value = TESTING_MODEL.get('output_size')
	mock_model.encode.return_value = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
	return mock_model


def test_setup_for_execution_initializes_model(mock_sentence_transformer):
	config = SentenceTransformerConfig(model_name=TESTING_MODEL.get('name'))
	resource = SentenceTransformerResource(config=config)

	with patch(
		'epiflipboard_aggregator.resources.sentence_transformer.SentenceTransformer',
		return_value=mock_sentence_transformer,
	) as mock_constructor:
		resource.setup_for_execution(context=None)

		mock_constructor.assert_called_once_with(
			TESTING_MODEL.get('name'),
			device='cpu',
		)
		assert resource._model is mock_sentence_transformer


def test_get_sentence_embedding_dimension(mock_sentence_transformer):
	config = SentenceTransformerConfig(model_name=TESTING_MODEL.get('name'))
	resource = SentenceTransformerResource(config=config)
	resource._model = mock_sentence_transformer

	dim = resource.get_sentence_embedding_dimension()

	assert dim == TESTING_MODEL.get('output_size')
	mock_sentence_transformer.get_sentence_embedding_dimension.assert_called_once()


def test_encode_returns_numpy_array(mock_sentence_transformer):
	config = SentenceTransformerConfig(model_name=TESTING_MODEL.get('name'))
	resource = SentenceTransformerResource(config=config)
	resource._model = mock_sentence_transformer

	documents = ['hello world', 'unit tests']
	result = resource.encode(documents, batch_size=16)

	mock_sentence_transformer.encode.assert_called_once_with(
		documents,
		batch_size=16,
		show_progress_bar=False,
		convert_to_numpy=True,
	)

	assert isinstance(result, np.ndarray)
	assert result.shape == (2, 3)
