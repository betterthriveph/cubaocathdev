/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Update Facility Master Pricing (Admin Only)
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

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 1. Verify authenticated admin from Netlify Identity & admin_users
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
      facilityId, 
      basePrice, 
      depositAmount, 
      additionalCharges, 
      pricingNotes, 
      pricingStatus 
    } = payload;

    if (!facilityId) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'facilityId is required' }),
      };
    }

    const cleanBasePrice = Number(basePrice || 0);
    const cleanDepositAmount = Number(depositAmount || 0);
    const cleanAdditionalCharges = Number(additionalCharges || 0);
    const cleanPricingNotes = String(pricingNotes || '');
    const cleanPricingStatus = pricingStatus === 'inactive' ? 'inactive' : 'active';

    const db = getDatabaseClient();

    // Update master pricing for the facility by ID or slug
    const updateResult = await db.sql`
      UPDATE facilities
      SET 
        base_price = ${cleanBasePrice},
        deposit_amount = ${cleanDepositAmount},
        additional_charges = ${cleanAdditionalCharges},
        pricing_notes = ${cleanPricingNotes},
        pricing_status = ${cleanPricingStatus},
        updated_at = NOW()
      WHERE id::text = ${facilityId} OR slug = ${facilityId}
      RETURNING id, name, slug, base_price, deposit_amount, additional_charges, pricing_notes, pricing_status
    `;

    const updatedRows = Array.isArray(updateResult) ? updateResult : (updateResult as any)?.rows || [];

    if (!updatedRows || updatedRows.length === 0) {
      return {
        statusCode: 404,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Facility not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        facility: updatedRows[0],
        message: 'Master pricing updated successfully. Existing historical reservations remain unchanged.',
      }),
    };
  } catch (err: any) {
    console.error('Error updating facility pricing:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to update pricing', details: err?.message }),
    };
  }
};
