export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const authEnv = {
  secret: () => requireEnv("AUTH_SECRET"),
};

export const mongoEnv = {
  uri: () => requireEnv("MONGODB_URI"),
  db: () => process.env.MONGODB_DB || "jj-core",
};

