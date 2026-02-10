# 5. Use PostgreSQL and Database Separation

Date: 2026-02-10

## Status

Accepted

## Context

We need a reliable, performing, and cost-effective relational database system to store application data. We also have a requirement to handle user data responsibly, specifically ensuring that personal identifiable information (PII) is kept secure and distinct from behavioral data.

## Decision

We have decided to use **PostgreSQL** as our primary database technology and to architecturally separate the data into three distinct databases:
1.  **Identity** (Users, Auth)
2.  **Activity** (User interactions, History)
3.  **Content** (Feeds, Articles, Tags)

## Consequences

*   **Standard Compliance**: PostgreSQL is the default standard for modern web applications, offering reliability and a huge ecosystem.
*   **Performance/Cost**: Provides excellent performance at minimal compute cost while remaining free and open-source.
*   **Privacy & Security**: separating the databases enables us to track user activity in the **Activity** database without directly exposing their PII (stored in the **Identity** database), reducing the risk of data leaks and ensuring better privacy compliance.
