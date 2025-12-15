use crate::cli::{Args, Commands};
use std::fs;

#[derive(Debug, Clone)]
pub struct Config {
  pub server: ServerConfig,
  pub database: DatabaseConfig,
  pub log: LogConfig,
}

#[derive(Debug, Clone)]
pub struct ServerConfig {
  pub host: String,
  pub port: u16,
}

#[derive(Debug, Clone)]
pub struct DatabaseConfig {
  pub user: Sensitive<String>,
  pub password: Sensitive<String>,
  pub host: String,
  pub port: u16,
  pub name: String,
}

#[derive(Debug, Clone)]
pub struct LogConfig {
  pub level: String,
}

// Wrapper type for sensitive data that masks itself when printed
#[derive(Clone)]
pub struct Sensitive<T>(T);

impl<T> Sensitive<T> {
  fn new(value: T) -> Self {
    Sensitive(value)
  }
  
  pub fn expose(&self) -> &T {
    &self.0
  }
}

impl<T> std::fmt::Debug for Sensitive<T> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "***")
  }
}

impl<T> std::fmt::Display for Sensitive<T> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "***")
  }
}

impl Config {
  pub fn from_args(
    args: Args,
  ) -> Self {
    match args.command {
      Commands::Serve {
        host,
        port,
        db_user,
        db_user_file,
        db_password,
        db_password_file,
        db_host,
        db_port,
        db_name,
      } => {
        Config {
          server: ServerConfig { host, port },
          database: DatabaseConfig {
            user: Sensitive::new(db_user.unwrap_or_else(|| {
                fs::read_to_string(db_user_file.expect("missing database user secret file path"))
                .expect("failed to read database user secret file").trim_end().to_string()
            })),
            password: Sensitive::new(db_password.unwrap_or_else(|| {
                fs::read_to_string(db_password_file.expect("missing database user secret file path"))
                .expect("failed to read database password secret file").trim_end().to_string()
            })),
            host: db_host,
            port: db_port,
            name: db_name,
          },
          log: LogConfig {
            level: args.log_level,
          },
        }
      },
      Commands::Migrate {
        db_user,
        db_user_file,
        db_password,
        db_password_file,
        db_host,
        db_port,
        db_name,
      } => {
        Config {
          server: ServerConfig { host: String::from(""), port: 0 },
          database: DatabaseConfig {
            user: Sensitive::new(db_user.unwrap_or_else(|| {
                fs::read_to_string(db_user_file.expect("missing database user secret file path"))
                .expect("failed to read database user secret file").trim_end().to_string()
            })),
            password: Sensitive::new(db_password.unwrap_or_else(|| {
                fs::read_to_string(db_password_file.expect("missing database user secret file path"))
                .expect("failed to read database password secret file").trim_end().to_string()
            })),
            host: db_host,
            port: db_port,
            name: db_name,
          },
          log: LogConfig {
            level: args.log_level,
          },
        }
      }
    }

  }
}
