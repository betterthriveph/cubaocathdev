/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Send Payment Instructions & Start 2-Hour Slot Hold (Admin Only)
 * 
 * Flow:
 * 1. Admin confirms payment amounts, instructions, and deadline.
 * 2. Server generates payment upload URL and sends transactional email via Resend.
 * 3. ONLY upon successful email send:
 *    - Updates reservation status to 'awaiting_payment'
 *    - Sets payment_status = 'unpaid'
 *    - Sets hold_expires_at = NOW() + INTERVAL '2 hours'
 */

import { getDatabaseClient } from './utils/db';
import { verifyAdminUser, NetlifyRequestEvent, NetlifyRequestContext } from './utils/auth';
import { sendEmail, buildPaymentInstructionsEmail } from './utils/email';

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
      agreedAmount,
      depositDue,
      paymentDeadline,
      paymentInstructions,
      paymentMethodDetails,
      paymentNotes,
      siteOrigin, // e.g. https://cubaocathedral.com or current origin
    } = payload;

    console.log(`[send-payment-instructions] Dispatching payment instructions for reservation: ${reservationId} by admin: ${auth.user.email}`);

    if (!reservationId) {
      console.warn('[send-payment-instructions] Validation failure: reservationId is required');
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'reservationId is required' }),
      };
    }

    const db = getDatabaseClient();

    // 2. Fetch reservation with facility name
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
        body: JSON.stringify({ error: 'Reservation not found' }),
      };
    }

    const reservation = resRows[0];
    const cleanAgreedAmount = agreedAmount !== undefined ? Number(agreedAmount) : Number(reservation.agreed_price || reservation.amount || 0);
    const cleanDepositDue = depositDue !== undefined ? Number(depositDue) : Number(reservation.deposit_due || cleanAgreedAmount * 0.3);
    const cleanDeadline = paymentDeadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const cleanInstructions = paymentInstructions !== undefined ? String(paymentInstructions) : (reservation.payment_instructions || '');
    const cleanMethodDetails = paymentMethodDetails !== undefined ? String(paymentMethodDetails) : (reservation.payment_method_details || '');
    const cleanNotes = paymentNotes !== undefined ? String(paymentNotes) : (reservation.payment_notes || '');

    // 3. Construct Proof of Payment URL
    const baseUrl = siteOrigin || event.headers['origin'] || event.headers['host'] ? `https://${event.headers['host']}` : 'https://cubaocathedral.com';
    const uploadUrl = `${baseUrl.replace(/\/$/, '')}/facilities/payment/${reservation.reference_code || reservation.id}`;

    // 4. Build and dispatch payment instruction email via Resend
    const emailData = buildPaymentInstructionsEmail({
      applicantName: reservation.customer_name,
      referenceCode: reservation.reference_code,
      facilityName: reservation.facility_name || 'Cathedral Facility Space',
      date: new Date(reservation.reservation_date).toISOString().split('T')[0],
      startTime: reservation.start_time || '08:00 AM',
      endTime: reservation.end_time || '12:00 PM',
      agreedAmount: cleanAgreedAmount,
      depositDue: cleanDepositDue,
      paymentDeadline: cleanDeadline,
      paymentMethodDetails: cleanMethodDetails,
      paymentInstructions: cleanInstructions,
      paymentUploadUrl: uploadUrl,
    });

    const emailSendResult = await sendEmail({
      to: reservation.customer_email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    if (!emailSendResult.success) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: `Failed to dispatch payment instructions email via Resend: ${emailSendResult.error}. Hold timer was NOT started.`,
        }),
      };
    }

    // 5. Email succeeded! Now update reservation and calculate 2-hour hold: NOW() + 2 hours
    const updateRes = await db.sql`
      UPDATE reservations
      SET 
        status = 'awaiting_payment',
        payment_status = 'unpaid',
        agreed_price = ${cleanAgreedAmount},
        deposit_due = ${cleanDepositDue},
        payment_deadline = ${cleanDeadline}::timestamptz,
        payment_instructions = ${cleanInstructions},
        payment_method_details = ${cleanMethodDetails},
        payment_notes = ${cleanNotes},
        hold_expires_at = NOW() + INTERVAL '2 hours',
        updated_at = NOW()
      WHERE id = ${reservation.id}
      RETURNING *
    `;

    const updatedReservation = Array.isArray(updateRes) ? updateRes[0] : (updateRes as any)?.rows?.[0];

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Payment instructions email successfully dispatched. 2-hour slot hold has been activated.',
        holdExpiresAt: updatedReservation?.hold_expires_at,
        reservation: updatedReservation,
      }),
    };
  } catch (err: any) {
    console.error('Error sending payment instructions:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Server error processing payment instructions', details: err?.message }),
    };
  }
};
