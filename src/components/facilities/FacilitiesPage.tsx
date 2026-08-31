import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface FacilitiesPageProps {
  setCurrentPage?: (page: any) => void;
  onOpenCandleModal?: () => void;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = () => {
  const featuredFacilities = [
    {
      id: 'parish-center',
      path: '/facilities/parish-center',
      name: 'Parish Center',
      subname: 'Total 265 sqm Event Space',
      tagline: 'Versatile, fully air-conditioned spaces with dedicated rooms for meetings, formation seminars, and multi-purpose banquet receptions.',
      heroImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
      badge: 'Available for Rent',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      capacity: 'Multi-Purpose: 144 pax | Big Room: 45 pax | Small Room: 35 pax',
      rates: 'Church & Non-Church Rates Available',
      hours: '8:00 AM – 11:00 PM (By Reservation)',
      keyHighlights: [
        'Multi-Purpose Hall (118 sqm, 144 pax) with pro audio & stage',
        'Big Function Room (30 sqm, 45 pax) for seminars & workshops',
        'Small Function Room (23 sqm, 35 pax) for committee meetings',
        '100% full standby generator back-up and spacious parking compound',
      ],
      btnText: 'View Parish Center & Rates',
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'grotto',
      path: '/facilities/grotto',
      name: 'The Cathedral Grottos',
      subname: 'Chapel of the Ascension & Chapel of the Assumption',
      tagline: 'Tranquil prayer sanctuaries and garden courtyard for devotional recollections, vigils, and liturgical gatherings.',
      heroImage: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200',
      badge: 'Chapels & Sanctuaries',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      capacity: 'Ascension: 54–70 pax | Assumption: 38–50 pax',
      rates: 'Ascension: ₱12,000/day • Assumption: ₱10,000/day',
      hours: 'Open Daily 5:00 AM – 9:30 PM',
      keyHighlights: [
        'Chapel of the Ascension (83 sqm, 54–70 pax) for recollections',
        'Chapel of the Assumption (64 sqm, 38–50 pax) for family vigils',
        'Fountain of Grace blessed holy water dispensary',
        'Parish Media livestreaming coverage available for bookings',
      ],
      btnText: 'View The Cathedral Grottos & Reserve',
      icon: <Flame className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'nativity-chapel',
      path: '/facilities/nativity-chapel',
      name: 'Nativity Chapel',
      subname: 'Private & Prayerful Sacred Space',
      tagline: 'A private, prayerful, and dignified sacred space for meaningful Catholic celebrations and sacramental rites.',
      heroImage: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200',
      badge: 'Sacred Sanctuary',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      capacity: '182 – 200 Pax (235 sqm Floor Area)',
      rates: 'Inquire with Parish Secretariat',
      hours: 'By Reservation for Liturgical Celebrations',
      keyHighlights: [
        '235 sqm floor area with comfortable seating for 182–200 pax',
        'Fully air-conditioned with professional sound system & mics',
        'Dedicated liturgical sacristy for presiders and ministers',
        'Dedicated choir area and en-suite private restrooms',
      ],
      btnText: 'View Nativity Chapel Specifications',
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Diocese of Cubao • Cathedral Spaces</span>
          </div>
          
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Cathedral Spaces for the Parish
          </h1>

          <p className="font-scriptural italic text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto">
            Explore spaces where our parish community can gather, celebrate, connect, and come together.
          </p>
        </div>
      </section>

      {/* 2. THE 3 FEATURED FACILITIES CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
            Featured Cathedral Venues & Sanctuaries
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Click on any facility below to open its comprehensive dedicated page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Image with Tag */}
              <div>
                <div className="h-56 relative bg-slate-900 overflow-hidden">
                  <img
                    src={facility.heroImage}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${facility.badgeColor}`}>
                      {facility.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-sm text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-400/20 flex items-center justify-between">
                    <span>{facility.subname}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-cathedral text-xl font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {facility.tagline}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                      Facility Highlights:
                    </span>
                    {facility.keyHighlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick specs */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Capacity:</span>
                      <span className="font-bold text-slate-900 text-right">{facility.capacity.split('|')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Rates / Status:</span>
                      <span className="font-bold text-slate-900">{facility.rates.split('•')[0]}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Link */}
              <div className="p-6 pt-0">
                <Link
                  id={`open-page-${facility.id}-btn`}
                  to={facility.path}
                  className="w-full py-3 px-4 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>{facility.btnText}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 3. 4-STEP RESERVATION PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
            How to Reserve a Cathedral Facility
          </h2>
          <p className="text-xs text-slate-600">
            A simple and seamless process guided by our Parish Facilities Secretariat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Explore & Submit Request',
              desc: 'Choose your desired space (Parish Center, The Cathedral Grottos, or Nativity Chapel) and submit the online reservation request.',
            },
            {
              step: '2',
              title: 'Admin Verification',
              desc: 'The Parish Secretariat reviews your booking request on the Admin Dashboard and checks calendar schedule availability.',
            },
            {
              step: '3',
              title: 'Confirmation & Downpayment',
              desc: 'Confirm the reservation with the Parish Office and settle the initial reservation bond.',
            },
            {
              step: '4',
              title: 'Celebrate Your Milestone',
              desc: 'Enjoy your blessed celebration with complete air conditioning, pro audio setup, and standby power support.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0171bb] text-amber-300 font-cathedral font-bold text-base flex items-center justify-center">
                {item.step}
              </div>
              <h3 className="font-cathedral text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
