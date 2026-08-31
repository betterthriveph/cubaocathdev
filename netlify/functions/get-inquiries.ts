/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Get Inquiries & Reservations (Admin Only)
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

  if (event.httpMethod !== 'GET') {
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
    const db = getDatabaseClient();

    // 2. Fetch Inquiries with facility info
    const inqRes = await db.sql`
      SELECT 
        i.id,
        i.reference_code,
        i.facility_id,
        f.name as facility_name,
        f.slug as facility_slug,
        i.name,
        i.email,
        i.phone,
        i.requested_date,
        i.start_time,
        i.end_time,
        i.purpose,
        i.message,
        i.status,
        i.quoted_price,
        i.admin_notes,
        i.created_at,
        i.updated_at
      FROM inquiries i
      LEFT JOIN facilities f ON i.facility_id = f.id
      ORDER BY i.created_at DESC
    `;
    const inqRows = Array.isArray(inqRes) ? inqRes : (inqRes as any)?.rows || [];

    // 3. Fetch Reservations with facility & inquiry link
    const resRes = await db.sql`
      SELECT 
        r.id,
        r.reference_code,
        r.inquiry_id,
        r.facility_id,
        f.name as facility_name,
        f.slug as facility_slug,
        r.customer_name,
        r.customer_email,
        r.phone,
        r.reservation_date,
        r.start_time,
        r.end_time,
        r.purpose,
        r.status,
        r.amount,
        r.agreed_price,
        r.deposit_due,
        r.payment_status,
        r.payment_reference,
        r.payment_proof_url,
        r.payment_submitted_at,
        r.payment_deadline,
        r.payment_instructions,
        r.payment_method_details,
        r.payment_notes,
        r.hold_expires_at,
        r.admin_notes,
        r.confirmed_at,
        r.confirmation_email_sent_at,
        r.reminder_sent_at,
        r.reminder_status,
        r.feedback_email_sent_at,
        r.feedback_status,
        r.created_at,
        r.updated_at
      FROM reservations r
      LEFT JOIN facilities f ON r.facility_id = f.id
      ORDER BY r.created_at DESC
    `;
    const resRows = Array.isArray(resRes) ? resRes : (resRes as any)?.rows || [];

    const inquiries = inqRows.map((r: any) => ({
      id: String(r.id),
      referenceCode: String(r.reference_code || `INQ-${r.id.substring(0, 8)}`),
      facilityId: String(r.facility_id || ''),
      facilityName: String(r.facility_name || 'Cathedral Space'),
      facilitySlug: String(r.facility_slug || ''),
      name: String(r.name),
      email: String(r.email),
      phone: r.phone ? String(r.phone) : '',
      requestedDate: r.requested_date ? new Date(r.requested_date).toISOString().split('T')[0] : '',
      startTime: String(r.start_time || '08:00 AM'),
      endTime: String(r.end_time || '12:00 PM'),
      purpose: String(r.purpose || ''),
      message: String(r.message || ''),
      status: String(r.status || 'new'),
      quotedPrice: Number(r.quoted_price || 0),
      adminNotes: String(r.admin_notes || ''),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    const reservations = resRows.map((r: any) => ({
      id: String(r.id),
      referenceCode: String(r.reference_code || `RES-${r.id.substring(0, 8)}`),
      inquiryId: r.inquiry_id ? String(r.inquiry_id) : undefined,
      facilityId: String(r.facility_id || ''),
      facilityName: String(r.facility_name || 'Cathedral Space'),
      facilitySlug: String(r.facility_slug || ''),
      customerName: String(r.customer_name),
      customerEmail: String(r.customer_email),
      phone: r.phone ? String(r.phone) : '',
      reservationDate: r.reservation_date ? new Date(r.reservation_date).toISOString().split('T')[0] : '',
      startTime: String(r.start_time || '08:00 AM'),
      endTime: String(r.end_time || '12:00 PM'),
      purpose: String(r.purpose || ''),
      status: String(r.status || 'pending'),
      amount: Number(r.amount || 0),
      agreedPrice: Number(r.agreed_price || r.amount || 0),
      depositDue: Number(r.deposit_due || 0),
      paymentStatus: String(r.payment_status || 'unpaid'),
      paymentReference: r.payment_reference ? String(r.payment_reference) : undefined,
      paymentProofUrl: r.payment_proof_url ? String(r.payment_proof_url) : undefined,
      paymentSubmittedAt: r.payment_submitted_at ? new Date(r.payment_submitted_at).toISOString() : undefined,
      paymentDeadline: r.payment_deadline ? new Date(r.payment_deadline).toISOString() : undefined,
      paymentInstructions: r.payment_instructions ? String(r.payment_instructions) : undefined,
      paymentMethodDetails: r.payment_method_details ? String(r.payment_method_details) : undefined,
      paymentNotes: r.payment_notes ? String(r.payment_notes) : undefined,
      holdExpiresAt: r.hold_expires_at ? new Date(r.hold_expires_at).toISOString() : undefined,
      adminNotes: r.admin_notes ? String(r.admin_notes) : undefined,
      confirmedAt: r.confirmed_at ? new Date(r.confirmed_at).toISOString() : undefined,
      confirmationEmailSentAt: r.confirmation_email_sent_at ? new Date(r.confirmation_email_sent_at).toISOString() : undefined,
      reminderSentAt: r.reminder_sent_at ? new Date(r.reminder_sent_at).toISOString() : undefined,
      reminderStatus: r.reminder_status ? String(r.reminder_status) : undefined,
      feedbackEmailSentAt: r.feedback_email_sent_at ? new Date(r.feedback_email_sent_at).toISOString() : undefined,
      feedbackStatus: r.feedback_status ? String(r.feedback_status) : undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        inquiries,
        reservations,
      }),
    };
  } catch (err: any) {
    console.error('Error fetching inquiries/reservations:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to retrieve inquiries', details: err?.message }),
    };
  }
};
