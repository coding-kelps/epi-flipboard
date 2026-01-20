import { loadSecret } from "./env-secrets";


function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildDatabaseUrl(prefix: string): string {
  const host = requiredEnv(`${prefix}_HOST`);
  const port = process.env[`${prefix}_PORT`] ?? "5432";
  const database = requiredEnv(`${prefix}_NAME`);

  const username = loadSecret({ name: `${prefix}_USER`, required: true })!;
  const password = loadSecret({ name: `${prefix}_PASSWORD`, required: true })!;

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

const urlCache = new Map<string, string>();

export function getDatabaseUrl(prefix: string): string {
  if (urlCache.has(prefix)) {
    return urlCache.get(prefix)!;
  }

  const url = buildDatabaseUrl(prefix);
  urlCache.set(prefix, url);

  return url;
}
