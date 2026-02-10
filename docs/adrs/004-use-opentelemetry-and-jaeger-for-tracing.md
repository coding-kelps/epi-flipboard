# 4. Use OpenTelemetry and Jaeger for Tracing

Date: 2026-02-10

## Status

Accepted

## Context

We need a robust solution to trace requests across our webserver and potential future microservices to understand performance bottlenecks and debug errors efficiently.

## Decision

We have decided to use **OpenTelemetry** to export traces and **Jaeger** to collect and visualize them.

## Consequences

*   **Industry Standard**: OpenTelemetry is the rising standard in the industry for observability, ensuring broad compatibility and future-proofing.
*   **Open Source**: Both tools are free and open-source.
*   **Advanced Monitoring**: Enables advanced monitoring analysis and deep visibility into request flows.
*   **Complex Queries**: Jaeger supports complex tracing queries to pinpoint specific issues.

## Alternatives Considered

### Grafana Tempo

We considered **Grafana Tempo** as a tracing backend.

*   **Pros**: strong integration with Grafana.
*   **Cons**: Required an external S3 bucket for storage.

**Reason for Rejection**: We preferred Jaeger because it only required a persistent volume in our Kubernetes cluster, which we found easier to set up for our specific infrastructure needs compared to configuring and managing an external S3 bucket.
