use clap::{Parser, Subcommand};
use std::path::PathBuf;

macro_rules! env_prefix {
    ($name:expr) => {
        concat!("EPIFLIPBOARD_", $name)
    };
}

/// Simple CLI for the server.
#[derive(Debug, Parser, Clone)]
#[command(author, version, about = "Finwar market server CLI")]
pub struct Args {
  /// Log level (trace, debug, info, warn, error)
  #[arg(long, env = env_prefix!("LOG_LEVEL"), default_value = "info")]
  pub log_level: String,

  #[command(subcommand)]
  pub command: Commands,
}

#[derive(Subcommand, Debug, Clone)]
pub enum Commands {
    Serve {
        /// Host to bind to
        #[arg(long, env = env_prefix!("HOST"), default_value = "0.0.0.0")]
        host: String,

        /// Port to bind to
        #[arg(short, long, env = env_prefix!("PORT"), default_value = "8080")]
        port: u16,

        /// Database user
        #[arg(long, env = env_prefix!("DB_USER"), required_unless_present = "db_user_file")]
        db_user: Option<String>,

        /// Database user file path
        #[arg(long, env = env_prefix!("DB_USER_FILE"), required_unless_present = "db_user")]
        db_user_file: Option<PathBuf>,

        /// Database password
        #[arg(long, env = env_prefix!("DB_PASSWORD"), required_unless_present = "db_password_file")]
        db_password: Option<String>,

        /// Database password file path
        #[arg(long, env = env_prefix!("DB_PASSWORD_FILE"), required_unless_present = "db_password")]
        db_password_file: Option<PathBuf>,

        /// Database host
        #[arg(long, env = env_prefix!("DB_HOST"), default_value = "localhost")]
        db_host: String,
    
        /// Database port
        #[arg(long, env = env_prefix!("DB_PORT"), default_value = "5432")]
        db_port: u16,

        /// Database name
        #[arg(long, env = env_prefix!("DB_NAME"), default_value = "postgres")]
        db_name: String,
    },

    Migrate {
        /// Database user
        #[arg(long, env = env_prefix!("DB_USER"), required_unless_present = "db_user_file")]
        db_user: Option<String>,

        /// Database user file path
        #[arg(long, env = env_prefix!("DB_USER_FILE"), required_unless_present = "db_user")]
        db_user_file: Option<PathBuf>,

        /// Database password
        #[arg(long, env = env_prefix!("DB_PASSWORD"), required_unless_present = "db_password_file")]
        db_password: Option<String>,

        /// Database password file path
        #[arg(long, env = env_prefix!("DB_PASSWORD_FILE"), required_unless_present = "db_password")]
        db_password_file: Option<PathBuf>,

        /// Database host
        #[arg(long, env = env_prefix!("DB_HOST"), default_value = "localhost")]
        db_host: String,
    
        /// Database port
        #[arg(long, env = env_prefix!("DB_PORT"), default_value = "5432")]
        db_port: u16,

        /// Database name
        #[arg(long, env = env_prefix!("DB_NAME"), default_value = "postgres")]
        db_name: String,
    }
}
