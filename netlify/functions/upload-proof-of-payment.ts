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
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Reservation record not found.' }),
      };
    }

    const reservation = resRows[0];

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
      } catch (blobErr) {
        console.warn('Netlify Blobs storage warning, using payload representation:', blobErr);
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
    } catch (notifyErr) {
      console.warn('Could not dispatch admin payment proof notification:', notifyErr);
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
    console.error('Error uploading payment proof:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to submit payment proof', details: err?.message }),
    };
  }
};
