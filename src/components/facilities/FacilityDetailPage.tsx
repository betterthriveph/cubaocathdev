import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { GrottoFacilityPage } from './GrottoFacilityPage';
import { ParishCenterFacilityPage } from './ParishCenterFacilityPage';
import { NativityChapelFacilityPage } from './NativityChapelFacilityPage';
import { CATHEDRAL_INFO } from '../../data/cathedralData';
import { 
  Building2, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useModals } from '../../context/ModalContext';

export const FacilityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openCandleModal } = useModals();

  // Route directly to rich specific components when slug matches
  if (slug === 'grotto' || slug === 'the-cathedral-grottos' || slug === 'facility-grotto') {
    return <GrottoFacilityPage setCurrentPage={() => {}} onOpenCandleModal={openCandleModal} />;
  }

  if (slug === 'parish-center' || slug === 'facility-parish-center') {
    return <ParishCenterFacilityPage setCurrentPage={() => {}} />;
  }

  if (slug === 'nativity-chapel' || slug === 'nativity-adoration-chapel' || slug === 'facility-nativity-chapel') {
    return <NativityChapelFacilityPage setCurrentPage={() => {}} onOpenCandleModal={openCandleModal} />;
  }

  // Fallback / Generic facility from data if crypt or other slug
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/facilities"
          className="text-xs font-bold text-slate-600 hover:text-[#0171bb] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Facilities</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0171bb] flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="font-cathedral text-3xl font-bold text-slate-900 capitalize">
          {slug?.replace(/-/g, ' ')}
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Please contact the Cathedral Secretariat or Parish Office for schedule reservations, availability, and guided visitations.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/facilities"
            className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors"
          >
            Explore Cathedral Facilities
          </Link>
          <Link
            to="/contact?subject=Facility%20Reservation%20Inquiry"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Inquire with Secretariat
          </Link>
        </div>
      </div>
    </div>
  );
};
