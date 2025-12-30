import { loadSecret } from "@/lib/env-secrets";


function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildDatabaseUrl(): string {
  const host = requiredEnv("DB_HOST");
  const port = process.env.DB_PORT ?? "5432";
  const database = requiredEnv("DB_NAME");

  const username = loadSecret({ name: "DB_USER", required: true })!;
  const password = loadSecret({ name: "DB_PASSWORD", required: true })!;

  const sslMode = process.env.DB_SSL_MODE;

  const credentials = `${encodeURIComponent(username)}:${encodeURIComponent(
    password
  )}`;

  const params = new URLSearchParams();
  if (sslMode) {
    params.set("sslmode", sslMode);
  }

  const query = params.toString();
  const querySuffix = query ? `?${query}` : "";

  return `postgresql://${credentials}@${host}:${port}/${database}${querySuffix}`;
}

let cachedDatabaseUrl: string | null = null;

export function getDatabaseUrl(): string {
  if (cachedDatabaseUrl) return cachedDatabaseUrl;

  cachedDatabaseUrl = process.env.DATABASE_URL ?? buildDatabaseUrl();

  return cachedDatabaseUrl;
}
