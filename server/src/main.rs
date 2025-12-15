mod auth;
mod cli;
mod config;
mod serve;
mod migrate;
mod error;
mod home;
mod state;

use tracing::event;
use tracing::Level;
use clap::Parser;

use crate::cli::{Args, Commands};
use crate::config::Config;
use crate::error::Error;


#[tokio::main]
async fn main() -> Result<(), Error> {
    let args = Args::parse();
    let cfg = Config::from_args(args.clone());

    init_observability(&cfg)?;

    match args.command {
        Commands::Serve { .. } => serve::serve(cfg).await?,
        Commands::Migrate { .. } => migrate::migrate(cfg).await?,
    }

    Ok(())
}

fn init_observability(cfg: &Config) -> Result<(), Error> {
    match cfg.log.level.parse::<Level>() {
        Ok(level) => {
            tracing_subscriber::fmt()
                .with_max_level(level)
                .with_test_writer()
                .init();
        },
        Err(_) => {
            tracing_subscriber::fmt()
                .with_max_level(Level::INFO)
                .with_test_writer()
                .init();

            event!(Level::WARN, "log level wrongly set at \"{}\" continuing server at default level \"info\"", cfg.log.level);
        }
    }

    Ok(())
}

