import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  Send,
  Search,
  Check,
  Calendar,
  DollarSign,
  Info,
  Phone,
  Mail,
  ShieldCheck,
  XCircle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { facilityService } from '../../services/facilityService';

interface PublicBookingDetails {
  referenceCode: string;
  applicantName: string;
  facility: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  agreedAmount: number;
  amountDue: number;
  paymentDeadline?: string | null;
  paymentInstructions: string;
  currentPaymentStatus: string;
  status: string;
  holdExpiresAt?: string | null;
  isExpired?: boolean;
  paymentSubmittedAt?: string | null;
}

export const PaymentProofUploadPage: React.FC = () => {
  const { reservationReference, referenceCode: legacyRefCode } = useParams<{ 
    reservationReference?: string; 
    referenceCode?: string; 
  }>();

  const initialCode = reservationReference || legacyRefCode || '';

  const [refInput, setRefInput] = useState(initialCode);
  const [booking, setBooking] = useState<PublicBookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form fields
  const [paymentReference, setPaymentReference] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    message: string;
    submittedAt: string;
    referenceCode: string;
  } | null>(null);

  // Hold expiration countdown
  const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);
  const [isHoldExpiredLocally, setIsHoldExpiredLocally] = useState<boolean>(false);

  const fetchBooking = useCallback(async (codeToLookup: string) => {
    const clean = codeToLookup.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMessage(null);
    setNotFound(false);

    const res = await facilityService.getPublicReservationForPayment(clean);

    setLoading(false);

    if (res.success && res.reservation) {
      setBooking(res.reservation);
      if (res.reservation.isExpired) {
        setIsHoldExpiredLocally(true);
      }
    } else {
      setBooking(null);
      setNotFound(true);
      setErrorMessage(res.error || 'Booking not found.');
    }
  }, []);

  // On page load or URL change, fetch reservation
  useEffect(() => {
    if (initialCode) {
      setRefInput(initialCode);
      fetchBooking(initialCode);
    }
  }, [initialCode, fetchBooking]);

  // Live countdown timer for active 2-hour hold
  useEffect(() => {
    if (!booking?.holdExpiresAt) {
      setTimeLeftStr(null);
      return;
    }

    // Only run timer if not yet confirmed or submitted
    const isPendingPayment = booking.status === 'awaiting_payment' && 
      (booking.currentPaymentStatus === 'unpaid' || !booking.currentPaymentStatus);

    if (!isPendingPayment) {
      setTimeLeftStr(null);
      return;
    }

    const checkTimer = () => {
      const expiry = new Date(booking.holdExpiresAt!).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeftStr('00:00:00');
        setIsHoldExpiredLocally(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.trim()) {
      fetchBooking(refInput.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller image or PDF receipt.');
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (!fileBase64 && !paymentReference.trim()) {
      setErrorMessage('Please attach a deposit slip image or enter your payment reference number.');
      return;
    }

    // Check if expired
    if (isHoldExpiredLocally || booking.isExpired) {
      setErrorMessage('This payment window has expired. Please contact Cubao Cathedral for assistance.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    const res = await facilityService.uploadProofOfPayment({
      referenceCode: booking.referenceCode,
      paymentReference: paymentReference.trim() || `Receipt file: ${fileName}`,
      fileBase64: fileBase64 || undefined,
      fileName,
      mimeType,
    });

    setUploading(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSubmissionSuccess({
        message: res.message || 'Proof of payment submitted successfully. Your reservation is now under review by our parish accounting staff for final confirmation.',
        submittedAt: nowTime,
        referenceCode: booking.referenceCode,
      });

      setBooking((prev) =>
        prev
          ? {
              ...prev,
              currentPaymentStatus: 'submitted',
              status: 'payment_submitted',
              paymentSubmittedAt: new Date().toISOString(),
            }
          : null
      );
    } else {
      setErrorMessage(res.message || 'Failed to submit proof of payment. Please try again.');
    }
  };

  // State evaluation flags
  const isHoldExpired = isHoldExpiredLocally || Boolean(booking?.isExpired);
  const isConfirmed = booking?.status === 'confirmed' || booking?.currentPaymentStatus === 'verified' || booking?.currentPaymentStatus === 'paid';
  const isAlreadySubmitted = !submissionSuccess && (booking?.status === 'payment_submitted' || booking?.currentPaymentStatus === 'submitted');

  return (
    <div id="payment-proof-page" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/facilities"
            id="back-to-facilities-link"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0171bb] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Facilities</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Cathedral Payment Portal</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0171bb] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Submit Proof of Payment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Securely transmit your bank transfer confirmation or deposit slip to the Immaculate Conception Cathedral Secretariat.
            </p>
          </div>

          {/* Reference Lookup Bar (when no param in URL or user wants to lookup another) */}
          {(!initialCode || notFound) && (
            <form onSubmit={handleManualSearch} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label htmlFor="ref-input" className="block text-xs font-bold text-slate-700">
                Enter your Reservation Reference Code:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="ref-input"
                    type="text"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="e.g. RES-2026-61991"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] focus:border-transparent font-mono"
                  />
                </div>
                <button
                  type="submit"
                  id="search-booking-btn"
                  disabled={loading || !refInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? 'Finding...' : 'Look Up'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0171bb] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Retrieving booking information from Cathedral records...</p>
            </div>
          )}

          {/* State 1: Booking Not Found */}
          {notFound && !loading && (
            <div id="booking-not-found-card" className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-rose-950 font-cathedral">
                  Booking not found.
                </h2>
                <p className="text-xs text-rose-800 max-w-md mx-auto">
                  We could not locate any reservation matching the reference code <strong className="font-mono">{refInput || initialCode}</strong>. Please verify the code from your confirmation email or contact the Cathedral Secretariat.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNotFound(false);
                    setRefInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100/50 transition-colors"
                >
                  Try Another Reference
                </button>
                <Link
                  to="/facilities"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Return to Facilities
                </Link>
              </div>
            </div>
          )}

          {/* General Error Alert */}
          {errorMessage && !notFound && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* State: Fresh Submission Success Screen */}
          {submissionSuccess && (
            <div id="payment-success-card" className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-emerald-950 font-cathedral">
                  Proof of Payment Submitted Successfully
                </h2>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  {submissionSuccess.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-100 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Reservation Reference:</span>
                  <span className="font-bold text-slate-900 font-mono">{submissionSuccess.referenceCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-700 capitalize">Submitted (Pending Accounting Audit)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Submission Timestamp:</span>
                  <span className="font-semibold text-slate-800">{submissionSuccess.submittedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Step:</span>
                  <span className="text-emerald-800 font-semibold">Cathedral Finance Verification</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Once our accounting team verifies your bank deposit, you will receive an official booking confirmation email via Resend.
              </p>

              <div className="pt-2">
                <Link
                  to="/facilities"
                  id="return-facilities-btn"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-block shadow-sm"
                >
                  Return to Facilities Home
                </Link>
              </div>
            </div>
          )}

          {/* Booking Data Display & Conditional Form / State Panels */}
          {booking && !submissionSuccess && !loading && (
            <div className="space-y-6">

              {/* State 2: Expired 2-Hour Hold */}
              {isHoldExpired && (
                <div id="payment-expired-card" className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                    <h3 className="font-bold text-sm">Hold Expired</h3>
                  </div>
                  <p className="text-xs text-amber-900 font-medium">
                    This payment window has expired. Please contact Cubao Cathedral for assistance.
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1">
                    <p className="text-[11px] text-slate-600">
                      The temporary 2-hour slot reservation for <strong>{booking.facility}</strong> on <strong>{booking.eventDate}</strong> has elapsed. Please reach out to the Secretariat to re-open or check slot availability.
                    </p>
                  </div>
                </div>
              )}

              {/* State 3: Payment Already Submitted (Awaiting Verification) */}
              {isAlreadySubmitted && (
                <div id="payment-already-submitted-card" className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-[#0171bb] shrink-0" />
                    <h3 className="font-bold text-sm">Payment Under Review</h3>
                  </div>
                  <p className="text-xs text-blue-900 font-medium">
                    Your proof of payment has already been submitted and is awaiting verification.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Our finance staff is auditing the deposit slip. You will receive an official confirmation email as soon as the verification is finalized.
                  </p>
                </div>
              )}

              {/* State 4: Payment Already Confirmed */}
              {isConfirmed && (
                <div id="booking-already-confirmed-card" className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="font-bold text-sm">Booking Confirmed</h3>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium">
                    This booking has already been confirmed.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    All payments for this reservation have been verified. We look forward to hosting your gathering at the Cathedral.
                  </p>
                </div>
              )}

              {/* Live Hold Countdown Banner (only if active awaiting_payment and not expired) */}
              {!isHoldExpired && !isAlreadySubmitted && !isConfirmed && timeLeftStr && (
                <div id="hold-countdown-banner" className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span className="font-bold">2-Hour Temporary Hold Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-700 uppercase font-semibold">Remaining:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-200/90 font-mono font-bold text-amber-950 text-xs">
                      {timeLeftStr}
                    </span>
                  </div>
                </div>
              )}

              {/* Reservation Snapshot Card (Required Fields Display) */}
              <div id="reservation-summary-card" className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Reservation Reference
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {booking.facility}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0171bb] text-xs font-mono font-bold">
                    {booking.referenceCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Applicant Name:</span>
                    <span className="font-bold text-slate-900">{booking.applicantName}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Facility:</span>
                    <span className="font-semibold text-slate-800">{booking.facility}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Event Date:</span>
                    <span className="font-semibold text-slate-800">{booking.eventDate}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Start / End Time:</span>
                    <span className="font-semibold text-slate-800">{booking.startTime} – {booking.endTime}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Agreed Total Amount:</span>
                    <span className="font-bold text-slate-900">₱{booking.agreedAmount.toLocaleString()}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Payment Deadline:</span>
                    <span className="font-semibold text-slate-800">{booking.paymentDeadline || 'Within 2 hours of hold'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Current Payment Status:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold capitalize bg-slate-200 text-slate-800">
                      {booking.currentPaymentStatus}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Reservation Status:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold capitalize bg-blue-100 text-blue-900">
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Amount Due Highlight */}
                <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-blue-800 block font-medium">Amount Due for Hold Confirmation (Deposit):</span>
                    <span className="text-lg font-extrabold text-[#0171bb]">
                      ₱{booking.amountDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <span>Agreed Balance Total: </span>
                    <span className="font-bold text-slate-800">
                      ₱{booking.agreedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Instructions Box */}
                {booking.paymentInstructions && (
                  <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Info className="w-3.5 h-3.5 text-[#0171bb]" />
                      <span>Payment Instructions:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-line text-slate-600">
                      {booking.paymentInstructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Proof of Payment Upload Form (Only shown when active and allowed) */}
              {!isHoldExpired && !isAlreadySubmitted && !isConfirmed && (
                <form id="proof-upload-form" onSubmit={handleSubmitProof} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label htmlFor="payment-ref-input" className="block text-xs font-bold text-slate-700">
                      Bank Transfer / Deposit Reference Number:
                    </label>
                    <input
                      id="payment-ref-input"
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. BDO Ref # 002938472910, GCash Ref 91823749, or Teller Slip #"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] focus:border-transparent"
                    />
                  </div>

                  {/* File Uploader */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Attach Deposit Slip Photo or PDF:
                    </label>
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#0171bb] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-blue-50/30">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700 text-center">
                        {fileName ? fileName : 'Click to select or drag and drop receipt'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        PNG, JPG, JPEG, or PDF (Max 10MB)
                      </span>
                      <input
                        type="file"
                        id="proof-file-input"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {fileBase64 && (
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 shrink-0 text-[#0171bb]" />
                          <span className="truncate font-medium">{fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFileBase64(null);
                            setFileName('');
                          }}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="submit-payment-proof-btn"
                    disabled={uploading || (!fileBase64 && !paymentReference.trim())}
                    className="w-full py-3.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Proof of Payment...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Proof of Payment</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

          {/* Secretariat Contact Footer Help Notice */}
          <div className="border-t border-slate-100 pt-4 text-center space-y-1">
            <p className="text-[11px] text-slate-500">
              Need assistance with your booking? Contact the Cathedral Secretariat:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#0171bb]">
              <a href="tel:0287253180" className="inline-flex items-center gap-1 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>(02) 8725-3180</span>
              </a>
              <a href="mailto:cubao.cathedral@gmail.com" className="inline-flex items-center gap-1 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>cubao.cathedral@gmail.com</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

