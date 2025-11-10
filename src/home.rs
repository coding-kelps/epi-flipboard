use crate::{error::AppError, state::AppState};
use askama::Template;
use axum::{extract::State, response::IntoResponse};

pub async fn home(
    State(_state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    let tmpl = HomeTemplate {};
    let rendered = tmpl.render().map_err(|e| {
        tracing::error!("Template rendering error: {}", e);
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template rendering error",
        ))
    })?;
    Ok(axum::response::Html(rendered))
}

#[derive(Template)]
#[template(path = "home.html")]
struct HomeTemplate {}
