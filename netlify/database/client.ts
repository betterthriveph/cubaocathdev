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
 * Lazy-loaded to prevent initialization crashes when running in client-only or static contexts.
 */
export function getDb() {
  return getDatabase();
}

export default getDb;
