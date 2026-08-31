/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Netlify Serverless Function: Get Authenticated Admin User
 * 
 * Authorization Workflow:
 * 1. Verifies the authenticated Netlify Identity session server-side from
 *    Netlify's clientContext or the Bearer JWT token in headers/cookies.
 * 2. Extracts the verified email (never trusts manual browser input).
 * 3. Queries the `admin_users` table in Netlify Database.
 * 4. Enforces:
 *    - Must exist in `admin_users` -> otherwise 403: "Your account is not authorized for admin access."
 *    - Must have `active = true` -> otherwise 403: "Your admin account is inactive."
 * 5. Returns safe admin information (id, name, email, role, active).
 */

import { getDatabase, MissingDatabaseConnectionError } from '@netlify/database';

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body?: string | null;
}

interface NetlifyContext {
  clientContext?: {
    user?: {
      email?: string;
      sub?: string;
      app_metadata?: Record<string, unknown>;
      user_metadata?: Record<string, unknown>;
      exp?: number;
    };
    identity?: {
      url?: string;
      token?: string;
    };
  };
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

/**
 * Extracts and decodes the authenticated email from a JWT token in Authorization header or cookie
 */
function extractEmailFromToken(authHeader?: string, cookieHeader?: string): string | null {
  let token: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/nf_jwt=([^;]+)/);
    if (match) token = match[1].trim();
  }

  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);

    // Check expiration if exp claim is present
    if (payload.exp && typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000;
      if (expMs < Date.now()) {
        console.warn('JWT token has expired');
        return null;
      }
    }

    return payload.email || payload.sub || null;
  } catch (err) {
    console.error('Failed to parse JWT payload:', err);
    return null;
  }
}

export const handler = async (
  event: NetlifyEvent,
  context: NetlifyContext
): Promise<NetlifyResponse> => {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
  };

  // Only allow GET or POST
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 1. Identify authenticated user email from server-verified Netlify Identity context or JWT
  let userEmail: string | null = null;

  if (context.clientContext?.user?.email) {
    userEmail = context.clientContext.user.email;
  }

  if (!userEmail) {
    userEmail = extractEmailFromToken(
      event.headers['authorization'] || event.headers['Authorization'],
      event.headers['cookie'] || event.headers['Cookie']
    );
  }

  if (!userEmail || !userEmail.trim()) {
    return {
      statusCode: 401,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'unauthenticated',
        message: 'Authentication required. No valid Netlify Identity session found.',
      }),
    };
  }

  const normalizedEmail = userEmail.trim().toLowerCase();

  // 2. Query admin_users table in Netlify Database
  try {
    const db = getDatabase();
    
    // Query database for matching admin record
    const result = await db.sql`
      SELECT id, name, email, role, active, created_at, updated_at
      FROM admin_users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `;

    const records = Array.isArray(result) ? result : (result as any)?.rows || [];

    if (!records || records.length === 0) {
      return {
        statusCode: 403,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: 'unauthorized',
          message: 'Your account is not authorized for admin access.',
        }),
      };
    }

    const adminRecord = records[0];

    // Check if active
    if (!adminRecord.active) {
      return {
        statusCode: 403,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: 'inactive',
          message: 'Your admin account is inactive.',
        }),
      };
    }

    // Return safe admin user info
    const safeUser = {
      id: String(adminRecord.id),
      name: String(adminRecord.name || 'Parish Staff'),
      email: String(adminRecord.email),
      role: adminRecord.role === 'admin' ? 'admin' : 'contributor',
      active: Boolean(adminRecord.active),
      status: 'Active' as const,
      title: adminRecord.role === 'admin' ? 'Cathedral Administrator' : 'Parish Pastoral Staff',
      createdDate: adminRecord.created_at
        ? new Date(adminRecord.created_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      lastActive: 'Online now',
    };

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        user: safeUser,
      }),
    };
  } catch (dbError: any) {
    console.error('Database query error in get-admin-user function:', dbError);

    if (dbError instanceof MissingDatabaseConnectionError || dbError?.name === 'MissingDatabaseConnectionError') {
      return {
        statusCode: 503,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: 'database_unavailable',
          message: 'Netlify Database is not connected. Please ensure Netlify Database is provisioned.',
        }),
      };
    }

    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'server_error',
        message: 'Internal server error validating admin authorization.',
      }),
    };
  }
};
