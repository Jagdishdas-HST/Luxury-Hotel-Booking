import { neon } from '@neondatabase/serverless';

async function main() {
  const sqlText = process.argv[2];
  if (!sqlText) {
    console.error('No SQL provided');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql.query(sqlText);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});