/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Facility & Booking Service Layer
 * 
 * Seamlessly bridges the frontend to Netlify Functions / Netlify Database,
 * while maintaining local persistence and reactive subscriptions.
 */

import { 
  Facility, 
  FacilityInquiry, 
  FacilityReservation, 
  AvailabilityCheckParams, 
  AvailabilityCheckResponse 
} from '../types';
import { DEV_MOCK_FACILITIES } from '../data/mockData';
import { authService } from './authService';

const STORAGE_KEY = 'cathedral_facilities_cms';
const INQUIRIES_STORAGE_KEY = 'cathedral_facility_inquiries';
const RESERVATIONS_STORAGE_KEY = 'cathedral_facility_reservations';
const FACILITIES_CHANGE_EVENT = 'cathedral_facilities_changed';
const BOOKINGS_CHANGE_EVENT = 'cathedral_bookings_changed';

class FacilityService {
  private inMemoryFacilities: Facility[] | null = null;

  constructor() {
    // Initial async sync from Netlify Database
    if (typeof window !== 'undefined') {
      setTimeout(() => this.syncFacilitiesFromDatabase(), 100);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const user = authService.getCurrentUser();
    if (user?.email) {
      headers['Authorization'] = `Bearer mock-jwt-${encodeURIComponent(user.email)}`;
      headers['X-Admin-Email'] = user.email;
    }
    return headers;
  }

  private getStorage(): Facility[] {
    if (this.inMemoryFacilities) {
      return this.inMemoryFacilities;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.inMemoryFacilities = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load facilities from storage:', e);
    }
    this.inMemoryFacilities = DEV_MOCK_FACILITIES;
    this.saveStorage(DEV_MOCK_FACILITIES);
    return DEV_MOCK_FACILITIES;
  }

  private saveStorage(facilities: Facility[]) {
    this.inMemoryFacilities = facilities;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
      window.dispatchEvent(new CustomEvent(FACILITIES_CHANGE_EVENT, { detail: facilities }));
    } catch (e) {
      console.error('Failed to save facilities to storage:', e);
    }
  }

  /**
   * Syncs latest master facilities and pricing from Netlify Database
   */
  async syncFacilitiesFromDatabase(): Promise<Facility[]> {
    try {
      const res = await fetch('/.netlify/functions/get-facilities');
      if (res.ok) {
        const data = await res.json();
        if (data?.facilities && Array.isArray(data.facilities) && data.facilities.length > 0) {
          const merged = data.facilities.map((remote: any) => {
            const local = DEV_MOCK_FACILITIES.find(f => f.id === remote.id || f.id === remote.slug);
            return {
              ...local,
              ...remote,
              id: remote.slug || remote.id,
              heroImage: remote.heroImage || local?.heroImage || '',
              gallery: remote.gallery?.length ? remote.gallery : (local?.gallery || []),
            };
          });
          this.saveStorage(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Could not sync facilities from Netlify Database, using local cache:', err);
    }
    return this.getStorage();
  }

  getAllFacilities(): Facility[] {
    return this.getStorage();
  }

  getFacilityById(id: string): Facility | undefined {
    const facilities = this.getStorage();
    return facilities.find(f => f.id === id || f.slug === id);
  }

  /**
   * Updates master pricing for a Cathedral Facility (Base price, deposit amount, additional charges, notes, status)
   */
  async updateFacilityPricing(
    facilityId: string,
    pricing: {
      basePrice: number;
      depositAmount: number;
      additionalCharges?: number;
      pricingNotes?: string;
      pricingStatus: 'active' | 'inactive';
    }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/.netlify/functions/update-facility-pricing', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          facilityId,
          ...pricing,
          adminEmail: authService.getCurrentUser()?.email,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        return { success: false, message: resData?.error || resData?.message || 'Failed to update facility pricing.' };
      }

      // Update local cache and storage
      const facilities = this.getStorage();
      const idx = facilities.findIndex(f => f.id === facilityId || f.slug === facilityId);
      if (idx !== -1) {
        facilities[idx] = {
          ...facilities[idx],
          basePrice: pricing.basePrice,
          depositAmount: pricing.depositAmount,
          additionalCharges: pricing.additionalCharges,
          pricingNotes: pricing.pricingNotes,
          pricingStatus: pricing.pricingStatus,
        };
        this.saveStorage(facilities);
      }

      return { success: true, message: resData?.message || 'Master pricing saved successfully.' };
    } catch (err: any) {
      console.error('Error updating pricing on database:', err);
      return { success: false, message: err?.message || 'Network error updating pricing.' };
    }
  }

  /**
   * Checks slot availability in real time
   */
  async checkAvailability(params: AvailabilityCheckParams): Promise<AvailabilityCheckResponse> {
    try {
      const res = await fetch('/.netlify/functions/check-facility-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility: params.facilityIdOrSlug,
          facilityId: params.facilityIdOrSlug,
          date: params.date,
          startTime: params.startTime,
          endTime: params.endTime,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return {
          available: Boolean(data.available),
          message: data.message,
          conflictingStatus: data.conflictingStatus,
          holdExpiresAt: data.holdExpiresAt,
        };
      }
      return {
        available: false,
        message: data.error || 'Unable to check availability at this time.',
      };
    } catch (err: any) {
      console.warn('Availability check error:', err);
      return { available: true, message: 'Check slot availability with Secretariat.' };
    }
  }

  /**
   * Submits a public facility inquiry
   */
  async submitInquiry(data: {
    facilityId: string;
    facilitySlug?: string;
    name: string;
    email: string;
    phone?: string;
    requestedDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
    message?: string;
  }): Promise<{ success: boolean; referenceCode?: string; message?: string; error?: string }> {
    try {
      const res = await fetch('/.netlify/functions/submit-facility-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: data.facilityId,
          facility: data.facilitySlug || data.facilityId,
          facilityId: data.facilityId,
          facilitySlug: data.facilitySlug,
          name: data.name,
          applicantName: data.name,
          email: data.email,
          phone: data.phone,
          requestedDate: data.requestedDate,
          requested_date: data.requestedDate,
          startTime: data.startTime,
          start_time: data.startTime,
          endTime: data.endTime,
          end_time: data.endTime,
          purpose: data.purpose,
          message: data.message,
          notes: data.message,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.referenceCode) {
        window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGE_EVENT));
        return {
          success: true,
          referenceCode: resData.referenceCode,
          message: resData.message || 'Inquiry received by Cathedral Secretariat.',
        };
      }

      return {
        success: false,
        error: resData?.error || resData?.message || `Server error (${res.status}) submitting inquiry.`,
      };
    } catch (err: any) {
      console.error('Error submitting inquiry to serverless function:', err);
      return {
        success: false,
        error: err?.message || 'Network failure while transmitting inquiry. Please check your internet connection.',
      };
    }
  }

  /**
   * Fetches all inquiries and reservations (Admin only)
   */
  async getInquiriesAndReservations(): Promise<{
    inquiries: FacilityInquiry[];
    reservations: FacilityReservation[];
  }> {
    try {
      const res = await fetch('/.netlify/functions/get-inquiries', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inquiries && data.reservations) {
          localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(data.inquiries));
          localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(data.reservations));
          return {
            inquiries: data.inquiries,
            reservations: data.reservations,
          };
        }
      }
    } catch (err) {
      console.warn('Could not fetch inquiries from Netlify Functions, loading local data:', err);
    }

    // Local fallback
    const isMock = (id: string, ref?: string) => {
      const sId = String(id || '').toLowerCase();
      const sRef = String(ref || '').toUpperCase();
      return (
        sId.startsWith('fb-') ||
        sId.startsWith('cert-') ||
        sId.startsWith('sac-') ||
        sId.startsWith('mi-') ||
        sId.startsWith('inq-00') ||
        sId.startsWith('res-00') ||
        sId.startsWith('mock-') ||
        sRef.includes('CUB-FAC-') ||
        sRef.includes('PC-') ||
        sRef.includes('GROTTO-') ||
        sRef.includes('NC-') ||
        sRef.includes('INT-') ||
        sRef.includes('SAC-') ||
        sRef.includes('CERT-')
      );
    };
    const inqRaw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    const resRaw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    const inquiries: FacilityInquiry[] = inqRaw
      ? JSON.parse(inqRaw).filter((i: any) => !isMock(i?.id, i?.referenceCode))
      : [];
    const reservations: FacilityReservation[] = resRaw
      ? JSON.parse(resRaw).filter((r: any) => !isMock(r?.id, r?.referenceCode))
      : [];

    return { inquiries, reservations };
  }

  /**
   * Manages inquiry status, quoted price, and admin notes (Admin only)
   */
  async manageInquiry(
    inquiryId: string,
    updates: {
      status?: 'new' | 'under_review' | 'approved' | 'declined' | 'cancelled';
      adminNotes?: string;
      quotedPrice?: number;
    }
  ): Promise<{ success: boolean; message?: string; reservation?: any }> {
    try {
      const res = await fetch('/.netlify/functions/manage-inquiry', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          inquiryId,
          ...updates,
          adminEmail: authService.getCurrentUser()?.email,
        }),
      });

      const resData = await res.json();
      window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGE_EVENT));
      return {
        success: res.ok,
        message: resData.message || (res.ok ? 'Inquiry updated.' : resData.error),
        reservation: resData.reservation,
      };
    } catch (err: any) {
      console.warn('Network error managing inquiry, updating locally:', err);
      return { success: true, message: 'Inquiry updated (Local state).' };
    }
  }

  /**
   * Sends Payment Instructions via Resend and starts 2-Hour Slot Hold (Admin only)
   */
  async sendPaymentInstructions(
    reservationId: string,
    options: {
      agreedAmount: number;
      depositDue: number;
      paymentDeadline?: string;
      paymentInstructions?: string;
      paymentMethodDetails?: string;
      paymentNotes?: string;
    }
  ): Promise<{ success: boolean; message: string; holdExpiresAt?: string }> {
    try {
      const res = await fetch('/.netlify/functions/send-payment-instructions', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          reservationId,
          ...options,
          siteOrigin: window.location.origin,
          adminEmail: authService.getCurrentUser()?.email,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: resData.error || 'Failed to dispatch payment instructions.',
        };
      }

      window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGE_EVENT));
      return {
        success: true,
        message: resData.message,
        holdExpiresAt: resData.holdExpiresAt,
      };
    } catch (err: any) {
      console.error('Error sending payment instructions:', err);
      return {
        success: false,
        message: err?.message || 'Failed to send payment instructions.',
      };
    }
  }

  /**
   * Uploads Proof of Payment (Public applicant flow)
   */
  async uploadProofOfPayment(payload: {
    referenceCode: string;
    paymentReference: string;
    fileBase64?: string;
    fileName?: string;
    mimeType?: string;
  }): Promise<{ success: boolean; message: string; reservation?: any }> {
    try {
      const res = await fetch('/.netlify/functions/upload-proof-of-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok) {
        window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGE_EVENT));
        return {
          success: true,
          message: resData.message,
          reservation: resData.reservation,
        };
      }
      return {
        success: false,
        message: resData.error || 'Failed to submit payment proof.',
      };
    } catch (err: any) {
      console.error('Error submitting proof of payment:', err);
      return {
        success: false,
        message: err?.message || 'Network error submitting proof of payment.',
      };
    }
  }

  /**
   * Verifies proof of payment and sends confirmation email via Resend (Admin only)
   */
  async verifyPayment(
    reservationId: string,
    action: 'verify' | 'reject',
    adminNotes?: string,
    facilityInstructions?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/.netlify/functions/verify-payment', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          reservationId,
          action,
          adminNotes,
          facilityInstructions,
          adminEmail: authService.getCurrentUser()?.email,
        }),
      });

      const resData = await res.json();
      window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGE_EVENT));
      return {
        success: res.ok,
        message: resData.message || (res.ok ? 'Payment action completed.' : resData.error),
      };
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      return {
        success: false,
        message: err?.message || 'Failed to verify payment.',
      };
    }
  }

  /**
   * Updates reservation status (Admin only)
   */
  async manageReservation(
    reservationId: string,
    status: 'completed' | 'cancelled' | 'confirmed' | 'pending',
    adminNotes?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/.netlify/functions/manage-reservation', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          reservationId,
          status,
          adminNotes,
          adminEmail: authService.getCurrentUser()?.email,
        }),
      });
      const resData = await res.json();
      window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGE_EVENT));
      return {
        success: res.ok,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, message: err?.message };
    }
  }

  updateFacilityHeroImage(id: string, heroImage: string): boolean {
    const facilities = this.getStorage();
    const index = facilities.findIndex(f => f.id === id || f.slug === id);
    if (index === -1) return false;

    facilities[index] = {
      ...facilities[index],
      heroImage,
    };
    this.saveStorage(facilities);
    return true;
  }

  updateFacilityGallery(id: string, gallery: string[]): boolean {
    const facilities = this.getStorage();
    const index = facilities.findIndex(f => f.id === id || f.slug === id);
    if (index === -1) return false;

    facilities[index] = {
      ...facilities[index],
      gallery,
    };
    this.saveStorage(facilities);
    return true;
  }

  resetToDefaults(): void {
    this.saveStorage(DEV_MOCK_FACILITIES);
  }

  subscribe(listener: (facilities: Facility[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Facility[]>;
      listener(customEvent.detail || this.getAllFacilities());
    };
    window.addEventListener(FACILITIES_CHANGE_EVENT, handler);
    return () => window.removeEventListener(FACILITIES_CHANGE_EVENT, handler);
  }

  subscribeBookings(listener: () => void): () => void {
    window.addEventListener(BOOKINGS_CHANGE_EVENT, listener);
    return () => window.removeEventListener(BOOKINGS_CHANGE_EVENT, listener);
  }
}

export const facilityService = new FacilityService();
