import React from 'react';
import { Link } from 'react-router-dom';
import { Church, Home, ArrowLeft, Building2, Newspaper, Phone } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0171bb] flex items-center justify-center mx-auto">
          <Church className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#0171bb] uppercase tracking-wider">Error 404</span>
          <h1 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The cathedral page or resource you are looking for may have been relocated, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
            <Link
              to="/about"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              About
            </Link>
            <Link
              to="/facilities"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Facilities
            </Link>
            <Link
              to="/contact"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
