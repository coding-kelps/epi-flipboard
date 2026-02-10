# 1. Use Next.js for Webserver

Date: 2026-02-10

## Status

Accepted

## Context

We needed to select a technology stack for building the webserver component of our application. The webserver needs to handle user requests, serve the frontend application, and potentially handle API routes.

## Decision

We have decided to use **Next.js** for the webserver.

## Consequences

*   **Rapid Development**: Next.js provides a comprehensive framework that accelerates development with features like file-based routing and built-in API support.
*   **Large Ecosystem**: Access to the vast NPM/JavaScript ecosystem allows us to easily integrate with various libraries and tools.
*   **SSR/SSG**: Built-in support for Server-Side Rendering and Static Site Generation improves performance and SEO.

## Alternatives Considered

### Rust

We initially attempted to build the webserver using **Rust**.

*   **Pros**: High performance, memory safety, strong typing.
*   **Cons**:
    *   The development cycle was found to be significantly longer compared to Next.js.
    *   The pool of available packages for our specific needs was smaller and less mature than the JavaScript ecosystem.

**Reason for Rejection**: The trade-off between extreme performance and development speed/ecosystem availability favored Next.js for our current requirements.
