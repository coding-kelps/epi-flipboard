import dagster as dg
import numpy as np
from sentence_transformers import SentenceTransformer
from pydantic import Field
from typing import List


class SentenceTransformerConfig(dg.Config):
	model_name: str = Field(
		description='Name of a model from the Hugging Face Hub.',
	)


class SentenceTransformerResource(dg.ConfigurableResource):
	"""
	A Dagster resource for generating embeddings using HuggingFace sentence-transformers.
	"""

	config: SentenceTransformerConfig = Field(
		description=(
			"""Parameters to set up a text-to-embedding model.
      """
		),
	)

	def setup_for_execution(self, context) -> None:
		"""Initialize the model when the resource is used."""
		self._model = SentenceTransformer(
			self.config.model_name,
			device='cpu',
		)

	def get_sentence_embedding_dimension(self) -> int | None:
		"""Returns the number of dimensions in the output of SentenceTransformer.encode."""
		return self._model.get_sentence_embedding_dimension()

	def encode(self, documents: List[str], batch_size: int = 32) -> np.ndarray:
		"""
		Generate embeddings for a list of documents.

		Args:
		  documents: List of text strings to encode
		  batch_size: Batch size for encoding

		Returns:
		  numpy array of shape (n_documents, embedding_dim)
		"""
		embeddings = self._model.encode(
			documents, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True
		)

		return embeddings
