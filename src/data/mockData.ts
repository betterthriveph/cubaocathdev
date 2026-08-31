/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Development Mock Data Layer
 * 
 * IMPORTANT:
 * This file centralizes all initial mock/sample data used for local development,
 * testing, and initial database seeding. It is structured to be cleanly replaced
 * or seeded into Netlify Database / PostgreSQL / REST API endpoints in production.
 */

import { FacilityBooking, CertificateRequest, MassIntention, SacramentBooking } from './adminData';
import { BlogPost, ParishEvent, Facility, AdminUser } from '../types';

/* ==========================================================================
   1. ADMINISTRATIVE USERS (STAFF & CONTRIBUTORS)
   ========================================================================== */
export const DEV_MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Rev. Fr. Dennis Soriano',
    email: 'dennis.soriano@cubadiocese.ph',
    role: 'admin',
    title: 'Cathedral Rector & Administrator',
    status: 'Active',
    lastActive: 'Online now',
    createdDate: '2024-01-15',
    phone: '+63 920 950 4222'
  },
  {
    id: 'usr-002',
    name: 'Ma. Teresa Santos',
    email: 'teresa.santos@cubadiocese.ph',
    role: 'admin',
    title: 'Parish Secretariat Administrator',
    status: 'Active',
    lastActive: '15 mins ago',
    createdDate: '2024-03-01',
    phone: '+63 917 540 1192'
  },
  {
    id: 'usr-003',
    name: 'Bro. John Paul Ramirez',
    email: 'jp.ramirez@cubadiocese.ph',
    role: 'contributor',
    title: 'Media & Communications Contributor',
    status: 'Active',
    lastActive: '1 hour ago',
    createdDate: '2025-02-10',
    phone: '+63 918 334 8871'
  },
  {
    id: 'usr-004',
    name: 'Sis. Catherine Lim',
    email: 'cathy.lim@cubadiocese.ph',
    role: 'contributor',
    title: 'Parish Youth Ministry Writer',
    status: 'Active',
    lastActive: 'Yesterday',
    createdDate: '2025-04-12',
    phone: '+63 922 819 0044'
  }
];

/* ==========================================================================
   2. CATHEDRAL FACILITIES SPECIFICATIONS & PHOTO GALLERIES
   ========================================================================== */
export const DEV_MOCK_FACILITIES: Facility[] = [
  {
    id: 'parish-center',
    name: 'Parish Center',
    subname: 'Total 265 sqm Event & Formation Spaces',
    tagline: 'Modern, fully air-conditioned spaces with dedicated rooms for meetings, seminars, parish assemblies, and wedding banquets.',
    heroImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'The Parish Center is a 265 sqm multi-room facility offering flexible spaces: Multi-Purpose Hall (118 sqm, 144 pax), Big Function Room (30 sqm, 45 pax), and Small Function Room (23 sqm, 35 pax). Equipped with pro audio, projector displays, food prep area, and full standby power.',
    significance: 'Provides a convenient, elegant, and spiritually connected venue where families and parish ministries celebrate sacraments and community events.',
    capacity: 'Multi-Purpose Hall: 144 pax | Big Room: 45 pax | Small Room: 35 pax (265 sqm total space).',
    operatingHours: 'Available for morning, afternoon, and evening events (8:00 AM – 11:00 PM by reservation).',
    amenities: [
      'Multi-Purpose Hall (118 sqm) with Elevated Stage & Pro Sound',
      'Big Function Room (30 sqm) for Seminars & Pre-Cana',
      'Small Function Room (23 sqm) for Ministry Meetings',
      'Dedicated Caterer Food Prep & Washing Pantry',
      'Full Standby Generator Power & 24/7 Security Personnel',
      'Spacious Ground-level Parking Compound',
    ],
    guidelines: [
      'Reservations must be booked in advance via the Admin Dashboard or Parish Office.',
      'Church-connected and non-church rates available.',
      'Accredited and external caterers welcomed with standard guidelines.',
      'Prohibited: Open flames or wall adhesives that damage paint.',
    ],
    suitableFor: [
      'Wedding Receptions & Nuptial Banquets',
      'Christening / Baptismal Celebrations',
      'Parish Recollections, Seminars & Assemblies',
      'Committee & Ministry Planning Meetings',
    ],
    rateInfo: 'Church-Connected: Small ₱900/hr, Big ₱1,200/hr, Multi-Purpose ₱3,500/hr | Non-Church: Small ₱1,400/hr, Big ₱1,800/hr, Multi-Purpose ₱5,000/hr.',
    locationDetails: 'Cathedral Compound, Building B (Opposite the Parish Office), Lantana Street.',
    basePrice: 14000,
    depositAmount: 4200,
    additionalCharges: 1500,
    pricingNotes: 'Base 4-hour air-conditioned use with pro audio system. 30% initial deposit due upon approval.',
    pricingStatus: 'active',
  },
  {
    id: 'grotto',
    name: 'The Cathedral Grottos',
    subname: 'Chapel of the Ascension & Chapel of the Assumption',
    tagline: 'A peaceful oasis of contemplation, Marian devotion, and dedicated chapels for recollections and vigils.',
    heroImage: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Built into the lush cathedral courtyard, The Cathedral Grottos feature sacred outdoor sanctuary grounds and two dedicated prayer chapels: Chapel of the Ascension (83 sqm, 54–70 pax, ₱12,000/day) and Chapel of the Assumption (64 sqm, 38–50 pax, ₱10,000/day).',
    significance: 'For over 70 years, thousands of devotees from all over Metro Manila have come to this sacred grotto to pray the Holy Rosary, participate in recollections, and seek Our Lady’s maternal intercession.',
    capacity: 'Ascension: 54–70 pax | Assumption: 38–50 pax',
    operatingHours: 'Open daily from 5:00 AM to 9:30 PM (Free admission for pilgrims; Chapel reservations available).',
    amenities: [
      'Chapel of the Ascension (83 sqm, 54–70 pax)',
      'Chapel of the Assumption (64 sqm, 38–50 pax)',
      'Perpetual Holy Water Dispensary / Fountain of Grace',
      'Shaded Garden Stone Benches & Contemplative Landscaping',
      'Parish Media Livestreaming Coverage Option',
      'Wheelchair accessible pathways and night illumination',
    ],
    guidelines: [
      'Maintain solemn silence and respectful decorum at all times.',
      'Chapel reservations should be submitted in advance to the Parish Secretariat.',
      'Please keep the sacred grounds clean and free of litter.',
      'No commercial filming allowed without parish permit.',
    ],
    suitableFor: [
      'Personal prayer and meditation',
      'Holy Rosary recitations by pilgrim groups',
      'Recollections and solemn vigils',
      'Marian novenas and floral offerings',
    ],
    rateInfo: 'Ascension: ₱12,000/day • Assumption: ₱10,000/day (Includes air-conditioning and liturgical audio setup).',
    locationDetails: 'Cathedral East Courtyard, adjacent to the Parish Pastoral Office and Main Sanctuary.',
    basePrice: 12000,
    depositAmount: 3600,
    additionalCharges: 1000,
    pricingNotes: 'Daily chapel use with liturgical sound. Reservation deposit due within 2 hours of payment instruction.',
    pricingStatus: 'active',
  },
  {
    id: 'nativity-chapel',
    name: 'Nativity Chapel',
    subname: 'Sacred Sanctuary for Catholic Celebrations',
    tagline: 'A private, prayerful, and dignified sacred space for meaningful Catholic celebrations and sacramental rites.',
    heroImage: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'The Nativity Chapel is a 235 sqm air-conditioned sacred chapel accommodating 182–200 guests with custom hardwood pews, central aisle, professional sound system, microphones, private sacristy, dedicated choir area, and en-suite restrooms.',
    significance: 'Provides a serene, reverent sanctuary for private weddings, baptismal celebrations, wedding anniversaries, and memorial masses.',
    capacity: '182 – 200 Pax (235 sqm Floor Area)',
    operatingHours: 'Available for scheduled sacramental celebrations and liturgical rites by reservation.',
    amenities: [
      '235 sqm floor area with comfortable seating for 182–200 pax',
      'Fully Air-Conditioned with continuous climate control',
      'Professional sound system & wireless microphones',
      'Dedicated private sacristy for presiders',
      'Dedicated choir area with audio monitors',
      'En-suite clean restrooms exclusive to chapel guests',
    ],
    guidelines: [
      'Reserved exclusively for solemn Catholic liturgical ceremonies and rites.',
      'Decor must comply with Catholic ecclesiastical norms.',
      'Sound system is operated by authorized Cathedral technicians.',
      'Bookings coordinated through the Parish Secretariat.',
    ],
    suitableFor: [
      'Private Nuptial Masses & Weddings',
      'Baptismal Liturgies & Celebrations',
      'Wedding Anniversaries & Thanksgiving Masses',
      'Memorial & Solemn Liturgical Gatherings',
    ],
    rateInfo: 'Estimated Stipend/Donation: ₱8,000 – ₱15,000 depending on celebration type and liturgical inclusions.',
    locationDetails: 'Left wing of the Cathedral Main Facade, accessible through the side portico.',
    basePrice: 15000,
    depositAmount: 4500,
    additionalCharges: 2000,
    pricingNotes: 'Includes dedicated audio technician, liturgical lighting, and sacristy prep access.',
    pricingStatus: 'active',
  },
  {
    id: 'crypt',
    name: 'Cathedral Crypt & Columbary',
    subname: 'Sacred Resting Place of the Faithful Departed',
    tagline: 'Resting in the sacred embrace of the Cathedral sanctuary, awaiting the Resurrection.',
    heroImage: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Located directly beneath the Cathedral sanctuary altar, the Cathedral Crypt and Columbary offers sacred, perpetual inurnment niches for departed loved ones. Maintained with dignity, security, and daily mass intentions offered for the repose of the souls resting here.',
    significance: 'Deeply rooted in early Christian tradition of burying the faithful near the relics and altar of the cathedral.',
    capacity: 'Columbarium Niches and 60-pax Crypt Chapel',
    operatingHours: 'Visiting hours: Daily 8:00 AM – 6:00 PM (Extended hours during All Saints and All Souls Day).',
    amenities: [
      'Marble-faced Inurnment Niches with Personalized Brass Epitaphs',
      'Air-Conditioned Crypt Chapel for Memorial Masses and Anniversaries',
      'Perpetual Daily Mass Intentions offered by Cathedral Priests',
      'CCTV Surveillance and Biometric Registry for Security',
    ],
    guidelines: [
      'Fresh flowers and flameless electric candles are encouraged.',
      'Open flame candles are restricted inside the underground crypt for air quality.',
    ],
    suitableFor: [
      'Perpetual Inurnment of Cremated Remains',
      'Death Anniversary Memorial Masses',
      'All Souls Day Visits and Novenas',
    ],
    rateInfo: 'Single Niche (up to 2 urns): ₱65,000 perpetual lease. Family Niche (up to 4 urns): ₱110,000.',
    locationDetails: 'Cathedral Basement Level, entrance via the Crypt Staircase at the West Nave.',
    basePrice: 8000,
    depositAmount: 2400,
    additionalCharges: 500,
    pricingNotes: 'Crypt memorial Mass reservation and sanctuary maintenance coverage.',
    pricingStatus: 'active',
  },
];

/* ==========================================================================
   3. LITURGICAL & EVENT CALENDAR (PARISH EVENTS)
   ========================================================================== */
export const DEV_MOCK_PARISH_EVENTS: ParishEvent[] = [
  {
    id: 'evt-001',
    title: 'Solemnity of the Immaculate Conception (Titular Fiesta)',
    category: 'Feast Celebration',
    date: '2026-12-08',
    time: '6:00 AM – 8:00 PM (Misa Mayor at 10:00 AM)',
    location: 'Main Cathedral Sanctuary & Compound',
    description: 'Annual patronal fiesta of the Diocese of Cubao. Pontifical Mass presided by Most Rev. Elias L. Ayuban, Jr., CMF, D.D., followed by the Solemn Floral Procession along Cubao major avenues.',
    image: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    highlightNote: 'Plenary Indulgence granted under the usual canonical conditions.',
  },
  {
    id: 'evt-002',
    title: 'Monthly Diocesan Healing Mass & Anointing',
    category: 'Liturgical',
    date: '2026-09-12',
    time: '6:00 PM Mass followed by Healing Service',
    location: 'Main Cathedral Sanctuary',
    description: 'A special Eucharistic celebration offering intercessory prayers, individual laying on of hands, and the Sacrament of the Anointing of the Sick for the sick and burdened.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    highlightNote: 'Open to all parishioners, families, and caregivers.',
  },
  {
    id: 'evt-003',
    title: 'Pre-Cana Nuptial Formation Seminar (Batch 18)',
    category: 'Formation',
    date: '2026-09-26',
    time: '8:00 AM – 5:00 PM',
    location: 'Parish Center – Big Function Room',
    description: 'Comprehensive whole-day marriage preparation module covering Catholic theology of Holy Matrimony, conjugal spirituality, communication, and family planning.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    highlightNote: 'Mandatory certificate issued for couples with upcoming wedding bookings.',
  },
  {
    id: 'evt-004',
    title: 'Caritas Cubao Medical & Dental Mission',
    category: 'Outreach',
    date: '2026-10-18',
    time: '7:30 AM – 1:00 PM',
    location: 'Cathedral Multi-Purpose Hall & East Courtyard',
    description: 'Free pediatric and adult medical checkups, tooth extractions, prescription medicine distribution, and feeding program for underprivileged families in Barangay Immaculate Conception.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    highlightNote: 'Volunteer medical professionals and youth aides welcomed.',
  },
  {
    id: 'evt-005',
    title: 'Parish Youth Ministry Jubilee Recollection',
    category: 'Youth',
    date: '2026-10-24',
    time: '1:00 PM – 7:00 PM',
    location: 'Chapel of the Ascension & Garden Courtyard',
    description: 'A dynamic afternoon of praise and worship, inspirational keynote talks, small group faith sharing, and Holy Hour for high school and university students.',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    isFeatured: false,
    highlightNote: 'Free registration with complimentary snack pack.',
  },
  {
    id: 'evt-006',
    title: 'Simbang Gabi (Misa de Gallo) Novena Masses',
    category: 'Liturgical',
    date: '2026-12-16',
    time: 'Dawn: 4:30 AM | Anticipated: 8:00 PM (Dec 15–23)',
    location: 'Cathedral Main Nave & Courtyard Overflow',
    description: 'The traditional Filipino nine-day dawn and evening novena masses in honor of the Blessed Virgin Mary leading to the Nativity of our Lord Jesus Christ.',
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
    isFeatured: true,
    highlightNote: 'Hot bibingka and puto bumbong stalls open in the courtyard.',
  }
];

/* ==========================================================================
   4. SAMPLE FACILITY BOOKINGS (EMPTY INITIAL DATA)
   ========================================================================== */
export const DEV_MOCK_FACILITY_BOOKINGS: FacilityBooking[] = [];

/* ==========================================================================
   5. SAMPLE CERTIFICATE REQUESTS (EMPTY INITIAL DATA)
   ========================================================================== */
export const DEV_MOCK_CERTIFICATE_REQUESTS: CertificateRequest[] = [];

