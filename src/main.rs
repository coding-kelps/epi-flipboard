pub mod cli;
pub mod error;
pub mod home;
pub mod state;

use axum::response::Redirect;
use axum::routing::get;
use axum::Router;
use dotenvy::dotenv;
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing::event;
use tracing::Level;

use crate::error::AppError;
use crate::error::Error;
use crate::home::home;
use crate::state::AppState;

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv().ok();

    tracing_subscriber::fmt()
        .with_max_level(Level::DEBUG)
        .with_test_writer()
        .init();

    // Delegate to cli module to choose between server or migration commands.
    cli::run().await
}

async fn run_server() -> Result<(), Error> {
    let addr = "0.0.0.0";
    let port = 4444;

    let state = AppState::new().await.map_err(Error::State)?;

    let app = Router::new()
        .route("/", get(|| async { Redirect::to("/home") }))
        .route("/home", get(home))
        .nest_service("/static", ServeDir::new("static"))
        .fallback(|| async { AppError::NotFound })
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(format!("{addr}:{port}"))
        .await
        .map_err(Error::Bind)?;
    event!(Level::INFO, "server started and listening on http://{addr}:{port}");

    axum::serve(listener, app).await.map_err(Error::Run)?;
    Ok(())
}
