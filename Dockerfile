FROM rust:latest as builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY entity ./entity
COPY migration ./migration
COPY templates ./templates
COPY static ./static

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
      libpq5 \
      ca-certificates \
      && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/epi-flipboard ./

COPY templates ./templates

COPY static ./static

EXPOSE 4444

ENTRYPOINT ["/app/epi-flipboard"]

CMD ["serve"]
