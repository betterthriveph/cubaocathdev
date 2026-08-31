import React, { useState } from 'react';
import { PARISH_EVENTS } from '../../data/cathedralData';
import { ParishEvent } from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  CalendarPlus, 
  Check, 
  X, 
  Tag, 
  Bell 
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeEvent, setActiveEvent] = useState<ParishEvent | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'Feast Celebration', label: 'Feast Days & Solemnities' },
    { id: 'Liturgical', label: 'Liturgical Seasons (Simbang Gabi, Lent)' },
    { id: 'Youth', label: 'Youth & Young Adults' },
    { id: 'Formation', label: 'Formation & Recollections' },
    { id: 'Outreach', label: 'Outreach & Caritas' },
  ];

  const filteredEvents = PARISH_EVENTS.filter((evt) => {
    if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;
    return true;
  });

  const handleDownloadICS = (evt: ParishEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cubao Cathedral//Parish Events//EN
BEGIN:VEVENT
SUMMARY:${evt.title}
DESCRIPTION:${evt.description}
LOCATION:${evt.location} - Immaculate Conception Cathedral of Cubao
DTSTART:20261208T090000Z
DTEND:20261208T110000Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Activities & Feast Celebrations
          </h1>
          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            "To everything there is a season, and a time to every purpose under the heaven." (Ecclesiastes 3:1)
          </p>
        </div>
      </section>

      {/* Filter Category Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Category:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0171bb] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="h-48 overflow-hidden bg-slate-100 relative">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-blue-950/80 backdrop-blur-sm text-amber-300 px-2.5 py-0.5 rounded text-[10px] font-semibold">
                  {evt.category}
                </div>
                {evt.highlightNote && (
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-sm text-amber-200 px-2.5 py-1 rounded text-[10px] font-semibold truncate border border-amber-400/30">
                    ✨ {evt.highlightNote}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{evt.date}</span>
                  </div>

                  <h3 className="font-cathedral text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0171bb] shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0171bb] shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      id={`event-details-${evt.id}-btn`}
                      onClick={() => setActiveEvent(evt)}
                      className="flex-1 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>

                    <button
                      onClick={() => handleDownloadICS(evt)}
                      title="Add to iCal / Calendar"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            
            <div className="h-48 relative bg-slate-950">
              <img src={activeEvent.image} alt={activeEvent.title} className="w-full h-full object-cover opacity-80" />
              <button
                onClick={() => setActiveEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">{activeEvent.category}</span>
                <h3 className="font-cathedral text-xl font-bold">{activeEvent.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-950">
                <div><strong>Date:</strong> {activeEvent.date}</div>
                <div><strong>Time:</strong> {activeEvent.time}</div>
                <div><strong>Venue:</strong> {activeEvent.location}</div>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Description & Liturgical Schedule:</span>
                <p className="leading-relaxed">{activeEvent.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => handleDownloadICS(activeEvent)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <CalendarPlus className="w-4 h-4 text-amber-300" />
                  Add to Google / Apple Calendar (.ics)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
