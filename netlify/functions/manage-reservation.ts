/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Manage Reservation (Admin Only)
 * 
 * - Mark reservation as 'completed'
 * - Mark reservation as 'cancelled'
 * - Update admin notes
 */

import { getDatabaseClient } from './utils/db';
import { verifyAdminUser, NetlifyRequestEvent, NetlifyRequestContext } from './utils/auth';

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const handler = async (
  event: NetlifyRequestEvent,
  context: NetlifyRequestContext
): Promise<NetlifyResponse> => {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 1. Verify admin authorization
  const auth = await verifyAdminUser(event, context);
  if (!auth.authorized || !auth.user) {
    return {
      statusCode: auth.status || 401,
      headers: jsonHeaders,
      body: JSON.stringify({ error: auth.error || 'Unauthorized' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const {
      reservationId,
      status, // 'completed' | 'cancelled' | 'confirmed' | 'pending'
      adminNotes,
    } = payload;

    if (!reservationId || !status) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'reservationId and status are required' }),
      };
    }

    const db = getDatabaseClient();

    const updateRes = await db.sql`
      UPDATE reservations
      SET 
        status = ${status},
        admin_notes = COALESCE(${adminNotes ? String(adminNotes) : null}, admin_notes),
        updated_at = NOW()
      WHERE id::text = ${reservationId} OR reference_code = ${reservationId}
      RETURNING *
    `;

    const updatedRows = Array.isArray(updateRes) ? updateRes : (updateRes as any)?.rows || [];
    if (updatedRows.length === 0) {
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Reservation not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        message: `Reservation status updated to "${status}".`,
        reservation: updatedRows[0],
      }),
    };
  } catch (err: any) {
    console.error('Error managing reservation:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to update reservation', details: err?.message }),
    };
  }
};
