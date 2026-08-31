import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Church, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Camera, 
  Volume2, 
  Mic2, 
  Wind, 
  Users, 
  DoorOpen, 
  Music, 
  Maximize2,
  Calendar,
  X
} from 'lucide-react';

interface NativityChapelFacilityPageProps {
  setCurrentPage: (page: PageId) => void;
  onOpenCandleModal?: () => void;
}

export const NativityChapelFacilityPage: React.FC<NativityChapelFacilityPageProps> = ({
  setCurrentPage,
}) => {
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200',
      title: 'Nativity Chapel Sanctuary & Altar',
      caption: 'Reverent sacred space for weddings, baptismal celebrations, and solemn anniversary masses.',
    },
    {
      url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
      title: 'Chapel Nave & Seating for 182–200 Pax',
      caption: 'Spacious 235-sqm air-conditioned interior with custom wooden pews and clear central aisle.',
    },
    {
      url: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200',
      title: 'Dedicated Sacristy & Clergy Preparation Area',
      caption: 'Well-appointed liturgical sacristy for celebrants and assisting altar servers.',
    },
    {
      url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
      title: 'Choir Loft & Restroom Facilities',
      caption: 'Dedicated acoustic space for musical ensembles and clean en-suite comfort rooms.',
    },
  ];

  const featuresList = [
    {
      icon: <Maximize2 className="w-5 h-5 text-[#0171bb]" />,
      title: '235 sqm Floor Area',
      desc: 'Generous architectural footprint accommodating intimate to medium-scale liturgical celebrations.',
    },
    {
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      title: '182 – 200 Pax Capacity',
      desc: 'Comfortable pew seating arranged with generous aisle clearance for nuptials and processions.',
    },
    {
      icon: <Wind className="w-5 h-5 text-sky-600" />,
      title: 'Fully Air-Conditioned',
      desc: 'High-capacity split-type climate control ensuring continuous comfort for all guests.',
    },
    {
      icon: <Volume2 className="w-5 h-5 text-amber-600" />,
      title: 'Professional Sound System',
      desc: 'Crystal-clear acoustic equalization calibrated specifically for liturgical speaking and hymns.',
    },
    {
      icon: <Mic2 className="w-5 h-5 text-rose-600" />,
      title: 'Microphones & Lectern',
      desc: 'Wireless and wired high-grade microphones for celebrants, lectors, and commentators.',
    },
    {
      icon: <DoorOpen className="w-5 h-5 text-purple-600" />,
      title: 'Private Sacristy',
      desc: 'Dedicated preparation vestry for presiders, liturgical vestments, and sacred vessels.',
    },
    {
      icon: <Music className="w-5 h-5 text-emerald-600" />,
      title: 'Dedicated Choir Area',
      desc: 'Optimally positioned musical section with dedicated audio monitors and instrument inputs.',
    },
    {
      icon: <Church className="w-5 h-5 text-slate-700" />,
      title: 'En-suite Restrooms',
      desc: 'Clean, well-maintained private restroom facilities exclusive to chapel guests.',
    },
  ];

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
            <span className="text-white font-medium">Nativity Chapel</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 hidden sm:inline">Available for Sacramental Celebrations & Vigils</span>
          </div>
        </div>
      </div>

      {/* Hero Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
          <div className="h-[380px] sm:h-[460px] relative">
            <img
              src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1600"
              alt="Nativity Chapel Cubao Cathedral"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Sacred Chapel Venue
              </div>

              <h1 className="font-cathedral text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-4xl">
                Nativity Chapel
              </h1>

              <p className="font-scriptural italic text-base sm:text-xl text-amber-200 mt-2 max-w-3xl">
                "A private, prayerful, and dignified sacred space for meaningful Catholic celebrations."
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="px-5 py-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Inquire & Reserve Nativity Chapel</span>
                </button>
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
              Nativity Chapel Photo Gallery
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

      {/* Specifications & Features List (Clean Structured List) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0171bb] uppercase tracking-wider">
            <Maximize2 className="w-4 h-4" />
            Chapel Specifications & Features
          </div>
          <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Facility Specifications & Inclusions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Technical dimensions, climate control, acoustic parameters, and amenities for Nativity Chapel.
          </p>
        </div>

        {/* Technical Specs List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-cathedral text-lg font-bold text-slate-900">
            Core Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Floor Area</span>
              <span className="font-mono font-bold text-slate-900 text-sm block">235 sqm</span>
              <span className="text-slate-600">Generous nave and central processional aisle</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Seating Capacity</span>
              <span className="font-bold text-[#0171bb] text-sm block">182 – 200 Pax</span>
              <span className="text-slate-600">Padded hardwood pews with kneelers</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Climate System</span>
              <span className="font-bold text-slate-900 text-sm block">Fully Air-Conditioned</span>
              <span className="text-slate-600">Whisper-quiet split-type cooling units</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Acoustics & Audio</span>
              <span className="font-bold text-slate-900 text-sm block">Pro Sound & Sacristy</span>
              <span className="text-slate-600">Integrated wireless mics & choir area</span>
            </div>
          </div>
        </div>

        {/* Feature List (Structured Inclusions) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-cathedral text-lg font-bold text-slate-900">
            Features & Amenities List
          </h3>
          <ul className="space-y-3 text-xs">
            {featuresList.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0171bb] shrink-0">
                  {feature.icon}
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block text-sm">{feature.title}</span>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guidelines & Reservation CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="font-cathedral text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0171bb]" />
              Sacred Liturgical Guidelines
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-700">
              {[
                'Nativity Chapel is reserved exclusively for solemn Catholic liturgical ceremonies, sacramental rites, and approved prayer assemblies.',
                'Liturgical decor must respect Catholic ecclesiastical norms; adhesives that damage pews or walls are prohibited.',
                'The sound system is managed by trained Cathedral technicians to ensure optimal vocal clarity.',
                'Booking requests should be submitted at least 2 weeks in advance via the Parish Office or online inquiry.',
              ].map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0171bb] to-slate-900 text-white shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-white/20 inline-block">
                Reservations & Scheduling
              </span>
              <h3 className="font-cathedral text-2xl font-bold text-white">
                Book Nativity Chapel
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Connect with our Parish Secretariat to check date availability, liturgical arrangements, and reservation procedures.
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#0171bb] font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#0171bb]" />
              <span>Contact Secretariat for Booking</span>
            </button>
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
              alt="Nativity Chapel enlarged"
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
};
