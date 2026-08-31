/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { AboutPage } from './components/about/AboutPage';
import { MassSchedulePage } from './components/schedule/MassSchedulePage';
import { MinistriesPage } from './components/ministries/MinistriesPage';
import { SacramentsPage } from './components/sacraments/SacramentsPage';
import { ContactPage } from './components/contact/ContactPage';
import { NewsAndEventsPage } from './components/news/NewsAndEventsPage';
import { AnnouncementDetailPage } from './components/news/AnnouncementDetailPage';
import { FacilitiesPage } from './components/facilities/FacilitiesPage';
import { GrottoFacilityPage } from './components/facilities/GrottoFacilityPage';
import { ParishCenterFacilityPage } from './components/facilities/ParishCenterFacilityPage';
import { NativityChapelFacilityPage } from './components/facilities/NativityChapelFacilityPage';
import { FacilityDetailPage } from './components/facilities/FacilityDetailPage';
import { PaymentProofUploadPage } from './components/facilities/PaymentProofUploadPage';
import { AdminApp } from './components/admin/AdminApp';
import { SetPasswordPage } from './components/admin/SetPasswordPage';
import { ResetPasswordPage } from './components/admin/ResetPasswordPage';
import { NotFoundPage } from './components/layout/NotFoundPage';
import { authService, AuthCallbackInfo } from './services/authService';

/**
 * Main Layout Shell
 * Conditionally isolates public website chrome (Navbar & Footer) from Admin Suite
 * so the admin portal can seamlessly be deployed to a subdomain (admin.cubaocathedral.com)
 * or accessed via /admin without leaking public navigation.
 */
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authAction, setAuthAction] = useState<AuthCallbackInfo | null>(null);

  // Process Netlify Identity tokens on initial application load (#invite_token, #recovery_token, etc.)
  useEffect(() => {
    let isMounted = true;

    async function processAuthTokens() {
      try {
        const result = await authService.initAuth();
        if (isMounted && result) {
          if (result.type === 'invite' || result.type === 'recovery') {
            setAuthAction(result);
          } else if (result.type === 'confirmation' || result.type === 'oauth') {
            navigate('/admin');
          }
        }
      } catch (err) {
        console.error('Netlify Identity token processing notice:', err);
      }
    }

    processAuthTokens();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // 1. If an invitation token is detected in URL, present dedicated "Set Your Password" screen
  if (authAction?.type === 'invite' && authAction.token) {
    return (
      <SetPasswordPage 
        token={authAction.token} 
        onSuccess={(_user) => {
          setAuthAction(null);
          navigate('/admin');
        }} 
      />
    );
  }

  // 2. If a password recovery token is detected in URL, present "Reset Password" screen
  if (authAction?.type === 'recovery') {
    return (
      <ResetPasswordPage 
        token={authAction.token} 
        onSuccess={(_user) => {
          setAuthAction(null);
          navigate('/admin');
        }} 
      />
    );
  }

  const isSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
  const isAdminRoute = location.pathname.startsWith('/admin') || isSubdomain;

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#0171bb] selection:text-white">
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/admin/login" element={<AdminApp />} />
          {/* Subdomain root fallback */}
          {isSubdomain && <Route path="/*" element={<AdminApp />} />}
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#0171bb] selection:text-white">
      {/* Liturgical Top Navigation (Public) */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          
          {/* About & Parish Identity */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/:tab" element={<AboutPage />} />
          <Route path="/mass-schedule" element={<MassSchedulePage />} />
          <Route path="/ministries" element={<MinistriesPage />} />

          {/* Sacraments */}
          <Route path="/sacraments" element={<SacramentsPage />} />
          <Route path="/sacraments/:id" element={<SacramentsPage />} />

          {/* Facilities Hub & Dedicated Multi-Page Venues */}
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/facilities/parish-center" element={<ParishCenterFacilityPage />} />
          <Route path="/facilities/grotto" element={<GrottoFacilityPage />} />
          <Route path="/facilities/nativity-chapel" element={<NativityChapelFacilityPage />} />
          <Route path="/facilities/payment/:reservationReference" element={<PaymentProofUploadPage />} />
          <Route path="/facilities/payment" element={<PaymentProofUploadPage />} />
          <Route path="/facilities/payment-proof/:referenceCode" element={<PaymentProofUploadPage />} />
          <Route path="/facilities/payment-proof" element={<PaymentProofUploadPage />} />
          <Route path="/facilities/:slug" element={<FacilityDetailPage />} />

          {/* News, Announcements & Calendar */}
          <Route path="/news" element={<NewsAndEventsPage initialTab="news" />} />
          <Route path="/news-and-events" element={<NewsAndEventsPage />} />
          <Route path="/announcements" element={<NewsAndEventsPage initialTab="news" />} />
          <Route path="/calendar" element={<NewsAndEventsPage initialTab="calendar" />} />
          <Route path="/news/:slug" element={<AnnouncementDetailPage />} />
          <Route path="/announcements/:slug" element={<AnnouncementDetailPage />} />

          {/* Contact & Parish Office Inquiries */}
          <Route path="/contact" element={<ContactPage />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Cathedral Footer (Public) */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <ScrollToTop />
        <AppContent />
      </ModalProvider>
    </BrowserRouter>
  );
}
