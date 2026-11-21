// TLS for hosted MySQL: TiDB Cloud (and most cloud databases) refuse unencrypted connections.
// On for *.tidbcloud.com hosts or when DB_SSL=true in .env; off for local XAMPP.
export function sslFor(databaseUrl) {
  let host = "";
  try {
    host = new URL(databaseUrl).hostname;
  } catch {
    // invalid URL – mysql2 will report it
  }
  const on = process.env.DB_SSL === "true" || host.endsWith(".tidbcloud.com");
  return on ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;
}
