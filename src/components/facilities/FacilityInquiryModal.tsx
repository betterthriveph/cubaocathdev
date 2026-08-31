import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { facilityService } from '../../services/facilityService';
import { Facility } from '../../types';

interface FacilityInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFacility?: Facility | null;
}

export const FacilityInquiryModal: React.FC<FacilityInquiryModalProps> = ({
  isOpen,
  onClose,
  initialFacility,
}) => {
  const [facilities, setFacilities] = useState<Facility[]>(() => facilityService.getAllFacilities());
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    initialFacility?.id || 'parish-center'
  );

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedDate, setRequestedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks ahead by default
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [purpose, setPurpose] = useState('Parishioner Gathering / Sacramental Reception');
  const [message, setMessage] = useState('');

  // Availability checking state
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    available: boolean;
    message?: string;
  } | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceCode: string;
    message: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFacility) {
      setSelectedFacilityId(initialFacility.id || initialFacility.slug || 'parish-center');
    }
  }, [initialFacility]);

  // Sync facilities
  useEffect(() => {
    const unsub = facilityService.subscribe((list) => setFacilities(list));
    return () => unsub();
  }, []);

  const activeFacility = facilities.find(
    (f) => f.id === selectedFacilityId || f.slug === selectedFacilityId
  ) || facilities[0];

  // Run availability check whenever facility or date changes
  useEffect(() => {
    if (!isOpen || !selectedFacilityId || !requestedDate) return;

    let isMounted = true;
    setCheckingAvailability(true);
    setAvailabilityResult(null);

    const timer = setTimeout(async () => {
      const res = await facilityService.checkAvailability({
        facilityIdOrSlug: selectedFacilityId,
        date: requestedDate,
        startTime,
        endTime,
      });

      if (isMounted) {
        setAvailabilityResult(res);
        setCheckingAvailability(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, selectedFacilityId, requestedDate, startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !requestedDate) {
      setSubmitError('Please fill out all required fields.');
      return;
    }

    if (availabilityResult && !availabilityResult.available) {
      setSubmitError('This date/time slot is unavailable. Please select another slot.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const res = await facilityService.submitInquiry({
      facilityId: activeFacility.id,
      facilitySlug: activeFacility.slug || activeFacility.id,
      name,
      email,
      phone,
      requestedDate,
      startTime,
      endTime,
      purpose,
      message,
    });

    setSubmitting(false);

    if (res.success) {
      setSubmissionSuccess({
        referenceCode: res.referenceCode,
        message: res.message || 'Inquiry successfully submitted to Cathedral Secretariat.',
      });
    } else {
      setSubmitError('Failed to submit inquiry. Please try again.');
    }
  };

  const handleReset = () => {
    setSubmissionSuccess(null);
    setSubmitError(null);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#0b1f3a] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Cathedral Reservation Portal</span>
          </div>
          <h2 className="font-cathedral text-xl font-bold text-white">
            Facility Booking Inquiry
          </h2>
          <p className="text-xs text-blue-100/80 mt-1">
            Submit a reservation request for Cathedral function rooms, chapels, and sacred grounds.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Success State */}
          {submissionSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Inquiry Received!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {submissionSuccess.message}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inquiry Reference:</span>
                  <span className="font-bold text-[#0171bb] font-mono">{submissionSuccess.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility:</span>
                  <span className="font-semibold text-slate-800">{activeFacility?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Date:</span>
                  <span className="font-semibold text-slate-800">{requestedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-semibold text-slate-800">{startTime} – {endTime}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 text-left flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-[#0171bb] mt-0.5" />
                <span>
                  <strong>What happens next:</strong> Our parish administrator will review calendar availability and approve your inquiry. Once approved, you will receive payment instructions via email with a temporary 2-hour slot hold.
                </span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Facility Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Select Cathedral Facility:
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0171bb] font-semibold text-slate-800"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} {fac.basePrice ? `— ₱${fac.basePrice.toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Master Pricing Overview Card */}
              {activeFacility && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{activeFacility.name}</span>
                    <span className="text-[11px] font-bold text-[#0171bb] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      ₱{(activeFacility.basePrice || 0).toLocaleString()} Master Rate
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {activeFacility.pricingNotes || 'Standard 4-hour air-conditioned reservation. 30% deposit due upon approval.'}
                  </p>
                  {activeFacility.depositAmount > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span>Initial Deposit Required on Approval:</span>
                      <span className="font-semibold text-slate-800">₱{activeFacility.depositAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Date:
                  </label>
                  <input
                    type="date"
                    value={requestedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Start Time:
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    End Time:
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  >
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="09:00 PM">09:00 PM</option>
                    <option value="10:00 PM">10:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Real-time Availability Feedback */}
              <div className="pt-1">
                {checkingAvailability ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#0171bb] border-t-transparent rounded-full animate-spin" />
                    <span>Checking live Cathedral calendar availability...</span>
                  </div>
                ) : availabilityResult ? (
                  availabilityResult.available ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✓ Slot is currently available for reservation inquiry.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Slot Blocked / Temporarily Held</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">{availabilityResult.message}</p>
                      </div>
                    </div>
                  )
                ) : null}
              </div>

              {/* Applicant Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name / Organization: *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz / Parish Choir"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Address: *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. juan@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Contact Phone Number:
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 920 000 0000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Event Purpose / Type:
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Wedding Reception, Ministry Recollection"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Additional Notes / Logistical Requirements:
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Caterer name, estimated attendees, special audio/visual setup..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (availabilityResult !== null && !availabilityResult.available)}
                  className="px-6 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Inquiry...' : 'Submit Booking Inquiry'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
