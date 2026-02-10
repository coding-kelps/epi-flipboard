# 2. Use Python and Dagster for Aggregation Pipeline

Date: 2026-02-10

## Status

Accepted

## Context

We required a robust solution for our aggregation pipeline to collect, process, and manage data from various sources. The pipeline needs to be scalable, maintainable, and capable of handling complex dependencies.

## Decision

We have decided to use **Python** as the primary language and **Dagster** as the orchestration tool for the aggregation pipeline.

## Consequences

*   **Rich Ecosystem**: Python offers the best ecosystem for data processing, scraping, and AI integration.
*   **Modern Orchestration**: Dagster provides a highly capable orchestration layer with strong typing and testability.
*   **Distributed Computing**: Dagster allows us to increase computing potential through distributed runners (e.g., K8s, Celery).
*   **Built-in Features**: We profit from Dagster's built-in features for asset management and observability.
*   **Persistence**: We leverage Dagster's I/O managers, specifically the **S3 IO manager**, for efficient data persistence and passing data between steps.

## Alternatives Considered

### Rust

We initially tried to implement the pipeline in **Rust**.

*   **Pros**: Performance.
*   **Cons**: Complexity in handling dynamic data pipelines and less mature ecosystem for this specific domain compared to Python.

**Reason for Rejection**: Python was chosen as the main technology because it is the industry standard for data pipelines and AI, offering superior library support and ease of use.

### Apache Airflow

We considered **Apache Airflow**, a well-established alternative.

*   **Pros**: Industry standard, huge community.
*   **Cons**: Can be harder to test locally, less emphasis on data assets compared to tasks.

**Reason for Rejection**: We chose Dagster to "level up" our pipeline. Dagster's asset-centric approach, better local development experience, and modern features (like the S3 IO integration and distributed execution model) provided advantages over the more traditional task-centric model of Airflow for our needs.
