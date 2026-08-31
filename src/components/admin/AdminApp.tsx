import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, AuthSession } from '../../services/authService';
import { AdminUser } from '../../types';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';

/**
 * Standalone Admin Application Container
 * 
 * Architecture Features:
 * 1. Subdomain Ready: Can be deployed to `admin.cubaocathedral.com` or accessed via `/admin` on the main domain.
 * 2. Authentication Boundary: Guards all administrative portals (Parish Services, News CMS, Facilities Media, Emails, Permissions).
 * 3. Plug-and-Play Real Auth: State is driven by `authService` which can easily switch from mock tokens to OAuth, Firebase Auth, or Netlify Identity.
 * 4. Dedicated Layout: Runs without public website header/footer for distraction-free administration.
 */
export const AdminApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => authService.getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current route is explicitly /admin/login
  const isLoginPage = location.pathname.endsWith('/login');

  useEffect(() => {
    // Sync active session if available
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, [location.pathname]);

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    // If on /admin/login, redirect to /admin
    if (location.pathname.includes('/login')) {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/admin/login');
  };

  const handleBackToWebsite = () => {
    // In subdomain mode (e.g. admin.cubaocathedral.com), redirect to root apex domain
    if (window.location.hostname.startsWith('admin.')) {
      const apexDomain = window.location.hostname.replace(/^admin\./, '');
      window.location.href = `${window.location.protocol}//${apexDomain}`;
    } else {
      navigate('/');
    }
  };

  // If unauthenticated or explicitly on /admin/login, render dedicated login page
  if (!currentUser || isLoginPage) {
    return (
      <AdminLoginPage 
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render main admin suite
  return (
    <AdminDashboard 
      onBackToWebsite={handleBackToWebsite}
      onLogout={handleLogout}
    />
  );
};
