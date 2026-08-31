import React from 'react';
import { CATHEDRAL_INFO } from '../../data/cathedralData';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Flame, 
  Heart, 
  ShieldCheck
} from 'lucide-react';
import { useModals } from '../../context/ModalContext';

export const Footer: React.FC = () => {
  const { openCandleModal, openDonationModal } = useModals();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 pb-12 border-b border-slate-800">
          
          {/* Column 1: Parish Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white overflow-hidden p-0.5 border border-amber-400/40 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Immaculate Conception Cathedral of Cubao Seal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-cathedral text-lg font-bold text-white block">Cubao Cathedral</span>
                <span className="text-xs text-amber-400 font-medium">Diocese of Cubao</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Titular Patroness: Our Lady of the Immaculate Conception (Feast: Dec 8). Founded in 1950 by the SVD Fathers and consecrated as Cathedral in 2003.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{CATHEDRAL_INFO.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{CATHEDRAL_INFO.contactNumbers.landline}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{CATHEDRAL_INFO.email}</span>
              </p>
            </div>
          </div>

          {/* Column 2: Office Hours & Emergency Sick Call */}
          <div className="space-y-4 max-w-md md:ml-auto w-full">
            <h4 className="font-cathedral text-sm font-semibold text-white uppercase tracking-wider border-b border-amber-500/30 pb-1 inline-block">
              Parish Office Hours
            </h4>
            
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-200 font-medium">
                <span>Tuesday to Sunday</span>
                <span className="text-emerald-400 font-semibold">8:00 AM – 5:00 PM</span>
              </div>
              <p className="text-[11px] text-slate-400">Lunch Break: 12:00 NN – 1:00 PM</p>
              <div className="pt-1.5 border-t border-slate-800 text-rose-300 text-[11px] font-medium">
                Parish Office is closed on Mondays
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs">
              <div className="font-semibold text-rose-200 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                24/7 Emergency Sick Call
              </div>
              <p className="text-[11px] text-rose-300/80 mb-2">
                For emergency Anointing of the Sick & Viaticum for critical patients.
              </p>
              <a
                href={`tel:${CATHEDRAL_INFO.contactNumbers.emergencySickCall}`}
                className="inline-flex items-center gap-1.5 font-bold text-rose-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {CATHEDRAL_INFO.contactNumbers.emergencySickCall}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Devotional Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Immaculate Conception Cathedral of Cubao. Diocese of Cubao.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={openCandleModal}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Light a Candle</span>
            </button>
            <span>•</span>
            <button
              onClick={openDonationModal}
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Support Parish</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
