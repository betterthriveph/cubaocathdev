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
  id: 'grotto' | 'parish-center' | 'nativity-chapel' | 'crypt' | 'mortuary';
  name: string;
  subname: string;
  tagline: string;
  heroImage: string;
  gallery: string[];
  description: string;
  significance: string;
  capacity?: string;
  operatingHours: string;
  amenities: string[];
  guidelines: string[];
  suitableFor: string[];
  rateInfo?: string;
  locationDetails: string;
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
