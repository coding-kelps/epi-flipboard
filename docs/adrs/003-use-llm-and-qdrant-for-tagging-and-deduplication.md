# 3. Use LLM for Tagging and Qdrant for Deduplication

Date: 2026-02-10

## Status

Accepted

## Context

We are aggregating articles from numerous RSS feeds. This presents two main challenges:
1.  **Categorization**: Articles come with varying or missing tags, making it hard to organize them consistently.
2.  **Duplication**: The same story is often covered by multiple sources, leading to semantic duplicates that clutter the user feed.

## Decision

We have decided to implement a two-pronged strategy:
1.  **LLM-based Tagging**: Use Large Language Models (LLMs) to scan article content and generate standardized tags for categorization.
2.  **Vector Embeddings with Qdrant**: Use vector embeddings to represent articles semantically and **Qdrant** as the vector database to identify and mitigate semantic duplicates.

## Consequences

*   **Improved Content Organization**: Articles are consistently categorized regardless of their source's original tagging.
*   **Cleaner User Experience**: Users see fewer duplicate stories; "same story, different source" scenarios can be grouped or filtered.
*   **Semantic Search**: The architecture supports future semantic search capabilities.

## Technical Details

### Qdrant Selection

We chose **Qdrant** as our vector database.

*   **Ease of Integration**: Qdrant offers excellent client libraries and integration with the Python ecosystem.
*   **Minimal Infrastructure**: It has minimal infrastructural requirements (easy to run via Docker, low resource footprint) compared to some other vector stores.
*   **Performance**: Efficient handling of vector similarity search for our scale.

## Implementation Strategy

*   **Tagging**: Pass article summary/content to an LLM to generate a list of relevant tags from a controlled taxonomy or open tagging system.
*   **Deduplication**:
    1.  Generate an embedding vector for each incoming article.
    2.  Query Qdrant for existing vectors with high cosine similarity (representing "close meaning").
    3.  If a match is found above a certain threshold, mark as a duplicate or group with the existing article.
