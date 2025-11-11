pub use sea_orm_migration::prelude::*;

mod m20251111_131154_create_table_articles;
mod m20251111_132044_seed_table_articles;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20251111_131154_create_table_articles::Migration),
            Box::new(m20251111_132044_seed_table_articles::Migration),
        ]
    }
}
