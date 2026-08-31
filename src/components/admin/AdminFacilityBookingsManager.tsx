import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Check, 
  X, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Printer, 
  Timer, 
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { facilityService } from '../../services/facilityService';
import { Facility, FacilityInquiry, FacilityReservation } from '../../types';

interface AdminFacilityBookingsManagerProps {
  showToast: (msg: string) => void;
}

export const AdminFacilityBookingsManager: React.FC<AdminFacilityBookingsManagerProps> = ({ showToast }) => {
  const [facilities, setFacilities] = useState<Facility[]>(() => facilityService.getAllFacilities());
  const [inquiries, setInquiries] = useState<FacilityInquiry[]>([]);
  const [reservations, setReservations] = useState<FacilityReservation[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'reservations' | 'inquiries' | 'calendar'>('reservations');
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Active Selections
  const [selectedInquiry, setSelectedInquiry] = useState<FacilityInquiry | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<FacilityReservation | null>(null);
  const [isSendPaymentModalOpen, setIsSendPaymentModalOpen] = useState(false);
  const [isVerifyPaymentModalOpen, setIsVerifyPaymentModalOpen] = useState(false);
  const [isManualBookingModalOpen, setIsManualBookingModalOpen] = useState(false);

  // Payment Instructions Form State
  const [paymentFormAgreedAmount, setPaymentFormAgreedAmount] = useState<number>(10000);
  const [paymentFormDepositDue, setPaymentFormDepositDue] = useState<number>(3000);
  const [paymentFormDeadlineHours, setPaymentFormDeadlineHours] = useState<number>(2);
  const [paymentFormInstructions, setPaymentFormInstructions] = useState<string>(
    'Please deposit the required 30% reservation deposit via BDO Bank Transfer or GCash within 2 hours to secure your Cathedral schedule.\n\nBank Account:\nBank: BDO Unibank\nAccount Name: Roman Catholic Bishop of Cubao (Cathedral)\nAccount Number: 0023-4001-9283\n\nGCash Official QR:\nMobile: 0920-950-4222 (Parish Secretariat)'
  );
  const [sendingPaymentInstructions, setSendingPaymentInstructions] = useState(false);

  // Verification Form State
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyFacilityInstructions, setVerifyFacilityInstructions] = useState(
    'Please present your Cathedral Confirmation Voucher to the Secretariat reception 30 minutes prior to ingress time. Sound system operators and air conditioning units will be pre-configured.'
  );
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Manual Booking Form State
  const [manualFacilityId, setManualFacilityId] = useState('parish-center');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('08:00');
  const [manualEndTime, setManualEndTime] = useState('12:00');
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualPurpose, setManualPurpose] = useState('');
  const [manualAgreedPrice, setManualAgreedPrice] = useState(10000);
  const [manualDeposit, setManualDeposit] = useState(3000);

  // Time ticker for 2-hour hold timer countdown
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await facilityService.getInquiriesAndReservations();
      setInquiries(data.inquiries || []);
      setReservations(data.reservations || []);
      setFacilities(facilityService.getAllFacilities());
    } catch (e) {
      console.error('Failed to fetch inquiries and reservations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubBookings = facilityService.subscribeBookings(() => {
      loadData();
    });
    const unsubFacilities = facilityService.subscribe((facs) => {
      setFacilities(facs);
    });
    return () => {
      unsubBookings();
      unsubFacilities();
    };
  }, []);

  // Helper: Format countdown string
  const formatCountdown = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) {
      return { text: 'Hold Expired', isExpired: true, minutes: 0, seconds: 0 };
    }
    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { 
      text: `${mins}m ${secs.toString().padStart(2, '0')}s remaining`, 
      isExpired: false, 
      minutes: mins, 
      seconds: secs 
    };
  };

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.referenceCode.toLowerCase().includes(q) ||
      inq.purpose.toLowerCase().includes(q);
    const matchesFacility = facilityFilter === 'all' || inq.facilityId === facilityFilter;
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesFacility && matchesStatus;
  });

  // Filtered Reservations
  const filteredReservations = reservations.filter((res) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      res.name.toLowerCase().includes(q) ||
      res.email.toLowerCase().includes(q) ||
      res.referenceCode.toLowerCase().includes(q) ||
      res.purpose.toLowerCase().includes(q);
    const matchesFacility = facilityFilter === 'all' || res.facilityId === facilityFilter;
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesFacility && matchesStatus;
  });

  // Open Payment Instructions Modal for a reservation
  const handleOpenSendPaymentModal = (res: FacilityReservation) => {
    setSelectedReservation(res);
    const fac = facilities.find(f => f.id === res.facilityId || f.slug === res.facilityId);
    setPaymentFormAgreedAmount(res.agreedAmount || fac?.basePrice || 10000);
    setPaymentFormDepositDue(res.depositDue || fac?.depositAmount || Math.round((res.agreedAmount || fac?.basePrice || 10000) * 0.3));
    setPaymentFormDeadlineHours(2);
    setIsSendPaymentModalOpen(true);
  };

  // Submit Send Payment Instructions
  const handleSendPaymentInstructionsSubmit = async () => {
    if (!selectedReservation) return;
    setSendingPaymentInstructions(true);

    const deadlineDate = new Date(Date.now() + paymentFormDeadlineHours * 60 * 60 * 1000).toISOString();

    const res = await facilityService.sendPaymentInstructions(selectedReservation.id, {
      agreedAmount: paymentFormAgreedAmount,
      depositDue: paymentFormDepositDue,
      paymentDeadline: deadlineDate,
      paymentInstructions: paymentFormInstructions,
      paymentNotes: 'Official Cathedral payment request dispatched by secretariat.',
    });

    setSendingPaymentInstructions(false);
    if (res.success) {
      showToast(`Payment instructions dispatched to ${selectedReservation.email}! 2-Hour hold started.`);
      setIsSendPaymentModalOpen(false);
      loadData();
    } else {
      showToast(`Notice: ${res.message}`);
    }
  };

  // Open Verify Payment Modal
  const handleOpenVerifyModal = (res: FacilityReservation) => {
    setSelectedReservation(res);
    setVerifyNotes(`Payment reference: ${res.paymentReference || 'Bank Deposit Slip verified'}`);
    setIsVerifyPaymentModalOpen(true);
  };

  // Submit Verify Payment
  const handleVerifyPaymentSubmit = async (action: 'verify' | 'reject') => {
    if (!selectedReservation) return;
    setVerifyingPayment(true);

    const res = await facilityService.verifyPayment(
      selectedReservation.id,
      action,
      verifyNotes,
      action === 'verify' ? verifyFacilityInstructions : undefined
    );

    setVerifyingPayment(false);
    if (res.success) {
      showToast(action === 'verify' 
        ? `Booking confirmed! Confirmation email dispatched to ${selectedReservation.email}.`
        : 'Payment proof rejected. Reservation returned to pending payment.'
      );
      setIsVerifyPaymentModalOpen(false);
      loadData();
    } else {
      showToast(`Error: ${res.message}`);
    }
  };

  // Approve Inquiry & Create Reservation
  const handleApproveInquiry = async (inq: FacilityInquiry) => {
    const res = await facilityService.manageInquiry(inq.id, {
      status: 'approved',
      adminNotes: 'Inquiry approved by Cathedral Secretariat. Ready for payment instructions.',
      quotedPrice: inq.quotedPrice || 10000,
    });

    if (res.success) {
      showToast(`Inquiry ${inq.referenceCode} approved and converted to reservation!`);
      loadData();
    } else {
      showToast(`Error: ${res.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0171bb]" />
            <h2 className="font-cathedral text-xl font-bold text-slate-900">
              Cathedral Facilities & Venue Bookings
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant inquiries, dispatch official Resend payment instructions with 2-hour holds, verify bank receipts, and confirm reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Database</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSubTab('reservations'); setStatusFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'reservations'
                ? 'bg-[#0171bb] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Reservations ({reservations.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('inquiries'); setStatusFilter('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'inquiries'
                ? 'bg-[#0171bb] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Public Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, client, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-slate-50 focus:bg-white"
            />
          </div>

          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-white"
          >
            <option value="all">All Cathedral Spaces</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-white"
          >
            <option value="all">All Statuses</option>
            {activeSubTab === 'reservations' ? (
              <>
                <option value="awaiting_payment">Awaiting Payment (2-Hr Hold)</option>
                <option value="payment_submitted">Payment Proof Uploaded</option>
                <option value="confirmed">Confirmed Booking</option>
                <option value="completed">Completed Event</option>
                <option value="cancelled">Cancelled / Expired</option>
              </>
            ) : (
              <>
                <option value="new">New Inquiries</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* 1. RESERVATIONS TAB */}
      {activeSubTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredReservations.length} of {reservations.length} Cathedral Reservations
            </span>
            <span className="text-[11px] text-slate-500">
              Auto-syncs with Netlify Database & Resend Email Services
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Ref & Date</th>
                  <th className="p-3.5">Venue & Slot</th>
                  <th className="p-3.5">Client & Contact</th>
                  <th className="p-3.5">Financials & Deposit</th>
                  <th className="p-3.5">2-Hour Hold / Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No reservations match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => {
                    const fac = facilities.find(f => f.id === res.facilityId || f.slug === res.facilityId);
                    const holdTimer = formatCountdown(res.holdExpiresAt);

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 font-mono text-[11px]">{res.referenceCode}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#0171bb]" />
                            <span>{res.reservedDate}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-900 block">{fac?.name || res.facilityId}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {res.startTime} - {res.endTime}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{res.name}</div>
                          <div className="text-slate-500 text-[11px]">{res.phone || '—'}</div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[160px]">{res.email}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">₱{(res.agreedAmount || 0).toLocaleString()}</div>
                          <div className="text-emerald-700 font-semibold text-[11px]">
                            Deposit: ₱{(res.depositDue || 0).toLocaleString()}
                          </div>
                          {res.paymentReference && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                              Ref: {res.paymentReference}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              res.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : res.status === 'payment_submitted'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                                : res.status === 'awaiting_payment'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : res.status === 'completed'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                res.status === 'confirmed' ? 'bg-emerald-600' :
                                res.status === 'payment_submitted' ? 'bg-purple-600' :
                                res.status === 'awaiting_payment' ? 'bg-amber-600' : 'bg-slate-400'
                              }`} />
                              {res.status.replace('_', ' ').toUpperCase()}
                            </span>

                            {/* 2-Hour Slot Hold Timer */}
                            {res.status === 'awaiting_payment' && res.holdExpiresAt && (
                              <div className={`text-[10px] font-bold flex items-center gap-1 ${
                                holdTimer?.isExpired ? 'text-rose-600' : 'text-amber-700'
                              }`}>
                                <Timer className="w-3 h-3 shrink-0" />
                                <span>{holdTimer?.text}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Send Payment Instructions Button */}
                          {(res.status === 'pending' || res.status === 'awaiting_payment') && (
                            <button
                              onClick={() => handleOpenSendPaymentModal(res)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Dispatch Resend Payment Instructions & Start 2-Hour Hold"
                            >
                              <Send className="w-3 h-3" />
                              <span>{res.status === 'awaiting_payment' ? 'Resend Instructions' : 'Send Instructions'}</span>
                            </button>
                          )}

                          {/* Verify Payment Button */}
                          {res.status === 'payment_submitted' && (
                            <button
                              onClick={() => handleOpenVerifyModal(res)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Verify Receipt</span>
                            </button>
                          )}

                          {/* Mark Completed Button */}
                          {res.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                await facilityService.manageReservation(res.id, 'completed', 'Event successfully hosted.');
                                showToast(`Reservation ${res.referenceCode} marked as Completed!`);
                                loadData();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Mark Done
                            </button>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => setSelectedReservation(res)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0171bb]/10 hover:bg-[#0171bb]/20 text-[#0171bb] font-bold text-[11px] border border-[#0171bb]/20 transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INQUIRIES TAB */}
      {activeSubTab === 'inquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredInquiries.length} of {inquiries.length} Public Booking Inquiries
            </span>
            <span className="text-[11px] text-slate-500">
              Public inquiries submitted via the Cathedral Website
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Ref & Date</th>
                  <th className="p-3.5">Requested Venue</th>
                  <th className="p-3.5">Applicant & Purpose</th>
                  <th className="p-3.5">Time Schedule</th>
                  <th className="p-3.5">Quoted Estimate</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No inquiries match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inq) => {
                    const fac = facilities.find(f => f.id === inq.facilityId || f.slug === inq.facilityId);

                    return (
                      <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 font-mono text-[11px]">{inq.referenceCode}</div>
                          <div className="text-slate-500 text-[11px]">{inq.createdAt?.split('T')[0]}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-900 block">{fac?.name || inq.facilityId}</span>
                          <span className="text-[10px] text-slate-500">{inq.requestedDate}</span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{inq.name}</div>
                          <div className="text-slate-600 text-[11px] font-medium">{inq.purpose}</div>
                          <div className="text-slate-400 text-[10px]">{inq.email} • {inq.phone}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{inq.startTime} - {inq.endTime}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">
                            ₱{(inq.quotedPrice || fac?.basePrice || 0).toLocaleString()}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inq.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inq.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : inq.status === 'declined'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-900'
                          }`}>
                            {inq.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {inq.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveInquiry(inq)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: SEND PAYMENT INSTRUCTIONS VIA RESEND (2-HOUR HOLD) */}
      {isSendPaymentModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setIsSendPaymentModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Transactional Email Dispatch
                </span>
              </div>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                Send Payment Instructions & Hold Slot
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Client: {selectedReservation.name} ({selectedReservation.email}) • Ref: {selectedReservation.referenceCode}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Financial Inputs */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Agreed Total Rate (₱)
                  </label>
                  <input
                    type="number"
                    value={paymentFormAgreedAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPaymentFormAgreedAmount(val);
                      setPaymentFormDepositDue(Math.round(val * 0.3));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#0171bb]/30 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    Required Deposit Due (₱)
                  </label>
                  <input
                    type="number"
                    value={paymentFormDepositDue}
                    onChange={(e) => setPaymentFormDepositDue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 font-bold focus:ring-2 focus:ring-emerald-500/30 bg-white text-emerald-900"
                  />
                </div>
              </div>

              {/* Hold Duration */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Slot Hold Duration
                </label>
                <div className="flex items-center gap-3">
                  {[2, 4, 12, 24].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setPaymentFormDeadlineHours(hrs)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        paymentFormDeadlineHours === hrs
                          ? 'bg-[#0171bb] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {hrs} Hours {hrs === 2 && '(Standard Policy)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions Editor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Instructions & Bank Credentials (Included in Email Body)
                </label>
                <textarea
                  rows={5}
                  value={paymentFormInstructions}
                  onChange={(e) => setPaymentFormInstructions(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0171bb]/30 bg-slate-50 font-mono leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <Timer className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  Clicking <strong>"Dispatch via Resend"</strong> will lock the venue slot for {paymentFormDeadlineHours} hours, send automated instructions to <strong>{selectedReservation.email}</strong>, and provide an instant payment upload link.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsSendPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPaymentInstructionsSubmit}
                  disabled={sendingPaymentInstructions}
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingPaymentInstructions ? 'Sending Email...' : 'Dispatch via Resend'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERIFY PAYMENT PROOF & CONFIRM RESERVATION */}
      {isVerifyPaymentModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-900 text-white p-6 relative">
              <button
                onClick={() => setIsVerifyPaymentModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
                <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                  Deposit Audit & Payment Verification
                </span>
              </div>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                Verify Payment Proof
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                Ref: {selectedReservation.referenceCode} • Applicant: {selectedReservation.name}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Payment Proof Image / Reference */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Submitted Payment Reference:</span>
                  <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                    {selectedReservation.paymentReference || 'No reference string'}
                  </span>
                </div>

                {selectedReservation.paymentProofUrl ? (
                  <div>
                    <span className="font-bold text-slate-700 block mb-1.5">Uploaded Deposit Slip / Screenshot:</span>
                    <div className="rounded-xl overflow-hidden border border-slate-300 max-h-60 flex items-center justify-center bg-slate-900">
                      <img 
                        src={selectedReservation.paymentProofUrl} 
                        alt="Proof of Payment" 
                        className="w-full h-auto object-contain max-h-60"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                    <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span>Payment reference string provided. Deposit slip was physically presented or referenced via online bank.</span>
                  </div>
                )}
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cathedral Confirmation Notes & Ingress Guidelines
                </label>
                <textarea
                  rows={3}
                  value={verifyFacilityInstructions}
                  onChange={(e) => setVerifyFacilityInstructions(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/30 bg-slate-50 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleVerifyPaymentSubmit('reject')}
                  disabled={verifyingPayment}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  Reject Proof
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVerifyPaymentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVerifyPaymentSubmit('verify')}
                    disabled={verifyingPayment}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{verifyingPayment ? 'Verifying...' : 'Verify & Send Confirmation Email'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INQUIRY REVIEW MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Public Inquiry Review
              </span>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                {selectedInquiry.purpose}
              </h3>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                Ref: {selectedInquiry.referenceCode}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Applicant</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.name}</span>
                  <div className="text-slate-500">{selectedInquiry.email}</div>
                  <div className="text-slate-500">{selectedInquiry.phone}</div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Requested Date & Slot</span>
                  <span className="font-bold text-slate-900">{selectedInquiry.requestedDate}</span>
                  <div className="text-slate-500">{selectedInquiry.startTime} - {selectedInquiry.endTime}</div>
                </div>
              </div>

              {selectedInquiry.message && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  <span className="font-bold block text-[10px] uppercase text-slate-500">Applicant Notes:</span>
                  <p className="mt-1">{selectedInquiry.message}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>

                {selectedInquiry.status !== 'approved' && (
                  <button
                    onClick={() => {
                      handleApproveInquiry(selectedInquiry);
                      setSelectedInquiry(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Create Reservation</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RESERVATION DETAILS & CONTRACT PRINTER */}
      {selectedReservation && !isSendPaymentModalOpen && !isVerifyPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setSelectedReservation(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Cathedral Reservation Dossier
              </span>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                {selectedReservation.purpose}
              </h3>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                Ref: {selectedReservation.referenceCode}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Client Information</span>
                  <span className="font-bold text-slate-900">{selectedReservation.name}</span>
                  <div className="text-slate-500">{selectedReservation.email}</div>
                  <div className="text-slate-500">{selectedReservation.phone}</div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Schedule & Venue</span>
                  <span className="font-bold text-slate-900">{selectedReservation.reservedDate}</span>
                  <div className="text-slate-500">{selectedReservation.startTime} - {selectedReservation.endTime}</div>
                  <div className="text-[#0171bb] font-semibold">{facilities.find(f => f.id === selectedReservation.facilityId)?.name || selectedReservation.facilityId}</div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Agreed Financials</span>
                  <span className="font-bold text-slate-900">Total: ₱{(selectedReservation.agreedAmount || 0).toLocaleString()}</span>
                  <div className="text-emerald-700 font-semibold">Deposit: ₱{(selectedReservation.depositDue || 0).toLocaleString()}</div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold uppercase text-slate-900">{selectedReservation.status.replace('_', ' ')}</span>
                  {selectedReservation.holdExpiresAt && (
                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                      Hold: {selectedReservation.holdExpiresAt.split('T')[0]}
                    </div>
                  )}
                </div>
              </div>

              {selectedReservation.adminNotes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                  <span className="font-bold block text-[10px]">Secretariat Administrative Notes:</span>
                  <p className="mt-0.5">{selectedReservation.adminNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    showToast(`Permit & rental agreement printed for ${selectedReservation.referenceCode}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Permit / Contract</span>
                </button>

                <button
                  onClick={() => setSelectedReservation(null)}
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
