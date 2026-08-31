import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Flame, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  ArrowUpRight, 
  X, 
  Check, 
  AlertCircle, 
  Phone, 
  Mail, 
  Tag, 
  Sparkles, 
  Heart, 
  Printer, 
  Edit3, 
  Trash2,
  ChevronDown,
  Layers,
  FileCheck,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Info,
  Send,
  Video,
  ShieldCheck,
  UserCheck,
  Lock,
  Newspaper,
  Key
} from 'lucide-react';
import { 
  FacilityBooking, 
  CertificateRequest,
  MassIntention, 
  SacramentBooking, 
  INITIAL_FACILITY_BOOKINGS, 
  INITIAL_CERTIFICATE_REQUESTS,
  INITIAL_MASS_INTENTIONS, 
  INITIAL_SACRAMENTS 
} from '../../data/adminData';
import { AdminUser, UserRole, FacilityInquiry, FacilityReservation } from '../../types';
import { AdminNewsCms } from './AdminNewsCms';
import { AdminUserSettings } from './AdminUserSettings';
import { AdminFacilitiesManager } from './AdminFacilitiesManager';
import { AdminFacilityBookingsManager } from './AdminFacilityBookingsManager';
import { AdminEmailLogsViewer } from './AdminEmailLogsViewer';
import { emailWorkflowService } from '../../services/emailService';
import { authService } from '../../services/authService';
import { facilityService } from '../../services/facilityService';
import { LogOut } from 'lucide-react';

interface AdminDashboardProps {
  currentUser?: AdminUser;
  onBackToWebsite?: () => void;
  onLogout?: () => void;
}

// Normalization helpers to prevent undefined property errors from localStorage or form submissions
const normalizeFacilityBooking = (raw: any): FacilityBooking => ({
  id: raw?.id || `fb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  referenceCode: raw?.referenceCode || `PC-${Math.floor(100000 + Math.random() * 900000)}`,
  facilityId: raw?.facilityId || 'parish-center-multipurpose',
  facilityName: raw?.facilityName || 'Cathedral Function Space',
  eventName: raw?.eventName || raw?.purpose || 'Cathedral Function',
  clientName: raw?.clientName || 'Parishioner',
  clientOrganization: raw?.clientOrganization,
  clientEmail: raw?.clientEmail || 'parishioner@cubadiocese.ph',
  clientPhone: raw?.clientPhone || '+63 920 950 4222',
  eventDate: raw?.eventDate || '2025-09-20',
  timeSlot: raw?.timeSlot || '4 Hours',
  status: raw?.status === 'Pending' ? 'Pending Review' : (raw?.status || 'Pending Review'),
  pax: Number(raw?.pax || raw?.estimatedPax || 50),
  totalAmount: Number(raw?.totalAmount || 0),
  depositAmount: Number(raw?.depositAmount || raw?.depositPaid || 0),
  depositStatus: raw?.depositStatus || (raw?.depositPaid ? 'Paid' : 'Unpaid'),
  addons: Array.isArray(raw?.addons) ? raw.addons : [],
  livestreaming: Boolean(raw?.livestreaming),
  notes: raw?.notes || '',
  createdDate: raw?.createdDate || raw?.createdAt || new Date().toISOString().split('T')[0],
  paymentRequestedDate: raw?.paymentRequestedDate,
  paymentDetailsSent: Boolean(raw?.paymentDetailsSent),
});

const normalizeCertificateRequest = (raw: any): CertificateRequest => ({
  id: raw?.id || `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  referenceCode: raw?.referenceCode || `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
  documentType: raw?.documentType || 'Baptismal',
  fullName: raw?.fullName || 'Parishioner Name',
  birthday: raw?.birthday || '',
  fatherName: raw?.fatherName || '',
  motherName: raw?.motherName || '',
  sacramentDate: raw?.sacramentDate || '',
  purpose: raw?.purpose || 'Ecclesiastical Requirement',
  requestedBy: raw?.requestedBy || raw?.fullName || 'Requester',
  contactEmail: raw?.contactEmail || '',
  contactPhone: raw?.contactPhone || '+63 920 950 4222',
  status: raw?.status || 'Pending',
  createdDate: raw?.createdDate || new Date().toISOString().split('T')[0],
  feeAmount: Number(raw?.feeAmount || 200),
  feePaid: Boolean(raw?.feePaid),
  notes: raw?.notes || '',
});

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser: initialUser, onBackToWebsite, onLogout }) => {
  const activeUser = initialUser || authService.getCurrentUser() || {
    id: 'usr-staff',
    name: 'Parish Administrator',
    email: 'staff@cubadiocese.ph',
    role: 'admin' as UserRole,
    status: 'Active',
    title: 'Cathedral Administrator',
    createdDate: new Date().toISOString().split('T')[0],
  };

  const [currentUser, setCurrentUser] = useState<AdminUser>(activeUser);
  const [users, setUsers] = useState<AdminUser[]>([activeUser]);

  // Keep state in sync with prop changes
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      setUsers([initialUser]);
    }
  }, [initialUser]);

  // Main Admin Pages (Parish Services Portal, News & Blog CMS, Facilities Media, Email Audit, User Permissions)
  type AdminPage = 'services' | 'cms' | 'facilities' | 'emails' | 'permissions';
  const [adminPage, setAdminPage] = useState<AdminPage>('services');

  // Sub-tabs within Parish Services Portal
  type ServicesTab = 'facilities' | 'certificates' | 'sacraments' | 'intentions' | 'calendar';
  const [activeTab, setActiveTab] = useState<ServicesTab>('facilities');

  // Enforce contributor role access constraint: Contributor only has access to the blog cms
  useEffect(() => {
    if (currentUser.role === 'contributor' && adminPage !== 'cms') {
      setAdminPage('cms');
    }
  }, [currentUser.role, adminPage]);
  
  // Mock IDs filter helper to purge old sample/mock data
  const isMockId = (id: string, ref?: string) => {
    if (!id && !ref) return false;
    const sId = String(id || '').toLowerCase();
    const sRef = String(ref || '').toUpperCase();
    return (
      sId.startsWith('fb-') ||
      sId.startsWith('cert-') ||
      sId.startsWith('sac-') ||
      sId.startsWith('mi-') ||
      sId.startsWith('inq-') ||
      sId.startsWith('res-') ||
      sId.startsWith('mock-') ||
      sRef.includes('CUB-FAC-') ||
      sRef.includes('PC-') ||
      sRef.includes('GROTTO-') ||
      sRef.includes('NC-') ||
      sRef.includes('INT-') ||
      sRef.includes('SAC-') ||
      sRef.includes('CERT-')
    );
  };

  // Real facility inquiries and reservations from facilityService
  const [inquiries, setInquiries] = useState<FacilityInquiry[]>([]);
  const [reservations, setReservations] = useState<FacilityReservation[]>([]);

  // Data state with localStorage synchronization
  const [facilityBookings, setFacilityBookings] = useState<FacilityBooking[]>([]);

  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>(() => {
    try {
      const saved = localStorage.getItem('cathedral_certificate_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const nonMock = parsed
            .filter((p: any) => !isMockId(p?.id, p?.referenceCode))
            .map(normalizeCertificateRequest);
          return nonMock;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [massIntentions, setMassIntentions] = useState<MassIntention[]>([]);
  const [sacraments, setSacraments] = useState<SacramentBooking[]>([]);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [docTypeFilter, setDocTypeFilter] = useState('all');

  // Calendar View specific state
  const [calendarStatusFilter, setCalendarStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Completed'>('all');
  const [calendarCurrentDate, setCalendarCurrentDate] = useState<Date>(new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  // Modals state
  const [isAddFacilityModalOpen, setIsAddFacilityModalOpen] = useState(false);
  const [addFacilityInitialDate, setAddFacilityInitialDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAddCertificateModalOpen, setIsAddCertificateModalOpen] = useState(false);
  const [isAddSacramentModalOpen, setIsAddSacramentModalOpen] = useState(false);
  const [isAddIntentionModalOpen, setIsAddIntentionModalOpen] = useState(false);
  
  const [selectedBookingForView, setSelectedBookingForView] = useState<FacilityBooking | null>(null);
  const [selectedCertificateForView, setSelectedCertificateForView] = useState<CertificateRequest | null>(null);
  const [selectedSacramentForView, setSelectedSacramentForView] = useState<SacramentBooking | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real inquiries & reservations from facilityService and sync calendar
  const refreshFacilityData = async () => {
    try {
      const data = await facilityService.getInquiriesAndReservations();
      const cleanInqs = (data.inquiries || []).filter((inq: any) => !isMockId(inq.id, inq.referenceCode));
      const cleanRes = (data.reservations || []).filter((res: any) => !isMockId(res.id, res.referenceCode));
      setInquiries(cleanInqs);
      setReservations(cleanRes);

      // Convert clean reservations into facilityBookings for calendar & compatibility
      const mappedBookings: FacilityBooking[] = cleanRes.map((r) => ({
        id: r.id,
        referenceCode: r.referenceCode,
        facilityId: (r.facilityId || 'parish-center-multipurpose') as any,
        facilityName: r.facilityName,
        eventName: r.purpose || 'Cathedral Facility Reservation',
        clientName: r.name,
        clientOrganization: 'Private Client',
        clientEmail: r.email,
        clientPhone: r.phone,
        eventDate: r.reservationDate,
        timeSlot: `${r.startTime} – ${r.endTime}`,
        pax: 100,
        totalAmount: r.amount || r.agreedAmount || 0,
        depositAmount: r.depositDue || 0,
        depositStatus: (r.paymentStatus === 'verified' || (r.paymentStatus as any) === 'paid') ? 'Paid' : 'Unpaid',
        status: (r.status === 'confirmed' ? 'Confirmed' : r.status === 'completed' ? 'Completed' : 'Pending Review') as any,
        addons: [],
        livestreaming: false,
        notes: r.adminNotes || '',
        createdDate: (r.createdAt || '').split('T')[0] || new Date().toISOString().split('T')[0],
      }));

      setFacilityBookings(mappedBookings);
    } catch (err) {
      console.error('Error refreshing facility data:', err);
    }
  };

  // Listen for storage events (e.g. from Contact Page or Facility Reservation forms)
  useEffect(() => {
    // Purge mock bookings and legacy items from storage
    try {
      localStorage.removeItem('cathedral_facility_bookings');
      const inqRaw = localStorage.getItem('cathedral_facility_inquiries');
      if (inqRaw) {
        const inqs = JSON.parse(inqRaw);
        if (Array.isArray(inqs)) {
          const cleaned = inqs.filter((i: any) => !isMockId(i?.id, i?.referenceCode));
          localStorage.setItem('cathedral_facility_inquiries', JSON.stringify(cleaned));
        }
      }
      const resRaw = localStorage.getItem('cathedral_facility_reservations');
      if (resRaw) {
        const ress = JSON.parse(resRaw);
        if (Array.isArray(ress)) {
          const cleaned = ress.filter((r: any) => !isMockId(r?.id, r?.referenceCode));
          localStorage.setItem('cathedral_facility_reservations', JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      console.error(e);
    }

    refreshFacilityData();
    const unsub = facilityService.subscribeBookings(() => {
      refreshFacilityData();
    });

    const handleStorageChange = () => {
      refreshFacilityData();
      try {
        const savedCerts = localStorage.getItem('cathedral_certificate_requests');
        if (savedCerts) {
          const parsed = JSON.parse(savedCerts);
          if (Array.isArray(parsed)) {
            const nonMock = parsed
              .filter((p: any) => !isMockId(p?.id, p?.referenceCode))
              .map(normalizeCertificateRequest);
            setCertificateRequests(nonMock);
          }
        }
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      unsub();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Filtered Facility Bookings
  const filteredFacilityBookings = facilityBookings.filter(b => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = !q ||
      (b.eventName || '').toLowerCase().includes(q) || 
      (b.clientName || '').toLowerCase().includes(q) || 
      (b.referenceCode || '').toLowerCase().includes(q) ||
      (b.facilityName || '').toLowerCase().includes(q);
    const matchesFacility = facilityFilter === 'all' || b.facilityId === facilityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'Pending' ? b.status === 'Pending Review' : b.status === statusFilter);
    return matchesSearch && matchesFacility && matchesStatus;
  });

  // 2. Filtered Certificate Requests
  const filteredCertificateRequests = certificateRequests.filter(c => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = !q ||
      (c.fullName || '').toLowerCase().includes(q) ||
      (c.referenceCode || '').toLowerCase().includes(q) ||
      (c.fatherName || '').toLowerCase().includes(q) ||
      (c.motherName || '').toLowerCase().includes(q) ||
      (c.requestedBy || '').toLowerCase().includes(q) ||
      (c.purpose || '').toLowerCase().includes(q) ||
      (c.documentType || '').toLowerCase().includes(q);
    const matchesDocType = docTypeFilter === 'all' || c.documentType === docTypeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesDocType && matchesStatus;
  });

  // 3. Filtered Sacraments
  const filteredSacraments = sacraments.filter(s => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = !q ||
      (s.candidateNames || '').toLowerCase().includes(q) ||
      (s.contactPerson || '').toLowerCase().includes(q) ||
      (s.referenceCode || '').toLowerCase().includes(q) ||
      (s.sacramentType || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 4. Filtered Intentions
  const filteredIntentions = massIntentions.filter(i => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = !q ||
      (i.requestedBy || '').toLowerCase().includes(q) ||
      (Array.isArray(i.names) && i.names.some(n => (n || '').toLowerCase().includes(q))) ||
      (i.referenceCode || '').toLowerCase().includes(q) ||
      (i.intentionType || '').toLowerCase().includes(q);
    return matchesSearch;
  });

  // 5. Calendar Bookings (Filtered by Calendar Status)
  const calendarBookings = facilityBookings.filter(b => {
    if (calendarStatusFilter === 'all') return true;
    if (calendarStatusFilter === 'Pending') return b.status === 'Pending Review';
    if (calendarStatusFilter === 'Confirmed') return b.status === 'Confirmed';
    if (calendarStatusFilter === 'Completed') return b.status === 'Completed';
    return true;
  });

  // Action handlers
  const handleSendPaymentRequest = (booking: FacilityBooking) => {
    const now = new Date().toISOString().split('T')[0];
    const updated = facilityBookings.map(b => {
      if (b.id === booking.id) {
        return {
          ...b,
          status: 'Payment Requested' as const,
          paymentDetailsSent: true,
          paymentRequestedDate: now
        };
      }
      return b;
    });
    setFacilityBookings(updated);
    try {
      localStorage.setItem('cathedral_facility_bookings', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setSelectedBookingForView(prev => prev ? {
      ...prev,
      status: 'Payment Requested',
      paymentDetailsSent: true,
      paymentRequestedDate: now
    } : null);

    // Trigger automated transactional email workflow (Request #7)
    emailWorkflowService.triggerEmailWorkflow(
      'PAYMENT_INSTRUCTIONS',
      { name: booking.clientName, email: booking.clientEmail || 'parishioner@cubadiocese.ph', phone: booking.clientPhone },
      {
        referenceCode: booking.referenceCode,
        facilityName: booking.facilityName,
        eventDate: booking.eventDate,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
      }
    );

    showToast(`Payment invoice & instructions dispatched to ${booking.clientEmail || 'client'}!`);
  };

  const handleUpdateFacilityStatus = (id: string, newStatus: FacilityBooking['status']) => {
    const targetBooking = facilityBookings.find(b => b.id === id);
    const updated = facilityBookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setFacilityBookings(updated);
    try {
      localStorage.setItem('cathedral_facility_bookings', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Trigger automated emails based on new status
    if (targetBooking) {
      if (newStatus === 'Confirmed') {
        emailWorkflowService.triggerEmailWorkflow(
          'PAYMENT_CONFIRMED',
          { name: targetBooking.clientName, email: targetBooking.clientEmail || 'parishioner@cubadiocese.ph', phone: targetBooking.clientPhone },
          {
            referenceCode: targetBooking.referenceCode,
            facilityName: targetBooking.facilityName,
            eventDate: targetBooking.eventDate,
            amountPaid: targetBooking.depositAmount || targetBooking.totalAmount,
            remainingBalance: Math.max(0, targetBooking.totalAmount - (targetBooking.depositAmount || 0)),
          }
        );
      } else if (newStatus === 'Pending Review' || newStatus === 'Payment Requested') {
        emailWorkflowService.triggerEmailWorkflow(
          'RESERVATION_APPROVED',
          { name: targetBooking.clientName, email: targetBooking.clientEmail || 'parishioner@cubadiocese.ph', phone: targetBooking.clientPhone },
          {
            referenceCode: targetBooking.referenceCode,
            facilityName: targetBooking.facilityName,
            eventDate: targetBooking.eventDate,
            totalAmount: targetBooking.totalAmount,
            depositAmount: targetBooking.depositAmount,
          }
        );
      }
    }

    showToast(`Booking ${id} status updated to "${newStatus}"`);
  };

  const handleUpdateCertificateStatus = (id: string, newStatus: CertificateRequest['status']) => {
    const targetCert = certificateRequests.find(c => c.id === id);
    const updated = certificateRequests.map(c => c.id === id ? { ...c, status: newStatus } : c);
    setCertificateRequests(updated);
    try {
      localStorage.setItem('cathedral_certificate_requests', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (targetCert && newStatus === 'Ready for Pickup') {
      emailWorkflowService.triggerEmailWorkflow(
        'CERTIFICATE_READY',
        { name: targetCert.requestedBy || targetCert.fullName, email: targetCert.contactEmail || 'parishioner@cubadiocese.ph', phone: targetCert.contactPhone },
        {
          referenceCode: targetCert.referenceCode,
          documentType: targetCert.documentType,
          fullName: targetCert.fullName,
        }
      );
    }

    showToast(`Certificate request status updated to "${newStatus}"`);
  };

  const handleUpdateSacramentStatus = (id: string, newStatus: SacramentBooking['status']) => {
    setSacraments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    showToast(`Sacrament booking status updated to "${newStatus}"`);
  };

  const handleToggleChecklistItem = (sacramentId: string, itemKey: keyof SacramentBooking['checklist']) => {
    setSacraments(prev => prev.map(s => {
      if (s.id === sacramentId) {
        return {
          ...s,
          checklist: {
            ...s.checklist,
            [itemKey]: !s.checklist[itemKey]
          }
        };
      }
      return s;
    }));
    showToast('Requirement checklist updated');
  };

  // Stats (Removed Facility Collections summary tab)
  const totalActiveBookings = reservations.filter(r => r.status === 'confirmed' || (r.status as any) === 'Confirmed').length;
  const pendingCertificatesCount = certificateRequests.filter(c => c.status === 'Pending' || c.status === 'Processing').length;
  const pendingSacramentReviews = sacraments.filter(s => s.status === 'Requirements Review' || s.status === 'Canonical Interview').length;
  const todayIntentionsCount = massIntentions.length;

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = calendarCurrentDate.getFullYear();
  const currentMonth = calendarCurrentDate.getMonth();
  const monthName = calendarCurrentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const totalDays = daysInMonth(currentYear, currentMonth);
  const startingDay = firstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCalendarCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Selected date events
  const selectedDateEvents = calendarSelectedDate 
    ? calendarBookings.filter(b => b.eventDate === calendarSelectedDate)
    : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-[#0171bb] flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="bg-[#0171bb] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden p-0.5 shadow border border-blue-200/50 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Cathedral Seal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  <span>Diocese of Cubao</span>
                  <span>•</span>
                  <span>Cathedral Administration & Secretariat</span>
                </div>
                <h1 className="font-cathedral text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
                  {adminPage === 'services' && 'Parish Services & Facilities Portal'}
                  {adminPage === 'cms' && 'News & Liturgical Calendar CMS'}
                  {adminPage === 'facilities' && 'Facilities Hero Images & Photo Galleries'}
                  {adminPage === 'emails' && 'Automated Email Logs & Transactional Audit'}
                  {adminPage === 'permissions' && 'User Settings & Role Permissions'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onBackToWebsite && (
                <button
                  id="admin-back-to-website-btn"
                  onClick={onBackToWebsite}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>← Public Website</span>
                </button>
              )}

              <button
                id="admin-logout-btn"
                onClick={() => {
                  authService.logout();
                  if (onLogout) {
                    onLogout();
                  } else if (onBackToWebsite) {
                    onBackToWebsite();
                  } else {
                    window.location.href = '/admin/login';
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold border border-rose-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sign out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
              
              {/* Authenticated Staff Badge */}
              <div className="flex items-center gap-2.5 bg-[#015f9e] px-3 py-1.5 rounded-xl border border-blue-300/30 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${currentUser.role === 'admin' ? 'bg-emerald-400' : 'bg-purple-400'} animate-pulse shrink-0`} />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-white leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-blue-200 truncate max-w-[150px]">{currentUser.email}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  currentUser.role === 'admin' ? 'bg-blue-900 text-blue-100' : 'bg-purple-700 text-purple-100'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Navigation Bar - Displays Page Names for User Selection */}
          <div className="mt-6 pt-4 border-t border-blue-400/30">
            <nav className="flex flex-wrap items-center gap-2" aria-label="Admin Page Navigation">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mr-2 hidden sm:inline">
                Admin Pages:
              </span>

              {/* 1. Parish Services Portal */}
              <button
                id="nav-parish-services-portal"
                onClick={() => {
                  if (currentUser.role === 'contributor') {
                    showToast('Parish Services Portal requires Administrator access.');
                    return;
                  }
                  setAdminPage('services');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminPage === 'services'
                    ? 'bg-white text-[#0171bb] shadow-md font-extrabold ring-2 ring-white/30'
                    : currentUser.role === 'contributor'
                    ? 'text-blue-200/60 hover:text-white hover:bg-white/10 opacity-60'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Parish Services Portal</span>
                {currentUser.role === 'contributor' ? (
                  <Lock className="w-3 h-3 text-amber-300 ml-0.5" />
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#0171bb] font-bold">
                    {reservations.length + inquiries.length + certificateRequests.length + sacraments.length + massIntentions.length}
                  </span>
                )}
              </button>

              {/* 2. News & Liturgical Calendar CMS */}
              <button
                id="nav-news-blog-cms"
                onClick={() => setAdminPage('cms')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminPage === 'cms'
                    ? 'bg-white text-[#0171bb] shadow-md font-extrabold ring-2 ring-white/30'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>News & Liturgical Calendar CMS</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  CMS
                </span>
              </button>

              {/* 3. Facilities Photos & Galleries Manager */}
              <button
                id="nav-facilities-manager"
                onClick={() => {
                  if (currentUser.role === 'contributor') {
                    showToast('Facilities Media Manager requires Administrator access.');
                    return;
                  }
                  setAdminPage('facilities');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminPage === 'facilities'
                    ? 'bg-white text-[#0171bb] shadow-md font-extrabold ring-2 ring-white/30'
                    : currentUser.role === 'contributor'
                    ? 'text-blue-200/60 hover:text-white hover:bg-white/10 opacity-60'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Facilities Photos & Sizing</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-bold">
                  Photo CMS
                </span>
              </button>

              {/* 4. Automated Transactional Emails */}
              <button
                id="nav-email-logs"
                onClick={() => {
                  if (currentUser.role === 'contributor') {
                    showToast('Automated Email Audit requires Administrator access.');
                    return;
                  }
                  setAdminPage('emails');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminPage === 'emails'
                    ? 'bg-white text-[#0171bb] shadow-md font-extrabold ring-2 ring-white/30'
                    : currentUser.role === 'contributor'
                    ? 'text-blue-200/60 hover:text-white hover:bg-white/10 opacity-60'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Automated Email Logs</span>
              </button>

              {/* 5. User Permissions */}
              <button
                id="nav-user-permissions"
                onClick={() => {
                  if (currentUser.role === 'contributor') {
                    showToast('User Settings & Permissions requires Administrator access.');
                    return;
                  }
                  setAdminPage('permissions');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminPage === 'permissions'
                    ? 'bg-white text-[#0171bb] shadow-md font-extrabold ring-2 ring-white/30'
                    : currentUser.role === 'contributor'
                    ? 'text-blue-200/60 hover:text-white hover:bg-white/10 opacity-60'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>User Permissions</span>
                {currentUser.role === 'contributor' ? (
                  <Lock className="w-3 h-3 text-amber-300 ml-0.5" />
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#0171bb] font-bold">
                    {users.length} Users
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Quick Metrics Bar (Visible when Parish Services Portal is active) */}
          {adminPage === 'services' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-blue-400/20">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
                <span className="text-[11px] text-blue-100 block">Active Venue Bookings</span>
                <span className="text-xl font-bold text-white mt-0.5 block">{totalActiveBookings} Confirmed</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
                <span className="text-[11px] text-blue-100 block">Certificate Requests</span>
                <span className="text-xl font-bold text-amber-300 mt-0.5 block">{pendingCertificatesCount} In Queue</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
                <span className="text-[11px] text-blue-100 block">Pending Sacraments</span>
                <span className="text-xl font-bold text-white mt-0.5 block">{pendingSacramentReviews} In Review</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
                <span className="text-[11px] text-blue-100 block">Daily Mass Intentions</span>
                <span className="text-xl font-bold text-white mt-0.5 block">{todayIntentionsCount} Queued</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Contributor Mode Notice Banner */}
        {currentUser.role === 'contributor' && adminPage === 'cms' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-purple-950">
                Contributor Role Active: News & Blog CMS Portal Access
              </p>
              <p className="text-purple-700 text-[11px]">
                You have permissions to create, draft, edit, and publish parish news, pastoral letters, and announcements. Church bookings and records are restricted to administrator accounts.
              </p>
            </div>
          </div>
        )}

        {/* 1. PARISH SERVICES PORTAL PAGE */}
        {adminPage === 'services' && (
          <div className="space-y-6">
            {/* Services Sub-Navigation Tabs & Primary Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. Cathedral Facilities */}
                <button
                  id="tab-cathedral-facilities"
                  onClick={() => { setActiveTab('facilities'); setStatusFilter('all'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'facilities'
                      ? 'bg-[#0171bb] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Cathedral Facilities ({reservations.length + inquiries.length})</span>
                </button>

                {/* 2. Certificate Request */}
                <button
                  id="tab-certificate-requests"
                  onClick={() => { setActiveTab('certificates'); setStatusFilter('all'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'certificates'
                      ? 'bg-[#0171bb] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Certificate Request ({certificateRequests.length})</span>
                </button>

                {/* 3. Sacraments Registry */}
                <button
                  id="tab-sacraments-registry"
                  onClick={() => { setActiveTab('sacraments'); setStatusFilter('all'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'sacraments'
                      ? 'bg-[#0171bb] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Sacraments Registry ({sacraments.length})</span>
                </button>

                {/* 4. Mass Intentions */}
                <button
                  id="tab-mass-intentions"
                  onClick={() => { setActiveTab('intentions'); setStatusFilter('all'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'intentions'
                      ? 'bg-[#0171bb] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Mass Intentions ({massIntentions.length})</span>
                </button>

                {/* 5. Booking Calendar View */}
                <button
                  id="tab-booking-calendar"
                  onClick={() => { setActiveTab('calendar'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'calendar'
                      ? 'bg-[#0171bb] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Booking Calendar</span>
                </button>
              </div>

          <div className="flex items-center gap-2">
            {activeTab === 'facilities' && (
              <button
                onClick={() => {
                  setAddFacilityInitialDate(calendarSelectedDate || new Date().toISOString().split('T')[0]);
                  setIsAddFacilityModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Facility Booking</span>
              </button>
            )}

            {activeTab === 'certificates' && (
              <button
                onClick={() => setIsAddCertificateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Certificate Request</span>
              </button>
            )}

            {activeTab === 'sacraments' && (
              <button
                onClick={() => setIsAddSacramentModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Sacrament</span>
              </button>
            )}

            {activeTab === 'intentions' && (
              <button
                onClick={() => setIsAddIntentionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mass Intention</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar (Active for Table tabs: facilities, certificates, sacraments, intentions) */}
        {activeTab !== 'calendar' && activeTab !== 'cms' && activeTab !== 'users' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activeTab === 'certificates' 
                    ? "Search name, parents, document type, ref..." 
                    : "Search by client, event name, or reference code..."
                }
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {activeTab === 'facilities' && (
                <select
                  value={facilityFilter}
                  onChange={(e) => setFacilityFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-white"
                >
                  <option value="all">All Venues & Halls</option>
                  <option value="parish-center-multipurpose">Multi-Purpose Hall (118 sqm, 144 pax)</option>
                  <option value="parish-center-big">Big Function Room (30 sqm, 45 pax)</option>
                  <option value="parish-center-small">Small Function Room (23 sqm, 35 pax)</option>
                  <option value="parish-center-grand">Grand Hall (350 pax)</option>
                  <option value="parish-center-st-joseph">St. Joseph Hall (120 pax)</option>
                  <option value="grotto-ascension">Chapel of Ascension (83 sqm)</option>
                  <option value="grotto-assumption">Chapel of Assumption (64 sqm)</option>
                  <option value="grotto">The Cathedral Grottos</option>
                  <option value="nativity-chapel">Nativity Chapel (235 sqm)</option>
                </select>
              )}

              {activeTab === 'certificates' && (
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-white"
                >
                  <option value="all">All Documents</option>
                  <option value="Baptismal">Baptismal Certificate</option>
                  <option value="Confirmation">Confirmation Certificate</option>
                  <option value="First Communion">First Communion Certificate</option>
                  <option value="Wedding">Wedding / Marriage Certificate</option>
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 bg-white"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'certificates' ? (
                  <>
                    <option value="Pending">Pending Verification</option>
                    <option value="Processing">Processing Archive Search</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Released / Completed</option>
                  </>
                ) : (
                  <>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending Review / Incomplete</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* 1. FACILITIES MANAGEMENT TAB */}
        {activeTab === 'facilities' && (
          <div className="space-y-4">
            <AdminFacilityBookingsManager showToast={showToast} />
          </div>
        )}

        {/* 2. CERTIFICATE REQUEST TAB (Requested new category) */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-cathedral text-lg font-bold text-slate-900">
                    Ecclesiastical Certificate Requests Registry
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage online and office requests for Baptismal, Confirmation, First Communion, and Wedding Certificates.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                  Showing {filteredCertificateRequests.length} of {certificateRequests.length} Requests
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Reference & Date</th>
                      <th className="p-3.5">Document Type</th>
                      <th className="p-3.5">Subject / Full Name</th>
                      <th className="p-3.5">Parents / Lineage</th>
                      <th className="p-3.5">Sacrament Date & Purpose</th>
                      <th className="p-3.5">Requested By & Phone</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCertificateRequests.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 font-mono text-[11px]">{cert.referenceCode}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#0171bb]" />
                            <span>{cert.createdDate}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            cert.documentType === 'Baptismal'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : cert.documentType === 'Confirmation'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : cert.documentType === 'Wedding'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {cert.documentType} Cert
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{cert.fullName}</div>
                          <div className="text-slate-500 text-[11px]">
                            DOB: {cert.birthday || 'Not specified'}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-800 text-[11px]">
                            <span className="font-semibold text-slate-500">F:</span> {cert.fatherName || '—'}
                          </div>
                          <div className="text-slate-800 text-[11px]">
                            <span className="font-semibold text-slate-500">M:</span> {cert.motherName || '—'}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">
                            Date: {cert.sacramentDate || '—'}
                          </div>
                          <div className="text-slate-500 text-[10px] max-w-xs truncate" title={cert.purpose}>
                            {cert.purpose}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{cert.requestedBy}</div>
                          <div className="text-slate-500 text-[11px]">{cert.contactPhone}</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            cert.status === 'Ready for Pickup'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cert.status === 'Processing'
                              ? 'bg-amber-100 text-amber-800'
                              : cert.status === 'Completed'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              cert.status === 'Ready for Pickup' ? 'bg-emerald-600' :
                              cert.status === 'Processing' ? 'bg-amber-600' : 'bg-slate-400'
                            }`} />
                            {cert.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCertificateForView(cert)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0171bb]/10 hover:bg-[#0171bb]/20 text-[#0171bb] font-bold text-[11px] transition-colors border border-[#0171bb]/20 cursor-pointer"
                          >
                            See Request
                          </button>
                          {cert.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateCertificateStatus(cert.id, 'Processing')}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors"
                            >
                              Search Archive
                            </button>
                          )}
                          {cert.status === 'Processing' && (
                            <button
                              onClick={() => handleUpdateCertificateStatus(cert.id, 'Ready for Pickup')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                            >
                              Ready
                            </button>
                          )}
                          {cert.status === 'Ready for Pickup' && (
                            <button
                              onClick={() => handleUpdateCertificateStatus(cert.id, 'Completed')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0171bb] hover:bg-[#015f9e] text-white font-semibold text-[11px] transition-colors"
                            >
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. SACRAMENTS REGISTRY TAB */}
        {activeTab === 'sacraments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-cathedral text-lg font-bold text-slate-900">
                    Sacraments & Canonical Registry Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review doc checklists, assign presiding priests, and approve baptism & wedding registrations.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Showing {filteredSacraments.length} Sacramental Applications
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Reference & Date</th>
                      <th className="p-3.5">Sacrament Type</th>
                      <th className="p-3.5">Candidate / Couple</th>
                      <th className="p-3.5">Officiating Priest</th>
                      <th className="p-3.5">Document Checklist</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSacraments.map((s) => {
                      const totalDocs = s.checklist ? Object.keys(s.checklist).length : 0;
                      const verifiedDocs = s.checklist ? Object.values(s.checklist).filter(Boolean).length : 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 font-mono text-[11px]">{s.referenceCode}</div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-[#0171bb]" />
                              <span>{s.scheduledDate}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{s.scheduledTime}</div>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-[#0171bb] block">{s.sacramentType}</span>
                            <span className="text-[10px] text-slate-500">
                              Fee: {s.feeAmount > 0 ? `₱${s.feeAmount.toLocaleString()}` : 'Free / Pastoral'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{s.candidateNames}</div>
                            <div className="text-slate-500 text-[11px]">Contact: {s.contactPerson} ({s.contactPhone})</div>
                          </td>

                          <td className="p-3.5">
                            <span className="text-slate-800 font-medium">{s.officiatingPriest || 'To be assigned'}</span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-[#0171bb] h-full rounded-full" 
                                  style={{ width: `${(verifiedDocs / totalDocs) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600">
                                {verifiedDocs}/{totalDocs} Verified
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              s.status === 'Confirmed & Scheduled'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status === 'Canonical Interview'
                                ? 'bg-amber-100 text-amber-800'
                                : s.status === 'Completed'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedSacramentForView(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                            >
                              Docs & Checklist
                            </button>
                            {s.status !== 'Confirmed & Scheduled' && (
                              <button
                                onClick={() => handleUpdateSacramentStatus(s.id, 'Confirmed & Scheduled')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                              >
                                Confirm
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. MASS INTENTIONS TAB */}
        {activeTab === 'intentions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-cathedral text-lg font-bold text-slate-900">
                    Daily & Sunday Mass Intentions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage Thanksgiving, Eternal Repose, and Healing mass petitions submitted by parishioners.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Printing liturgical intention sheet for celebrant priest...')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Celebrant Intention Sheet</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredIntentions.map((i) => (
                  <div key={i.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          i.intentionType === 'Thanksgiving'
                            ? 'bg-amber-100 text-amber-900'
                            : i.intentionType === 'Eternal Repose'
                            ? 'bg-purple-100 text-purple-900'
                            : i.intentionType === 'Healing & Recovery'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {i.intentionType}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 font-mono">{i.referenceCode}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-[#0171bb]">{i.massDate} ({i.massTime})</span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm">
                        {Array.isArray(i.names) ? i.names.join(' • ') : (i.names || '')}
                      </div>

                      <div className="text-xs text-slate-500">
                        Requested by: <span className="font-semibold text-slate-700">{i.requestedBy}</span> ({i.contactNumber}) • Stipend: ₱{i.stipendAmount} ({i.paymentStatus})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {i.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. BOOKING CALENDAR VIEW (Requested view with Pending, Confirmed, Completed) */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            
            {/* Calendar Controls & Status Filter Pills */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-cathedral font-bold text-slate-900 px-3 text-sm min-w-[140px] text-center">
                    {monthName}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Filter Pills: All, Pending, Confirmed, Completed */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Status Filter:</span>
                {(['all', 'Pending', 'Confirmed', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setCalendarStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      calendarStatusFilter === st
                        ? st === 'Pending'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : st === 'Confirmed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : st === 'Completed'
                          ? 'bg-[#0171bb] text-white shadow-sm'
                          : 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'Pending' && <span className="w-2 h-2 rounded-full bg-amber-200" />}
                    {st === 'Confirmed' && <span className="w-2 h-2 rounded-full bg-emerald-200" />}
                    {st === 'Completed' && <span className="w-2 h-2 rounded-full bg-blue-200" />}
                    <span>{st === 'all' ? 'All Items' : st}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Grid & Side Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Calendar Grid */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 uppercase tracking-wider text-[10px] pb-2 border-b border-slate-100">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells before month starts */}
                  {Array.from({ length: startingDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 rounded-xl bg-slate-50/50 border border-transparent p-1.5 opacity-30" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayEvents = calendarBookings.filter(b => b.eventDate === dateString);
                    const isSelected = calendarSelectedDate === dateString;

                    return (
                      <div
                        key={dayNum}
                        onClick={() => setCalendarSelectedDate(dateString)}
                        className={`h-24 rounded-xl p-1.5 transition-all cursor-pointer border flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'bg-blue-50/80 border-[#0171bb] ring-2 ring-[#0171bb]/20 shadow-sm'
                            : dayEvents.length > 0
                            ? 'bg-white border-slate-300 hover:border-[#0171bb]'
                            : 'bg-slate-50/60 border-slate-100 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#0171bb]' : 'text-slate-800'}`}>
                            {dayNum}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Events Chips in cell */}
                        <div className="space-y-1 overflow-hidden mt-1">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate border ${
                                ev.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : ev.status === 'Pending Review'
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-blue-50 text-blue-900 border-blue-200'
                              }`}
                              title={`${ev.eventName} (${ev.facilityName})`}
                            >
                              {ev.eventName}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[8px] font-bold text-slate-400 pl-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side Panel: Events for Selected Date */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Schedule Details
                      </span>
                      <h3 className="font-cathedral font-bold text-slate-900 text-base">
                        {calendarSelectedDate || 'No date selected'}
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      {selectedDateEvents.length} Item(s)
                    </span>
                  </div>

                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">No bookings scheduled on this date.</p>
                      <p className="text-[11px] text-slate-400">Select another date with registered events or log a new booking.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {selectedDateEvents.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0171bb] transition-all space-y-2 bg-slate-50/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{b.eventName}</div>
                              <span className="text-[10px] text-slate-500 font-mono">{b.referenceCode}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'Pending Review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-900'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#0171bb]" />
                              <span className="font-medium text-slate-800">{b.facilityName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.timeSlot}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.pax} Expected Pax • Client: {b.clientName}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">₱{b.totalAmount.toLocaleString()}</span>
                            <button
                              onClick={() => setSelectedBookingForView(b)}
                              className="px-2.5 py-1 rounded bg-[#0171bb] hover:bg-[#015f9e] text-white text-[10px] font-bold transition-colors"
                            >
                              View Dossier
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => {
                      setAddFacilityInitialDate(calendarSelectedDate || new Date().toISOString().split('T')[0]);
                      setIsAddFacilityModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book Venue on This Date</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        </div>
        )}

        {/* 2. NEWS & BLOG CMS PAGE */}
        {adminPage === 'cms' && (
          <div className="space-y-4">
            <AdminNewsCms userRole={currentUser.role} />
          </div>
        )}

        {/* 3. FACILITIES PHOTOS & MEDIA CMS */}
        {adminPage === 'facilities' && (
          <div className="space-y-4">
            <AdminFacilitiesManager showToast={showToast} />
          </div>
        )}

        {/* 4. AUTOMATED EMAIL LOGS & TRANSACTIONAL AUDIT */}
        {adminPage === 'emails' && (
          <div className="space-y-4">
            <AdminEmailLogsViewer showToast={showToast} />
          </div>
        )}

        {/* 5. USER PERMISSIONS PAGE */}
        {adminPage === 'permissions' && (
          <div className="space-y-4">
            {currentUser.role === 'admin' ? (
              <AdminUserSettings
                users={users}
                currentUserId={currentUser.id}
                onSelectUser={setCurrentUser}
                onUpdateUsers={setUsers}
                showToast={showToast}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-cathedral text-xl font-bold text-slate-900">Administrator Access Required</h3>
                <p className="text-xs text-slate-600">
                  User permissions and staff access roles can only be configured by full Cathedral Administrator accounts.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL 1: VIEW/EDIT FACILITY BOOKING DETAILS */}
      {selectedBookingForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setSelectedBookingForView(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Facility Booking Dossier
              </span>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                {selectedBookingForView.eventName}
              </h3>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                Ref: {selectedBookingForView.referenceCode}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Venue Space</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedBookingForView.facilityName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-bold text-slate-900">{selectedBookingForView.eventDate}</span>
                  <div className="text-slate-500">{selectedBookingForView.timeSlot}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Client Contact</span>
                  <span className="font-semibold text-slate-900">{selectedBookingForView.clientName}</span>
                  <div className="text-slate-500">{selectedBookingForView.clientPhone} • {selectedBookingForView.clientEmail}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Financial Summary</span>
                  <span className="font-bold text-slate-900">Total: ₱{(selectedBookingForView.totalAmount || 0).toLocaleString()}</span>
                  <div className="text-emerald-700 font-semibold">Deposit: ₱{(selectedBookingForView.depositAmount || 0).toLocaleString()} ({selectedBookingForView.depositStatus || 'Unpaid'})</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Included Add-ons & Equipment:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedBookingForView.addons || []).map((add, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0171bb] font-semibold text-[11px] border border-blue-200">
                      ✓ {add}
                    </span>
                  ))}
                  {selectedBookingForView.livestreaming && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-semibold text-[11px] border border-amber-300">
                      ✓ Parish Media Livestreaming
                    </span>
                  )}
                </div>
              </div>

              {selectedBookingForView.status === 'Payment Requested' && (
                <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-950 flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px] text-indigo-900">Payment Request Dispatched</span>
                    <p className="mt-0.5 text-[11px] text-indigo-800 leading-relaxed">
                      Official payment details & breakdown were emailed to <strong>{selectedBookingForView.clientEmail}</strong>. Once payment proof is received or verified at the Secretariat, click <strong>"Confirm"</strong> to finalize booking.
                    </p>
                  </div>
                </div>
              )}

              {selectedBookingForView.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                  <span className="font-bold block text-[11px]">Special Secretariat Notes:</span>
                  <p className="mt-0.5">{selectedBookingForView.notes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    showToast(`Rental contract and venue reservation permit printed for ${selectedBookingForView.referenceCode}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Rental Contract</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Step 1: Send Payment Request */}
                  {selectedBookingForView.status === 'Pending Review' && (
                    <button
                      onClick={() => handleSendPaymentRequest(selectedBookingForView)}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send Payment Request</span>
                    </button>
                  )}

                  {/* Step 2: Confirm after payment requested */}
                  {selectedBookingForView.status === 'Payment Requested' && (
                    <button
                      onClick={() => {
                        const updated = facilityBookings.map(b => b.id === selectedBookingForView.id ? {
                          ...b,
                          status: 'Confirmed' as const,
                          depositStatus: 'Paid'
                        } : b);
                        setFacilityBookings(updated);
                        try {
                          localStorage.setItem('cathedral_facility_bookings', JSON.stringify(updated));
                        } catch (e) { console.error(e); }
                        setSelectedBookingForView(prev => prev ? { ...prev, status: 'Confirmed', depositStatus: 'Paid' } : null);
                        showToast(`Booking ${selectedBookingForView.referenceCode} confirmed! Deposit verified.`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedBookingForView(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW/PROCESS CERTIFICATE REQUEST DETAILS */}
      {selectedCertificateForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setSelectedCertificateForView(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Certificate Request Details
              </span>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                {selectedCertificateForView.documentType} Certificate
              </h3>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                Ref: {selectedCertificateForView.referenceCode} • Requested on {selectedCertificateForView.createdDate}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Subject Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedCertificateForView.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{selectedCertificateForView.birthday || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Father's Name</span>
                  <span className="font-semibold text-slate-800">{selectedCertificateForView.fatherName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Mother's Maiden Name</span>
                  <span className="font-semibold text-slate-800">{selectedCertificateForView.motherName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Sacrament Date</span>
                  <span className="font-semibold text-slate-800">{selectedCertificateForView.sacramentDate || '—'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Purpose of Request:</span>
                <p className="p-3 bg-blue-50 rounded-xl text-slate-800 border border-blue-200">
                  {selectedCertificateForView.purpose}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Claimant / Requester</span>
                  <span className="font-bold text-slate-900">{selectedCertificateForView.requestedBy}</span>
                  <div className="text-[11px] text-slate-500">{selectedCertificateForView.contactPhone} • {selectedCertificateForView.contactEmail}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  selectedCertificateForView.status === 'Ready for Pickup'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedCertificateForView.status === 'Processing'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  {selectedCertificateForView.status}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    showToast(`Certificate Release Claim Slip printed for ${selectedCertificateForView.referenceCode}`);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Release Slip</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {selectedCertificateForView.status === 'Pending' && (
                    <button
                      onClick={() => {
                        handleUpdateCertificateStatus(selectedCertificateForView.id, 'Ready for Pickup');
                        setSelectedCertificateForView(prev => prev ? { ...prev, status: 'Ready for Pickup' } : null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCertificateForView(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SACRAMENT CHECKLIST & VERIFICATION */}
      {selectedSacramentForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setSelectedSacramentForView(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Canonical Document Checklist
              </span>
              <h3 className="font-cathedral text-xl font-bold text-white mt-1">
                {selectedSacramentForView.candidateNames}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {selectedSacramentForView.sacramentType} • {selectedSacramentForView.scheduledDate}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Required Canonical Documents (Click to Verify):
                </span>

                {[
                  { key: 'birthCertificate' as const, label: 'PSA Certified Birth Certificate' },
                  { key: 'baptismalCertWithAnnotation' as const, label: 'Baptismal Certificate (Annotated: "For Marriage / Parish Record")' },
                  { key: 'preCanaSeminar' as const, label: 'Pre-Cana / Pre-Baptism Seminar Certificate' },
                  { key: 'canonicalInterview' as const, label: 'Canonical Interview with Priest' },
                  { key: 'marriageLicenseOrCert' as const, label: 'Civil Marriage License or PSA Marriage Certificate' },
                ].map((item) => {
                  const isChecked = Boolean(selectedSacramentForView.checklist && selectedSacramentForView.checklist[item.key]);
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        handleToggleChecklistItem(selectedSacramentForView.id, item.key);
                        setSelectedSacramentForView(prev => prev ? ({
                          ...prev,
                          checklist: {
                            ...(prev.checklist || {}),
                            [item.key]: !((prev.checklist || {})[item.key])
                          }
                        }) : null);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isChecked
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedSacramentForView.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  <span className="font-bold block text-[11px]">Notes:</span>
                  <p>{selectedSacramentForView.notes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedSacramentForView(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD NEW FACILITY RESERVATION */}
      {isAddFacilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setIsAddFacilityModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-cathedral text-xl font-bold text-white">
                New Cathedral Facility Booking
              </h3>
              <p className="text-xs text-blue-100">
                Log a space reservation for Parish Center, The Cathedral Grottos, or Nativity Chapel.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newBooking: FacilityBooking = {
                  id: `fb-${Date.now()}`,
                  referenceCode: `CUB-FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                  facilityId: (form.elements.namedItem('facilityId') as HTMLSelectElement).value as any,
                  facilityName: (form.elements.namedItem('facilityName') as HTMLInputElement).value,
                  eventName: (form.elements.namedItem('eventName') as HTMLInputElement).value,
                  clientName: (form.elements.namedItem('clientName') as HTMLInputElement).value,
                  clientEmail: (form.elements.namedItem('clientEmail') as HTMLInputElement).value,
                  clientPhone: (form.elements.namedItem('clientPhone') as HTMLInputElement).value,
                  eventDate: (form.elements.namedItem('eventDate') as HTMLInputElement).value,
                  timeSlot: (form.elements.namedItem('timeSlot') as HTMLInputElement).value,
                  pax: Number((form.elements.namedItem('pax') as HTMLInputElement).value) || 100,
                  totalAmount: Number((form.elements.namedItem('totalAmount') as HTMLInputElement).value) || 15000,
                  depositAmount: Number((form.elements.namedItem('depositAmount') as HTMLInputElement).value) || 5000,
                  depositStatus: 'Paid',
                  status: 'Confirmed',
                  addons: ['Full Air Conditioning', 'Standard Sound System'],
                  notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
                  createdDate: new Date().toISOString().split('T')[0],
                };

                const updated = [newBooking, ...facilityBookings];
                setFacilityBookings(updated);
                try {
                  localStorage.setItem('cathedral_facility_bookings', JSON.stringify(updated));
                } catch (err) {
                  console.error(err);
                }
                setIsAddFacilityModalOpen(false);
                showToast(`New facility booking created with Ref: ${newBooking.referenceCode}`);
              }}
              className="p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Select Facility Venue Space *
                </label>
                <select
                  name="facilityId"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 bg-white text-xs"
                  onChange={(e) => {
                    const nameMap: Record<string, string> = {
                      'parish-center-multipurpose': 'Parish Center - Multi-Purpose Hall (118 sqm, 144 pax)',
                      'parish-center-big': 'Parish Center - Big Function Room (30 sqm, 45 pax)',
                      'parish-center-small': 'Parish Center - Small Function Room (23 sqm, 35 pax)',
                      'grotto-ascension': 'The Cathedral Grottos - Chapel of the Ascension (83 sqm)',
                      'grotto-assumption': 'The Cathedral Grottos - Chapel of the Assumption (64 sqm)',
                      'nativity-chapel': 'Nativity Chapel (235 sqm, 182–200 pax)'
                    };
                    const nameInput = document.getElementById('new-booking-facility-name') as HTMLInputElement;
                    if (nameInput) nameInput.value = nameMap[e.target.value] || 'Parish Space';
                  }}
                >
                  <option value="parish-center-multipurpose">Parish Center - Multi-Purpose Hall (118 sqm, 144 pax)</option>
                  <option value="parish-center-big">Parish Center - Big Function Room (30 sqm, 45 pax)</option>
                  <option value="parish-center-small">Parish Center - Small Function Room (23 sqm, 35 pax)</option>
                  <option value="grotto-ascension">The Cathedral Grottos - Chapel of the Ascension (83 sqm, ₱12,000/day)</option>
                  <option value="grotto-assumption">The Cathedral Grottos - Chapel of the Assumption (64 sqm, ₱10,000/day)</option>
                  <option value="nativity-chapel">Nativity Chapel (235 sqm, 182–200 pax)</option>
                </select>
                <input type="hidden" id="new-booking-facility-name" name="facilityName" value="Parish Center - Multi-Purpose Hall (118 sqm, 144 pax)" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Event Name / Title *
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    required
                    placeholder="e.g. Parish Youth Leadership Seminar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Client / Organizer Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    required
                    placeholder="e.g. Maria Santos"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    required
                    placeholder="0917-xxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    placeholder="client@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    key={addFacilityInitialDate}
                    defaultValue={addFacilityInitialDate}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Time Slot *
                  </label>
                  <input
                    type="text"
                    name="timeSlot"
                    defaultValue="1:00 PM – 5:00 PM (4 Hours)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Expected Pax
                  </label>
                  <input
                    type="number"
                    name="pax"
                    defaultValue={50}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Total Amount (₱)
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    defaultValue={10000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Deposit Collected (₱)
                  </label>
                  <input
                    type="number"
                    name="depositAmount"
                    defaultValue={3000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Special Instructions
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Sound system check 30 minutes before start"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFacilityModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold shadow-md"
                >
                  Confirm & Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD NEW CERTIFICATE REQUEST (Manual Admin Entry) */}
      {isAddCertificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setIsAddCertificateModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-cathedral text-xl font-bold text-white">
                Log New Certificate Request
              </h3>
              <p className="text-xs text-blue-100">
                Enter details for a walk-in or phone certificate application.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const docType = (form.elements.namedItem('documentType') as HTMLSelectElement).value as any;
                const prefixMap: Record<string, string> = {
                  'Baptismal': 'BAP',
                  'Confirmation': 'CNF',
                  'First Communion': 'COM',
                  'Wedding': 'WED',
                };
                const newCert: CertificateRequest = {
                  id: `cert-${Date.now()}`,
                  referenceCode: `CERT-${prefixMap[docType] || 'GEN'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                  documentType: docType,
                  fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
                  birthday: (form.elements.namedItem('birthday') as HTMLInputElement).value,
                  fatherName: (form.elements.namedItem('fatherName') as HTMLInputElement).value,
                  motherName: (form.elements.namedItem('motherName') as HTMLInputElement).value,
                  sacramentDate: (form.elements.namedItem('sacramentDate') as HTMLInputElement).value,
                  purpose: (form.elements.namedItem('purpose') as HTMLInputElement).value,
                  requestedBy: (form.elements.namedItem('requestedBy') as HTMLInputElement).value,
                  contactEmail: (form.elements.namedItem('contactEmail') as HTMLInputElement).value,
                  contactPhone: (form.elements.namedItem('contactPhone') as HTMLInputElement).value,
                  status: 'Pending',
                  createdDate: new Date().toISOString().split('T')[0],
                  feeAmount: 200,
                  feePaid: true,
                };

                const updated = [newCert, ...certificateRequests];
                setCertificateRequests(updated);
                try {
                  localStorage.setItem('cathedral_certificate_requests', JSON.stringify(updated));
                } catch (err) {
                  console.error(err);
                }
                setIsAddCertificateModalOpen(false);
                showToast(`Certificate request created with Ref: ${newCert.referenceCode}`);
              }}
              className="p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Requested Document *
                </label>
                <select
                  name="documentType"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 bg-white text-xs"
                >
                  <option value="Baptismal">Baptismal Certificate</option>
                  <option value="Confirmation">Confirmation Certificate</option>
                  <option value="First Communion">First Holy Communion Certificate</option>
                  <option value="Wedding">Wedding / Marriage Certificate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Full Name of Subject *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Juan Carlos Dela Cruz"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Name of Father
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="Father's full name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Name of Mother (Maiden)
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    placeholder="Mother's maiden name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Date of Sacrament (approx.)
                  </label>
                  <input
                    type="text"
                    name="sacramentDate"
                    placeholder="e.g. October 2018"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Purpose of Request *
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    required
                    placeholder="e.g. School Requirement, Marriage"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Requested By *
                  </label>
                  <input
                    type="text"
                    name="requestedBy"
                    required
                    placeholder="Requester name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    required
                    placeholder="0917-xxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="requester@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCertificateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold shadow-md"
                >
                  Save Certificate Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD MASS INTENTION */}
      {isAddIntentionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setIsAddIntentionModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-cathedral text-xl font-bold text-white">
                Add Mass Intention
              </h3>
              <p className="text-xs text-blue-100">
                Log a daily or Sunday Mass offering.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newIntention: MassIntention = {
                  id: `mi-${Date.now()}`,
                  referenceCode: `INT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  intentionType: (form.elements.namedItem('intentionType') as HTMLSelectElement).value as any,
                  names: [(form.elements.namedItem('names') as HTMLInputElement).value],
                  requestedBy: (form.elements.namedItem('requestedBy') as HTMLInputElement).value,
                  contactNumber: (form.elements.namedItem('contactNumber') as HTMLInputElement).value,
                  massDate: (form.elements.namedItem('massDate') as HTMLInputElement).value,
                  massTime: (form.elements.namedItem('massTime') as HTMLInputElement).value,
                  stipendAmount: Number((form.elements.namedItem('stipendAmount') as HTMLInputElement).value) || 500,
                  paymentStatus: 'Paid',
                  status: 'Approved',
                  createdDate: new Date().toISOString().split('T')[0],
                };

                setMassIntentions([newIntention, ...massIntentions]);
                setIsAddIntentionModalOpen(false);
                showToast(`Mass Intention logged with Ref: ${newIntention.referenceCode}`);
              }}
              className="p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Intention Category *
                </label>
                <select
                  name="intentionType"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 bg-white text-xs"
                >
                  <option value="Thanksgiving">Thanksgiving / Birthday / Anniversary</option>
                  <option value="Eternal Repose">Eternal Repose of the Soul (+)</option>
                  <option value="Healing & Recovery">Healing & Speedy Recovery</option>
                  <option value="Special Intention">Special Intention & Guidance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Name(s) for the Intention *
                </label>
                <input
                  type="text"
                  name="names"
                  required
                  placeholder="e.g. + Juanita Reyes (Eternal Repose)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Requested By *
                  </label>
                  <input
                    type="text"
                    name="requestedBy"
                    required
                    placeholder="e.g. Teresa Reyes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="0917-xxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Mass Date *
                  </label>
                  <input
                    type="date"
                    name="massDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Mass Time *
                  </label>
                  <input
                    type="text"
                    name="massTime"
                    defaultValue="6:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Stipend (₱)
                  </label>
                  <input
                    type="number"
                    name="stipendAmount"
                    defaultValue={500}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIntentionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold shadow-md"
                >
                  Save Mass Intention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: REGISTER SACRAMENT */}
      {isAddSacramentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-[#0171bb] text-white p-6 relative">
              <button
                onClick={() => setIsAddSacramentModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-cathedral text-xl font-bold text-white">
                Register Sacramental Celebration
              </h3>
              <p className="text-xs text-blue-100">
                Log a Holy Baptism, Matrimony, or Confirmation booking.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newSacrament: SacramentBooking = {
                  id: `sac-${Date.now()}`,
                  referenceCode: `SAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                  sacramentType: (form.elements.namedItem('sacramentType') as HTMLSelectElement).value as any,
                  candidateNames: (form.elements.namedItem('candidateNames') as HTMLInputElement).value,
                  contactPerson: (form.elements.namedItem('contactPerson') as HTMLInputElement).value,
                  contactEmail: (form.elements.namedItem('contactEmail') as HTMLInputElement).value,
                  contactPhone: (form.elements.namedItem('contactPhone') as HTMLInputElement).value,
                  scheduledDate: (form.elements.namedItem('scheduledDate') as HTMLInputElement).value,
                  scheduledTime: (form.elements.namedItem('scheduledTime') as HTMLInputElement).value,
                  officiatingPriest: (form.elements.namedItem('officiatingPriest') as HTMLInputElement).value || 'To be assigned',
                  status: 'Requirements Review',
                  checklist: {
                    birthCertificate: true,
                    baptismalCertWithAnnotation: false,
                    preCanaSeminar: false,
                    canonicalInterview: false,
                    marriageLicenseOrCert: false,
                  },
                  feeAmount: Number((form.elements.namedItem('feeAmount') as HTMLInputElement).value) || 0,
                  feePaid: true,
                  createdDate: new Date().toISOString().split('T')[0],
                };

                setSacraments([newSacrament, ...sacraments]);
                setIsAddSacramentModalOpen(false);
                showToast(`Sacrament registered with Ref: ${newSacrament.referenceCode}`);
              }}
              className="p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Sacrament Type *
                </label>
                <select
                  name="sacramentType"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 bg-white text-xs"
                >
                  <option value="Holy Matrimony (Wedding)">Holy Matrimony (Cathedral Wedding)</option>
                  <option value="Holy Baptism">Holy Baptism (Christening)</option>
                  <option value="Confirmation">Sacrament of Confirmation</option>
                  <option value="Anointing of the Sick">Anointing of the Sick / Viaticum</option>
                  <option value="First Holy Communion">First Holy Communion</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Candidate / Couple Names *
                  </label>
                  <input
                    type="text"
                    name="candidateNames"
                    required
                    placeholder="e.g. Gabriel Reyes & Sofia Valenzuela"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    placeholder="e.g. Sofia Valenzuela"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    required
                    placeholder="0917-xxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="sofia@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Time *
                  </label>
                  <input
                    type="text"
                    name="scheduledTime"
                    defaultValue="2:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                    Parish Fee (₱)
                  </label>
                  <input
                    type="number"
                    name="feeAmount"
                    defaultValue={1500}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0171bb]/30 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSacramentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold shadow-md"
                >
                  Register Sacrament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
