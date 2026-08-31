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

export const INITIAL_FACILITY_BOOKINGS: FacilityBooking[] = [
  {
    id: 'fb-001',
    referenceCode: 'CUB-FAC-2025-084',
    facilityId: 'parish-center-grand',
    facilityName: 'Cathedral Grand Hall',
    eventName: 'De Vera & Ramirez Wedding Banquet',
    clientName: 'Atty. Marco De Vera',
    clientEmail: 'marco.devera@gmail.com',
    clientPhone: '0917-882-3901',
    eventDate: '2025-09-20',
    timeSlot: '5:00 PM – 10:00 PM (5 Hours)',
    pax: 280,
    totalAmount: 22000,
    depositAmount: 10000,
    depositStatus: 'Paid',
    status: 'Confirmed',
    addons: ['Full Stage Lighting', 'Standby Generator', 'Aircon Extension (1 hr)'],
    notes: 'Accredited Caterer: Juan Carlo Catering. Ingress at 2:00 PM.',
    createdDate: '2025-08-15',
  },
  {
    id: 'fb-002',
    referenceCode: 'CUB-FAC-2025-089',
    facilityId: 'parish-center-st-joseph',
    facilityName: 'St. Joseph Hall',
    eventName: 'Baby Liam Gabriel Christening Reception',
    clientName: 'Clarisse Villamor-Tan',
    clientEmail: 'clarisse.tan@outlook.com',
    clientPhone: '0918-540-1123',
    eventDate: '2025-09-28',
    timeSlot: '11:30 AM – 3:30 PM (4 Hours)',
    pax: 95,
    totalAmount: 9500,
    depositAmount: 5000,
    depositStatus: 'Paid',
    status: 'Confirmed',
    addons: ['Basic Audio System', 'Air Conditioning'],
    notes: 'Baptism in Main Cathedral at 10:00 AM prior to hall reception.',
    createdDate: '2025-08-18',
  },
  {
    id: 'fb-003',
    referenceCode: 'CUB-FAC-2025-092',
    facilityId: 'grotto',
    facilityName: 'The Grotto of Our Lady of Lourdes',
    eventName: 'Flores de Mayo Pilgrims & Rosary Group',
    clientName: 'Sister Teresa Cruz (Legion of Mary)',
    clientEmail: 'teresa.cruz@legionmary.ph',
    clientPhone: '0920-912-7744',
    eventDate: '2025-10-05',
    timeSlot: '8:00 AM – 10:30 AM',
    pax: 60,
    totalAmount: 0,
    depositAmount: 0,
    depositStatus: 'Paid',
    status: 'Confirmed',
    addons: ['Microphone & Sound System Setup', 'Votive Candles Pre-order'],
    notes: 'Diocesan Marian block rosary pilgrimage from Project 4.',
    createdDate: '2025-08-22',
  },
  {
    id: 'fb-004',
    referenceCode: 'CUB-FAC-2025-095',
    facilityId: 'parish-center-formation',
    facilityName: 'Formation Rooms (Upper Level)',
    eventName: 'Parish Pastoral Council Strategic Planning',
    clientName: 'Bro. Eduardo Santos (PPC Head)',
    clientEmail: 'ed.santos@cubao-cathedral.ph',
    clientPhone: '0917-333-8822',
    eventDate: '2025-10-12',
    timeSlot: '1:00 PM – 6:00 PM (5 Hours)',
    pax: 45,
    totalAmount: 4000,
    depositAmount: 0,
    depositStatus: 'Unpaid',
    status: 'Pending Review',
    addons: ['Projector & Whiteboard', 'Audio Visual Setup'],
    notes: 'Diocesan pastoral year review.',
    createdDate: '2025-08-25',
  },
  {
    id: 'fb-005',
    referenceCode: 'CUB-FAC-2025-098',
    facilityId: 'grotto',
    facilityName: 'The Grotto Grounds',
    eventName: 'Pre-Nuptial Photo Session (Alvarez-Mercado)',
    clientName: 'Kristine Mercado',
    clientEmail: 'kristine.m@gmail.com',
    clientPhone: '0995-441-2090',
    eventDate: '2025-10-18',
    timeSlot: '4:00 PM – 6:00 PM (2 Hours)',
    pax: 8,
    totalAmount: 2500,
    depositAmount: 2500,
    depositStatus: 'Paid',
    status: 'Confirmed',
    addons: ['Grotto Photo Permit Pass'],
    notes: 'Couples wedding will be held in Cathedral on Dec 14.',
    createdDate: '2025-08-27',
  },
  {
    id: 'fb-006',
    referenceCode: 'CUB-FAC-2025-102',
    facilityId: 'nativity-chapel',
    facilityName: 'Nativity Adoration Chapel',
    eventName: 'Nocturnal Eucharistic Vigil & Holy Hour',
    clientName: 'Adoracion Nocturna Filipina (Section 12)',
    clientEmail: 'anf.cubao@gmail.com',
    clientPhone: '0917-662-1088',
    eventDate: '2025-10-25',
    timeSlot: '9:00 PM – 12:00 MN',
    pax: 35,
    totalAmount: 0,
    depositAmount: 0,
    depositStatus: 'Paid',
    status: 'Confirmed',
    addons: ['Chime & Liturgical Vestments Preparation'],
    notes: 'Quarterly nocturnal vigil of reparation.',
    createdDate: '2025-08-28',
  }
];

export const INITIAL_MASS_INTENTIONS: MassIntention[] = [
  {
    id: 'mi-001',
    referenceCode: 'INT-2025-1041',
    intentionType: 'Thanksgiving',
    names: ['Gabriel and Maria Santos (30th Wedding Anniversary)', 'Success in Board Examinations - Engr. Rafael Ramos'],
    requestedBy: 'Maria Santos',
    contactNumber: '0917-555-1234',
    massDate: '2025-09-07',
    massTime: '10:30 AM (Solemn High Mass)',
    stipendAmount: 500,
    paymentStatus: 'Paid',
    status: 'Approved',
    createdDate: '2025-08-28',
  },
  {
    id: 'mi-002',
    referenceCode: 'INT-2025-1042',
    intentionType: 'Eternal Repose',
    names: ['+ Roberto "Tito" Gonzales (40th Day)', '+ Consolacion Reyes (1st Death Anniversary)', '+ All Souls in Purgatory'],
    requestedBy: 'Ma. Elena Gonzales',
    contactNumber: '0922-334-9988',
    massDate: '2025-09-07',
    massTime: '6:00 PM (Anticipated / Sunday Mass)',
    stipendAmount: 600,
    paymentStatus: 'Paid',
    status: 'Approved',
    createdDate: '2025-08-29',
  },
  {
    id: 'mi-003',
    referenceCode: 'INT-2025-1043',
    intentionType: 'Healing & Recovery',
    names: ['Carmen Navarro (Cancer treatment & surgery)', 'Baby Noah Bautista (Speedy recovery)'],
    requestedBy: 'Dr. Arthur Navarro',
    contactNumber: '0918-992-4411',
    massDate: '2025-09-08',
    massTime: '6:30 AM (Daily Mass)',
    stipendAmount: 400,
    paymentStatus: 'Paid',
    status: 'Approved',
    createdDate: '2025-08-29',
  },
  {
    id: 'mi-004',
    referenceCode: 'INT-2025-1044',
    intentionType: 'Special Intention',
    names: ['Safe Travel of OFWs - Mendoza Family', 'Peace in the Holy Land & Worldwide'],
    requestedBy: 'Rowena Mendoza',
    contactNumber: '0939-112-7654',
    massDate: '2025-09-08',
    massTime: '12:15 PM (Midday Mass)',
    stipendAmount: 300,
    paymentStatus: 'Pending',
    status: 'Queued',
    createdDate: '2025-08-30',
  }
];

export const INITIAL_SACRAMENTS: SacramentBooking[] = [
  {
    id: 'sac-001',
    referenceCode: 'SAC-WED-2025-042',
    sacramentType: 'Holy Matrimony (Wedding)',
    candidateNames: 'Engr. Christian Dave Reyes & Dra. Patricia Anne Lim',
    contactPerson: 'Patricia Anne Lim',
    contactEmail: 'patricia.lim@med.ph',
    contactPhone: '0917-811-0945',
    scheduledDate: '2025-11-15',
    scheduledTime: '2:30 PM',
    officiatingPriest: 'Rev. Msgr. Antonio Mortillero, PC',
    status: 'Confirmed & Scheduled',
    checklist: {
      birthCertificate: true,
      baptismalCertWithAnnotation: true,
      preCanaSeminar: true,
      canonicalInterview: true,
      marriageLicenseOrCert: true,
    },
    notes: 'Organist and solo soprano requested. Rehearsal on Nov 13 at 7:00 PM.',
    feeAmount: 18000,
    feePaid: true,
    createdDate: '2025-07-10',
  },
  {
    id: 'sac-002',
    referenceCode: 'SAC-BAP-2025-128',
    sacramentType: 'Holy Baptism',
    candidateNames: 'Baby Mateo Luis Alcantara',
    contactPerson: 'Dominic Alcantara (Father)',
    contactEmail: 'dominic.alcantara@gmail.com',
    contactPhone: '0920-334-1188',
    scheduledDate: '2025-09-21',
    scheduledTime: '10:00 AM (Community Baptism)',
    officiatingPriest: 'Rev. Fr. Steve Tynan, SVD',
    status: 'Confirmed & Scheduled',
    checklist: {
      birthCertificate: true,
      baptismalCertWithAnnotation: false,
      preCanaSeminar: false,
      canonicalInterview: true,
      marriageLicenseOrCert: true,
    },
    notes: '8 pairs of principal sponsors. Pre-baptism seminar attended on Sep 6.',
    feeAmount: 1500,
    feePaid: true,
    createdDate: '2025-08-12',
  },
  {
    id: 'sac-003',
    referenceCode: 'SAC-WED-2025-055',
    sacramentType: 'Holy Matrimony (Wedding)',
    candidateNames: 'Joshua Paul Soriano & Bianca Camille Roxas',
    contactPerson: 'Joshua Soriano',
    contactEmail: 'joshua.soriano@corp.com',
    contactPhone: '0917-900-3412',
    scheduledDate: '2025-12-20',
    scheduledTime: '10:00 AM',
    officiatingPriest: 'Most Rev. Honesto F. Ongtioco, D.D. (Requested)',
    status: 'Canonical Interview',
    checklist: {
      birthCertificate: true,
      baptismalCertWithAnnotation: true,
      preCanaSeminar: false,
      canonicalInterview: false,
      marriageLicenseOrCert: true,
    },
    notes: 'Canonical interview scheduled with Parish Priest on Sept 15.',
    feeAmount: 22000,
    feePaid: false,
    createdDate: '2025-08-20',
  },
  {
    id: 'sac-004',
    referenceCode: 'SAC-ANO-2025-019',
    sacramentType: 'Anointing of the Sick',
    candidateNames: 'Don Fernando Sison (Age 84, In-Home Viaticum)',
    contactPerson: 'Maria Lourdes Sison (Daughter)',
    contactEmail: 'ml.sison@gmail.com',
    contactPhone: '0918-442-9900',
    scheduledDate: '2025-09-02',
    scheduledTime: '3:00 PM (Home Visit)',
    officiatingPriest: 'Assigned Duty Priest',
    status: 'Confirmed & Scheduled',
    checklist: {
      birthCertificate: false,
      baptismalCertWithAnnotation: false,
      preCanaSeminar: false,
      canonicalInterview: true,
      marriageLicenseOrCert: false,
    },
    notes: 'Urgent pastoral visit in Lantana St. vicinity near Cathedral.',
    feeAmount: 0,
    feePaid: true,
    createdDate: '2025-08-30',
  }
];

export const INITIAL_CERTIFICATE_REQUESTS: CertificateRequest[] = [
  {
    id: 'cert-001',
    referenceCode: 'CERT-BAP-2025-014',
    documentType: 'Baptismal',
    fullName: 'Raphael Gabriel Dela Cruz',
    birthday: '2018-05-14',
    fatherName: 'Roberto Dela Cruz',
    motherName: 'Carmela Mendoza Dela Cruz',
    sacramentDate: '2018-08-25',
    purpose: 'School Enrollment / First Communion Requirement',
    requestedBy: 'Carmela Dela Cruz (Mother)',
    contactEmail: 'carmela.delacruz@yahoo.com',
    contactPhone: '0917-889-2311',
    status: 'Ready for Pickup',
    createdDate: '2025-08-28',
    feeAmount: 200,
    feePaid: true,
    notes: 'Book 45, Page 112, Line 18 in Cathedral Registry archives.'
  },
  {
    id: 'cert-002',
    referenceCode: 'CERT-WED-2025-009',
    documentType: 'Wedding',
    fullName: 'Marco Antonio Santos & Maria Theresa Perez',
    birthday: '1992-11-04',
    fatherName: 'Antonio Santos / Eduardo Perez',
    motherName: 'Corazon Santos / Victoria Perez',
    sacramentDate: '2020-02-15',
    purpose: 'Visa / Permanent Residency Application (Embassy Requirement)',
    requestedBy: 'Marco Antonio Santos',
    contactEmail: 'marco.santos@gmail.com',
    contactPhone: '0922-311-7744',
    status: 'Processing',
    createdDate: '2025-08-29',
    feeAmount: 300,
    feePaid: true,
    notes: 'Requires Cathedral Dry Seal and Parish Priest signature.'
  },
  {
    id: 'cert-003',
    referenceCode: 'CERT-CNF-2025-006',
    documentType: 'Confirmation',
    fullName: 'Isabella Marie Villanueva',
    birthday: '2005-09-21',
    fatherName: 'Ferdinand Villanueva',
    motherName: 'Grace Lynn Villanueva',
    sacramentDate: '2019-12-08',
    purpose: 'Church Wedding Requirement (Bride)',
    requestedBy: 'Isabella Marie Villanueva',
    contactEmail: 'isabella.mv@outlook.com',
    contactPhone: '0919-555-1289',
    status: 'Pending',
    createdDate: '2025-08-30',
    feeAmount: 200,
    feePaid: false,
    notes: 'Need to cross-reference Diocese of Cubao fiesta confirmation registry.'
  },
  {
    id: 'cert-004',
    referenceCode: 'CERT-COM-2025-003',
    documentType: 'First Communion',
    fullName: 'Lucas Emmanuel Tan',
    birthday: '2014-03-10',
    fatherName: 'Christopher Tan',
    motherName: 'Joanne Tan',
    sacramentDate: '2022-10-16',
    purpose: 'Personal Records & Family Keepsake',
    requestedBy: 'Joanne Tan',
    contactEmail: 'joanne.tan@techph.com',
    contactPhone: '0918-223-9911',
    status: 'Completed',
    createdDate: '2025-08-22',
    feeAmount: 150,
    feePaid: true,
    notes: 'Claimed by parent at Cathedral office.'
  }
];

