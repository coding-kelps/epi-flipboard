FROM docker.io/library/rust:1.92-slim-bookworm AS base

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN cargo install cargo-chef --version ^0.1

RUN cargo install sccache --version ^0.7

ENV RUSTC_WRAPPER=sccache SCCACHE_DIR=/sccache

FROM base AS planner

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

COPY entity ./entity

COPY migration ./migration

COPY src ./src

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo chef prepare --recipe-path recipe.json

FROM base AS builder

WORKDIR /build

COPY --from=planner /app/recipe.json recipe.json

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo chef cook --release --recipe-path recipe.json

COPY Cargo.toml Cargo.lock ./

COPY templates ./templates

COPY entity ./entity

COPY migration ./migration

COPY src ./src

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo build --release

FROM gcr.io/distroless/cc-debian12:nonroot as runner
      
LABEL org.opencontainers.image.authors="guilhem.sante@kelps.org"
LABEL org.opencontainers.image.title="EpiFlipBoard"
LABEL org.opencontainers.image.description="A FlipBoard clone."
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app
      
COPY --from=builder /build/target/release/epi-flipboard /app/epi-flipboard

COPY templates ./templates

COPY static ./static

ENV RUST_LOG=info

EXPOSE 3000

ENTRYPOINT ["/app/epi-flipboard"]

CMD ["serve"]
