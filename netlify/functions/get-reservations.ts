/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Get Reservations & Calendar Data (Admin Only)
 * 
 * Retrieves live reservation records from Netlify Database for the Admin Booking Calendar.
 * 
 * Requirements:
 * 1. Live data source: Queries reservations table via serverless SQL (never directly from browser).
 * 2. Status handling:
 *    - Active calendar entries: 'awaiting_payment' (with future hold_expires_at), 'payment_submitted', 'confirmed'.
 *    - Historical: 'completed'.
 *    - Excluded from active calendar blocks: 'hold_expired', 'cancelled', 'declined'.
 *    - Expired holds (hold_expires_at <= NOW()) automatically stop appearing as active holds.
 * 3. Returns calendar metadata (facility, date, start/end time, reference, status, customer info, payment status, remaining hold time).
 * 4. Supports optional date range and facility filtering.
 */

import { getDatabaseClient } from './utils/db';
import { verifyAdminUser, NetlifyRequestEvent, NetlifyRequestContext } from './utils/auth';

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const handler = async (
  event: NetlifyRequestEvent & { queryStringParameters?: Record<string, string | undefined> | null },
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
      body: JSON.stringify({ error: auth.error || 'Unauthorized access to Cathedral booking records.' }),
    };
  }

  try {
    const db = getDatabaseClient();
    const params = event.queryStringParameters || {};
    const facilityFilter = params.facility || params.facilityId || params.facilitySlug;
    const startDate = params.startDate || params.start_date;
    const endDate = params.endDate || params.end_date;
    const statusParam = params.status;
    const activeOnly = params.activeOnly === 'true' || params.active_only === 'true';

    // 2. Fetch reservations joined with facilities
    const resResult = await db.sql`
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
        r.feedback_email_sent_at,
        r.created_at,
        r.updated_at
      FROM reservations r
      LEFT JOIN facilities f ON r.facility_id = f.id
      ORDER BY r.reservation_date ASC, r.start_time ASC
    `;

    const rows = Array.isArray(resResult) ? resResult : (resResult as any)?.rows || [];
    const now = Date.now();

    // 3. Map and compute real-time hold expirations & active statuses
    const allReservations = rows.map((r: any) => {
      const holdExpiresAtDate = r.hold_expires_at ? new Date(r.hold_expires_at) : null;
      const isHoldExpired = Boolean(
        r.status === 'awaiting_payment' && 
        holdExpiresAtDate && 
        holdExpiresAtDate.getTime() <= now
      );

      let effectiveStatus = String(r.status || 'pending');
      if (isHoldExpired) {
        effectiveStatus = 'hold_expired';
      }

      let remainingHoldSeconds = 0;
      if (r.status === 'awaiting_payment' && holdExpiresAtDate) {
        remainingHoldSeconds = Math.max(0, Math.floor((holdExpiresAtDate.getTime() - now) / 1000));
      }

      const resDate = r.reservation_date 
        ? new Date(r.reservation_date).toISOString().split('T')[0] 
        : '';

      const facilitySlug = String(r.facility_slug || r.facility_id || '');
      const facilityId = String(r.facility_id || r.facility_slug || '');

      return {
        id: String(r.id),
        referenceCode: String(r.reference_code || `RES-${r.id.substring(0, 8)}`),
        inquiryId: r.inquiry_id ? String(r.inquiry_id) : undefined,
        facilityId,
        facilityName: String(r.facility_name || 'Cathedral Facility Space'),
        facilitySlug,
        customerName: String(r.customer_name || 'Parishioner'),
        customerEmail: String(r.customer_email || ''),
        applicantName: String(r.customer_name || 'Parishioner'),
        applicantEmail: String(r.customer_email || ''),
        phone: r.phone ? String(r.phone) : '',
        reservationDate: resDate,
        eventDate: resDate,
        startTime: String(r.start_time || '08:00 AM'),
        endTime: String(r.end_time || '12:00 PM'),
        purpose: String(r.purpose || 'Cathedral Facility Event'),
        status: effectiveStatus,
        rawStatus: String(r.status || 'pending'),
        amount: Number(r.amount || 0),
        agreedAmount: Number(r.agreed_price || r.amount || 0),
        depositDue: Number(r.deposit_due || 0),
        paymentStatus: String(r.payment_status || 'unpaid'),
        paymentReference: r.payment_reference ? String(r.payment_reference) : undefined,
        paymentProofUrl: r.payment_proof_url ? String(r.payment_proof_url) : undefined,
        paymentSubmittedAt: r.payment_submitted_at ? new Date(r.payment_submitted_at).toISOString() : undefined,
        paymentDeadline: r.payment_deadline ? new Date(r.payment_deadline).toISOString() : undefined,
        paymentInstructions: r.payment_instructions ? String(r.payment_instructions) : undefined,
        paymentMethodDetails: r.payment_method_details ? String(r.payment_method_details) : undefined,
        paymentNotes: r.payment_notes ? String(r.payment_notes) : undefined,
        holdExpiresAt: holdExpiresAtDate ? holdExpiresAtDate.toISOString() : undefined,
        isHoldExpired,
        remainingHoldSeconds,
        adminNotes: r.admin_notes ? String(r.admin_notes) : undefined,
        confirmedAt: r.confirmed_at ? new Date(r.confirmed_at).toISOString() : undefined,
        confirmationEmailSentAt: r.confirmation_email_sent_at ? new Date(r.confirmation_email_sent_at).toISOString() : undefined,
        reminderSentAt: r.reminder_sent_at ? new Date(r.reminder_sent_at).toISOString() : undefined,
        feedbackEmailSentAt: r.feedback_email_sent_at ? new Date(r.feedback_email_sent_at).toISOString() : undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    });

    // 4. Apply filter parameters
    let filtered = allReservations;

    // Facility filter
    if (facilityFilter && facilityFilter !== 'all') {
      filtered = filtered.filter(
        (r) => r.facilityId === facilityFilter || r.facilitySlug === facilityFilter
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((r) => r.reservationDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((r) => r.reservationDate <= endDate);
    }

    // Status filter
    if (statusParam && statusParam !== 'all') {
      filtered = filtered.filter((r) => r.status === statusParam);
    }

    // Active calendar filter (matches Availability Check conflict rules):
    // Active calendar blocks: awaiting_payment (not expired), payment_submitted, confirmed, and completed
    // Excludes: cancelled, declined, and hold_expired
    const calendarBookings = filtered.filter((r) => {
      if (r.status === 'cancelled' || r.status === 'declined' || r.status === 'hold_expired' || r.isHoldExpired) {
        return false;
      }
      return (
        r.status === 'awaiting_payment' ||
        r.status === 'payment_submitted' ||
        r.status === 'confirmed' ||
        r.status === 'completed'
      );
    });

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        total: allReservations.length,
        calendarCount: calendarBookings.length,
        reservations: activeOnly ? calendarBookings : filtered,
        calendarBookings,
        allReservations,
      }),
    };
  } catch (err: any) {
    console.error('Error fetching calendar reservations:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'Failed to retrieve reservation records from Netlify Database.',
        details: err?.message,
      }),
    };
  }
};
