-- ============================================================================
-- Netlify Database Initial Schema Migration
-- Project: Immaculate Conception Cathedral of Cubao (ICCC)
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- Ensure pgcrypto or standard uuid-ossp extension is enabled for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically manage updated_at timestamp columns
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================================================
-- 1. ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'contributor',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_admin_users
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- 2. ANNOUNCEMENTS TABLE (Parish News & Pastoral Updates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category VARCHAR(100) NOT NULL,
    author_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);

CREATE TRIGGER set_timestamp_announcements
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- 3. FACILITIES TABLE (Cathedral Parish Spaces & Halls)
-- ============================================================================
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    capacity INTEGER,
    location VARCHAR(255),
    featured_image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_slug ON facilities(slug);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);

CREATE TRIGGER set_timestamp_facilities
BEFORE UPDATE ON facilities
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- 4. INQUIRIES TABLE (Parish Center & Facility Booking Inquiries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    requested_date DATE,
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    purpose TEXT,
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_facility_id ON inquiries(facility_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

CREATE TRIGGER set_timestamp_inquiries
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- 5. RESERVATIONS TABLE (Confirmed & Processed Parish Bookings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    reservation_date DATE,
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    purpose TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    amount NUMERIC(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    payment_reference VARCHAR(255),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_facility_id ON reservations(facility_id);
CREATE INDEX IF NOT EXISTS idx_reservations_inquiry_id ON reservations(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

CREATE TRIGGER set_timestamp_reservations
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
