#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');
// dotenv is already a dependency in this project
require('dotenv').config();

const SQL_PATH = './db/migration_run.sql';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  console.error('Set it (PowerShell: $env:DATABASE_URL = "postgres://user:pass@host:5432/dbname") and re-run.');
  process.exit(2);
}

if (!fs.existsSync(SQL_PATH)) {
  console.error(`ERROR: SQL file not found at ${SQL_PATH}`);
  process.exit(3);
}

const sql = fs.readFileSync(SQL_PATH, 'utf8');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to database.');

    console.log('Ensuring pgcrypto extension exists...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    console.log('Running migration SQL...');
    await client.query(sql);

    console.log('Migration applied successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.end(); } catch (_) {}
    process.exit(1);
  }
})();
