/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Upload Proof of Payment (Public)
 * 
 * - Stores uploaded receipt in Netlify Blobs ('payment-proofs')
 * - Updates reservation:
 *   - payment_proof_url
 *   - payment_reference
 *   - payment_submitted_at = NOW()
 *   - payment_status = 'submitted'
 *   - status = 'payment_submitted'
 * - Sends operational email notification to ADMIN_NOTIFICATION_EMAIL
 */

import { getDatabaseClient } from './utils/db';
import { sendAdminNotification } from './utils/email';
import { getStore } from '@netlify/blobs';

interface NetlifyEvent {
  httpMethod: string;
  body?: string | null;
  queryStringParameters?: Record<string, string | undefined> | null;
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

  // --- GET: Retrieve sanitized reservation details for public payment page ---
  if (event.httpMethod === 'GET') {
    try {
      const qParams = event.queryStringParameters || {};
      const refCode = qParams.referenceCode || qParams.reservationReference || qParams.ref || qParams.id;

      console.log(`[upload-proof-of-payment] GET request received for refCode: ${refCode || 'empty'}`);

      if (!refCode || !refCode.trim()) {
        console.warn('[upload-proof-of-payment] GET validation failure: reference code is required.');
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: JSON.stringify({ error: 'Reservation reference is required.' }),
        };
      }

      const cleanRef = refCode.trim();
      const db = getDatabaseClient();

      const resRes = await db.sql`
        SELECT 
          r.id,
          r.reference_code,
          r.customer_name,
          r.customer_email,
          r.reservation_date,
          r.start_time,
          r.end_time,
          r.status,
          r.amount,
          r.agreed_price,
          r.deposit_due,
          r.payment_status,
          r.payment_deadline,
          r.payment_instructions,
          r.payment_method_details,
          r.hold_expires_at,
          r.payment_submitted_at,
          r.payment_reference,
          f.name as facility_name
        FROM reservations r
        LEFT JOIN facilities f ON r.facility_id = f.id
        WHERE r.reference_code = ${cleanRef} OR r.id::text = ${cleanRef}
        LIMIT 1
      `;

      const resRows = Array.isArray(resRes) ? resRes : (resRes as any)?.rows || [];

      if (resRows.length === 0) {
        console.warn(`[upload-proof-of-payment] Booking not found for reference: ${cleanRef}`);
        return {
          statusCode: 404,
          headers: jsonHeaders,
          body: JSON.stringify({ error: 'Booking not found.' }),
        };
      }

      const r = resRows[0];
      const holdTime = r.hold_expires_at ? new Date(r.hold_expires_at).getTime() : null;
      const isHoldExpired = Boolean(
        holdTime &&
        holdTime < Date.now() &&
        r.status === 'awaiting_payment' &&
        (r.payment_status === 'unpaid' || !r.payment_status)
      );

      const agreedAmt = Number(r.agreed_price || r.amount || 0);
      const depositAmt = Number(r.deposit_due || (agreedAmt > 0 ? agreedAmt * 0.3 : 0));

      console.log(`[upload-proof-of-payment] GET success: Retrieved booking ${r.reference_code} (Status: ${r.status}, Payment: ${r.payment_status})`);

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          reservation: {
            referenceCode: r.reference_code || String(r.id),
            applicantName: r.customer_name,
            facility: r.facility_name || 'Cathedral Facility Space',
            eventDate: r.reservation_date ? new Date(r.reservation_date).toISOString().split('T')[0] : '',
            startTime: r.start_time || '08:00 AM',
            endTime: r.end_time || '12:00 PM',
            agreedAmount: agreedAmt,
            amountDue: depositAmt,
            paymentDeadline: r.payment_deadline ? new Date(r.payment_deadline).toISOString().split('T')[0] : null,
            paymentInstructions: r.payment_instructions || r.payment_method_details || 'Please deposit or transfer to the Cathedral Account and upload your transfer slip.',
            currentPaymentStatus: r.payment_status || 'unpaid',
            status: r.status,
            holdExpiresAt: r.hold_expires_at,
            isExpired: isHoldExpired,
            paymentSubmittedAt: r.payment_submitted_at,
          },
        }),
      };
    } catch (err: any) {
      console.error('[upload-proof-of-payment] Database failure on GET:', err);
      return {
        statusCode: 500,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Database failure retrieving booking details', details: err?.message }),
      };
    }
  }

  // --- POST: Handle Proof of Payment Upload ---
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const {
      referenceCode, // or reservationId
      paymentReference, // e.g. "BDO Ref # 9384910283"
      fileBase64,
      fileName,
      mimeType,
    } = payload;

    console.log(`[upload-proof-of-payment] Received proof upload for referenceCode: ${referenceCode}`);

    if (!referenceCode || (!fileBase64 && !paymentReference)) {
      console.warn('[upload-proof-of-payment] Validation failure: referenceCode and payment proof/reference details are required.');
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'referenceCode and payment proof / reference details are required.' }),
      };
    }

    const db = getDatabaseClient();

    // 1. Fetch reservation
    const resRes = await db.sql`
      SELECT 
        r.*, 
        f.name as facility_name
      FROM reservations r
      LEFT JOIN facilities f ON r.facility_id = f.id
      WHERE r.reference_code = ${referenceCode} OR r.id::text = ${referenceCode}
      LIMIT 1
    `;
    const resRows = Array.isArray(resRes) ? resRes : (resRes as any)?.rows || [];

    if (resRows.length === 0) {
      console.warn(`[upload-proof-of-payment] POST failure: Booking not found for reference: ${referenceCode}`);
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Booking not found.' }),
      };
    }

    const reservation = resRows[0];

    // Check if 2-hour hold has expired and no payment was previously submitted
    const holdTime = reservation.hold_expires_at ? new Date(reservation.hold_expires_at).getTime() : null;
    const isHoldExpired = Boolean(
      holdTime &&
      holdTime < Date.now() &&
      reservation.status === 'awaiting_payment' &&
      (reservation.payment_status === 'unpaid' || !reservation.payment_status)
    );

    if (isHoldExpired) {
      console.warn(`[upload-proof-of-payment] POST rejected: 2-hour payment window expired for ${referenceCode}`);
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: 'This payment window has expired. Please contact Cubao Cathedral for assistance.',
        }),
      };
    }

    // 2. Save proof file in Netlify Blobs or fallback storage
    let proofUrl = fileBase64 || '';
    if (fileBase64) {
      try {
        const store = getStore('payment-proofs');
        const fileKey = `${reservation.reference_code || reservation.id}-${Date.now()}-${fileName || 'receipt'}`;
        const buffer = Buffer.from(fileBase64.replace(/^data:[^;]+;base64,/, ''), 'base64');
        
        await store.set(fileKey, buffer, {
          metadata: {
            reservationId: String(reservation.id),
            referenceCode: String(reservation.reference_code),
            mimeType: mimeType || 'image/jpeg',
          },
        });

        // Store persistent blob key / identifier
        proofUrl = `blob://payment-proofs/${fileKey}`;
      } catch (blobErr: any) {
        console.warn('[upload-proof-of-payment] Netlify Blobs storage notice:', blobErr?.message || blobErr);
        // If Netlify Blobs token is absent in standalone dev, keep data/url string safely
        proofUrl = fileBase64.length < 500000 ? fileBase64 : `Receipt-Attached-${Date.now()}`;
      }
    }

    const cleanPaymentRef = paymentReference ? String(paymentReference).trim() : `Proof submitted on ${new Date().toLocaleDateString()}`;

    // 3. Update reservation in Netlify Database
    const updateRes = await db.sql`
      UPDATE reservations
      SET 
        status = 'payment_submitted',
        payment_status = 'submitted',
        payment_proof_url = ${proofUrl},
        payment_reference = ${cleanPaymentRef},
        payment_submitted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${reservation.id}
      RETURNING *
    `;

    const updatedReservation = Array.isArray(updateRes) ? updateRes[0] : (updateRes as any)?.rows?.[0];
    console.log(`[upload-proof-of-payment] Success: Updated reservation ${reservation.reference_code} to payment_submitted.`);

    // 4. Send operational notification email to ADMIN_NOTIFICATION_EMAIL
    try {
      await sendAdminNotification(
        `Payment Submitted: ${reservation.reference_code} - ${reservation.facility_name}`,
        `Payment proof has been submitted by applicant for Cathedral Reservation:

Reference Code: ${reservation.reference_code}
Customer: ${reservation.customer_name} (${reservation.customer_email}, ${reservation.phone || 'N/A'})
Facility: ${reservation.facility_name}
Date: ${new Date(reservation.reservation_date).toLocaleDateString()}
Agreed Price: ₱${Number(reservation.agreed_price || reservation.amount || 0).toLocaleString()}
Deposit Due: ₱${Number(reservation.deposit_due || 0).toLocaleString()}
Payment Ref / Note: ${cleanPaymentRef}

Please review and verify the payment proof in the Admin Dashboard to send the official booking confirmation.`
      );
      console.log(`[upload-proof-of-payment] Email notification dispatched for ${reservation.reference_code}`);
    } catch (notifyErr: any) {
      console.warn('[upload-proof-of-payment] Email notification failure:', notifyErr?.message || notifyErr);
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Proof of payment submitted successfully. Your reservation is now under review by our parish accounting staff for final confirmation.',
        reservation: {
          id: updatedReservation?.id,
          referenceCode: updatedReservation?.reference_code,
          facilityName: reservation.facility_name,
          customerName: reservation.customer_name,
          reservationDate: reservation.reservation_date,
          status: 'payment_submitted',
          paymentStatus: 'submitted',
          paymentSubmittedAt: updatedReservation?.payment_submitted_at,
        },
      }),
    };
  } catch (err: any) {
    console.error('[upload-proof-of-payment] Database failure on POST:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to submit payment proof', details: err?.message }),
    };
  }
};
