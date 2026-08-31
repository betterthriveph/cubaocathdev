# Immaculate Conception Cathedral of Cubao (ICCC)
> **Mother Church of the Roman Catholic Diocese of Cubao**  
> Official Multi-Page Parish Web Portal & Administrative Management System

---

## 🏛️ Project Overview & Architecture

This application is built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **React Router DOM**. It provides a multi-page portal for parishioners and a secure, isolated content management suite for the Cathedral Secretariat.

### ✨ Public Website Features
- **True Multi-Page Routing**: Every route (`/`, `/about`, `/mass-schedule`, `/sacraments`, `/facilities`, `/news`, `/contact`) is directly accessible, bookmarkable, and shareable.
- **Dedicated Facility Pages**: Specialized multi-page venue showcases for the Parish Center (`/facilities/parish-center`), The Cathedral Grottos (`/facilities/grotto`), and Nativity Chapel (`/facilities/nativity-chapel`).
- **Sacramental Services & Requests**: Online certificate requests (Baptismal, Confirmation, Marriage), sacrament scheduling, and daily mass intentions.
- **Liturgical & Event Calendar**: Interactive parish feast days, novenas, holy days of obligation, and ministry announcements.
- **Direct Route Refresh Guarantee**: Configured via `netlify.toml` and `public/_redirects` to ensure seamless SPA routing on any static or cloud host without 404s.

### 🛡️ Administrative Portal (`/admin`)
- **Discrete Administrative Access**: No admin links or indicators appear on the public website. Authorized parish staff access the management suite directly via `/admin` or `/admin/login`.
- **Subdomain Ready**: Structured so it can run via path-based routing (`/admin`) or be deployed to a dedicated subdomain such as `admin.cubaocathedral.com`.
- **Modular Data & Service Layer**: All CMS operations (Announcements, Facilities Media, Event Calendar, Facility Bookings, Certificate Requests, Mass Intentions) are abstracted behind services (`postService`, `facilityService`, `eventService`, `reservationService`, `emailService`), enabling a smooth swap from local development storage to Netlify Database, PostgreSQL, or a REST API.
- **Role-Based Access Control**: Distinguishes between Full Administrators and Content Writers/Contributors.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **bun**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/cubao-cathedral.git
cd cubao-cathedral

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

#### Required Environment Variables:
| Variable Name | Description | Environment |
|---|---|---|
| `RESEND_API_KEY` | API Key from [Resend](https://resend.com) for transactional emails | Serverless / Netlify |
| `RESEND_FROM_EMAIL` | Verified sender signature (e.g. `Cathedral Secretariat <reservations@cubadiocese.ph>`) | Serverless / Netlify |
| `ADMIN_NOTIFICATION_EMAIL` | Cathedral Secretariat recipient for booking alerts | Serverless / Netlify |

> **Note**: No API keys, passwords, or tokens are exposed to the client-side bundle. All sensitive transactional dispatches are routed through Netlify Serverless Functions (`/netlify/functions/send-email.ts`).

### 4. Running Locally
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## 🛠️ Production Build & Verification

To compile the production-ready static assets:
```bash
npm run build
```
This outputs optimized, tree-shaken static assets into the `dist/` directory.

To test the production build locally:
```bash
npm run preview
```

---

## 🌐 Netlify Deployment Guide

1. **Connect Git Repository**: Link your GitHub repository in your Netlify dashboard.
2. **Build Settings**:
   - **Base directory**: `.` (Root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
3. **Environment Variables**:
   In Netlify under **Site configuration > Environment variables**, configure:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ADMIN_NOTIFICATION_EMAIL`
4. **Custom Subdomain (Optional)**:
   To deploy the admin interface to `admin.cubaocathedral.com`, set up a Netlify branch subdomain or domain alias pointing to the site. The application's router automatically detects `admin.*` hostnames and presents the administrative suite.

---

## 📄 License & Ownership
© Roman Catholic Bishop of Cubao — Immaculate Conception Cathedral of Cubao. All rights reserved.
