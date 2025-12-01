pub mod auth;
pub mod cli;
pub mod error;
pub mod greg;
pub mod home;
pub mod state;

use axum::response::Redirect;
use axum::routing::{get, post};
use axum::Router;
use dotenvy::dotenv;
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing::event;
use tracing::Level;

use crate::auth::{get_login, get_signup, logout, post_login, post_signup};
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
        .route("/signup", get(get_signup))
        .route("/signup", post(post_signup))
        .route("/login", get(get_login))
        .route("/login", post(post_login))
        .route("/logout", get(logout))
        .nest_service("/static", ServeDir::new("static"))
        .fallback(|| async { AppError::NotFound })
        .layer(tower_cookies::CookieManagerLayer::new())
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(format!("{addr}:{port}"))
        .await
        .map_err(Error::Bind)?;
    event!(Level::INFO, "server started and listening on http://{addr}:{port}");

    axum::serve(listener, app).await.map_err(Error::Run)?;
    Ok(())
}
