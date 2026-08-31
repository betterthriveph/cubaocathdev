/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Admin Application Container & Security Guard
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { AdminUser } from '../../types';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';

export const AdminApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => authService.getCurrentUser());
  const [isVerifying, setIsVerifying] = useState<boolean>(() => !authService.getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current route is explicitly /admin/login
  const isLoginPage = location.pathname.endsWith('/login');

  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      try {
        const verifiedUser = await authService.validateAndSyncSession();
        if (isMounted) {
          setCurrentUser(verifiedUser);
        }
      } catch (err) {
        console.error('Session sync error:', err);
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    syncSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    if (location.pathname.includes('/login')) {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigate('/admin/login');
  };

  const handleBackToWebsite = () => {
    if (window.location.hostname.startsWith('admin.')) {
      const apexDomain = window.location.hostname.replace(/^admin\./, '');
      window.location.href = `${window.location.protocol}//${apexDomain}`;
    } else {
      navigate('/');
    }
  };

  // Brief clean loading indicator during cold auth initialization
  if (isVerifying && !currentUser && !isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0171bb]/30 border-t-[#0171bb] rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Verifying authorized access...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated or on /admin/login, render login page
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
      currentUser={currentUser}
      onBackToWebsite={handleBackToWebsite}
      onLogout={handleLogout}
    />
  );
};
