# Running Migrator CLI

steps to get a clean and up to date db:

```sh
# first make sure the db is running
docker-compose up postgres

# apply all migrations
sea-orm-cli migrate

# generate the up to date entities (should normally be pushed)
sea-orm-cli generate entity -o entity 2> /dev/null
```

- Generate a new migration file

```sh
  cargo run -- generate MIGRATION_NAME
```

- Apply all pending migrations

```sh
  cargo run
```

```sh
  cargo run -- up
```

- Apply first 10 pending migrations

```sh
  cargo run -- up -n 10
```

- Rollback last applied migrations

```sh
  cargo run -- down
```

- Rollback last 10 applied migrations

```sh
  cargo run -- down -n 10
```

- Drop all tables from the database, then reapply all migrations

```sh
  cargo run -- fresh
```

- Rollback all applied migrations, then reapply all migrations

```sh
  cargo run -- refresh
```

- Rollback all applied migrations

```sh
  cargo run -- reset
```

- Check the status of all migrations

```sh
  cargo run -- status
```
