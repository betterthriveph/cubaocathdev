/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Parish Services & Reservations Service Layer
 * 
 * Manages Facility Bookings, Sacrament Registrations, Certificate Requests,
 * and Mass Intentions. Structured for seamless Netlify Database / PostgreSQL
 * or REST API migration.
 */

import { 
  FacilityBooking, 
  CertificateRequest, 
  MassIntention, 
  SacramentBooking,
  INITIAL_FACILITY_BOOKINGS,
  INITIAL_CERTIFICATE_REQUESTS,
  INITIAL_MASS_INTENTIONS,
  INITIAL_SACRAMENTS 
} from '../data/adminData';

const BOOKINGS_KEY = 'cathedral_facility_bookings_cms';
const CERTIFICATES_KEY = 'cathedral_certificates_cms';
const INTENTIONS_KEY = 'cathedral_intentions_cms';
const SACRAMENTS_KEY = 'cathedral_sacraments_cms';

class ReservationService {
  /* ==========================================================================
     1. FACILITY BOOKINGS & RESERVATIONS
     ========================================================================== */
  getBookings(): FacilityBooking[] {
    try {
      const data = localStorage.getItem(BOOKINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load facility bookings:', e);
    }
    this.saveBookings(INITIAL_FACILITY_BOOKINGS);
    return INITIAL_FACILITY_BOOKINGS;
  }

  saveBookings(bookings: FacilityBooking[]): void {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings:', e);
    }
  }

  createBooking(booking: Omit<FacilityBooking, 'id' | 'referenceCode' | 'createdDate'>): FacilityBooking {
    const bookings = this.getBookings();
    const newBooking: FacilityBooking = {
      ...booking,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      referenceCode: `CUB-FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    this.saveBookings([newBooking, ...bookings]);
    return newBooking;
  }

  updateBookingStatus(id: string, status: FacilityBooking['status'], depositStatus?: FacilityBooking['depositStatus']): boolean {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return false;

    bookings[index] = {
      ...bookings[index],
      status,
      ...(depositStatus ? { depositStatus } : {}),
    };
    this.saveBookings(bookings);
    return true;
  }

  /* ==========================================================================
     2. CERTIFICATE REQUESTS
     ========================================================================== */
  getCertificateRequests(): CertificateRequest[] {
    try {
      const data = localStorage.getItem(CERTIFICATES_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load certificate requests:', e);
    }
    this.saveCertificates(INITIAL_CERTIFICATE_REQUESTS);
    return INITIAL_CERTIFICATE_REQUESTS;
  }

  saveCertificates(certificates: CertificateRequest[]): void {
    try {
      localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
    } catch (e) {
      console.error('Failed to save certificates:', e);
    }
  }

  createCertificateRequest(req: Omit<CertificateRequest, 'id' | 'referenceCode' | 'createdDate'>): CertificateRequest {
    const list = this.getCertificateRequests();
    const prefix = req.documentType.substring(0, 3).toUpperCase();
    const newReq: CertificateRequest = {
      ...req,
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      referenceCode: `CERT-${prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    this.saveCertificates([newReq, ...list]);
    return newReq;
  }

  /* ==========================================================================
     3. MASS INTENTIONS
     ========================================================================== */
  getMassIntentions(): MassIntention[] {
    try {
      const data = localStorage.getItem(INTENTIONS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load mass intentions:', e);
    }
    this.saveIntentions(INITIAL_MASS_INTENTIONS);
    return INITIAL_MASS_INTENTIONS;
  }

  saveIntentions(intentions: MassIntention[]): void {
    try {
      localStorage.setItem(INTENTIONS_KEY, JSON.stringify(intentions));
    } catch (e) {
      console.error('Failed to save intentions:', e);
    }
  }

  /* ==========================================================================
     4. SACRAMENT REGISTRATIONS
     ========================================================================== */
  getSacramentBookings(): SacramentBooking[] {
    try {
      const data = localStorage.getItem(SACRAMENTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load sacraments:', e);
    }
    this.saveSacraments(INITIAL_SACRAMENTS);
    return INITIAL_SACRAMENTS;
  }

  saveSacraments(sacraments: SacramentBooking[]): void {
    try {
      localStorage.setItem(SACRAMENTS_KEY, JSON.stringify(sacraments));
    } catch (e) {
      console.error('Failed to save sacraments:', e);
    }
  }
}

export const reservationService = new ReservationService();
