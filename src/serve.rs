use axum::{
    Router,
    routing::{get, post},
    response::Redirect,
};
use tower_http::services::ServeDir;

use crate::config::Config;
use crate::state::AppState;
use crate::home::home;
use crate::auth::{get_login, get_signup, logout, post_login, post_signup};
use crate::error::{Error, AppError};

pub async fn serve(cfg: Config) -> Result<(), Error> {
    let db = sea_orm::Database::connect(
    format!(
            "postgresql://{}:{}@{}:{}/{}",
            cfg.database.user.expose(),
            cfg.database.password.expose(),
            cfg.database.host,
            cfg.database.port,
            cfg.database.name,
        ))
        .await
        .map_err(crate::error::Error::Database)?;

    let state = AppState::new(db).await.map_err(Error::State)?;

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
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", cfg.server.host, cfg.server.port))
        .await
        .map_err(Error::Bind)?;

    axum::serve(listener, app).await.map_err(Error::Run)?;

    Ok(())
}
