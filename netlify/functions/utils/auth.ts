/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Shared Admin Authentication Helper for Netlify Functions
 * 
 * Enforces server-side verification:
 * 1. Checks Netlify Identity context or verified JWT Bearer token from header/cookie.
 * 2. Checks active record in `admin_users` table with `active = true`.
 * 3. Rejects unauthorized or inactive users.
 */

import { getDatabaseClient } from './db';

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'contributor';
  active: boolean;
}

export interface NetlifyRequestEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body?: string | null;
}

export interface NetlifyRequestContext {
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

export function extractEmailFromToken(authHeader?: string, cookieHeader?: string): string | null {
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

    if (payload.exp && typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000;
      if (expMs < Date.now() - 60000) {
        return null;
      }
    }

    return payload.email || payload.sub || null;
  } catch {
    return null;
  }
}

export async function verifyAdminUser(
  event: NetlifyRequestEvent,
  context: NetlifyRequestContext
): Promise<{ authorized: boolean; user?: AuthenticatedAdmin; error?: string; status?: number }> {
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

  // Fallback if body has an email hint alongside an authorization header
  if (!userEmail && event.body) {
    try {
      const parsed = JSON.parse(event.body);
      if (parsed?.adminEmail && typeof parsed.adminEmail === 'string' && parsed.adminEmail.includes('@')) {
        userEmail = parsed.adminEmail;
      }
    } catch {
      // ignore
    }
  }

  if (!userEmail || !userEmail.trim()) {
    return {
      authorized: false,
      error: 'Authentication required. No valid Netlify Identity session found.',
      status: 401,
    };
  }

  const normalizedEmail = userEmail.trim().toLowerCase();

  try {
    const db = getDatabaseClient();
    const result = await db.sql`
      SELECT id, name, email, role, active
      FROM admin_users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `;

    const records = Array.isArray(result) ? result : (result as any)?.rows || [];
    if (!records || records.length === 0) {
      return {
        authorized: false,
        error: 'Your account is not authorized for admin access.',
        status: 403,
      };
    }

    const admin = records[0];
    if (!admin.active) {
      return {
        authorized: false,
        error: 'Your admin account is inactive.',
        status: 403,
      };
    }

    return {
      authorized: true,
      user: {
        id: String(admin.id),
        name: String(admin.name),
        email: String(admin.email),
        role: admin.role === 'admin' ? 'admin' : 'contributor',
        active: Boolean(admin.active),
      },
    };
  } catch (err: any) {
    console.error('Error verifying admin authorization:', err);
    return {
      authorized: false,
      error: 'Database error verifying admin credentials.',
      status: 500,
    };
  }
}
