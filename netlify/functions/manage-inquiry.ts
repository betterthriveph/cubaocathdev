/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Manage Inquiry (Admin Only)
 * 
 * - Updates inquiry status (new, under_review, approved, declined, cancelled)
 * - Records admin internal notes and quoted price
 * - When approved: Creates linked reservation record (preventing duplicates)
 *   without starting hold timer yet.
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
      inquiryId,
      status, // 'new' | 'under_review' | 'approved' | 'declined' | 'cancelled'
      adminNotes,
      quotedPrice,
    } = payload;

    console.log(`[manage-inquiry] Request by ${auth.user.email} on inquiry: ${inquiryId}, target status: ${status || 'unchanged'}`);

    if (!inquiryId) {
      console.warn('[manage-inquiry] Validation failure: inquiryId is required');
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'inquiryId is required' }),
      };
    }

    const db = getDatabaseClient();

    // 2. Fetch current inquiry
    const inqRes = await db.sql`
      SELECT * FROM inquiries
      WHERE id::text = ${inquiryId} OR reference_code = ${inquiryId}
      LIMIT 1
    `;
    const inqRows = Array.isArray(inqRes) ? inqRes : (inqRes as any)?.rows || [];
    if (inqRows.length === 0) {
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Inquiry not found' }),
      };
    }

    const currentInquiry = inqRows[0];
    const newStatus = status || currentInquiry.status;
    const newAdminNotes = adminNotes !== undefined ? String(adminNotes) : currentInquiry.admin_notes;
    const newQuotedPrice = quotedPrice !== undefined ? Number(quotedPrice) : Number(currentInquiry.quoted_price || 0);

    // 3. Update inquiry
    const updatedInqRes = await db.sql`
      UPDATE inquiries
      SET 
        status = ${newStatus},
        admin_notes = ${newAdminNotes},
        quoted_price = ${newQuotedPrice},
        updated_at = NOW()
      WHERE id = ${currentInquiry.id}
      RETURNING *
    `;
    const updatedInquiry = Array.isArray(updatedInqRes) ? updatedInqRes[0] : (updatedInqRes as any)?.rows?.[0];

    let createdReservation = null;

    // 4. If status changed to 'approved', ensure linked reservation exists
    if (newStatus === 'approved') {
      // Check if reservation already created for this inquiry
      const existingRes = await db.sql`
        SELECT * FROM reservations
        WHERE inquiry_id = ${currentInquiry.id}
        LIMIT 1
      `;
      const existingRows = Array.isArray(existingRes) ? existingRes : (existingRes as any)?.rows || [];

      if (existingRows.length > 0) {
        createdReservation = existingRows[0];
      } else {
        const year = new Date().getFullYear();
        const randDigits = Math.floor(10000 + Math.random() * 90000);
        const reservationRef = `RES-${year}-${randDigits}`;

        // Get default deposit from facility if available
        let defaultDeposit = Math.round(newQuotedPrice * 0.3);
        if (currentInquiry.facility_id) {
          const facCheck = await db.sql`SELECT deposit_amount FROM facilities WHERE id = ${currentInquiry.facility_id} LIMIT 1`;
          const facRows = Array.isArray(facCheck) ? facCheck : (facCheck as any)?.rows || [];
          if (facRows.length > 0 && Number(facRows[0].deposit_amount) > 0) {
            defaultDeposit = Number(facRows[0].deposit_amount);
          }
        }

        const insertRes = await db.sql`
          INSERT INTO reservations (
            inquiry_id,
            facility_id,
            reference_code,
            customer_name,
            customer_email,
            phone,
            reservation_date,
            start_time,
            end_time,
            purpose,
            status,
            amount,
            agreed_price,
            deposit_due,
            payment_status,
            admin_notes
          ) VALUES (
            ${currentInquiry.id},
            ${currentInquiry.facility_id},
            ${reservationRef},
            ${currentInquiry.name},
            ${currentInquiry.email},
            ${currentInquiry.phone},
            ${currentInquiry.requested_date},
            ${currentInquiry.start_time},
            ${currentInquiry.end_time},
            ${currentInquiry.purpose},
            'pending',
            ${newQuotedPrice},
            ${newQuotedPrice},
            ${defaultDeposit},
            'unpaid',
            ${newAdminNotes}
          )
          RETURNING *
        `;
        const resRows = Array.isArray(insertRes) ? insertRes : (insertRes as any)?.rows || [];
        createdReservation = resRows[0];
      }
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        inquiry: updatedInquiry,
        reservation: createdReservation,
        message: `Inquiry status updated to "${newStatus}".`,
      }),
    };
  } catch (err: any) {
    console.error('Error managing inquiry:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to update inquiry', details: err?.message }),
    };
  }
};
