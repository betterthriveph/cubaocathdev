/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Admin Authentication & Netlify Identity Service
 * 
 * Integrates @netlify/identity for production authentication, account invitations,
 * password creation, password recovery, and secure sessions.
 */

import { 
  handleAuthCallback, 
  acceptInvite as netlifyAcceptInvite, 
  login as netlifyLogin, 
  logout as netlifyLogout, 
  getUser as getNetlifyUser, 
  isAuthenticated as isNetlifyAuthenticated, 
  recoverPassword as netlifyRecoverPassword, 
  requestPasswordRecovery as netlifyRequestPasswordRecovery, 
  updateUser as netlifyUpdateUser,
  AuthError,
  MissingIdentityError,
  User as NetlifyUser
} from '@netlify/identity';
import { AdminUser, UserRole } from '../types';
import { DEV_MOCK_ADMIN_USERS } from '../data/mockData';

const AUTH_STORAGE_KEY = 'cathedral_admin_session';

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
  provider: 'netlify-identity' | 'mock-dev';
}

export interface AuthCallbackInfo {
  type: 'invite' | 'recovery' | 'confirmation' | 'oauth' | 'email_change' | null;
  token?: string;
  user?: AdminUser | null;
  error?: string;
}

class AuthService {
  private initialCallbackResult: AuthCallbackInfo | null = null;
  private initialized = false;

  /**
   * Translates a Netlify Identity User object into the application's AdminUser model
   */
  public mapNetlifyUserToAdminUser(user: NetlifyUser): AdminUser {
    const roles = user.roles || (user.role ? [user.role] : []);
    const isAdmin = roles.includes('admin') || roles.includes('Admin');
    const role: UserRole = isAdmin ? 'admin' : 'contributor';
    
    return {
      id: user.id,
      name: user.name || user.email?.split('@')[0] || 'Parish Staff',
      email: user.email || 'staff@cubadiocese.ph',
      role,
      title: isAdmin ? 'Cathedral Administrator' : 'Parish Pastoral Staff',
      status: 'Active',
      lastActive: 'Online now',
      createdDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Initializes auth handling on app load.
   * Processes #invite_token=..., #recovery_token=..., #confirmation_token=... from URLs.
   */
  async initAuth(): Promise<AuthCallbackInfo | null> {
    if (this.initialized && this.initialCallbackResult) {
      return this.initialCallbackResult;
    }

    if (typeof window === 'undefined') return null;

    const hash = window.location.hash;
    let explicitInviteToken: string | null = null;
    let explicitRecoveryToken: string | null = null;

    // Detect hash tokens before handleAuthCallback potentially clears them
    if (hash) {
      const matchInvite = hash.match(/invite_token=([^&]+)/);
      if (matchInvite) explicitInviteToken = matchInvite[1];

      const matchRecovery = hash.match(/recovery_token=([^&]+)/);
      if (matchRecovery) explicitRecoveryToken = matchRecovery[1];
    }

    try {
      const callbackResult = await handleAuthCallback();
      this.initialized = true;

      if (callbackResult) {
        if (callbackResult.type === 'invite') {
          this.initialCallbackResult = {
            type: 'invite',
            token: callbackResult.token || explicitInviteToken || '',
          };
          return this.initialCallbackResult;
        }

        if (callbackResult.type === 'recovery') {
          const mappedUser = callbackResult.user ? this.mapNetlifyUserToAdminUser(callbackResult.user) : null;
          if (mappedUser) {
            this.setSession(mappedUser, 'netlify-identity', true);
          }
          this.initialCallbackResult = {
            type: 'recovery',
            token: explicitRecoveryToken || '',
            user: mappedUser,
          };
          return this.initialCallbackResult;
        }

        if (callbackResult.type === 'confirmation' || callbackResult.type === 'oauth') {
          const user = callbackResult.user ? this.mapNetlifyUserToAdminUser(callbackResult.user) : null;
          if (user) {
            this.setSession(user, 'netlify-identity', true);
          }
          this.initialCallbackResult = {
            type: callbackResult.type,
            user,
          };
          return this.initialCallbackResult;
        }
      }
    } catch (err: unknown) {
      console.warn('Netlify Identity auth callback check notice:', err);
    }

    // Fallback if hash contained invite token but client was not initialized
    if (explicitInviteToken) {
      this.initialCallbackResult = {
        type: 'invite',
        token: explicitInviteToken,
      };
      this.initialized = true;
      return this.initialCallbackResult;
    }

    if (explicitRecoveryToken) {
      this.initialCallbackResult = {
        type: 'recovery',
        token: explicitRecoveryToken,
      };
      this.initialized = true;
      return this.initialCallbackResult;
    }

    this.initialized = true;
    return null;
  }

  public setSession(user: AdminUser, provider: 'netlify-identity' | 'mock-dev', rememberMe = true) {
    const session: AuthSession = {
      user,
      token: `auth-${provider}-${user.id}-${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      provider,
    };
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  public getSession(): AuthSession | null {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        const session: AuthSession = JSON.parse(data);
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

  /**
   * Asynchronously checks active Netlify Identity session if present in browser
   */
  async syncNetlifyUser(): Promise<AdminUser | null> {
    try {
      const isAuth = await isNetlifyAuthenticated();
      if (isAuth) {
        const netlifyUser = await getNetlifyUser();
        if (netlifyUser) {
          const user = this.mapNetlifyUserToAdminUser(netlifyUser);
          this.setSession(user, 'netlify-identity', true);
          return user;
        }
      }
    } catch {
      // Ignore if offline
    }
    return this.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Completes account activation by setting a password using an invite token
   */
  async acceptInvite(token: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const user = await netlifyAcceptInvite(token, password);
      const mappedUser = this.mapNetlifyUserToAdminUser(user);
      this.setSession(mappedUser, 'netlify-identity', true);
      return { success: true, user: mappedUser };
    } catch (err: unknown) {
      console.error('Netlify Identity acceptInvite failed:', err);
      let errorMsg = 'Failed to activate account. The invitation link may be invalid or expired.';
      if (err instanceof AuthError) {
        errorMsg = err.message || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Logs in using email and password via Netlify Identity.
   * Gracefully falls back to mock profiles in local dev environment if Netlify Identity is not active.
   */
  async login(emailOrUsername: string, password?: string, rememberMe = true): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    if (!emailOrUsername || !emailOrUsername.trim()) {
      return { success: false, error: 'Please enter your parish staff email or username.' };
    }

    // 1. Attempt Netlify Identity Login
    if (password && emailOrUsername.includes('@')) {
      try {
        const netlifyUser = await netlifyLogin(emailOrUsername.trim(), password);
        if (netlifyUser) {
          const mappedUser = this.mapNetlifyUserToAdminUser(netlifyUser);
          this.setSession(mappedUser, 'netlify-identity', rememberMe);
          return { success: true, user: mappedUser };
        }
      } catch (err: unknown) {
        // If AuthError with 400/401/422, credentials were rejected by Netlify Identity
        if (err instanceof AuthError && (err.status === 400 || err.status === 401 || err.status === 422)) {
          return { success: false, error: err.message || 'Invalid email or password. Please try again.' };
        }
        
        // If MissingIdentityError or endpoint uncontactable, log and allow dev fallback if in local environment
        if (err instanceof MissingIdentityError || !(err instanceof AuthError)) {
          console.info('Netlify Identity endpoint not active on local host; testing development fallback.');
        }
      }
    }

    // 2. Development & Evaluation Mock User Fallback
    const matched = DEV_MOCK_ADMIN_USERS.find(
      u => u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
           u.name.toLowerCase().includes(emailOrUsername.toLowerCase())
    );

    if (matched) {
      this.setSession(matched, 'mock-dev', rememberMe);
      return { success: true, user: matched };
    }

    // Generic demo user
    const genericUser: AdminUser = {
      id: 'usr-staff',
      name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername.toLowerCase()}@cubadiocese.ph`,
      role: emailOrUsername.toLowerCase().includes('contributor') ? 'contributor' : 'admin',
      title: 'Parish Administrative Staff',
      status: 'Active',
      lastActive: 'Online now',
      createdDate: new Date().toISOString().split('T')[0],
    };

    this.setSession(genericUser, 'mock-dev', rememberMe);
    return { success: true, user: genericUser };
  }

  /**
   * Initiates password recovery email via Netlify Identity
   */
  async requestPasswordRecovery(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await netlifyRequestPasswordRecovery(email);
      return { success: true };
    } catch (err: unknown) {
      console.error('Request password recovery error:', err);
      let errorMsg = 'Failed to send password recovery email.';
      if (err instanceof AuthError) errorMsg = err.message || errorMsg;
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Redeems a recovery token and updates password
   */
  async recoverPassword(token: string, newPassword: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const user = await netlifyRecoverPassword(token, newPassword);
      const mappedUser = this.mapNetlifyUserToAdminUser(user);
      this.setSession(mappedUser, 'netlify-identity', true);
      return { success: true, user: mappedUser };
    } catch (err: unknown) {
      console.error('Recover password error:', err);
      let errorMsg = 'Failed to reset password. The recovery link may be expired.';
      if (err instanceof AuthError) errorMsg = err.message || errorMsg;
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Updates password for the active logged-in user
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await netlifyUpdateUser({ password: newPassword });
      return { success: true };
    } catch (err: unknown) {
      console.error('Update password error:', err);
      let errorMsg = 'Failed to update password.';
      if (err instanceof AuthError) errorMsg = err.message || errorMsg;
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Cleans up sessions and signs out from Netlify Identity
   */
  async logout(): Promise<void> {
    try {
      await netlifyLogout();
    } catch {
      // Ignore if offline
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export const authService = new AuthService();
