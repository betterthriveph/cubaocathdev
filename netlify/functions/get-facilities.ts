/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Netlify Function: Get Facilities & Master Pricing (Public / Admin)
 */

import { getDatabaseClient } from './utils/db';

interface NetlifyEvent {
  httpMethod: string;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60, s-maxage=120',
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const db = getDatabaseClient();
    const result = await db.sql`
      SELECT 
        id, 
        name, 
        slug, 
        subname, 
        tagline, 
        description, 
        capacity, 
        location, 
        featured_image_url, 
        base_price, 
        deposit_amount, 
        additional_charges, 
        pricing_notes, 
        pricing_status, 
        status, 
        operating_hours,
        amenities,
        guidelines,
        suitable_for,
        rate_info,
        gallery
      FROM facilities
      ORDER BY name ASC
    `;

    const rows = Array.isArray(result) ? result : (result as any)?.rows || [];

    const facilities = rows.map((r: any) => ({
      id: String(r.slug || r.id),
      dbId: String(r.id),
      slug: String(r.slug || r.id),
      name: String(r.name),
      subname: String(r.subname || ''),
      tagline: String(r.tagline || ''),
      description: String(r.description || ''),
      capacity: r.capacity || '',
      locationDetails: String(r.location || 'Cathedral Parish Grounds'),
      heroImage: String(r.featured_image_url || ''),
      basePrice: Number(r.base_price || 0),
      depositAmount: Number(r.deposit_amount || 0),
      additionalCharges: Number(r.additional_charges || 0),
      pricingNotes: String(r.pricing_notes || ''),
      pricingStatus: (r.pricing_status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
      status: String(r.status || 'available'),
      operatingHours: String(r.operating_hours || '8:00 AM – 9:00 PM'),
      amenities: Array.isArray(r.amenities) ? r.amenities : [],
      guidelines: Array.isArray(r.guidelines) ? r.guidelines : [],
      suitableFor: Array.isArray(r.suitable_for) ? r.suitable_for : [],
      rateInfo: String(r.rate_info || ''),
      gallery: Array.isArray(r.gallery) ? r.gallery : [],
    }));

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ success: true, facilities }),
    };
  } catch (err: any) {
    console.error('Error fetching facilities from database:', err);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Failed to fetch facilities', details: err?.message }),
    };
  }
};
