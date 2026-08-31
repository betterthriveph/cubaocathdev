export interface FacilityBooking {
  id: string;
  referenceCode: string;
  facilityId: 'parish-center-small' | 'parish-center-big' | 'parish-center-multipurpose' | 'parish-center-grand' | 'parish-center-st-joseph' | 'parish-center-formation' | 'grotto-ascension' | 'grotto-assumption' | 'grotto' | 'nativity-chapel';
  facilityName: string;
  eventName: string;
  clientName: string;
  clientOrganization?: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  timeSlot: string;
  pax: number;
  totalAmount: number;
  depositAmount: number;
  depositStatus: 'Paid' | 'Partial' | 'Unpaid';
  status: 'Confirmed' | 'Pending Review' | 'Payment Requested' | 'Completed' | 'Cancelled';
  addons: string[];
  notes?: string;
  createdDate: string;
  livestreaming?: boolean;
  paymentRequestedDate?: string;
  paymentDetailsSent?: boolean;
}

export interface CertificateRequest {
  id: string;
  referenceCode: string;
  documentType: 'Baptismal' | 'Confirmation' | 'First Communion' | 'Wedding';
  fullName: string;
  birthday: string;
  fatherName: string;
  motherName: string;
  sacramentDate: string;
  purpose: string;
  requestedBy: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Pending' | 'Processing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  createdDate: string;
  feeAmount: number;
  feePaid: boolean;
  notes?: string;
}

export interface MassIntention {
  id: string;
  referenceCode: string;
  intentionType: 'Thanksgiving' | 'Eternal Repose' | 'Healing & Recovery' | 'Special Intention';
  names: string[];
  requestedBy: string;
  contactNumber: string;
  massDate: string;
  massTime: string;
  stipendAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  status: 'Approved' | 'Queued' | 'Completed';
  createdDate: string;
}

export interface SacramentBooking {
  id: string;
  referenceCode: string;
  sacramentType: 'Holy Matrimony (Wedding)' | 'Holy Baptism' | 'Confirmation' | 'Anointing of the Sick' | 'First Holy Communion';
  candidateNames: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  officiatingPriest?: string;
  status: 'Requirements Review' | 'Canonical Interview' | 'Confirmed & Scheduled' | 'Completed' | 'Cancelled';
  checklist: {
    birthCertificate: boolean;
    baptismalCertWithAnnotation: boolean;
    preCanaSeminar: boolean;
    canonicalInterview: boolean;
    marriageLicenseOrCert: boolean;
  };
  notes?: string;
  feeAmount: number;
  feePaid: boolean;
  createdDate: string;
}

export const INITIAL_FACILITY_BOOKINGS: FacilityBooking[] = [];

export const INITIAL_MASS_INTENTIONS: MassIntention[] = [];

export const INITIAL_SACRAMENTS: SacramentBooking[] = [];

export const INITIAL_CERTIFICATE_REQUESTS: CertificateRequest[] = [];


