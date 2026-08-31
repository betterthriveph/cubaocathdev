/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Database Client Configuration
 * 
 * This server-side helper initializes and exports the Netlify Database connection
 * using the `@netlify/database` SDK. In production on Netlify, credentials and
 * connection pools are managed securely through serverless runtime environment
 * variables without exposing secrets to frontend code.
 */

import { getDatabase } from '@netlify/database';

/**
 * Returns an instance of the Netlify Database client.
 * Automatically resolves the database connection from the environment variables
 * provided by Netlify (NETLIFY_DB_URL, NETLIFY_DATABASE_URL, DATABASE_URL, etc.).
 */
export function getDb() {
  const connectionString = 
    process.env.NETLIFY_DB_URL ||
    process.env.NETLIFY_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PGDATABASE_URL ||
    (globalThis as any).Netlify?.env?.get?.('NETLIFY_DB_URL') ||
    (globalThis as any).Netlify?.env?.get?.('NETLIFY_DATABASE_URL') ||
    (globalThis as any).Netlify?.env?.get?.('DATABASE_URL');

  if (connectionString) {
    return getDatabase({ connectionString });
  }
  return getDatabase();
}

export default getDb;
