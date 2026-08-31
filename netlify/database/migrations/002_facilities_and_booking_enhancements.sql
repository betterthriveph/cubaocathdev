-- ============================================================================
-- Netlify Database Schema Migration: 002
-- Project: Immaculate Conception Cathedral of Cubao (ICCC)
-- Migration: 002_facilities_and_booking_enhancements.sql
-- Description: Master-level facility pricing, booking inquiry workflow,
--              2-hour slot hold, proof-of-payment, and Resend confirmation tracking.
-- ============================================================================

-- 1. Enhance facilities table with master pricing and details
ALTER TABLE facilities 
    ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS additional_charges NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS pricing_notes TEXT,
    ADD COLUMN IF NOT EXISTS pricing_status VARCHAR(50) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS subname VARCHAR(255),
    ADD COLUMN IF NOT EXISTS tagline TEXT,
    ADD COLUMN IF NOT EXISTS rate_info TEXT,
    ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(255),
    ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS suitable_for JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS guidelines JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- 2. Enhance inquiries table with human-readable reference code and admin fields
ALTER TABLE inquiries
    ADD COLUMN IF NOT EXISTS reference_code VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_inquiries_reference_code ON inquiries(reference_code);

-- 3. Enhance reservations table with 2-hour hold, payment details, and Resend tracking
ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS reference_code VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS agreed_price NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS deposit_due NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS payment_instructions TEXT,
    ADD COLUMN IF NOT EXISTS payment_method_details TEXT,
    ADD COLUMN IF NOT EXISTS payment_notes TEXT,
    ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
    ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT,
    ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reminder_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS feedback_email_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS feedback_status VARCHAR(50) DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_reservations_reference_code ON reservations(reference_code);
CREATE INDEX IF NOT EXISTS idx_reservations_hold_expires_at ON reservations(hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status);

-- 4. Seed initial Cathedral facilities with master rates if not yet present
INSERT INTO facilities (
    name, 
    slug, 
    subname, 
    tagline, 
    description, 
    capacity, 
    location, 
    base_price, 
    deposit_amount, 
    additional_charges, 
    pricing_notes, 
    pricing_status, 
    status, 
    featured_image_url
) VALUES 
(
    'Parish Center Multi-Purpose Hall',
    'parish-center',
    'Total 265 sqm Event Space & Function Rooms',
    'Versatile, fully air-conditioned spaces with dedicated rooms for meetings, formation seminars, and multi-purpose banquet receptions.',
    'The primary grand assembly and seminar hall of the cathedral parish, equipped with professional acoustic sound system, stage, and full standby backup generator.',
    144,
    'Cathedral Parish Compound (Ground & 2nd Floor)',
    14000.00,
    4200.00,
    1500.00,
    'Base rental includes 4 hours air-conditioned use with sound system. 30% deposit required on approval.',
    'active',
    'available',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200'
),
(
    'The Cathedral Grottos',
    'grotto',
    'Chapel of the Ascension & Chapel of the Assumption',
    'Tranquil prayer sanctuaries and garden courtyard for devotional recollections, vigils, and liturgical gatherings.',
    'Tranquil prayer sanctuaries and garden courtyard for devotional recollections, vigils, and liturgical gatherings. Includes blessed holy water dispensary.',
    70,
    'Cathedral Garden Courtyard',
    12000.00,
    3600.00,
    1000.00,
    'Ascension: ₱12,000/day; Assumption: ₱10,000/day. Reservation bond required upon booking confirmation.',
    'active',
    'available',
    'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200'
),
(
    'Nativity Adoration Chapel',
    'nativity-chapel',
    'Private & Prayerful Sacred Space',
    'A private, prayerful, and dignified sacred space for meaningful Catholic celebrations and sacramental rites.',
    '235 sqm floor area with comfortable seating for 182–200 pax. Fully air-conditioned with professional sound system, presider sacristy, and dedicated choir area.',
    200,
    'Cathedral Left Transept / Nativity Wing',
    15000.00,
    4500.00,
    2000.00,
    'Available for private liturgical celebrations, nuptials, and recollection vigils with approval by Cathedral Rector.',
    'active',
    'available',
    'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'
),
(
    'Cathedral Crypt & Columbary',
    'crypt',
    'Sacred Memorial & Prayer Niches',
    'Dignified and peaceful memorial ground and niches under the spiritual protection of the Cathedral.',
    'Air-conditioned chapel niches and perpetual prayer sanctuary for departed loved ones and anniversary memorial Masses.',
    80,
    'Cathedral Undercroft Lower Level',
    8000.00,
    2400.00,
    500.00,
    'Memorial Mass reservation and perpetual maintenance coverage.',
    'active',
    'available',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200'
)
ON CONFLICT (slug) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    deposit_amount = EXCLUDED.deposit_amount,
    pricing_notes = EXCLUDED.pricing_notes,
    pricing_status = EXCLUDED.pricing_status,
    subname = EXCLUDED.subname,
    tagline = EXCLUDED.tagline;
