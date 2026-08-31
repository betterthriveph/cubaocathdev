/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Submit Facility Inquiry (Public)
 */

import { getDatabaseClient } from './utils/db';
import { sendAdminNotification } from './utils/email';

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
    
    // Support standard frontend variations of property names
    const facilityIdentifier = 
      payload.facilityId || 
      payload.facility_id || 
      payload.facility || 
      payload.facilitySlug || 
      payload.facility_slug;

    const name = 
      payload.name || 
      payload.applicantName || 
      payload.applicant_name || 
      payload.clientName || 
      payload.contactPerson;

    const email = 
      payload.email || 
      payload.clientEmail || 
      payload.contactEmail;

    const phone = 
      payload.phone || 
      payload.phoneNumber || 
      payload.phone_number || 
      payload.clientPhone || 
      payload.contactPhone;

    const requestedDate = 
      payload.requestedDate || 
      payload.requested_date || 
      payload.date || 
      payload.eventDate || 
      payload.targetDate;

    const startTime = 
      payload.startTime || 
      payload.start_time || 
      payload.targetTime;

    const endTime = 
      payload.endTime || 
      payload.end_time;

    const purpose = 
      payload.purpose || 
      payload.eventType || 
      payload.event_type || 
      payload.eventName;

    const message = 
      payload.message || 
      payload.notes || 
      payload.specialNotes || 
      payload.special_notes;

    console.log(`[submit-facility-inquiry] Received inquiry for facility: ${facilityIdentifier || 'unspecified'}, applicant: ${name || 'unspecified'} (${email || 'no-email'})`);

    if (!name || !email || !requestedDate || !facilityIdentifier) {
      console.warn(`[submit-facility-inquiry] Validation failure - missing required fields: name=${Boolean(name)}, email=${Boolean(email)}, requestedDate=${Boolean(requestedDate)}, facility=${Boolean(facilityIdentifier)}`);
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: 'Missing required fields: facility, applicant name, email, and requested date are required.',
        }),
      };
    }

    const db = getDatabaseClient();

    // 1. Resolve facility
    const facRes = await db.sql`
      SELECT id, name, slug, base_price, deposit_amount
      FROM facilities
      WHERE slug = ${facilityIdentifier} OR id::text = ${facilityIdentifier}
      LIMIT 1
    `;
    const facRows = Array.isArray(facRes) ? facRes : (facRes as any)?.rows || [];
    
    let resolvedFacilityDbId: string | null = null;
    let facilityName = 'Cathedral Facility Space';
    let defaultQuotedPrice = 0;

    if (facRows.length > 0) {
      resolvedFacilityDbId = facRows[0].id;
      facilityName = facRows[0].name;
      defaultQuotedPrice = Number(facRows[0].base_price || 0);
    }

    // 2. Generate human-readable reference number: INQ-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randDigits = Math.floor(10000 + Math.random() * 90000);
    const referenceCode = `INQ-${year}-${randDigits}`;

    const cleanStartTime = startTime || '08:00 AM';
    const cleanEndTime = endTime || '12:00 PM';
    const cleanPurpose = purpose || 'Parishioner Gathering / Event';
    const cleanMessage = message || '';

    // 3. Insert inquiry into database
    const insertRes = await db.sql`
      INSERT INTO inquiries (
        facility_id,
        reference_code,
        name,
        email,
        phone,
        requested_date,
        start_time,
        end_time,
        purpose,
        message,
        status,
        quoted_price
      ) VALUES (
        ${resolvedFacilityDbId},
        ${referenceCode},
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone ? phone.trim() : null},
        ${requestedDate}::date,
        ${cleanStartTime},
        ${cleanEndTime},
        ${cleanPurpose},
        ${cleanMessage},
        'new',
        ${defaultQuotedPrice}
      )
      RETURNING *
    `;

    const insertedInquiry = Array.isArray(insertRes) ? insertRes[0] : (insertRes as any)?.rows?.[0];

    // 4. Send operational notification email to ADMIN_NOTIFICATION_EMAIL
    try {
      await sendAdminNotification(
        `New Facility Inquiry (${referenceCode}) - ${facilityName}`,
        `A new facility inquiry has been submitted on the Cathedral Portal:

Reference Code: ${referenceCode}
Applicant: ${name} (${email}, ${phone || 'No phone provided'})
Facility: ${facilityName}
Requested Date: ${requestedDate}
Time: ${cleanStartTime} – ${cleanEndTime}
Purpose: ${cleanPurpose}
Notes / Message: ${cleanMessage || 'None'}

Review and manage this inquiry in the Cathedral Admin Dashboard.`
      );
      console.log(`[submit-facility-inquiry] Admin notification email dispatched for ${referenceCode}`);
    } catch (emailErr: any) {
      console.warn('[submit-facility-inquiry] Could not dispatch admin inquiry notification:', emailErr?.message || emailErr);
    }

    console.log(`[submit-facility-inquiry] Success: Created inquiry ${referenceCode} in database.`);

    return {
      statusCode: 201,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        referenceCode,
        inquiry: {
          id: insertedInquiry?.id || referenceCode,
          referenceCode,
          facilityName,
          name,
          email,
          requestedDate,
          startTime: cleanStartTime,
          endTime: cleanEndTime,
          purpose: cleanPurpose,
          status: 'new',
          quotedPrice: defaultQuotedPrice,
        },
        message: 'Your inquiry has been successfully submitted to the Cathedral Secretariat.',
      }),
    };
  } catch (err: any) {
    console.error('[submit-facility-inquiry] Database failure submitting inquiry:', err?.message || err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'Failed to submit inquiry to database',
        details: err?.message,
      }),
    };
  }
};
