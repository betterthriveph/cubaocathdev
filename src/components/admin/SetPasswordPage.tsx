/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Staff Account Password Setup & Activation View
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles,
  LogIn,
  Home
} from 'lucide-react';
import { authService, InviteActivationResult } from '../../services/authService';
import { AdminUser } from '../../types';

interface SetPasswordPageProps {
  token: string;
  onSuccess: (user: AdminUser) => void;
}

export const SetPasswordPage: React.FC<SetPasswordPageProps> = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for activation outcome
  const [activationResult, setActivationResult] = useState<InviteActivationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Complete Netlify Identity password setup first, then obtain session and verify admin_users
      const result = await authService.acceptInvite(token, password);
      
      if (!result.identitySuccess) {
        // Identity activation itself failed (e.g. invalid/expired invite token)
        setErrorMsg(result.error || 'Failed to activate account. The invitation link may be invalid or expired.');
      } else {
        // Identity activation succeeded!
        setActivationResult(result);

        if (result.isAuthorized && result.user) {
          // Authorized admin user -> redirect to admin dashboard
          setTimeout(() => {
            onSuccess(result.user!);
          }, 1200);
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred while activating your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900">
      
      {/* Background Cathedral Sanctuary */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=2000"
          alt="Cathedral Sanctuary"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/80 to-slate-100/60" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-5 text-center">
        
        {/* Cathedral Seal */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg border border-slate-200/80 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Cubao Cathedral Seal"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Staff Account Activation</span>
          </div>
          <h1 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activationResult ? 'Account Activation' : 'Set Your Password'}
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {activationResult 
              ? 'Immaculate Conception Cathedral of Cubao Staff Portal'
              : 'Welcome to the Cubao Cathedral Administrative Portal. Create a secure password to complete your staff account setup.'}
          </p>
        </div>

      </div>

      {/* Main Activation Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          {/* CASE 1: Identity Activated AND Authorized in admin_users */}
          {activationResult?.isAuthorized && activationResult?.user && (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Account Activated!</h3>
              <p className="text-xs text-slate-600">
                Your password has been set successfully and administrative access is verified. Redirecting you to the Cathedral Admin Portal...
              </p>
            </div>
          )}

          {/* CASE 2: Identity Activated BUT NOT Authorized in admin_users (or inactive) */}
          {activationResult && !activationResult.isAuthorized && (
            <div className="py-4 space-y-5">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    Identity Setup Complete
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    {activationResult.statusReason === 'inactive'
                      ? 'Admin Account Inactive'
                      : 'Authorization Required'}
                  </h3>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 space-y-2">
                <p className="font-semibold text-amber-950">
                  {activationResult.error || 'Your account has been activated, but it is not authorized for admin access.'}
                </p>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Your Netlify Identity credentials have been securely established for <span className="font-bold text-amber-950">{activationResult.identityEmail || 'your email'}</span>. To access church bookings, announcements, and administrative records, this account must be assigned active permissions in the parish administration roster.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href="/admin/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Go to Staff Sign In</span>
                </a>

                <a
                  href="/"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Cathedral Homepage</span>
                </a>
              </div>
            </div>
          )}

          {/* CASE 3: Initial Password Form (Identity Activation not yet executed) */}
          {!activationResult && (
            <>
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Create Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="set-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0171bb] focus:ring-1 focus:ring-[#0171bb] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0171bb] focus:ring-1 focus:ring-[#0171bb] transition-all"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700 block">Password Guidelines:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                    <li>At least 8 characters in length</li>
                    <li>Use a mix of letters, numbers, and symbols for high security</li>
                  </ul>
                </div>

                <button
                  id="activate-account-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Activating account...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Complete Account Setup & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  <span>Return to Cathedral Homepage</span>
                </a>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
