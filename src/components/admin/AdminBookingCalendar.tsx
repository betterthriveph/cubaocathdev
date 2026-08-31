/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Admin Booking Calendar Component
 * 
 * Requirements:
 * 1. Live Data Source: Reads live Netlify Database reservation data via serverless function.
 * 2. Active Status Filtering:
 *    - Displays 'awaiting_payment' (while hold is active in future), 'payment_submitted', 'confirmed', and 'completed'.
 *    - Automatically excludes 'hold_expired', 'cancelled', and 'declined'.
 *    - Expired awaiting_payment holds automatically stop appearing as active blocks.
 * 3. Calendar Details:
 *    - Facility, Date, Start/End time, Reservation Reference, Booking Status.
 *    - Admin view: Applicant Name, Payment Status, Remaining Hold Time countdown.
 * 4. Facility Filtering: Supports All Facilities and individual facility filtering.
 * 5. Visual Distinction: Clear badges and colors for Temporary Hold, Payment Submitted, Confirmed, Completed.
 * 6. Refresh Behavior: Auto-subscribes to bookings change events and re-fetches on verification/updates.
 * 7. Availability Consistency: Matches check-facility-availability conflict rules.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Timer, 
  Eye, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  DollarSign, 
  Plus, 
  X,
  Send,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { facilityService } from '../../services/facilityService';
import { Facility, FacilityReservation, ReservationStatus } from '../../types';

interface AdminBookingCalendarProps {
  showToast?: (msg: string) => void;
  onOpenAddBooking?: (date?: string) => void;
  onOpenVerifyModal?: (reservation: FacilityReservation) => void;
  onOpenSendPaymentModal?: (reservation: FacilityReservation) => void;
}

export const AdminBookingCalendar: React.FC<AdminBookingCalendarProps> = ({
  showToast,
  onOpenAddBooking,
  onOpenVerifyModal,
  onOpenSendPaymentModal,
}) => {
  const [facilities, setFacilities] = useState<Facility[]>(() => facilityService.getAllFacilities());
  const [reservations, setReservations] = useState<FacilityReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Calendar View Navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filters
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'awaiting_payment' | 'payment_submitted' | 'confirmed' | 'completed'>('all');

  // Selected reservation for deep dossier view
  const [selectedReservationForView, setSelectedReservationForView] = useState<FacilityReservation | null>(null);

  // Time ticker for countdown
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live calendar reservations from Netlify Function
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate date range for current view (current month +/- 1 month for buffer)
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0];

      const res = await facilityService.getReservations({
        startDate,
        endDate,
        facilityId: facilityFilter !== 'all' ? facilityFilter : undefined,
      });

      if (res.success) {
        // Fallback: If facilityService also cached allReservations, use allReservations or reservations
        const rawList = res.allReservations?.length ? res.allReservations : (res.reservations || []);
        setReservations(rawList);
        setLastRefreshed(new Date());
      } else {
        console.warn('Failed to load reservations from server, falling back to inquiries/reservations cache:', res.error);
        const fallbackData = await facilityService.getInquiriesAndReservations();
        setReservations(fallbackData.reservations || []);
      }
    } catch (err) {
      console.error('Error fetching calendar reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, facilityFilter]);

  useEffect(() => {
    fetchCalendarData();
    const unsubBookings = facilityService.subscribeBookings(() => {
      fetchCalendarData();
    });
    const unsubFacilities = facilityService.subscribe((facs) => {
      setFacilities(facs);
    });
    return () => {
      unsubBookings();
      unsubFacilities();
    };
  }, [fetchCalendarData]);

  // Year & Month details
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDay = firstDayOfMonth.getDay(); // 0 is Sunday
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Helper: Format countdown string and determine if hold expired
  const getHoldCountdown = (holdExpiresAt?: string) => {
    if (!holdExpiresAt) return null;
    const diff = new Date(holdExpiresAt).getTime() - currentTime;
    if (diff <= 0) {
      return { text: 'Hold Expired', isExpired: true, minutes: 0, seconds: 0 };
    }
    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const text = hrs > 0 
      ? `${hrs}h ${remMins}m remaining`
      : `${mins}m ${secs.toString().padStart(2, '0')}s remaining`;
    return { text, isExpired: false, minutes: mins, seconds: secs };
  };

  // Filter reservations based on active availability rules and user filters
  const activeCalendarReservations = useMemo(() => {
    return reservations.filter((r) => {
      // 1. Facility filter
      if (facilityFilter !== 'all') {
        const matchesFacility = r.facilityId === facilityFilter || (r as any).facilitySlug === facilityFilter;
        if (!matchesFacility) return false;
      }

      // 2. Active status rules (Requirement 2):
      // Must exclude hold_expired, cancelled, and declined
      if (r.status === 'cancelled' || (r.status as string) === 'declined' || r.status === 'hold_expired') {
        return false;
      }

      // Expired awaiting_payment holds must automatically stop appearing
      if (r.status === 'awaiting_payment' && r.holdExpiresAt) {
        const isExpired = new Date(r.holdExpiresAt).getTime() <= currentTime;
        if (isExpired) return false;
      }

      // Allowed active statuses
      const isValidStatus = 
        r.status === 'awaiting_payment' || 
        r.status === 'payment_submitted' || 
        r.status === 'confirmed' || 
        r.status === 'completed';

      if (!isValidStatus) return false;

      // 3. User status filter pill
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [reservations, facilityFilter, statusFilter, currentTime]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return activeCalendarReservations.filter((r) => {
      const resDate = r.reservationDate || (r as any).eventDate || (r as any).reservedDate || '';
      return resDate === selectedDate;
    });
  }, [activeCalendarReservations, selectedDate]);

  // Status Styling Helper
  const getStatusBadge = (status: ReservationStatus, holdExpiresAt?: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'payment_submitted':
        return {
          label: 'Payment Submitted',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          icon: ShieldCheck,
        };
      case 'awaiting_payment': {
        const countdown = getHoldCountdown(holdExpiresAt);
        return {
          label: countdown?.isExpired ? 'Hold Expired' : 'Temporary Hold',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          icon: Timer,
        };
      }
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          dot: 'bg-blue-500',
          icon: CheckCircle2,
        };
      default:
        return {
          label: String(status).replace('_', ' ').toUpperCase(),
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-400',
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Live Synchronization Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Netlify Database Sync
            </span>
            <span className="text-xs text-slate-400">
              Synced {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <h2 className="font-cathedral font-bold text-slate-900 text-lg sm:text-xl mt-1">
            Cathedral Venue Booking & Availability Calendar
          </h2>
          <p className="text-xs text-slate-500">
            Real-time schedule of active slot holds, submitted payment receipts, and confirmed parish events.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => fetchCalendarData()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-query live Netlify Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Refresh Calendar'}</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAddBooking) {
                onOpenAddBooking(selectedDate);
              } else if (showToast) {
                showToast(`Opened manual booking for ${selectedDate}`);
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* 2. Controls, Month Navigation & Interactive Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Month Picker Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-cathedral font-bold text-slate-900 px-3 text-sm min-w-[150px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Facility & Status Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
          
          {/* Facility Filter Dropdown (Requirement 4) */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-[#0171bb]/30 cursor-pointer"
            >
              <option value="all">All Cathedral Facilities</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Pills (Requirement 5) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Active
            </button>

            <button
              onClick={() => setStatusFilter('awaiting_payment')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'awaiting_payment'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Temporary Holds</span>
            </button>

            <button
              onClick={() => setStatusFilter('payment_submitted')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'payment_submitted'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Payment Submitted</span>
            </button>

            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Confirmed</span>
            </button>

            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'completed'
                  ? 'bg-[#0171bb] text-white shadow-sm'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Completed</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. Calendar Grid & Side Schedule Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols on Large) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 uppercase tracking-wider text-[10px] pb-2 border-b border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            
            {/* Empty cells before month begins */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div
                key={`empty-start-${i}`}
                className="h-24 sm:h-28 rounded-xl bg-slate-50/40 border border-transparent p-1.5 opacity-25"
              />
            ))}

            {/* Day cells */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const dayEvents = activeCalendarReservations.filter((r) => {
                const rDate = r.reservationDate || (r as any).eventDate || (r as any).reservedDate || '';
                return rDate === dateString;
              });

              const isSelected = selectedDate === dateString;
              const isToday = new Date().toISOString().split('T')[0] === dateString;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDate(dateString)}
                  className={`h-24 sm:h-28 rounded-xl p-1.5 sm:p-2 transition-all cursor-pointer border flex flex-col justify-between overflow-hidden relative group ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#0171bb] ring-2 ring-[#0171bb]/20 shadow-sm'
                      : dayEvents.length > 0
                      ? 'bg-white border-slate-300 hover:border-[#0171bb] hover:shadow-xs'
                      : isToday
                      ? 'bg-slate-50/90 border-blue-300 hover:bg-white'
                      : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center justify-center w-5 h-5 rounded-full ${
                      isToday
                        ? 'bg-[#0171bb] text-white'
                        : isSelected
                        ? 'text-[#0171bb]'
                        : 'text-slate-800'
                    }`}>
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Reservation Chips in Day Cell (Requirement 3 & 5) */}
                  <div className="space-y-1 overflow-hidden mt-1 flex-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const badge = getStatusBadge(ev.status, ev.holdExpiresAt);
                      const fac = facilities.find(f => f.id === ev.facilityId || f.slug === ev.facilityId);
                      const facLabel = fac?.name || ev.facilityName || ev.facilityId;

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(dateString);
                            setSelectedReservationForView(ev);
                          }}
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate border transition-all hover:scale-[1.02] cursor-pointer ${badge.bg}`}
                          title={`${facLabel} • ${ev.startTime}-${ev.endTime} • ${ev.customerName || ev.applicantName || 'Parishioner'} (${badge.label})`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                            <span className="truncate">{facLabel}</span>
                          </div>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[8px] font-bold text-slate-500 pl-1">
                        +{dayEvents.length - 2} more bookings
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Detailed Schedule for Selected Date (Requirement 3 & 5) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Schedule Details
                </span>
                <h3 className="font-cathedral font-bold text-slate-900 text-base">
                  {selectedDate ? (
                    new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  ) : (
                    'No date selected'
                  )}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {selectedDateEvents.length} Active Booking(s)
              </span>
            </div>

            {/* Event List */}
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 space-y-2.5">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No active bookings scheduled</p>
                <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                  This date has no temporary holds or confirmed reservations for the selected facility filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {selectedDateEvents.map((res) => {
                  const badge = getStatusBadge(res.status, res.holdExpiresAt);
                  const countdown = getHoldCountdown(res.holdExpiresAt);
                  const fac = facilities.find(f => f.id === res.facilityId || f.slug === res.facilityId);
                  const clientName = res.customerName || res.applicantName || res.name || 'Parishioner';
                  const clientEmail = res.customerEmail || res.applicantEmail || res.email || '';

                  return (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0171bb] transition-all space-y-2.5 bg-slate-50/50"
                    >
                      {/* Top Bar: Venue & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {fac?.name || res.facilityName || res.facilityId}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Ref: {res.referenceCode}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 border flex items-center gap-1 ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* Schedule, Customer, & Payment Details (Requirement 3) */}
                      <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#0171bb]" />
                          <span>{res.startTime} – {res.endTime}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-900">{clientName}</span>
                        </div>

                        {clientEmail && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{clientEmail}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-100 mt-1">
                          <span>
                            Payment: <strong className="text-slate-800 uppercase">{res.paymentStatus || 'unpaid'}</strong>
                          </span>
                          <span>
                            Deposit Due: <strong className="text-emerald-700">₱{(res.depositDue || 0).toLocaleString()}</strong>
                          </span>
                        </div>

                        {/* Remaining Hold Time Ticker if awaiting payment */}
                        {res.status === 'awaiting_payment' && res.holdExpiresAt && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded mt-1 border border-amber-200">
                            <Timer className="w-3 h-3 text-amber-600" />
                            <span>{countdown?.text}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1 flex items-center justify-between gap-1.5">
                        {/* Send Payment Instructions if Pending */}
                        {(res.status === 'pending' || res.status === 'awaiting_payment') && onOpenSendPaymentModal && (
                          <button
                            onClick={() => onOpenSendPaymentModal(res)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Hold Email</span>
                          </button>
                        )}

                        {/* Verify Payment if Submitted */}
                        {res.status === 'payment_submitted' && onOpenVerifyModal && (
                          <button
                            onClick={() => onOpenVerifyModal(res)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Verify Receipt</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReservationForView(res)}
                          className="ml-auto px-2.5 py-1 rounded-lg bg-[#0171bb] hover:bg-[#015f9e] text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Book on Date Button */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => {
                if (onOpenAddBooking) {
                  onOpenAddBooking(selectedDate);
                } else if (showToast) {
                  showToast(`Schedule venue on ${selectedDate}`);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve Venue on {selectedDate}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Deep Dossier Modal */}
      {selectedReservationForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setSelectedReservationForView(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Cathedral Booking Dossier
              </span>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                {selectedReservationForView.purpose || 'Cathedral Facility Event'}
              </h3>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                Reference: {selectedReservationForView.referenceCode}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Client Information</span>
                  <span className="font-bold text-slate-900">
                    {selectedReservationForView.customerName || selectedReservationForView.applicantName || selectedReservationForView.name || 'Parishioner'}
                  </span>
                  <div className="text-slate-500">{selectedReservationForView.customerEmail || selectedReservationForView.applicantEmail || selectedReservationForView.email}</div>
                  <div className="text-slate-500">{selectedReservationForView.phone || 'No phone provided'}</div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Schedule & Venue</span>
                  <span className="font-bold text-slate-900">
                    {selectedReservationForView.reservationDate || (selectedReservationForView as any).reservedDate}
                  </span>
                  <div className="text-slate-500">{selectedReservationForView.startTime} – {selectedReservationForView.endTime}</div>
                  <div className="text-[#0171bb] font-semibold">
                    {facilities.find(f => f.id === selectedReservationForView.facilityId)?.name || selectedReservationForView.facilityName || selectedReservationForView.facilityId}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Agreed Financials</span>
                  <span className="font-bold text-slate-900">
                    Total: ₱{(selectedReservationForView.agreedAmount || selectedReservationForView.agreedPrice || selectedReservationForView.amount || 0).toLocaleString()}
                  </span>
                  <div className="text-emerald-700 font-semibold">
                    Deposit Due: ₱{(selectedReservationForView.depositDue || 0).toLocaleString()}
                  </div>
                  {selectedReservationForView.paymentReference && (
                    <div className="text-blue-700 font-mono text-[10px] mt-0.5">
                      Pay Ref: {selectedReservationForView.paymentReference}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Booking Status</span>
                  <span className="font-bold uppercase text-slate-900">
                    {selectedReservationForView.status.replace('_', ' ')}
                  </span>
                  {selectedReservationForView.holdExpiresAt && (
                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                      Hold expires: {new Date(selectedReservationForView.holdExpiresAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {selectedReservationForView.paymentProofUrl && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                  <div className="text-purple-900 font-semibold text-xs">
                    Official Proof of Payment Attached
                  </div>
                  <a
                    href={selectedReservationForView.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                  >
                    View Receipt Image
                  </a>
                </div>
              )}

              {selectedReservationForView.adminNotes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                  <span className="font-bold block text-[10px]">Administrative Secretariat Notes:</span>
                  <p className="mt-0.5">{selectedReservationForView.adminNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (showToast) {
                      showToast(`Permit & rental agreement printed for ${selectedReservationForView.referenceCode}`);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Permit / Voucher</span>
                </button>

                <button
                  onClick={() => setSelectedReservationForView(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
