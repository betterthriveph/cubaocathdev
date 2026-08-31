export type PageId = 
  | 'home' 
  | 'about' 
  | 'mass-schedule' 
  | 'sacraments' 
  | 'facilities' 
  | 'facility-grotto'
  | 'facility-parish-center'
  | 'facility-nativity-chapel'
  | 'ministries' 
  | 'calendar' 
  | 'news' 
  | 'news-and-events'
  | 'contact'
  | 'admin';

export type NewsAndEventsTab = 'news' | 'calendar';

export type UserRole = 'admin' | 'contributor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  createdDate: string;
  avatar?: string;
  phone?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string;
  category: 'Announcements' | 'Pastoral Letters' | 'Parish Life' | 'Youth Spotlight' | 'Social Action' | 'Feast Celebration' | 'Liturgical' | 'Community';
  body: string;
  author: string;
  authorRole?: string;
  status: 'draft' | 'published';
  publishDate: string;
  createdDate: string;
  updatedDate: string;
  tags: string[];
  isPinned?: boolean;
  readTime?: string;
}

export type AboutTab = 
  | 'history' 
  | 'mass-times' 
  | 'ministries' 
  | 'mission' 
  | 'clergy' 
  | 'leadership' 
  | 'heritage';

export interface ClergyMember {
  id: string;
  name: string;
  role: string;
  subRole?: string;
  image: string;
  bio: string;
  ordinationDate?: string;
}

export interface MassTime {
  time: string;
  language: 'English' | 'Tagalog' | 'Bilingual';
  type: 'Regular' | 'High Mass' | 'Anticipated' | 'Novena Mass' | 'Youth Mass' | 'Healing Mass';
  presider?: string;
  isLivestreamed?: boolean;
  notes?: string;
}

export interface DayMassSchedule {
  day: string;
  dayType: 'weekday' | 'saturday' | 'sunday' | 'special';
  masses: MassTime[];
  confessionTimes?: string[];
  novenaDetails?: string;
}

export interface SacramentRequirement {
  title: string;
  description: string;
  isMandatory: boolean;
  category: 'Document' | 'Seminar' | 'Fee/Donation' | 'Canonical';
}

export interface SacramentInfo {
  id: string;
  name: string;
  tagalogName: string;
  tagline: string;
  description: string;
  image: string;
  iconName: string;
  schedule: string;
  leadTime: string;
  stipend: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  requirements: SacramentRequirement[];
  importantReminders: string[];
}

export interface Facility {
  id: string;
  slug?: string;
  name: string;
  subname: string;
  tagline: string;
  heroImage: string;
  gallery: string[];
  description: string;
  significance?: string;
  capacity?: string | number;
  operatingHours: string;
  amenities: string[];
  guidelines: string[];
  suitableFor: string[];
  rateInfo?: string;
  locationDetails: string;
  // Master pricing controls (Page 2)
  basePrice?: number;
  depositAmount?: number;
  additionalCharges?: number;
  pricingNotes?: string;
  pricingStatus?: 'active' | 'inactive';
}

export type InquiryStatus = 'new' | 'under_review' | 'approved' | 'declined' | 'cancelled';

export interface FacilityInquiry {
  id: string;
  referenceCode: string;
  facilityId: string;
  facilityName?: string;
  facilitySlug?: string;
  name: string;
  email: string;
  phone?: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  message?: string;
  status: InquiryStatus;
  quotedPrice?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReservationStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'confirmed'
  | 'completed'
  | 'hold_expired'
  | 'cancelled'
  | 'declined';

export type PaymentStatus = 
  | 'unpaid'
  | 'submitted'
  | 'verified'
  | 'refunded'
  | 'rejected';

export interface FacilityReservation {
  id: string;
  referenceCode: string;
  inquiryId?: string;
  facilityId: string;
  facilityName?: string;
  customerName?: string;
  customerEmail?: string;
  name?: string;
  email?: string;
  phone?: string;
  reservationDate?: string;
  reservedDate?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: ReservationStatus;
  amount?: number;
  agreedPrice?: number;
  agreedAmount?: number;
  depositDue?: number;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  paymentProofUrl?: string;
  paymentSubmittedAt?: string;
  paymentDeadline?: string;
  paymentInstructions?: string;
  paymentMethodDetails?: string;
  paymentNotes?: string;
  holdExpiresAt?: string;
  adminNotes?: string;
  confirmedAt?: string;
  confirmationEmailSentAt?: string;
  reminderSentAt?: string;
  reminderStatus?: string;
  feedbackEmailSentAt?: string;
  feedbackStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilityCheckParams {
  facilityIdOrSlug: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  message?: string;
  conflictingStatus?: string;
  holdExpiresAt?: string;
}

export interface Ministry {
  id: string;
  name: string;
  acronym?: string;
  commission: 'Liturgy & Worship' | 'Formation & Evangelization' | 'Social Services & Development' | 'Mandated Organizations & Movements';
  headCoordinator: string;
  spiritualDirector?: string;
  meetingSchedule: string;
  description: string;
  keyActivities: string[];
  qualifications: string[];
  contactEmail?: string;
}

export interface ParishEvent {
  id: string;
  title: string;
  category: 'Liturgical' | 'Feast Celebration' | 'Youth' | 'Formation' | 'Outreach' | 'Parish Assembly';
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  isFeatured?: boolean;
  highlightNote?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Announcements' | 'Pastoral Letters' | 'Parish Life' | 'Youth Spotlight' | 'Social Action';
  date: string;
  author: string;
  authorRole: string;
  readTime: string;
  summary: string;
  content: string[];
  image: string;
  tags: string[];
  isPinned?: boolean;
}

export interface MassIntentionRequest {
  intentionType: 'Thanksgiving' | 'Eternal Repose (Soul)' | 'Healing & Recovery' | 'Special Petition' | 'Birthday Blessing' | 'Wedding Anniversary';
  massDate: string;
  massTime: string;
  names: string[];
  offeredBy: string;
  contactEmail: string;
  contactPhone: string;
  specialNotes?: string;
}

export interface CertificateRequestData {
  requestedDocument: 'Baptismal' | 'Confirmation' | 'First Communion' | 'Wedding';
  name: string;
  birthday: string;
  fatherName: string;
  motherName: string;
  sacramentDate: string;
  purpose: string;
  requestedBy: string;
  email: string;
  phone: string;
}

export interface ParishInquiry {
  topic: 'General Inquiry' | 'Certificate Request' | 'Parish Spaces Reservation' | 'Sacraments Inquiry' | 'Mass Intentions' | 'Sick Call / Anointing' | 'Volunteer & Ministries';
  senderName: string;
  email: string;
  phone: string;
  address?: string;
  preferredContactMethod: 'Email' | 'Phone' | 'SMS';
  message: string;
  certificateDetails?: CertificateRequestData;
}

export interface PrayerPetition {
  id: string;
  senderName: string;
  intention: string;
  candleColor: 'amber' | 'blue' | 'rose' | 'white' | 'gold';
  date: string;
  isPrivate?: boolean;
}
