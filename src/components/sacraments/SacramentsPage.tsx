import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SACRAMENTS_DATA } from '../../data/cathedralData';
import { 
  BookOpen, 
  Droplets, 
  Flame, 
  HeartHandshake, 
  Cross, 
  HandHeart, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  FileCheck, 
  PhoneCall, 
  Printer, 
  Info 
} from 'lucide-react';

interface SacramentsPageProps {
  setCurrentPage?: (page: any) => void;
  selectedSacramentId?: string;
  onOpenInquiryForSacrament?: (sacramentName: string) => void;
}

export const SacramentsPage: React.FC<SacramentsPageProps> = ({
  selectedSacramentId,
}) => {
  const { id: urlSacramentId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const initialId = urlSacramentId || selectedSacramentId || 'baptism';
  const [activeSacramentId, setActiveSacramentId] = useState<string>(initialId);
  
  // Interactive Document Checklist tracker state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (urlSacramentId) {
      setActiveSacramentId(urlSacramentId);
    }
  }, [urlSacramentId]);

  const handleSelectSacrament = (id: string) => {
    setActiveSacramentId(id);
    navigate(`/sacraments/${id}`);
  };

  const currentSacrament = SACRAMENTS_DATA.find((s) => s.id === activeSacramentId) || SACRAMENTS_DATA[0];

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'baptism': return <Droplets className="w-5 h-5" />;
      case 'confirmation': return <Flame className="w-5 h-5" />;
      case 'marriage': return <HeartHandshake className="w-5 h-5" />;
      case 'funeral': return <Cross className="w-5 h-5" />;
      case 'anointing': return <HandHeart className="w-5 h-5" />;
      case 'blessings': return <Sparkles className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const totalRequirements = currentSacrament?.requirements ? currentSacrament.requirements.length : 0;
  const completedCount = currentSacrament?.requirements
    ? currentSacrament.requirements.filter((req, idx) => checkedItems[`${currentSacrament.id}-${idx}`]).length
    : 0;

  return (
    <div className="space-y-12 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Sacraments of the Church
          </h1>
          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            "Visible signs of invisible grace, instituted by Christ for our salvation."
          </p>
        </div>
      </section>

      {/* Main Sacraments Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Sacrament Selector */}
          <div className="lg:col-span-4 space-y-2">
            <div className="p-3 bg-slate-100 rounded-xl font-bold text-xs text-slate-700 uppercase tracking-wider">
              Select Holy Sacrament:
            </div>

            <div className="space-y-1.5">
              {SACRAMENTS_DATA.map((sacrament) => {
                const isActive = activeSacramentId === sacrament.id;
                return (
                  <button
                    key={sacrament.id}
                    id={`select-sacrament-${sacrament.id}`}
                    onClick={() => handleSelectSacrament(sacrament.id)}
                    className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between border cursor-pointer ${
                      isActive
                        ? 'bg-[#0171bb] text-white border-[#0171bb] shadow-md ring-2 ring-[#0171bb]/20'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-amber-300' : 'text-[#0171bb]'}>
                        {getIcon(sacrament.id)}
                      </span>
                      <div>
                        <div className="font-cathedral text-sm font-bold">
                          {sacrament.name.replace('Sacrament of ', '')}
                        </div>
                        <div className={`text-[11px] font-scriptural ${isActive ? 'text-amber-200' : 'text-slate-500'}`}>
                          {sacrament.tagalogName}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Sick Call Emergency Notice */}
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                <HandHeart className="w-4 h-4 text-rose-600" />
                Emergency Sick Call / Viaticum
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                For patients dangerously ill or in hospice requiring immediate Anointing of the Sick:
              </p>
              <a
                href="tel:+639209504222"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-rose-300 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Hotline: 0920-950-4222
              </a>
            </div>
          </div>

          {/* Main Sacrament Detail Showcase */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-60 relative overflow-hidden bg-slate-900">
                <img
                  src={currentSacrament.image}
                  alt={currentSacrament.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    {currentSacrament.tagalogName}
                  </span>
                  <h2 className="font-cathedral text-2xl sm:text-3xl font-bold">
                    {currentSacrament.name}
                  </h2>
                  <p className="font-scriptural italic text-sm sm:text-base text-slate-200 mt-1">
                    "{currentSacrament.tagline}"
                  </p>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50/60 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Liturgical Schedule:</span>
                  <div className="font-bold text-slate-900">{currentSacrament.schedule}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Advance Lead Time:</span>
                  <div className="font-bold text-amber-800">{currentSacrament.leadTime}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Stipend / Offering:</span>
                  <div className="font-bold text-slate-900">{currentSacrament.stipend}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentSacrament.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    id="book-sacrament-inquiry-btn"
                    to={`/contact?subject=Inquiry%20for%20${encodeURIComponent(currentSacrament.name)}`}
                    className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-semibold text-xs shadow transition-colors flex items-center gap-2"
                  >
                    <span>Submit Inquiry for {currentSacrament.name.replace('Sacrament of ', '')}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print Checklist</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-cathedral text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Step-by-Step Application Procedure</span>
              </h3>

              <div className="space-y-3 pt-2">
                {currentSacrament.steps.map((step) => (
                  <div key={step.stepNumber} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-[#0171bb] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-cathedral text-sm font-bold text-slate-900">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Checklist Tracker */}
            {currentSacrament.requirements && currentSacrament.requirements.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-cathedral text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span>Requirements Checklist Tracker</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Check off documents you have prepared for submission to the parish office.
                    </p>
                  </div>

                  <div className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {completedCount} of {totalRequirements} Complete
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {currentSacrament.requirements.map((req, idx) => {
                    const itemKey = `${currentSacrament.id}-${idx}`;
                    const isChecked = !!checkedItems[itemKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(itemKey)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {req.title}
                            </span>
                            {req.isMandatory && (
                              <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {req.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Important Reminders */}
            {currentSacrament.importantReminders && currentSacrament.importantReminders.length > 0 && (
              <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <h4 className="font-cathedral text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>Important Liturgical & Canonical Reminders</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900/90 pl-5 list-disc">
                  {currentSacrament.importantReminders.map((rem, rIdx) => (
                    <li key={rIdx}>{rem}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
