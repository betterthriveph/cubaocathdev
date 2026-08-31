import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import { authService } from '../../services/authService';
import { DEV_MOCK_ADMIN_USERS } from '../../data/mockData';
import { AdminUser } from '../../types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('dennis.soriano@cubadiocese.ph');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your parish staff email or username.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.login(email, password, rememberMe);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (user: AdminUser) => {
    setEmail(user.email);
    setPassword('••••••••••••');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900">
      
      {/* Background Sacred Architecture Backdrop */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=2000"
          alt="Cathedral Sanctuary"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/80 to-slate-100/60" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-5 text-center">
        
        {/* Cathedral Seal Logo */}
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0171bb] text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0171bb]" />
            <span>Parish Administration Portal</span>
          </div>
          <h1 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cubao Cathedral CMS
          </h1>
          <p className="text-xs text-slate-600">
            Immaculate Conception Cathedral Parish • Diocese of Cubao
          </p>
        </div>

      </div>

      {/* Main Login Card (Clean Light Mode) */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Staff Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cubadiocese.ph"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0171bb] focus:ring-1 focus:ring-[#0171bb] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Access Password / Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter staff password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0171bb] focus:ring-1 focus:ring-[#0171bb] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-[#0171bb] focus:ring-0 cursor-pointer"
                />
                <span>Remember session for 24h</span>
              </label>

              <span className="text-[11px] text-slate-500 font-semibold">
                Authorized Personnel Only
              </span>
            </div>

            <button
              id="admin-sign-in-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Key className="w-4 h-4 text-amber-300" />
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Staff Profile Selector */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              Quick Select Staff Profile (Development & Evaluation)
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEV_MOCK_ADMIN_USERS.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickSelect(user)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    email === user.email
                      ? 'bg-blue-50/90 border-[#0171bb] text-[#0171bb] shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold truncate text-[11px] text-slate-900">{user.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span className="capitalize">{user.role}</span>
                    <span className="text-[#0171bb] font-mono font-bold text-[9px]">{user.role === 'admin' ? 'FULL CMS' : 'WRITER'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Cathedral Website</span>
            </a>
          </div>

        </div>

        {/* Subdomain Notice */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          Configured for deployment on <code>admin.cubaocathedral.com</code> with future Netlify Identity / OAuth.
        </p>

      </div>
    </div>
  );
};
