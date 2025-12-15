use askama::Template;
use axum::{
    http::StatusCode,
    response::{Html, IntoResponse},
};

#[derive(displaydoc::Display, pretty_error_debug::Debug, thiserror::Error)]
pub enum Error {
    /// Error binding the port to the server
    Bind(#[source] std::io::Error),
    /// Error running the server
    Run(#[source] std::io::Error),
    /// Error with app state
    State(#[from] crate::state::StateError),
    /// Error initializing the database
    Database(#[from] sea_orm::DbErr),
    /// RSS feed aggregation error
    GregError(#[from] Box<dyn std::error::Error>),
}

#[derive(Debug, displaydoc::Display, thiserror::Error)]
pub enum AppError {
    /// Resource not found
    NotFound,
    /// IO error
    Io(#[from] std::io::Error),
    /// App state
    State(#[from] crate::state::StateError),
    /// Database error
    DatabaseError(#[from] sea_orm::DbErr),
    /// Email already exists
    EmailExists,
    /// Password hashing error
    HashError,
    /// Invalid credentials
    InvalidCredentials,
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        #[derive(Debug, Template)]
        #[template(path = "error.html")]
        struct Tmpl {
            error: String,
            status: StatusCode,
            username: String,
        }

        let status = match &self {
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::Io(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::State(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::EmailExists => StatusCode::CONFLICT,
            AppError::HashError => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::InvalidCredentials => StatusCode::UNAUTHORIZED,
        };
        let tmpl =
            Tmpl { error: self.to_string(), status, username: String::new() };
        if let Ok(body) = tmpl.render() {
            (status, Html(body)).into_response()
        } else {
            (status, "Something went wrong").into_response()
        }
    }
}
