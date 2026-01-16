FROM docker.io/library/python:3.13.11-slim AS builder

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN uv sync --no-dev --locked --no-install-project

COPY . /app

RUN uv sync --no-dev --locked

FROM docker.io/library/python:3.13.11-slim AS runner

LABEL org.opencontainers.image.authors="guilhem.sante@kelps.org"
LABEL org.opencontainers.image.title="EpiFlipBoard Aggregator User Code"
LABEL org.opencontainers.image.description="Data pipeline to aggregate and analyze articles from RSS feeds."
LABEL org.opencontainers.image.licenses="MIT"

RUN groupadd --system --gid 999 appuser \
 && useradd --system --gid 999 --uid 999 --create-home appuser

RUN mkdir -p /opt/dagster \
 && chown -R 999:999 /opt/dagster

COPY --from=builder --chown=appuser:appuser /app /app
 
ENV PATH="/app/.venv/bin:$PATH"

USER appuser

WORKDIR /app

EXPOSE 4000

CMD ["dagster", "code-server", "start", "-h", "0.0.0.0", "-p", "4000", "-f", "src/epiflipboard_aggregator/definitions.py"]
