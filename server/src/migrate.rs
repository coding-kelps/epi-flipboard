use migration::{Migrator, MigratorTrait};

use crate::config::Config;
use crate::error::Error;

pub async fn migrate(cfg: Config) -> Result<(), Error> {
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

    Migrator::up(&db, None).await?;

    Ok(())
}
