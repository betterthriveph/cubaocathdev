/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Check Facility Availability (Public / Admin)
 * 
 * Availability rules:
 * - Checks reservations for requested facility and date.
 * - Unavailable if status = 'confirmed' or 'payment_submitted'.
 * - Unavailable if status = 'awaiting_payment' AND hold_expires_at > NOW().
 * - Available if hold_expires_at <= NOW() (expired hold released).
 * - Available if status = 'cancelled', 'declined', or 'completed'.
 */

import { getDatabaseClient } from './utils/db';

interface NetlifyEvent {
  httpMethod: string;
  body?: string | null;
  queryStringParameters?: Record<string, string | undefined>;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  let facilitySlugOrId: string | undefined;
  let requestedDate: string | undefined;
  let startTime: string | undefined;
  let endTime: string | undefined;

  if (event.httpMethod === 'GET') {
    facilitySlugOrId = event.queryStringParameters?.facility || event.queryStringParameters?.facilityId;
    requestedDate = event.queryStringParameters?.date;
    startTime = event.queryStringParameters?.startTime;
    endTime = event.queryStringParameters?.endTime;
  } else if (event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      facilitySlugOrId = payload.facility || payload.facilityId || payload.facilitySlug;
      requestedDate = payload.date || payload.requestedDate;
      startTime = payload.startTime;
      endTime = payload.endTime;
    } catch {
      // ignore
    }
  } else {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  if (!facilitySlugOrId || !requestedDate) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'facility and date are required parameters' }),
    };
  }

  try {
    const db = getDatabaseClient();

    // 1. Resolve facility ID if slug was passed
    const facilityRes = await db.sql`
      SELECT id, name, slug FROM facilities
      WHERE slug = ${facilitySlugOrId} OR id::text = ${facilitySlugOrId}
      LIMIT 1
    `;
    const facilityRows = Array.isArray(facilityRes) ? facilityRes : (facilityRes as any)?.rows || [];
    
    if (facilityRows.length === 0) {
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Facility not found' }),
      };
    }

    const facilityDbId = facilityRows[0].id;
    const facilityName = facilityRows[0].name;

    // 2. Query reservations for this facility on requested date
    // Check conflicts:
    // status IN ('confirmed', 'payment_submitted') OR (status = 'awaiting_payment' AND hold_expires_at > NOW())
    const conflictRes = await db.sql`
      SELECT 
        id, 
        reference_code, 
        reservation_date, 
        start_time, 
        end_time, 
        status, 
        hold_expires_at
      FROM reservations
      WHERE facility_id = ${facilityDbId}
        AND reservation_date = ${requestedDate}::date
        AND (
          status IN ('confirmed', 'payment_submitted')
          OR (status = 'awaiting_payment' AND (hold_expires_at IS NULL OR hold_expires_at > NOW()))
        )
    `;

    const conflictingRows = Array.isArray(conflictRes) ? conflictRes : (conflictRes as any)?.rows || [];

    if (conflictingRows.length > 0) {
      const conflict = conflictingRows[0];
      const isHold = conflict.status === 'awaiting_payment';

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          available: false,
          facilityName,
          requestedDate,
          conflictingStatus: conflict.status,
          holdExpiresAt: conflict.hold_expires_at,
          message: isHold
            ? `This slot is currently placed on a temporary 2-hour hold awaiting payment. If payment is not submitted, the slot will be released automatically.`
            : `This slot is already reserved and confirmed on the Cathedral calendar. Please select another date or time slot.`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        available: true,
        facilityName,
        requestedDate,
        message: 'This date and time slot is available for reservation inquiry.',
      }),
    };
  } catch (err: any) {
    console.error('Error checking availability:', err);
    // If database is offline or in mock preview, return available
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        available: true,
        message: 'Slot is open for inquiry (preview mode).',
      }),
    };
  }
};
