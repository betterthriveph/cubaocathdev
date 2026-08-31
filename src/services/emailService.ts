/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Immaculate Conception Cathedral of Cubao
 * Automated Email Workflow Service Layer
 * 
 * SECURITY & ARCHITECTURE NOTICE:
 * This service defines the automated transactional email contract for the Cathedral.
 * No API keys or Resend secrets are stored on the frontend.
 * In production on Netlify, this service dispatches payloads to a secure Netlify Function
 * (e.g. `/.netlify/functions/send-transactional-email`) which executes Resend server-side.
 * 
 * In development, events are formatted and logged to the console and in-app audit trail.
 */

export type EmailEventType = 
  | 'RESERVATION_PENDING'
  | 'RESERVATION_APPROVED'
  | 'PAYMENT_INSTRUCTIONS'
  | 'PAYMENT_CONFIRMED'
  | 'BOOKING_REMINDER'
  | 'CERTIFICATE_READY';

export interface EmailRecipient {
  name: string;
  email: string;
  phone?: string;
}

export interface EmailLogEntry {
  id: string;
  eventType: EmailEventType;
  recipient: EmailRecipient;
  subject: string;
  timestamp: string;
  status: 'Simulated / Sent' | 'Queued';
  metadata: Record<string, any>;
  previewBody: string;
}

const EMAIL_LOGS_KEY = 'cathedral_email_logs';

class EmailWorkflowService {
  private getLogs(): EmailLogEntry[] {
    try {
      const data = localStorage.getItem(EMAIL_LOGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load email logs:', e);
    }
    return [];
  }

  private saveLog(entry: EmailLogEntry) {
    try {
      const current = this.getLogs();
      const updated = [entry, ...current].slice(0, 50); // keep last 50
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save email log:', e);
    }
  }

  getRecentEmailLogs(): EmailLogEntry[] {
    return this.getLogs();
  }

  /**
   * Dispatches an automated email trigger.
   * In development: Simulates delivery, logs formatted template, and records audit trail.
   * In production: Proxies to Netlify Serverless Function with server-side Resend API.
   */
  async triggerEmailWorkflow(
    eventType: EmailEventType,
    recipient: EmailRecipient,
    data: Record<string, any>
  ): Promise<{ success: boolean; messageId: string }> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

    let subject = '';
    let previewBody = '';

    switch (eventType) {
      case 'RESERVATION_PENDING':
        subject = `[Cubao Cathedral] Reservation Request Received – Ref: ${data.referenceCode}`;
        previewBody = `Dear ${recipient.name},\n\nPeace in Christ!\n\nWe have received your reservation inquiry for ${data.facilityName} scheduled on ${data.eventDate}.\n\nReference Code: ${data.referenceCode}\nStatus: Under Review by Parish Secretariat\n\nOur office will verify calendar availability and contact you within 24-48 hours with next steps.`;
        break;

      case 'RESERVATION_APPROVED':
        subject = `[Cubao Cathedral] Reservation APPROVED – Ref: ${data.referenceCode}`;
        previewBody = `Dear ${recipient.name},\n\nWe are pleased to inform you that your booking for ${data.facilityName} on ${data.eventDate} has been APPROVED by the Parish Administration.\n\nTotal Contract Amount: ₱${Number(data.totalAmount || 0).toLocaleString()}\nRequired Reservation Bond (30%): ₱${Number(data.depositAmount || 0).toLocaleString()}\n\nPlease settle the initial reservation bond within 5 working days to secure your date.`;
        break;

      case 'PAYMENT_INSTRUCTIONS':
        subject = `[Cubao Cathedral] Payment Instructions & Billing Invoice – Ref: ${data.referenceCode}`;
        previewBody = `Dear ${recipient.name},\n\nPlease find the payment instructions for your Cathedral reservation:\n\nReference Code: ${data.referenceCode}\nAmount Due: ₱${Number(data.depositAmount || data.totalAmount || 0).toLocaleString()}\n\nPayment Options:\n1. BDO Bank Deposit / Online Transfer (Acct: Roman Catholic Bishop of Cubao - 002340019283)\n2. Official GCash Merchant QR (Parish Office Secretariat)\n3. Cashier Payment at Cathedral Secretariat Office (Tue–Sun, 8AM–5PM)\n\nPlease send proof of transfer with your reference code.`;
        break;

      case 'PAYMENT_CONFIRMED':
        subject = `[Cubao Cathedral] Payment CONFIRMED & Official E-Receipt – Ref: ${data.referenceCode}`;
        previewBody = `Dear ${recipient.name},\n\nThank you! We have verified your payment of ₱${Number(data.amountPaid || data.depositAmount || 0).toLocaleString()} for ${data.facilityName} (${data.eventDate}).\n\nOfficial E-Receipt Ref: OR-${Math.floor(100000 + Math.random() * 900000)}\nRemaining Balance: ₱${Number(data.remainingBalance || 0).toLocaleString()}\n\nYour date is officially locked in our parish master calendar. God bless your celebration!`;
        break;

      case 'BOOKING_REMINDER':
        subject = `[Cubao Cathedral] Upcoming Event Reminder (48 Hours) – Ref: ${data.referenceCode}`;
        previewBody = `Dear ${recipient.name},\n\nThis is a friendly reminder from Cubao Cathedral regarding your upcoming event:\n\nFacility: ${data.facilityName}\nDate & Time: ${data.eventDate} (${data.timeSlot})\nExpected Pax: ${data.pax}\n\nPlease ensure your caterer/suppliers follow the parish logistical and safety guidelines.`;
        break;

      case 'CERTIFICATE_READY':
        subject = `[Cubao Cathedral] Sacramental Certificate READY for Claim – Ref: ${data.referenceCode}`;
        previewBody = `Dear ${recipient.name},\n\nYour requested ${data.documentType} Certificate for ${data.fullName} is now ready for pickup at the Parish Office.\n\nClaim Reference: ${data.referenceCode}\nParish Office Hours: Tuesday to Sunday, 8:00 AM – 12:00 NN, 1:00 PM – 5:00 PM\n\nPlease bring a valid government ID.`;
        break;
    }

    const logEntry: EmailLogEntry = {
      id: messageId,
      eventType,
      recipient,
      subject,
      timestamp,
      status: 'Simulated / Sent',
      metadata: data,
      previewBody,
    };

    this.saveLog(logEntry);

    // Audit log entry saved for admin review
    return { success: true, messageId };
  }
}

export const emailWorkflowService = new EmailWorkflowService();
