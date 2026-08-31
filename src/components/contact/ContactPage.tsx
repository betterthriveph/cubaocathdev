import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CATHEDRAL_INFO } from '../../data/cathedralData';
import { PageId } from '../../types';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  PhoneCall, 
  Building2, 
  Navigation,
  FileCheck,
  ArrowRight,
  Calendar,
  Sparkles
} from 'lucide-react';

interface ContactPageProps {
  initialSubject?: string;
  setCurrentPage?: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ initialSubject }) => {
  const [searchParams] = useSearchParams();
  const querySubject = searchParams.get('subject') || initialSubject;

  const [concern, setConcern] = useState(
    querySubject ? (querySubject.toLowerCase().includes('sacrament') || querySubject.toLowerCase().includes('marriage') || querySubject.toLowerCase().includes('baptism') ? 'Sacrament Inquiry' : 'General Parish Concern') : 'General Parish Concern'
  );
  
  // General Inquiry form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(querySubject ? `Regarding: ${querySubject}\n\n` : '');

  useEffect(() => {
    if (querySubject) {
      setMessage(`Regarding: ${querySubject}\n\n`);
    }
  }, [querySubject]);

  // Certificate Request specific fields
  const [requestedDocument, setRequestedDocument] = useState<'Baptismal' | 'Confirmation' | 'First Communion' | 'Wedding'>('Baptismal');
  const [certName, setCertName] = useState('');
  const [certBirthday, setCertBirthday] = useState('');
  const [certFatherName, setCertFatherName] = useState('');
  const [certMotherName, setCertMotherName] = useState('');
  const [certSacramentDate, setCertSacramentDate] = useState('');
  const [certPurpose, setCertPurpose] = useState('');
  const [certRequestedBy, setCertRequestedBy] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let randomRef = '';

    if (concern === 'Certificate Request') {
      if (!certName || !certFatherName || !certMotherName || !certPurpose || !certRequestedBy || !email) {
        return;
      }
      randomRef = 'CERT-' + Math.floor(100000 + Math.random() * 900000);
      
      // Persist new certificate request to localStorage so Admin Dashboard can load it
      try {
        const existing = JSON.parse(localStorage.getItem('cathedral_certificate_requests') || '[]');
        const newReq = {
          id: 'cert-' + Date.now(),
          referenceCode: randomRef,
          documentType: requestedDocument,
          fullName: certName,
          birthday: certBirthday || 'Not specified',
          fatherName: certFatherName,
          motherName: certMotherName,
          sacramentDate: certSacramentDate || 'Not specified',
          purpose: certPurpose,
          requestedBy: certRequestedBy,
          contactEmail: email,
          contactPhone: phone || 'N/A',
          status: 'Pending',
          createdDate: new Date().toISOString().split('T')[0],
          feeAmount: requestedDocument === 'Wedding' ? 300 : 200,
          feePaid: false,
          notes: 'Submitted via Online Portal Contact Form'
        };
        localStorage.setItem('cathedral_certificate_requests', JSON.stringify([newReq, ...existing]));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Storage error', err);
      }
    } else {
      if (!name || !email || !message) return;
      randomRef = 'ICCC-' + Math.floor(100000 + Math.random() * 900000);
    }

    setReferenceCode(randomRef);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setCertName('');
    setCertBirthday('');
    setCertFatherName('');
    setCertMotherName('');
    setCertSacramentDate('');
    setCertPurpose('');
    setCertRequestedBy('');
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-white/20">
            <Mail className="w-3.5 h-3.5" />
            Parish Secretariat & Inquiries
          </div>
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Contact Cubao Cathedral
          </h1>
          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            One consolidated inquiry point for sacramental scheduling, certificates, pastoral counseling, and parish concerns.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Directory Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Emergency Hotline */}
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 font-cathedral font-bold text-base text-rose-900">
                <PhoneCall className="w-5 h-5 text-rose-600 animate-pulse" />
                Emergency Sick Call / Viaticum Hotline
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                For patients dangerously ill or requiring immediate Extreme Unction at nearby hospitals (St. Luke's QC, Cardinal Santos, World Citi, etc.):
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <a
                  href="tel:+639209504222"
                  className="font-mono font-bold text-sm text-rose-900 bg-white px-3.5 py-2 rounded-xl border border-rose-300 inline-flex items-center gap-2 shadow-xs"
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  0920-950-4222 (24/7 Priest on Duty)
                </a>
              </div>
            </div>

            {/* Office Directory Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-cathedral text-lg font-bold text-blue-950 border-b border-slate-100 pb-3">
                Parish Office Directory
              </h3>

              <div className="space-y-4 text-xs">
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Physical Address:</span>
                    <span className="text-slate-600">
                      {CATHEDRAL_INFO.address}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      (Walking distance from LRT-2 Betty Go-Belmonte Station)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Secretariat Office Hours:</span>
                    <span className="text-slate-600 block">
                      <strong>Tuesday to Saturday:</strong> 8:00 AM – 12:00 NN | 1:30 PM – 5:00 PM
                    </span>
                    <span className="text-slate-600 block">
                      <strong>Sunday:</strong> 8:00 AM – 12:00 NN
                    </span>
                    <span className="text-amber-800 text-[11px] font-semibold block mt-0.5">
                      * Closed on Mondays and Official National Church Holidays.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Landline Numbers:</span>
                    <span className="text-slate-600 block font-mono">
                      (02) 8725-2432 / (02) 8721-0422
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Department Emails:</span>
                    <ul className="text-slate-600 space-y-0.5 mt-0.5">
                      <li><strong>General:</strong> {CATHEDRAL_INFO.email}</li>
                      <li><strong>Events / Halls:</strong> events@cubaocathedral.org</li>
                      <li><strong>Caritas Cubao:</strong> caritas@dioceseofcubao.ph</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Commute Guide */}
            <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-cathedral font-bold text-blue-950">
                <Navigation className="w-4 h-4 text-blue-800" />
                How to Reach Us (Commuter's Guide)
              </div>
              <p className="text-slate-600 leading-relaxed">
                Take the <strong>LRT-2 to Betty Go-Belmonte Station</strong>. Exit along Aurora Blvd and walk 300 meters south along Lantana Street (towards E. Rodriguez Sr. Ave). Free secured parking is available inside the Cathedral Compound for parish visitors.
              </p>
            </div>

          </div>

          {/* Unified Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div>
                <h3 className="font-cathedral text-xl font-bold text-slate-900">
                  Send a Parish Inquiry or Message
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Fill out this direct inquiry form. Our Parish Secretariat will respond via email or phone promptly.
                </p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h4 className="font-cathedral text-xl font-bold text-slate-900">
                    {concern === 'Certificate Request' ? 'Certificate Request Filed Successfully' : 'Inquiry Transmitted Successfully'}
                  </h4>

                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {concern === 'Certificate Request'
                      ? `Thank you, ${certRequestedBy || 'Devotee'}! Your certificate request has been forwarded to the Cathedral Administration & Secretariat. Please bring a valid ID when claiming your official document.`
                      : `Thank you, ${name}! Your message has been logged with the Cathedral office desk. You will receive an email confirmation shortly.`}
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 max-w-sm mx-auto space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Reference Tracking Code</span>
                    <span className="font-mono text-base font-bold text-[#0171bb] block">{referenceCode}</span>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-[#0171bb] hover:bg-[#015f9e] text-white rounded-xl text-xs font-semibold"
                    >
                      Send Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Concern Dropdown (Replaces Concern Category) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Concern *
                    </label>
                    <select
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 bg-white"
                    >
                      <option value="General Parish Concern">General Parish Concern / Questions</option>
                      <option value="Certificate Request">Certificate Request</option>
                      <option value="Parish Spaces Reservation">Parish Spaces Reservation</option>
                      <option value="Sacrament Inquiry">Sacrament Inquiry (Baptism, Wedding, Confirmation)</option>
                      <option value="Mass Offering / Intentions">Mass Offering / Intentions (Misa de Gracia)</option>
                      <option value="Counseling / Confession">Pastoral Counseling / Confession Appointment</option>
                      <option value="Volunteer / Ministry">Volunteer / Ministry Inquiries</option>
                      <option value="Caritas Outreach / Donation">Caritas Social Outreach / Donations</option>
                    </select>
                  </div>

                  {/* If Parish Spaces Reservation is selected */}
                  {concern === 'Parish Spaces Reservation' && (
                    <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-800 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-cathedral font-bold text-base text-amber-900">
                        <Building2 className="w-5 h-5 text-amber-700" />
                        <span>Cathedral Facilities & Venue Booking</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Learn more about our facilities and book{' '}
                        <Link
                          to="/facilities"
                          className="font-bold text-[#0171bb] underline hover:text-[#015f9e] inline-flex items-center gap-0.5"
                        >
                          <span>here</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>.
                      </p>
                      <div className="pt-2">
                        <Link
                          to="/facilities"
                          className="px-4 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>View All Cathedral Facilities & Reserve</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* If Certificate Request is selected */}
                  {concern === 'Certificate Request' && (
                    <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                      <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#0171bb] shrink-0" />
                        <span>Please fill in the official sacramental archive details below:</span>
                      </div>

                      {/* Requested Document */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Requested Document *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(['Baptismal', 'Confirmation', 'First Communion', 'Wedding'] as const).map((doc) => (
                            <button
                              key={doc}
                              type="button"
                              onClick={() => setRequestedDocument(doc)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                                requestedDocument === doc
                                  ? 'bg-[#0171bb] text-white border-[#0171bb] shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {doc}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name of Candidate / Subject */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Name (Person on Certificate) *
                        </label>
                        <input
                          type="text"
                          required
                          value={certName}
                          onChange={(e) => setCertName(e.target.value)}
                          placeholder="Full Name as recorded in baptism/sacrament"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                        />
                      </div>

                      {/* Birthday (date field) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Birthday *
                        </label>
                        <input
                          type="date"
                          required
                          value={certBirthday}
                          onChange={(e) => setCertBirthday(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                        />
                      </div>

                      {/* Parents */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Name of Father *
                          </label>
                          <input
                            type="text"
                            required
                            value={certFatherName}
                            onChange={(e) => setCertFatherName(e.target.value)}
                            placeholder="Father's Full Name"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Name of Mother *
                          </label>
                          <input
                            type="text"
                            required
                            value={certMotherName}
                            onChange={(e) => setCertMotherName(e.target.value)}
                            placeholder="Mother's Full Maiden Name"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>
                      </div>

                      {/* Date of Sacrament */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Date of Sacrament (or Approximate Year) *
                        </label>
                        <input
                          type="text"
                          required
                          value={certSacramentDate}
                          onChange={(e) => setCertSacramentDate(e.target.value)}
                          placeholder="e.g. August 25, 2018 or Year 2018"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                        />
                      </div>

                      {/* Purpose & Requested By */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Purpose of Request *
                          </label>
                          <input
                            type="text"
                            required
                            value={certPurpose}
                            onChange={(e) => setCertPurpose(e.target.value)}
                            placeholder="e.g. Wedding, School, Visa, Personal"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Requested by *
                          </label>
                          <input
                            type="text"
                            required
                            value={certRequestedBy}
                            onChange={(e) => setCertRequestedBy(e.target.value)}
                            placeholder="Your Name & Relationship to Subject"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Your Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0917-xxx-xxxx"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          id="submit-cert-request-btn"
                          className="w-full py-3.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4 text-amber-300" />
                          <span>Submit Certificate Request to Admin</span>
                        </button>
                        <p className="text-[11px] text-slate-500 text-center mt-2">
                          Standard certificate preparation lead time is 2-3 working days.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Standard Form for all other concerns (Subject line is removed) */}
                  {concern !== 'Parish Spaces Reservation' && concern !== 'Certificate Request' && (
                    <div className="space-y-4">
                      {/* Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Your Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Juan Dela Cruz"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="juan@email.com"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Contact Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0917-xxx-xxxx"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Your Message / Details *
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Please provide complete details regarding your sacramental inquiry, preferred dates, or parish concern..."
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          id="submit-contact-inquiry-btn"
                          className="w-full py-3.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4 text-amber-300" />
                          <span>Submit Parish Inquiry</span>
                        </button>
                        <p className="text-[11px] text-slate-500 text-center mt-2">
                          Office communications are handled in strict pastoral confidentiality.
                        </p>
                      </div>
                    </div>
                  )}

                </form>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

