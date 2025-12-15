use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(User::Table)
                    .if_not_exists()
                    .col(pk_auto(User::Id))
                    .col(string(User::Email).not_null().unique_key())
                    .col(string(User::PasswordHash).not_null())
                    .col(string(User::Username).not_null().unique_key())
                    .col(
                        timestamp(User::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        timestamp(User::UpdatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(boolean(User::EmailVerified).not_null().default(false))
                    .index(
                        Index::create()
                            .name("idx_user_email")
                            .col(User::Email)
                            .unique(),
                    )
                    .index(
                        Index::create()
                            .name("idx_user_username")
                            .col(User::Username)
                            .unique(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(User::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum User {
    Table,
    Id,
    Email,
    PasswordHash,
    Username,
    CreatedAt,
    UpdatedAt,
    EmailVerified,
}
