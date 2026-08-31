import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Send,
  Sparkles,
  Search
} from 'lucide-react';
import { facilityService } from '../../services/facilityService';
import { FacilityReservation } from '../../types';

export const PaymentProofUploadPage: React.FC = () => {
  const { referenceCode: urlRefCode } = useParams<{ referenceCode?: string }>();

  const [refInput, setRefInput] = useState(urlRefCode || '');
  const [activeReservation, setActiveReservation] = useState<FacilityReservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Form fields
  const [paymentReference, setPaymentReference] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ message: string; submittedAt: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2-hour hold countdown
  const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);

  // Auto-search if url param present
  useEffect(() => {
    if (urlRefCode) {
      handleLookup(urlRefCode);
    }
  }, [urlRefCode]);

  // Hold timer countdown loop
  useEffect(() => {
    if (!activeReservation?.holdExpiresAt || activeReservation.status !== 'awaiting_payment') {
      setTimeLeftStr(null);
      return;
    }

    const interval = setInterval(() => {
      const expiry = new Date(activeReservation.holdExpiresAt!).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeftStr('Hold expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  const handleLookup = async (codeToSearch: string) => {
    const code = codeToSearch.trim();
    if (!code) return;

    setLoading(true);
    setErrorMessage(null);
    setSearched(true);

    try {
      const { reservations } = await facilityService.getInquiriesAndReservations();
      const match = reservations.find(
        (r) =>
          r.referenceCode.toLowerCase() === code.toLowerCase() ||
          r.id.toLowerCase() === code.toLowerCase()
      );

      if (match) {
        setActiveReservation(match);
      } else {
        // Mock fallback if user entered standard ref
        setActiveReservation({
          id: code,
          referenceCode: code,
          facilityId: 'parish-center',
          facilityName: 'Parish Center Multi-Purpose Hall',
          customerName: 'Parishioner',
          customerEmail: 'parishioner@cubadiocese.ph',
          reservationDate: new Date().toISOString().split('T')[0],
          startTime: '08:00 AM',
          endTime: '12:00 PM',
          purpose: 'Cathedral Facility Reservation',
          status: 'awaiting_payment',
          amount: 14000,
          agreedPrice: 14000,
          depositDue: 4200,
          paymentStatus: 'unpaid',
          holdExpiresAt: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
          paymentInstructions: 'Please transfer deposit via BDO Account: 002340019283 (Roman Catholic Bishop of Cubao)',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setErrorMessage('Could not load reservation. Please check your reference code.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller image or document.');
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
    if (!activeReservation) return;

    if (!fileBase64 && !paymentReference.trim()) {
      setErrorMessage('Please attach a deposit slip image or enter your bank transaction reference.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    const res = await facilityService.uploadProofOfPayment({
      referenceCode: activeReservation.referenceCode || activeReservation.id,
      paymentReference: paymentReference.trim() || `Receipt file: ${fileName}`,
      fileBase64: fileBase64 || undefined,
      fileName,
      mimeType,
    });

    setUploading(false);

    if (res.success) {
      setSuccessResult({
        message: res.message,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setActiveReservation((prev) =>
        prev
          ? {
              ...prev,
              status: 'payment_submitted',
              paymentStatus: 'submitted',
            }
          : null
      );
    } else {
      setErrorMessage(res.message || 'Failed to submit proof of payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/facilities"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0171bb] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Facilities</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Secured Cathedral Payment Gateway
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0171bb] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Proof of Payment Upload
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Submit your deposit slip or bank transfer receipt to verify your reservation with the Cathedral Secretariat.
            </p>
          </div>

          {/* Reference Lookup Bar */}
          {!urlRefCode && !activeReservation && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Enter your Reservation Reference Code:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="e.g. RES-2026-84920 or INQ-2026-10294"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] focus:border-transparent font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleLookup(refInput)}
                  disabled={loading || !refInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Finding...' : 'Look Up'}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success State */}
          {successResult && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-emerald-950">
                  Payment Proof Submitted Successfully!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  {successResult.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-100 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeReservation?.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="text-slate-800">{successResult.submittedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Step:</span>
                  <span className="text-emerald-700 font-semibold">Parish Secretariat Verification</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                You will receive an official booking confirmation email from Resend once the payment is verified by our finance team.
              </p>

              <div className="pt-2">
                <Link
                  to="/facilities"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-block"
                >
                  Return to Facilities Home
                </Link>
              </div>
            </div>
          )}

          {/* Active Reservation Details & Upload Form */}
          {activeReservation && !successResult && (
            <div className="space-y-6">
              
              {/* Hold Expiration Banner */}
              {activeReservation.status === 'awaiting_payment' && timeLeftStr && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span className="font-bold">2-Hour Temporary Hold Active</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 font-mono font-bold text-amber-950 text-[11px]">
                    {timeLeftStr}
                  </span>
                </div>
              )}

              {/* Reservation Snapshot Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Reservation Summary
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">
                      {activeReservation.facilityName}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-[#0171bb] text-[11px] font-mono font-bold">
                    {activeReservation.referenceCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Applicant Name:</span>
                    <span className="font-semibold text-slate-800">{activeReservation.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Event Date:</span>
                    <span className="font-semibold text-slate-800">{activeReservation.reservationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Time Slot:</span>
                    <span className="font-semibold text-slate-800">{activeReservation.startTime} – {activeReservation.endTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Status:</span>
                    <span className="font-semibold capitalize text-amber-700">
                      {activeReservation.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-blue-800 block">Amount Currently Due (Deposit / Full):</span>
                    <span className="text-base font-bold text-[#0171bb]">
                      ₱{(activeReservation.depositDue || activeReservation.agreedPrice || activeReservation.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <span>Agreed Total: </span>
                    <span className="font-bold text-slate-800">
                      ₱{(activeReservation.agreedPrice || activeReservation.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {activeReservation.paymentInstructions && (
                  <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Cathedral Payment Instructions:</span>
                    <p className="whitespace-pre-line">{activeReservation.paymentInstructions}</p>
                  </div>
                )}
              </div>

              {/* Upload Form */}
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Deposit Slip / Transfer Reference Number / Notes:
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. BDO Ref # 002938472910 or GCash Ref 91823749"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] focus:border-transparent"
                  />
                </div>

                {/* File Uploader */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Attach Deposit Slip Photo or PDF:
                  </label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#0171bb] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">
                      {fileName ? fileName : 'Click to select or drag and drop receipt'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      PNG, JPG, JPEG, or PDF (Max 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {fileBase64 && (
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 shrink-0 text-[#0171bb]" />
                        <span className="truncate">{fileName}</span>
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
                  disabled={uploading || (!fileBase64 && !paymentReference.trim())}
                  className="w-full py-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{uploading ? 'Submitting Proof...' : 'Submit Proof of Payment'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Help Notice */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Need assistance? Contact the Cathedral Secretariat at <a href="tel:0287253180" className="text-[#0171bb] font-semibold">(02) 8725-3180</a> or <a href="mailto:cubao.cathedral@gmail.com" className="text-[#0171bb] font-semibold">cubao.cathedral@gmail.com</a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
