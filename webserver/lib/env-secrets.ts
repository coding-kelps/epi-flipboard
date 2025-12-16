import { readFileSync } from "node:fs";


type SecretOptions = {
  name: string;
  fileName?: string;
  required?: boolean;
};

export function loadSecret({
  name,
  fileName = `${name}_FILE`,
  required = true,
}: SecretOptions): string | undefined {
  const directValue = process.env[name];
  if (directValue) {
    return directValue;
  }

  const filePath = process.env[fileName];
  if (filePath) {
    try {
      return readFileSync(filePath, "utf8").trim();
    } catch (err) {
      throw new Error(
        `Failed to read secret file for ${name} at ${filePath}`
      );
    }
  }

  if (required) {
    throw new Error(
      `Missing required secret: ${name} or ${fileName}`
    );
  }

  return undefined;
}
