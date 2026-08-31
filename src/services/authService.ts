/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Real Netlify Identity Authentication & Database Authorization Service
 * 
 * Flow:
 * 1. Netlify Identity handles authentication (email/password, invitations, password reset).
 * 2. `admin_users` table in Netlify Database handles authorization via serverless function.
 * 3. Access to /admin requires both valid Netlify Identity session AND active record in admin_users.
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
  refreshSession as netlifyRefreshSession,
  AuthError,
  User as NetlifyUser
} from '@netlify/identity';
import { AdminUser, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'cathedral_admin_session';

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
  provider: 'netlify-identity';
}

export interface AuthCallbackInfo {
  type: 'invite' | 'recovery' | 'confirmation' | 'oauth' | 'email_change' | null;
  token?: string;
  user?: AdminUser | null;
  error?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

class AuthService {
  private initialCallbackResult: AuthCallbackInfo | null = null;
  private initialized = false;
  private inviteHandled = false;

  /**
   * Helper to retrieve Netlify Identity JWT access token from current session
   */
  public async getJwtToken(): Promise<string | null> {
    try {
      const refreshed = await netlifyRefreshSession();
      if (refreshed) return refreshed;
    } catch {
      // ignore
    }

    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('gotrue.user') || sessionStorage.getItem('gotrue.user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token?.access_token) {
            return parsed.token.access_token;
          }
        }
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Calls the serverless Netlify function to authorize the verified user against `admin_users` table
   */
  public async fetchAdminAuthorization(token?: string): Promise<{ success: boolean; user?: AdminUser; error?: string; status?: number }> {
    try {
      const jwt = token || (await this.getJwtToken());
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      // Query server-side function
      const response = await fetch('/.netlify/functions/get-admin-user', {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        return {
          success: true,
          user: data.user as AdminUser,
        };
      }

      if (response.status === 403) {
        if (data.error === 'inactive') {
          return {
            success: false,
            error: 'Your admin account is inactive.',
            status: 403,
          };
        }
        return {
          success: false,
          error: 'Your account is not authorized for admin access.',
          status: 403,
        };
      }

      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication required. No valid Netlify Identity session found.',
          status: 401,
        };
      }

      return {
        success: false,
        error: data.message || 'Failed to verify admin authorization.',
        status: response.status,
      };
    } catch (err) {
      console.error('Error verifying admin authorization with database:', err);
      return {
        success: false,
        error: 'Unable to connect to authorization server. Please try again.',
      };
    }
  }

  /**
   * Translates a Netlify Identity User object into a baseline AdminUser model
   */
  public mapNetlifyUserToAdminUser(user: NetlifyUser, roleOverride?: UserRole): AdminUser {
    const roles = user.roles || (user.role ? [user.role] : []);
    const isAdmin = roleOverride ? roleOverride === 'admin' : (roles.includes('admin') || roles.includes('Admin'));
    const role: UserRole = isAdmin ? 'admin' : 'contributor';
    
    return {
      id: user.id,
      name: user.name || user.email?.split('@')[0] || 'Parish Staff',
      email: user.email || '',
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
   * Clears token hashes from URL and history immediately to avoid loops on refresh.
   */
  async initAuth(): Promise<AuthCallbackInfo | null> {
    if (this.initialized && this.initialCallbackResult) {
      return this.initialCallbackResult;
    }

    if (typeof window === 'undefined') return null;

    const hash = window.location.hash;
    let explicitInviteToken: string | null = null;
    let explicitRecoveryToken: string | null = null;

    if (hash && !this.inviteHandled) {
      const matchInvite = hash.match(/invite_token=([^&]+)/);
      if (matchInvite) {
        explicitInviteToken = matchInvite[1];
      }

      const matchRecovery = hash.match(/recovery_token=([^&]+)/);
      if (matchRecovery) {
        explicitRecoveryToken = matchRecovery[1];
      }

      // Immediately clear the hash from browser address bar & history to prevent loops
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
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
          this.initialCallbackResult = {
            type: 'recovery',
            token: explicitRecoveryToken || '',
          };
          return this.initialCallbackResult;
        }

        if (callbackResult.type === 'confirmation' || callbackResult.type === 'oauth') {
          // Verify user authorization with database
          const authRes = await this.fetchAdminAuthorization();
          if (authRes.success && authRes.user) {
            this.setSession(authRes.user, true);
            this.initialCallbackResult = {
              type: callbackResult.type,
              user: authRes.user,
            };
            return this.initialCallbackResult;
          } else {
            await this.logout();
            this.initialCallbackResult = {
              type: callbackResult.type,
              error: authRes.error || 'Your account is not authorized for admin access.',
            };
            return this.initialCallbackResult;
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Netlify Identity auth callback check notice:', err);
    }

    // Fallback if hash contained invite token
    if (explicitInviteToken && !this.inviteHandled) {
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

    // Check if there is an active session
    await this.validateAndSyncSession();

    this.initialized = true;
    return null;
  }

  /**
   * Sets the verified admin user session in browser storage
   */
  public setSession(user: AdminUser, rememberMe = true) {
    const session: AuthSession = {
      user,
      token: `auth-netlify-${user.id}-${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      provider: 'netlify-identity',
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

  public getCurrentUser(): AdminUser | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Validates active Netlify Identity session against `admin_users` table in database
   */
  public async validateAndSyncSession(): Promise<AdminUser | null> {
    try {
      const isAuth = await isNetlifyAuthenticated();
      if (isAuth) {
        const netlifyUser = await getNetlifyUser();
        if (netlifyUser) {
          const authRes = await this.fetchAdminAuthorization();
          if (authRes.success && authRes.user) {
            this.setSession(authRes.user, true);
            return authRes.user;
          } else {
            // Logged in to Netlify Identity, but not authorized in admin_users or inactive
            await this.logout();
            return null;
          }
        }
      }
    } catch {
      // Ignore if offline
    }

    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Completes account activation by setting a password using an invite token.
   * Then authorizes against admin_users database.
   */
  async acceptInvite(token: string, password: string): Promise<AuthResult> {
    this.inviteHandled = true;
    this.initialCallbackResult = null;

    // Clean hash from URL and history immediately
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    try {
      const user = await netlifyAcceptInvite(token, password);
      if (!user) {
        return { success: false, error: 'Failed to activate account with Netlify Identity.' };
      }

      // Query database for admin_users authorization
      const authRes = await this.fetchAdminAuthorization();
      if (authRes.success && authRes.user) {
        this.setSession(authRes.user, true);
        return { success: true, user: authRes.user };
      }

      // If user is authenticated in Netlify Identity but not authorized in admin_users
      await this.logout();
      return {
        success: false,
        error: authRes.error || 'Your account is not authorized for admin access.',
      };
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
   * Real login with Netlify Identity and authorization with admin_users database table.
   * No mock authentication or hardcoded credentials.
   */
  async login(email: string, password?: string, rememberMe = true): Promise<AuthResult> {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your parish staff email.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Authenticate with Netlify Identity
    try {
      const netlifyUser = await netlifyLogin(cleanEmail, password);
      if (!netlifyUser) {
        return { success: false, error: 'Invalid email or password.' };
      }

      // 2. Query admin_users table in Netlify Database via secure Netlify Function
      const authRes = await this.fetchAdminAuthorization();

      if (authRes.success && authRes.user) {
        this.setSession(authRes.user, rememberMe);
        return { success: true, user: authRes.user };
      }

      // 3. User authenticated in Netlify Identity but failed admin_users authorization
      await this.logout();
      return {
        success: false,
        error: authRes.error || 'Your account is not authorized for admin access.',
      };
    } catch (err: unknown) {
      console.error('Netlify Identity login error:', err);
      
      if (err instanceof AuthError) {
        if (err.status === 400 || err.status === 401 || err.status === 422) {
          return { success: false, error: 'Invalid email or password.' };
        }
        return { success: false, error: err.message || 'Invalid email or password.' };
      }
      
      return { success: false, error: 'Invalid email or password.' };
    }
  }

  /**
   * Initiates password recovery email via Netlify Identity
   */
  async requestPasswordRecovery(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await netlifyRequestPasswordRecovery(email.trim());
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
  async recoverPassword(token: string, newPassword: string): Promise<AuthResult> {
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    try {
      const user = await netlifyRecoverPassword(token, newPassword);
      if (!user) {
        return { success: false, error: 'Failed to reset password.' };
      }

      const authRes = await this.fetchAdminAuthorization();
      if (authRes.success && authRes.user) {
        this.setSession(authRes.user, true);
        return { success: true, user: authRes.user };
      }

      await this.logout();
      return {
        success: false,
        error: authRes.error || 'Your account is not authorized for admin access.',
      };
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
    this.initialCallbackResult = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}

export const authService = new AuthService();
