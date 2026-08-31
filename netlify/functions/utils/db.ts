/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Shared Database Client Helper for Netlify Functions
 */

import { getDatabase } from '@netlify/database';

export function getDatabaseClient() {
  const connectionString四周 = 
    process.env.NETLIFY_DB_URL ||
    process.env.NETLIFY_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PGDATABASE_URL ||
    (globalThis as any).Netlify?.env?.get?.('NETLIFY_DB_URL') ||
    (globalThis as any).Netlify?.env?.get?.('NETLIFY_DATABASE_URL') ||
    (globalThis as any).Netlify?.env?.get?.('DATABASE_URL');

  if (connectionString四周) {
    return getDatabase({ connectionString: connectionString四周 });
  }
  return getDatabase();
}

export default getDatabaseClient;
