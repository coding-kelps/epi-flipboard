# EPI Flipboard Webserver

This is the webserver component of the EPI Flipboard project.

## Environment Variables

The application is configured using environment variables. You can set them directly or use `_FILE` suffixed variables to point to a file containing the secret (useful for Docker/Kubernetes secrets).

### Database Configuration

The application constructs the `DATABASE_URL` from individual components (`DB_HOST`, `DB_USER`, etc.) unless `DATABASE_URL` is explicitly provided.

| Variable       | Default | Required | Description                                                           |
| :------------- | :------ | :------- | :-------------------------------------------------------------------- |
| `DB_HOST`      | -       | Yes\*    | Hostname of the PostgreSQL database.                                  |
| `DB_PORT`      | `5432`  | No       | Port of the PostgreSQL database.                                      |
| `DB_NAME`      | -       | Yes\*    | Name of the database to connect to.                                   |
| `DB_USER`      | -       | Yes\*    | Database user. Can also be set via `DB_USER_FILE`.                    |
| `DB_PASSWORD`  | -       | Yes\*    | Database password. Can also be set via `DB_PASSWORD_FILE`.            |
| `DB_SSL_MODE`  | -       | No       | SSL mode for the connection (e.g., `require`, `prefer`).              |
| `DATABASE_URL` | -       | No       | Full connection string. If set, overrides all other `DB_*` variables. |

_\* Required unless `DATABASE_URL` is set._

### Observability (OpenTelemetry)

| Variable                      | Default | Required | Description                                 |
| :---------------------------- | :------ | :------- | :------------------------------------------ |
| `OTEL_ENABLED`                | -       | No       | Set to `1` to enable OpenTelemetry tracing. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | -       | No       | Endpoint URL for the OTLP exporter.         |

### General

| Variable   | Default       | Required | Description                                                |
| :--------- | :------------ | :------- | :--------------------------------------------------------- |
| `NODE_ENV` | `development` | No       | Node.js environment (`development`, `production`, `test`). |

## Secrets Management

For sensitive variables like `DB_USER` and `DB_PASSWORD`, the application supports reading from files using the `loadSecret` utility.

- If `DB_USER` is set, it is used directly.
- If not, the application looks for `DB_USER_FILE`. If that variable is set to a path (e.g., `/run/secrets/db_user`), it reads the content of that file.

This pattern applies to:

- `DB_USER` / `DB_USER_FILE`
- `DB_PASSWORD` / `DB_PASSWORD_FILE`

## Scripts

- `bun dev`: Run development server
- `bun build`: Build for production
- `bun start`: Start production server
- `bun lint`: Run linter
- `bun test`: Run unit tests
- `bun test:coverage`: Run tests with coverage report
