import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Building2, 
  Calendar, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Camera, 
  Zap, 
  X,
  Maximize2,
  Tag,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { facilityService } from '../../services/facilityService';

interface ParishCenterFacilityPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const ParishCenterFacilityPage: React.FC<ParishCenterFacilityPageProps> = ({
  setCurrentPage,
}) => {
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);
  const [rateTier, setRateTier] = useState<'church' | 'non-church'>('church');

  // Reservation / Quote Form State
  const [clientName, setClientName] = useState('');
  const [clientOrg, setClientOrg] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<'multi-purpose' | 'big' | 'small'>('multi-purpose');
  const [eventDate, setEventDate] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [eventType, setEventType] = useState('Parish Ministry Recollection');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const rooms = [
    {
      id: 'small' as const,
      name: 'Small Function Room',
      subtitle: 'Breakout & Committee Meetings',
      area: '23 sqm',
      capacity: 'Up to 35 Pax',
      churchRate: '₱900 / hr',
      churchRateNum: 900,
      nonChurchRate: '₱1,400 / hr',
      nonChurchRateNum: 1400,
      description: 'Cozy and quiet meeting room with split air-conditioning, conference tables, whiteboard, and high-speed Wi-Fi.',
      idealFor: ['Ministry Core Team Meetings', 'Small Group Catechesis', 'Counseling & Consultations', 'Committee Planning'],
    },
    {
      id: 'big' as const,
      name: 'Big Function Room',
      subtitle: 'Seminars & Formation Sessions',
      area: '30 sqm',
      capacity: 'Up to 45 Pax',
      churchRate: '₱1,200 / hr',
      churchRateNum: 1200,
      nonChurchRate: '₱1,800 / hr',
      nonChurchRateNum: 1800,
      description: 'Mid-sized air-conditioned formation room with audiovisual projection capability, flexible seating arrangements, and podium.',
      idealFor: ['Pre-Cana Seminars', 'Bible Study Groups', 'Youth Leadership Workshops', 'Parish Council Meetings'],
    },
    {
      id: 'multi-purpose' as const,
      name: 'Multi-Purpose Hall',
      subtitle: 'Large Gatherings, Banquets & Recollections',
      area: '118 sqm',
      capacity: 'Up to 144 Pax',
      churchRate: '₱3,500 / hr',
      churchRateNum: 3500,
      nonChurchRate: '₱5,000 / hr',
      nonChurchRateNum: 5000,
      description: 'The primary grand assembly space equipped with pro audio system, stage area, presentation display, and direct access to food prep pantries.',
      idealFor: ['Wedding Receptions', 'Baptismal Banquets', 'Parish General Assemblies', 'Diocesan Conventions'],
    },
  ];

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
      title: 'Multi-Purpose Hall Setup',
      caption: '118 sqm main hall arranged for banquet celebration with elevated stage.',
    },
    {
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
      title: 'Big Function Room Layout',
      caption: '30 sqm formation space suited for seminars, retreats, and workshops.',
    },
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      title: 'Small Room Conference Meeting',
      caption: '23 sqm meeting room for parish ministries and committee deliberations.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
      title: 'Parish Center Courtyard & Compound',
      caption: 'Safe ground parking, standby power generator, and accessible entryways.',
    },
  ];

  const activeRoomObj = rooms.find((r) => r.id === selectedRoom) || rooms[2];

  const calculateTotal = () => {
    const hourlyRate = rateTier === 'church' ? activeRoomObj.churchRateNum : activeRoomObj.nonChurchRateNum;
    return hourlyRate * durationHours;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !eventDate) {
      setBookingError('Please fill out all required fields (Name, Email, Phone, and Event Date).');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    const calculatedTotal = calculateTotal();
    const facilityId = selectedRoom === 'small' ? 'parish-center-small' : selectedRoom === 'big' ? 'parish-center-big' : 'parish-center-multipurpose';

    const res = await facilityService.submitInquiry({
      facilityId,
      facilitySlug: 'parish-center',
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      requestedDate: eventDate,
      startTime: rateTier === 'church' ? '08:00 AM' : '09:00 AM',
      endTime: `${durationHours} Hours Session`,
      purpose: `${eventType} (${activeRoomObj.name})${clientOrg ? ` - Org: ${clientOrg}` : ''}${specialNotes ? ` - Notes: ${specialNotes}` : ''}`,
      message: `Duration: ${durationHours} hrs | Classification: ${rateTier === 'church' ? 'Church Rate' : 'Non-Church Rate'} | Estimated Total: ₱${calculatedTotal.toLocaleString()}${specialNotes ? ` | Notes: ${specialNotes}` : ''}`,
    });

    setIsSubmitting(false);

    if (res.success && res.referenceCode) {
      setReferenceCode(res.referenceCode);
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
        });
      } catch {
        // safe fallback
      }
      setIsBooked(true);
    } else {
      setBookingError(res.error || res.message || 'Failed to submit reservation inquiry. Please check your network and try again.');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Top Breadcrumb Header */}
      <div className="bg-slate-900 text-slate-300 py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('facilities')}
              className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Facilities</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">Parish Center</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] border border-emerald-500/30">
              Total 265 sqm Event Space
            </span>
          </div>
        </div>
      </div>

      {/* Hero Showcase / Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
          <div className="h-[380px] sm:h-[460px] relative">
            <img
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600"
              alt="Parish Center Cubao Cathedral"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Parish Center & Function Spaces
              </div>

              <h1 className="font-cathedral text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-4xl">
                Parish Center
              </h1>

              <p className="font-scriptural italic text-base sm:text-xl text-amber-200 mt-2 max-w-3xl">
                Versatile, fully air-conditioned function rooms and multi-purpose halls for faith formations, receptions, and community milestones.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <a
                  href="#reservation-section"
                  className="px-5 py-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Reserve a Function Room</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Grid (Between Introduction and Specifications) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0171bb] uppercase tracking-wider">
              <Camera className="w-4 h-4" />
              Facility Gallery
            </div>
            <h2 className="font-cathedral text-2xl font-bold text-slate-900 mt-0.5">
              Parish Center Photo Gallery
            </h2>
          </div>
          <span className="text-xs text-slate-500">Click to enlarge</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedGalleryImg(img.url)}
              className="group relative h-56 rounded-2xl overflow-hidden bg-slate-900 cursor-pointer border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="font-cathedral text-sm font-bold leading-snug">{img.title}</h4>
                <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Building Specifications & Features List (Clean structured list, NOT option tiles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0171bb] uppercase tracking-wider">
              <Maximize2 className="w-4 h-4" />
              Facility Breakdown & Technical Specifications (265 sqm Total Space)
            </div>
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              Room Specifications & Features
            </h2>
          </div>

          {/* Rate Tier Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setRateTier('church')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                rateTier === 'church'
                  ? 'bg-white text-[#0171bb] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Church-Connected Rates
            </button>
            <button
              onClick={() => setRateTier('non-church')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                rateTier === 'non-church'
                  ? 'bg-white text-[#0171bb] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non-Church Rates
            </button>
          </div>
        </div>

        {/* Structured List of Rooms & Specifications */}
        <div className="space-y-4">
          {rooms.map((room) => {
            const currentHourly = rateTier === 'church' ? room.churchRate : room.nonChurchRate;
            return (
              <div
                key={room.id}
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#0171bb]/40 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-cathedral text-xl font-bold text-slate-900">
                        {room.name}
                      </h3>
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0171bb] border border-blue-200">
                        {currentHourly}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{room.subtitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <Maximize2 className="w-3.5 h-3.5 text-[#0171bb]" />
                      <span>Floor Area: <strong className="text-slate-900 font-mono">{room.area}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-[#0171bb]" />
                      <span>Capacity: <strong className="text-slate-900">{room.capacity}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  <div className="lg:col-span-7 space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">Description & Inclusions:</span>
                    <p className="text-slate-600 leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  <div className="lg:col-span-5 space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">Ideal For:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {room.idealFor.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* General Building Specifications & Amenities */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-cathedral text-base font-bold text-slate-900">
            Compound Facilities & General Inclusions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>100% Full Standby Generator Backup for uninterrupted events</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Secure gated parking with 24/7 Cathedral security personnel</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Dedicated pantry, restrooms, and separate air-conditioning units</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>Wheelchair-accessible ramps and convenient staging access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation & Rate Calculator Form */}
      <section id="reservation-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10">
          
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0171bb] text-[11px] font-bold uppercase tracking-wider border border-blue-200 mb-2">
              <Tag className="w-3.5 h-3.5" />
              Parish Center Reservation
            </div>
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Book a Space at Parish Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select your preferred space, booking classification, and schedule. Reservation submissions are transmitted directly to the Admin Dashboard.
            </p>
          </div>

          {isBooked ? (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="font-cathedral text-2xl font-bold text-slate-900">
                Reservation Request Sent!
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Thank you, {clientName}! Your booking request for <strong>{activeRoomObj.name}</strong> on <strong>{eventDate}</strong> has been logged to the Admin Dashboard.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1.5 text-left">
                <div><strong>Tracking Code:</strong> <span className="font-mono text-[#0171bb] font-bold">{referenceCode}</span></div>
                <div><strong>Space:</strong> {activeRoomObj.name} ({activeRoomObj.area})</div>
                <div><strong>Duration:</strong> {durationHours} Hours ({rateTier === 'church' ? 'Church Rate' : 'Non-Church Rate'})</div>
                <div><strong>Estimated Amount:</strong> <span className="font-bold text-emerald-700">₱{calculateTotal().toLocaleString()}</span></div>
              </div>

              <button
                onClick={() => {
                  setIsBooked(false);
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                  setEventDate('');
                  setSpecialNotes('');
                }}
                className="px-5 py-2.5 bg-[#0171bb] hover:bg-[#015f9e] text-white rounded-xl text-xs font-semibold"
              >
                Create Another Reservation
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Category & Room Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rate Classification *
                  </label>
                  <select
                    value={rateTier}
                    onChange={(e) => setRateTier(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 bg-white"
                  >
                    <option value="church">Church-Connected / Parish Ministry</option>
                    <option value="non-church">Non-Church / Private / Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selected Space *
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 bg-white"
                  >
                    <option value="multi-purpose">Multi-Purpose Hall (118 sqm, 144 pax)</option>
                    <option value="big">Big Function Room (30 sqm, 45 pax)</option>
                    <option value="small">Small Function Room (23 sqm, 35 pax)</option>
                  </select>
                </div>
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (Hours) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type of Gathering / Activity
                  </label>
                  <input
                    type="text"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="e.g. Wedding Reception / Formation"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organization / Family
                  </label>
                  <input
                    type="text"
                    value={clientOrg}
                    onChange={(e) => setClientOrg(e.target.value)}
                    placeholder="Parish Ministry / Santos Family"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="juan@email.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="0917-xxx-xxxx"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                  />
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Setup / Equipment Needs
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Audiovisual equipment, seating configuration, catering setup ingress time..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                />
              </div>

              {bookingError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Estimate Summary & Submit */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-slate-500 block">Calculated Estimated Total:</span>
                  <span className="text-xl font-bold text-[#0171bb]">
                    ₱{calculateTotal().toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-600">
                      ({durationHours} hrs × {rateTier === 'church' ? activeRoomObj.churchRate : activeRoomObj.nonChurchRate})
                    </span>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{isSubmitting ? 'Transmitting Request...' : 'Submit Reservation Request'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </section>

      {/* Image Lightbox Modal */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-800 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedGalleryImg}
              alt="Facility enlarged"
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
};
