use clap::{Parser, Subcommand};
use migration::{Migrator, MigratorTrait};

/// Simple CLI for the market server. Defaults to `serve` when no subcommand
/// is provided.
#[derive(Debug, Parser)]
#[command(author, version, about = "Finwar market server CLI")]
pub struct Opts {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Start the HTTP server (default)
    Serve,
    /// Run database migrations using the workspace `migration` member
    Migrate,
}

pub async fn run() -> Result<(), crate::error::Error> {
    let opts = Opts::parse();

    match opts.command {
        Command::Serve => crate::run_server().await,
        Command::Migrate => {
            let database_url = std::env::var("DATABASE_URL")
                .expect("DATABASE_URL must be set");
            let db_connection = sea_orm::Database::connect(&database_url)
                .await
                .map_err(crate::error::Error::InitDb)?;
            Migrator::up(&db_connection, None).await?;

            Ok(())
        },
    }
}
