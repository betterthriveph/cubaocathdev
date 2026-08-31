import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Info, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { emailWorkflowService, EmailLogEntry, EmailEventType } from '../../services/emailService';

interface AdminEmailLogsViewerProps {
  showToast: (msg: string) => void;
}

export const AdminEmailLogsViewer: React.FC<AdminEmailLogsViewerProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<EmailLogEntry[]>(() => emailWorkflowService.getRecentEmailLogs());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<EmailLogEntry | null>(null);

  const refreshLogs = () => {
    setLogs(emailWorkflowService.getRecentEmailLogs());
    showToast('Refreshed automated email logs.');
  };

  const filteredLogs = logs.filter((log) => {
    const matchSearch = log.recipient.name.toLowerCase().includes(search.toLowerCase()) ||
                        log.recipient.email.toLowerCase().includes(search.toLowerCase()) ||
                        log.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || log.eventType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0171bb] border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
            <Mail className="w-3 h-3" />
            <span>Automated Transactional Emails & Audit Trail</span>
          </div>
          <h2 className="font-cathedral text-xl sm:text-2xl font-bold text-slate-900">
            Email Notifications & Serverless Dispatch Logs
          </h2>
          <p className="text-xs text-slate-600">
            Audit trail of automated transactional emails triggered by reservation updates, payment invoices, e-receipts, and certificate readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Production Integration Architecture Note */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Production Architecture: Netlify Serverless Function + Resend</span>
        </div>
        <p className="text-amber-800 text-[11px] leading-relaxed">
          No API keys are stored in the client application. In development, email dispatches are formatted, validated, and logged below. In production on Netlify, calls will proxy to <code>/.netlify/functions/send-email</code> using environment secrets (<code>RESEND_API_KEY</code>).
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by recipient name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#0171bb]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#0171bb]"
        >
          <option value="all">All Email Triggers ({logs.length})</option>
          <option value="RESERVATION_PENDING">Reservation Request Received</option>
          <option value="RESERVATION_APPROVED">Reservation Approved</option>
          <option value="PAYMENT_INSTRUCTIONS">Payment Instructions & Invoice</option>
          <option value="PAYMENT_CONFIRMED">Payment Confirmed / E-Receipt</option>
          <option value="BOOKING_REMINDER">48h Booking Reminder</option>
          <option value="CERTIFICATE_READY">Certificate Ready for Claim</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900">
              Recent Dispatches ({filteredLogs.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-Audit Logging Active
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No automated emails recorded yet. Trigger a booking action or status change in the Parish Services tab to generate notifications.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  className={`w-full p-4 text-left transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                    selectedLog?.id === log.id ? 'bg-blue-50/70 border-l-4 border-[#0171bb]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        log.eventType === 'PAYMENT_CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.eventType === 'RESERVATION_APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : log.eventType === 'PAYMENT_INSTRUCTIONS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs truncate">
                      {log.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>To: <strong>{log.recipient.name}</strong> ({log.recipient.email})</span>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                    View Body
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-5">
          {selectedLog ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Message Preview
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-0.5">
                    {selectedLog.subject}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {selectedLog.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div><strong>Recipient:</strong> {selectedLog.recipient.name} &lt;{selectedLog.recipient.email}&gt;</div>
                  <div><strong>Timestamp:</strong> {selectedLog.timestamp}</div>
                  <div><strong>Message ID:</strong> <code className="text-[10px]">{selectedLog.id}</code></div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Rendered Email Body:</label>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                    {selectedLog.previewBody}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select an email entry from the list to preview the delivered content and transactional template.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
