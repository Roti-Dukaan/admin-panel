import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const requireBackend = createRequire(join(__dirname, "..", "..", "dukaan-backend", "package.json"));
const { Client } = requireBackend("pg");

const env = readFileSync(join(__dirname, "..", "..", "dukaan-backend", ".env"), "utf8");
const DATABASE_URL = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
const BRANCH_ID = "c249916d-48dc-44ee-ab74-ca116098dbc4";

const pg = new Client({ connectionString: DATABASE_URL });
await pg.connect();
await pg.query(
  `UPDATE admins SET "branchId" = $1 WHERE lower(email) = lower('Test@gmail.com') AND "branchId" IS NULL`,
  [BRANCH_ID],
);
const { rows } = await pg.query(`SELECT email, "branchId" FROM admins WHERE lower(email) = lower('Test@gmail.com')`);
console.log(rows[0]);
await pg.end();
