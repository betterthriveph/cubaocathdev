import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Building2, 
  Clock, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  ArrowLeft,
  Camera, 
  Heart, 
  Droplet, 
  Info, 
  Send,
  Video,
  Maximize2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrottoFacilityPageProps {
  setCurrentPage: (page: PageId) => void;
  onOpenCandleModal?: () => void;
}

export const GrottoFacilityPage: React.FC<GrottoFacilityPageProps> = ({
  setCurrentPage,
}) => {
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  // Form State
  const [selectedChapel, setSelectedChapel] = useState<'Chapel of the Ascension' | 'Chapel of the Assumption'>('Chapel of the Ascension');
  const [contactPerson, setContactPerson] = useState('');
  const [groupName, setGroupName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('09:00 AM');
  const [estimatedPax, setEstimatedPax] = useState('50');
  const [isLivestreaming, setIsLivestreaming] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  const chapels = [
    {
      id: 'Chapel of the Ascension',
      name: 'Chapel of the Ascension',
      area: '83 sqm',
      capacity: '54 – 70 pax',
      rate: '₱12,000 / day',
      rateValue: 12000,
      description: 'Spacious air-conditioned prayer sanctuary suitable for medium-sized recollections, memorial masses, and solemn vigils.',
      features: [
        'High-grade centralized air-conditioning',
        'Built-in liturgical altar, ambo, and crucifix',
        'Yamaha audio mixer with 2 wireless microphones',
        'Padded wooden church pews with kneelers',
        'Direct covered access to Grotto garden',
      ],
      idealFor: [
        'Half-day / Full-day Parish Group Recollections',
        'Memorial Vigils & Memorial Requiem Masses',
        'Family Thanksgiving Liturgies & Jubilees',
        'Rosary Novena Devotions',
      ],
    },
    {
      id: 'Chapel of the Assumption',
      name: 'Chapel of the Assumption',
      area: '64 sqm',
      capacity: '38 – 50 pax',
      rate: '₱10,000 / day',
      rateValue: 10000,
      description: 'Intimate prayer chapel designed for private family liturgies, novenas, and devotional gatherings with dedicated altar.',
      features: [
        'Dedicated split-type quiet air-conditioning',
        'Intimate Marian sanctuary & tabernacle alcove',
        'Compact PA sound system with podium mic',
        'Private sacristy and preparation ante-room',
        'Wheelchair ramp and accessible restrooms',
      ],
      idealFor: [
        'Private Family Devotions and Novenas',
        'Small Group Spiritual Direction & Retreats',
        'Personal Prayer Vigils',
        'Solemn Anniversary Masses',
      ],
    },
  ];

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200',
      title: 'Main Grotto Sanctuary & Cave Replica',
      caption: 'The stone grotto modeled after Massabielle, Lourdes, France surrounded by flowering shrubs.',
    },
    {
      url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
      title: 'Chapel of the Ascension Sanctuary',
      caption: 'Reverent prayer interior with seating for up to 70 devotees, liturgical altar, and sound setup.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
      title: 'Garden Prayer Benches & Courtyard',
      caption: 'Quiet contemplative space shaded by mature trees for rosary and silent meditation.',
    },
    {
      url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200',
      title: 'Chapel of the Assumption Interior',
      caption: 'Subtle warm lighting provides a peaceful atmosphere for family vigils and recollections.',
    },
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson || !contactEmail || !contactPhone || !targetDate) return;

    const ref = 'GROTTO-' + Math.floor(100000 + Math.random() * 900000);
    setReferenceCode(ref);

    const chapelObj = chapels.find(c => c.id === selectedChapel);
    const fee = (chapelObj ? chapelObj.rateValue : 12000) + (isLivestreaming ? 2500 : 0);

    // Save to localStorage for Admin Dashboard
    try {
      const existing = JSON.parse(localStorage.getItem('cathedral_facility_bookings') || '[]');
      const newBooking: any = {
        id: 'fb-' + Date.now(),
        referenceCode: ref,
        facilityId: selectedChapel,
        facilityName: `The Cathedral Grottos – ${chapelObj ? chapelObj.name : selectedChapel}`,
        facilityType: 'Grotto',
        eventName: `Devotional Liturgy & Gathering (${chapelObj ? chapelObj.name : selectedChapel})`,
        clientName: contactPerson,
        clientOrganization: groupName || 'Devotee Group',
        clientEmail: contactEmail,
        clientPhone: contactPhone,
        eventDate: targetDate,
        timeSlot: targetTime,
        status: 'Pending Review',
        pax: parseInt(estimatedPax) || 50,
        estimatedPax: parseInt(estimatedPax) || 50,
        purpose: `Chapel Reservation (${chapelObj ? chapelObj.name : selectedChapel})${isLivestreaming ? ' + Livestreaming' : ''}${specialNotes ? ` - Notes: ${specialNotes}` : ''}`,
        totalAmount: fee,
        depositAmount: Math.round(fee * 0.3),
        depositStatus: 'Unpaid',
        depositPaid: 0,
        addons: isLivestreaming ? ['Parish Media Livestreaming Coverage'] : ['Standard Chapel Access'],
        livestreaming: isLivestreaming,
        notes: specialNotes || 'Submitted via Cathedral Grottos Online Reservation Form',
        createdAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem('cathedral_facility_bookings', JSON.stringify([newBooking, ...existing]));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Storage error', err);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    setBookingSubmitted(true);
  };

  const handleReset = () => {
    setContactPerson('');
    setGroupName('');
    setContactEmail('');
    setContactPhone('');
    setTargetDate('');
    setSpecialNotes('');
    setIsLivestreaming(false);
    setBookingSubmitted(false);
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
            <span className="text-white font-medium">The Cathedral Grottos</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 hidden sm:inline">Open Daily 5:00 AM – 9:30 PM</span>
          </div>
        </div>
      </div>

      {/* Hero Showcase / Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
          <div className="h-[380px] sm:h-[460px] relative">
            <img
              src="https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1600"
              alt="The Cathedral Grottos Cubao Cathedral"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Marian Prayer Sanctuary & Chapels
              </div>

              <h1 className="font-cathedral text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-4xl">
                The Cathedral Grottos
              </h1>

              <p className="font-scriptural italic text-base sm:text-xl text-amber-200 mt-2 max-w-3xl">
                "I am the Immaculate Conception." — Blessed Virgin Mary to St. Bernadette Soubirous
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <a
                  href="#grotto-reservation-form"
                  className="px-5 py-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Reserve a Grotto Chapel Below</span>
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
              Visual Tour & Gallery
            </div>
            <h2 className="font-cathedral text-2xl font-bold text-slate-900 mt-0.5">
              The Cathedral Grottos Photo Gallery
            </h2>
          </div>
          <span className="text-xs text-slate-500">Click any image to enlarge</span>
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

      {/* Overview & Chapel Specifications (Clean List of Features & Specifications, NOT Option Tiles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0171bb] uppercase tracking-wider">
            <Maximize2 className="w-4 h-4" />
            Chapel Features & Technical Specifications
          </div>
          <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Available Grotto Chapels & Inclusions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Detailed specifications for prayer chapels located within The Cathedral Grottos complex for solemn gatherings and recollections.
          </p>
        </div>

        <div className="space-y-4">
          {chapels.map((chapel) => (
            <div
              key={chapel.id}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#0171bb]/40 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-cathedral text-xl font-bold text-slate-900">
                      {chapel.name}
                    </h3>
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0171bb] border border-blue-200">
                      {chapel.rate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{chapel.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Maximize2 className="w-3.5 h-3.5 text-[#0171bb]" />
                    <span>Floor Area: <strong className="text-slate-900 font-mono">{chapel.area}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Users className="w-3.5 h-3.5 text-[#0171bb]" />
                    <span>Capacity: <strong className="text-slate-900">{chapel.capacity}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                <div className="lg:col-span-6 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">Standard Inclusions:</span>
                  <ul className="space-y-1.5">
                    {chapel.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-6 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">Ideal For:</span>
                  <ul className="space-y-1.5">
                    {chapel.idealFor.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content & Reservation Form */}
      <section id="grotto-reservation-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Description & Amenities */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* About The Cathedral Grottos */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-cathedral text-2xl font-bold text-slate-900">
                A Sacred Oasis of Peace and Maternal Intercession
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                Built during the early founding years of the parish, The Cathedral Grottos stand as a venerated sanctuary within the Cathedral grounds. Designed with prayerful dignity, the complex features stone architecture, climbing vines, flowering garden beds, and dedicated chapels symbolizing the miraculous waters of grace.
              </p>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                For over seven decades, generations of faithful Catholics from Quezon City and across Metro Manila have visited this peaceful haven to lay their worries before Our Lady, recite the Holy Rosary, and participate in parish liturgies.
              </p>
            </div>

            {/* Amenities & Grounds Features */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-cathedral text-xl font-bold text-blue-950">
                Sanctuary Amenities & Features
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  {
                    icon: <Droplet className="w-4 h-4 text-blue-600" />,
                    title: 'Fountain of Grace & Holy Water',
                    desc: 'Blessed holy water dispensary where parishioners can fill personal bottles.',
                  },
                  {
                    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
                    title: 'Landscaped Courtyard Gardens',
                    desc: 'Surrounded by ornamental palms and shaded stone benches for private contemplation.',
                  },
                  {
                    icon: <Heart className="w-4 h-4 text-rose-600" />,
                    title: 'Life-Sized Statuary',
                    desc: 'Reverent sculpted depictions of the Blessed Mother and kneeling St. Bernadette.',
                  },
                  {
                    icon: <Users className="w-4 h-4 text-indigo-600" />,
                    title: 'Wheelchair Accessible Paths',
                    desc: 'Smooth, non-slip ramp access from the main nave and parish parking compound.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules of Reverence Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-cathedral text-base font-bold text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                Rules of Reverence & Decorum
              </h4>

              <ul className="space-y-2 text-xs text-slate-700">
                {[
                  'Maintain quiet prayerful silence and turn off mobile phone rings.',
                  'Dress modestly as this is consecrated cathedral prayer ground.',
                  'No eating, picnics, or commercial unauthorized filming allowed.',
                  'Children must be supervised near the sanctuary and fountain.',
                ].map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Embedded Reservation Form (Fields Shown by Default) */}
          <div className="lg:col-span-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 sticky top-24">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0171bb] text-[11px] font-bold uppercase tracking-wider border border-blue-200 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Grotto Chapel Reservation
                </div>
                <h3 className="font-cathedral text-2xl font-bold text-slate-900">
                  Book a Grotto Chapel
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Fill in the reservation details below. Your booking request will be automatically routed to the Cathedral Admin Dashboard for confirmation.
                </p>
              </div>

              {bookingSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h4 className="font-cathedral text-xl font-bold text-slate-900">
                    Reservation Request Logged!
                  </h4>

                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, {contactPerson}! Your reservation for <strong>{selectedChapel}</strong> on <strong>{targetDate}</strong> has been transmitted to the Admin Dashboard.
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 max-w-sm mx-auto space-y-1 text-left">
                    <div><strong>Tracking Ref:</strong> <span className="font-mono text-[#0171bb] font-bold">{referenceCode}</span></div>
                    <div><strong>Chapel:</strong> {selectedChapel}</div>
                    <div><strong>Date & Time:</strong> {targetDate} ({targetTime})</div>
                    <div><strong>Livestreaming:</strong> {isLivestreaming ? 'Yes (Requested)' : 'No'}</div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-[#0171bb] hover:bg-[#015f9e] text-white rounded-xl text-xs font-semibold"
                    >
                      Book Another Date / Chapel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Chapel Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Selected Chapel *
                    </label>
                    <select
                      value={selectedChapel}
                      onChange={(e) => setSelectedChapel(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 bg-white"
                    >
                      <option value="Chapel of the Ascension">Chapel of the Ascension (83 sqm, 54-70 pax, ₱12,000/day)</option>
                      <option value="Chapel of the Assumption">Chapel of the Assumption (64 sqm, 38-50 pax, ₱10,000/day)</option>
                    </select>
                  </div>

                  {/* Target Date & Preferred Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Target Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preferred Time *
                      </label>
                      <select
                        value={targetTime}
                        onChange={(e) => setTargetTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 bg-white"
                      >
                        <option value="08:00 AM – 12:00 NN">08:00 AM – 12:00 NN (Morning Slot)</option>
                        <option value="01:00 PM – 05:00 PM">01:00 PM – 05:00 PM (Afternoon Slot)</option>
                        <option value="08:00 AM – 05:00 PM">08:00 AM – 05:00 PM (Full Day Slot)</option>
                        <option value="06:00 PM – 09:00 PM">06:00 PM – 09:00 PM (Evening Vigil)</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Person & Group/Ministry Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Group / Ministry Name
                      </label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Legion of Mary / Santos Family"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
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
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="0917-xxx-xxxx"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                      />
                    </div>
                  </div>

                  {/* Estimated Pax */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Attendees (Pax)
                    </label>
                    <input
                      type="number"
                      value={estimatedPax}
                      onChange={(e) => setEstimatedPax(e.target.value)}
                      placeholder="50"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                    />
                  </div>

                  {/* Livestreaming Checkbox */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="livestream-checkbox"
                      checked={isLivestreaming}
                      onChange={(e) => setIsLivestreaming(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0171bb] focus:ring-[#0171bb] mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="livestream-checkbox" className="text-xs text-slate-700 cursor-pointer">
                      <span className="font-bold block text-slate-900 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-600" />
                        Add Parish Media Livestreaming Coverage
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Broadcast liturgy or recollection to family abroad via high-definition private link or Facebook Live.
                      </span>
                    </label>
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Special Requests / Liturgical Needs
                    </label>
                    <textarea
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Priest presider requirements, sound equipment, or special floral needs..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      id="submit-grotto-booking-btn"
                      className="w-full py-3.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>Submit Grotto Chapel Reservation</span>
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-2">
                      Requests are sent directly to the Cathedral Admin Dashboard for verification.
                    </p>
                  </div>

                </form>
              )}

            </div>
          </div>

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
              alt="Grotto view enlarged"
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
};
