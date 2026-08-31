/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Admin Authentication & Session Management Service
 * 
 * Manages admin staff credentials, session persistence, role permissions,
 * and secure sign-out. Prepared for Netlify Identity / JWT / OAuth authentication.
 */

import { AdminUser, UserRole } from '../types';
import { DEV_MOCK_ADMIN_USERS } from '../data/mockData';

const AUTH_STORAGE_KEY = 'cathedral_admin_session';

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
}

class AuthService {
  private getSession(): AuthSession | null {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        const session: AuthSession = JSON.parse(data);
        // Check expiration
        if (session.expiresAt > Date.now()) {
          return session;
        } else {
          this.logout();
        }
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    return null;
  }

  getCurrentUser(): AdminUser | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Mock authentication for development.
   * In production, this proxies to `/api/auth/login` or Netlify Identity.
   */
  async login(emailOrUsername: string, _password?: string, rememberMe = true): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    // Check against mock users
    const matched = DEV_MOCK_ADMIN_USERS.find(
      u => u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
           u.name.toLowerCase().includes(emailOrUsername.toLowerCase())
    );

    if (matched) {
      const session: AuthSession = {
        user: matched,
        token: `mock-jwt-${matched.id}-${Date.now()}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true, user: matched };
    }

    // Default fallback if generic user credentials entered
    if (emailOrUsername.trim().length > 0) {
      const genericUser: AdminUser = {
        id: 'usr-custom',
        name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername.toLowerCase()}@cubadiocese.ph`,
        role: emailOrUsername.toLowerCase().includes('contributor') ? 'contributor' : 'admin',
        title: 'Parish Administrative Staff',
        status: 'Active',
        lastActive: 'Online now',
        createdDate: new Date().toISOString().split('T')[0],
      };

      const session: AuthSession = {
        user: genericUser,
        token: `mock-jwt-${genericUser.id}-${Date.now()}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true, user: genericUser };
    }

    return { success: false, error: 'Please provide valid parish staff credentials.' };
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export const authService = new AuthService();
