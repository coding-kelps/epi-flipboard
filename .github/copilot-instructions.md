# EpiFlipBoard - AI Coding Agent Instructions

## Project Overview

RSS feed aggregator inspired by Flipboard. Rust backend (Axum + SeaORM) serving HTML templates (Askama), PostgreSQL database. Core flow: `greg` module scrapes RSS feeds → stores in DB → `home` handler displays articles.

## Architecture

### Workspace Structure

- **Root**: Axum web server (`src/main.rs`, `src/home.rs`, `src/greg.rs`)
- **`entity/`**: SeaORM entity definitions (Article model)
- **`migration/`**: Database migrations using SeaORM Migrator
- Workspace members share dependencies via root `Cargo.toml`

### CLI Commands (via `src/cli.rs`)

- `serve` - Start web server on port 4444
- `migrate` - Run DB migrations
- `greg` - Aggregate RSS feeds from `awesome-rss-feeds/recommended/with_category/*.opml`

### RSS Aggregation (`src/greg.rs`)

- Spawns concurrent tasks (JoinSet) per feed URL
- Limits: 7 feeds/category, 4 articles/feed
- Validates images with HEAD requests + content-type checks
- Bans specific domains (BBC CDN URLs) - see `BANNED_DOMAINS`
- Strips HTML from content using `nanohtml2text`
- Uses `on_conflict().do_nothing()` for duplicate URL handling

## Development Workflow

### Setup

```bash
docker-compose up -d postgres  # Start PostgreSQL
cargo run -- migrate           # Apply migrations
cargo run -- greg              # Populate initial data
cargo run -- serve             # Start server at localhost:4444
```

### Database

- Connection via `DATABASE_URL` env var (see `.env.dev`)
- AppState holds shared `DatabaseConnection` clone
- Article schema: id, title, authors, publishers, created_at, description, content, original_url (unique), tag, image_url, published_at

### Templates (Askama)

- Located in `templates/` - base.html, home.html, error.html, header.html, footer.html
- Derive `Template` trait, specify path with `#[template(path = "...")]`
- Template structs in handler modules (e.g., `HomeTemplate` in `src/home.rs`)

## Code Patterns

### Error Handling

- Top-level errors: `Error` enum in `src/error.rs` (thiserror + displaydoc)
- HTTP errors: `AppError` implements `IntoResponse` - renders `error.html` template
- StateError for app initialization failures

### Handlers

```rust
pub async fn handler(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    // Query DB via state.db
    // Return Template struct (implements IntoResponse)
}
```

### Entity Queries

- Use `EntityTrait` methods: `find()`, `filter()`, `order_by()`
- Limit results: `.limit(100)` - home page loads 100 articles
- Access via `entity::article::Entity`

### Time Display

- Custom `format_time_ago()` in `home.rs` - converts DateTime to "X minutes/hours/days ago"

## Project Conventions

- No comments in code (per `.github/instructions/code.instructions.md`)
- Idiomatic Rust: use `?` for errors, prefer iterators, explicit types only when needed
- Optimized dev builds: workspace dependencies compile with opt-level 3
- Static files served from `/static` via tower-http ServeDir
- Tracing: DEBUG level, structured logging with `tracing::event!`

## Key Dependencies

- **axum** 0.8 - web framework
- **sea-orm** 1.1 - ORM with postgres + tokio runtime
- **askama** 0.14 - compile-time templates
- **rss** 2.0 - feed parsing
- **opml** 1.1 - category feed lists
- **tower-http** - middleware (static files, tracing)

## Common Tasks

### Add New Route

1. Create handler in new module or existing (e.g., `src/home.rs`)
2. Add route in `main.rs`: `.route("/path", get(handler))`
3. Pass state with `.with_state(state)`

### Add Database Table

1. `cd migration && cargo run -- generate table_name`
2. Edit generated migration in `migration/src/`
3. Add to `Migrator::migrations()` in `migration/src/lib.rs`
4. Create entity in `entity/src/` matching schema
5. Run `cargo run -- migrate`

### Modify RSS Scraping

- Edit constants: `MAX_FEEDS_PER_CATEGORY`, `MAX_ARTICLES_PER_FEED`
- Ban domains: add to `BANNED_DOMAINS` array
- Change OPML path: update `fs::read_dir()` call in `aggregate_feeds()`

## Testing & Debugging

- Run with `RUST_LOG=debug cargo run -- serve` for verbose logs
- Check `docker-compose logs postgres` for DB issues
- Migration status: `cd migration && cargo run -- status`
