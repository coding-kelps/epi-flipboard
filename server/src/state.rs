use std::fmt;
use sea_orm::DatabaseConnection;

#[derive(Debug)]
pub enum StateError {
    InvalidState(String),
    MissingState,
    InitState,
}

impl fmt::Display for StateError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            StateError::InvalidState(msg) => {
                write!(f, "Invalid state: {}", msg)
            },
            StateError::MissingState => write!(f, "Missing state"),
            StateError::InitState => write!(f, "Error initializing state"),
        }
    }
}

impl std::error::Error for StateError {}

#[derive(Clone)]
pub struct AppState {
    pub db: sea_orm::DatabaseConnection,
}

impl AppState {
    pub async fn new(db: DatabaseConnection) -> Result<Self, StateError> {
        Ok(AppState {
            db: db,
        })
    }
}
