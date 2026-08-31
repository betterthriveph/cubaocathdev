/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Verify Payment & Confirm Reservation (Admin Only)
 * 
 * - Verifies proof of payment
 * - Updates status to 'confirmed' and payment_status to 'verified'
 * - Dispatches official confirmation email via Resend
 * - Records confirmation_email_sent_at
 */

import { getDatabaseClient } from './utils/db';
import { verifyAdminUser, NetlifyRequestEvent, NetlifyRequestContext } from './utils/auth';
import { sendEmail, buildBookingConfirmationEmail } from './utils/email';

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

  if (event.httpMethod !== 'POST') {
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
      action, // 'verify' | 'reject'
      adminNotes,
      facilityInstructions,
    } = payload;

    if (!reservationId || !action) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'reservationId and action are required.' }),
      };
    }

    const db = getDatabaseClient();

    // 2. Fetch reservation
    const resRes = await db.sql`
      SELECT 
        r.*, 
        f.name as facility_name
      FROM reservations r
      LEFT JOIN facilities f ON r.facility_id = f.id
      WHERE r.id::text = ${reservationId} OR r.reference_code = ${reservationId}
      LIMIT 1
    `;
    const resRows = Array.isArray(resRes) ? resRes : (resRes as any)?.rows || [];

    if (resRows.length === 0) {
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Reservation not found.' }),
      };
    }

    const reservation = resRows[0];

    if (action === 'reject') {
      // Rejection: return to awaiting payment or flag notes
      const updateRes = await db.sql`
        UPDATE reservations
        SET 
          status = 'awaiting_payment',
          payment_status = 'rejected',
          admin_notes = ${adminNotes ? String(adminNotes) : (reservation.admin_notes || '')},
          updated_at = NOW()
        WHERE id = ${reservation.id}
        RETURNING *
      `;
      const updated = Array.isArray(updateRes) ? updateRes[0] : (updateRes as any)?.rows?.[0];
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Payment rejected. Status returned to awaiting payment.',
          reservation: updated,
        }),
      };
    }

    // 3. Action = 'verify': Send Confirmation Email via Resend
    const emailData = buildBookingConfirmationEmail({
      applicantName: reservation.customer_name,
      referenceCode: reservation.reference_code,
      facilityName: reservation.facility_name || 'Cathedral Facility Space',
      date: new Date(reservation.reservation_date).toISOString().split('T')[0],
      startTime: reservation.start_time || '08:00 AM',
      endTime: reservation.end_time || '12:00 PM',
      agreedAmount: Number(reservation.agreed_price || reservation.amount || 0),
      paymentStatus: 'Verified (Deposit/Full Settled)',
      facilityInstructions: facilityInstructions || 'Please coordinate ingress with the Cathedral Secretariat 24 hours prior to event date.',
    });

    const emailSendResult = await sendEmail({
      to: reservation.customer_email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    // 4. Update reservation in database
    const updateRes = await db.sql`
      UPDATE reservations
      SET 
        status = 'confirmed',
        payment_status = 'verified',
        confirmed_at = NOW(),
        confirmation_email_sent_at = NOW(),
        admin_notes = ${adminNotes ? String(adminNotes) : (reservation.admin_notes || '')},
        updated_at = NOW()
      WHERE id = ${reservation.id}
      RETURNING *
    `;

    const confirmedReservation = Array.isArray(updateRes) ? updateRes[0] : (updateRes as any)?.rows?.[0];

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Payment verified and official confirmation email sent via Resend!',
        emailDispatched: emailSendResult.success,
        reservation: confirmedReservation,
      }),
    };
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Server error verifying payment', details: err?.message }),
    };
  }
};
