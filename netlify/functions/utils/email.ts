/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Shared Email Helper using Resend
 * Protected strictly on the server-side.
 */

import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  return new Resend(apiKey.trim());
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cubao Cathedral Facilities <facilities@cubaocathedral.com>';
  const defaultReplyTo = process.env.RESEND_REPLY_TO || 'cubao.cathedral@gmail.com';

  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  if (!resend) {
    console.log(`[SIMULATED EMAIL] To: ${recipients.join(', ')} | Subject: ${options.subject}`);
    return {
      success: true,
      data: {
        id: `sim-${Date.now()}`,
        simulated: true,
        message: 'Email logged in development/preview mode without RESEND_API_KEY',
      },
    };
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      replyTo: options.replyTo || defaultReplyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    console.error('Failed to send email via Resend:', err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/**
 * Builds clean, mobile-friendly HTML & Plain Text templates for payment instructions
 */
export function buildPaymentInstructionsEmail(data: {
  applicantName: string;
  referenceCode: string;
  facilityName: string;
  date: string;
  startTime: string;
  endTime: string;
  agreedAmount: number;
  depositDue: number;
  paymentDeadline: string;
  paymentMethodDetails?: string;
  paymentInstructions?: string;
  paymentUploadUrl: string;
}): { html: string; text: string; subject: string } {
  const subject = `[Cubao Cathedral] Payment Instructions for Reservation ${data.referenceCode}`;
  
  const text = `
Dear ${data.applicantName},

Peace in Christ!

Your facility inquiry for ${data.facilityName} has been approved by the Immaculate Conception Cathedral of Cubao Administration.

RESERVATION DETAILS:
- Reference Code: ${data.referenceCode}
- Facility: ${data.facilityName}
- Date: ${data.date}
- Time: ${data.startTime} - ${data.endTime}
- Total Agreed Amount: ₱${data.agreedAmount.toLocaleString()}
- Amount Currently Due (Deposit/Full): ₱${data.depositDue.toLocaleString()}
- Payment Deadline: ${data.paymentDeadline}

PAYMENT METHODS & INSTRUCTIONS:
${data.paymentMethodDetails || 'Bank Transfer: Roman Catholic Bishop of Cubao (BDO Acct: 002340019283) or Cathedral Cashier Office.'}

${data.paymentInstructions || 'Please transfer the deposit amount and submit your proof of payment to secure the reservation.'}

UPLOAD PROOF OF PAYMENT:
Please upload your bank deposit slip or transaction receipt at the following link:
${data.paymentUploadUrl}

Note: Your 2-hour temporary reservation hold is now active. Once your proof of payment is submitted and verified, your reservation will be officially confirmed.

Cathedral Secretariat Office
Immaculate Conception Cathedral of Cubao
Lantana St., Cubao, Quezon City
Phone: (02) 8725-3180 | Email: cubao.cathedral@gmail.com
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #0b1f3a; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">Immaculate Conception Cathedral of Cubao</h1>
      <p style="margin: 0; font-size: 13px; color: #fbbf24; font-weight: 600;">Facilities & Parish Reservations</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; margin: 0 0 16px 0;">Dear <strong>${data.applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        We are pleased to inform you that your facility booking inquiry has been reviewed and <strong>approved</strong> by the Cathedral Administration. Please review your reservation billing details below:
      </p>

      <!-- Reservation Summary Box -->
      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Reference Code:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0171bb;">${data.referenceCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Facility / Space:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${data.facilityName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Reservation Date:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Time Slot:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${data.startTime} – ${data.endTime}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="padding: 8px 0; color: #64748b;">Total Agreed Amount:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">₱${data.agreedAmount.toLocaleString()}</td>
          </tr>
          <tr style="background-color: #e0f2fe;">
            <td style="padding: 8px 6px; font-weight: bold; color: #0369a1;">Amount Currently Due:</td>
            <td style="padding: 8px 6px; font-weight: bold; text-align: right; color: #0369a1; font-size: 15px;">₱${data.depositDue.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #dc2626; font-weight: 600;">Payment Deadline:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #dc2626;">${data.paymentDeadline}</td>
          </tr>
        </table>
      </div>

      <!-- Payment Instructions -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">Payment Methods & Details</h3>
        <div style="background-color: #f8fafc; border-left: 4px solid #0171bb; padding: 12px 16px; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-line;">
          ${data.paymentMethodDetails || 'Bank Deposit / Online Transfer:\n• Bank: BDO (Banco de Oro)\n• Account Name: Roman Catholic Bishop of Cubao\n• Account Number: 002340019283\n\nOr in person at Cathedral Secretariat Office (Tuesday - Sunday, 8:00 AM - 5:00 PM).'}
        </div>
      </div>

      ${data.paymentInstructions ? `
      <div style="margin-bottom: 24px; font-size: 13px; color: #475569; line-height: 1.5;">
        <strong>Special Notes:</strong> ${data.paymentInstructions}
      </div>` : ''}

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${data.paymentUploadUrl}" style="display: inline-block; background-color: #0171bb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(1, 113, 187, 0.3);">
          Upload Proof of Payment
        </a>
        <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 0 0;">
          Link: <a href="${data.paymentUploadUrl}" style="color: #0171bb;">${data.paymentUploadUrl}</a>
        </p>
      </div>

      <!-- Hold Notice -->
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; font-size: 12px; color: #92400e; line-height: 1.4;">
        ⏳ <strong>2-Hour Slot Hold:</strong> Your selected time slot is temporarily reserved while awaiting proof of payment. Please submit your transfer reference to ensure final confirmation.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0;"><strong>Cathedral Secretariat • Diocese of Cubao</strong></p>
      <p style="margin: 0 0 4px 0;">Lantana St., Brgy. Immaculate Conception, Cubao, Quezon City</p>
      <p style="margin: 0;">Tel: (02) 8725-3180 | Email: cubao.cathedral@gmail.com</p>
    </div>
  </div>
</body>
</html>
`.trim();

  return { html, text, subject };
}

/**
 * Builds clean HTML & Plain Text templates for booking confirmation
 */
export function buildBookingConfirmationEmail(data: {
  applicantName: string;
  referenceCode: string;
  facilityName: string;
  date: string;
  startTime: string;
  endTime: string;
  agreedAmount: number;
  paymentStatus: string;
  facilityInstructions?: string;
}): { html: string; text: string; subject: string } {
  const subject = `[Cubao Cathedral] CONFIRMED Facility Booking – Ref: ${data.referenceCode}`;
  
  const text = `
Dear ${data.applicantName},

Peace in Christ!

We are pleased to confirm that your payment has been verified and your booking for ${data.facilityName} is now CONFIRMED.

BOOKING SUMMARY:
- Reference Code: ${data.referenceCode}
- Facility: ${data.facilityName}
- Date: ${data.date}
- Time: ${data.startTime} - ${data.endTime}
- Agreed Total: ₱${data.agreedAmount.toLocaleString()}
- Status: Confirmed & Reserved

IMPORTANT FACILITY GUIDELINES:
${data.facilityInstructions || 'Please arrive 30 minutes prior to your reserved slot. Clean as you go and respect cathedral sacred grounds.'}

Thank you and we look forward to welcoming you to the Immaculate Conception Cathedral of Cubao!

Cathedral Secretariat Office
Phone: (02) 8725-3180 | Email: cubao.cathedral@gmail.com
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">Immaculate Conception Cathedral of Cubao</h1>
      <p style="margin: 0; font-size: 13px; color: #a7f3d0; font-weight: 600;">✓ Official Booking Confirmation</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; margin: 0 0 16px 0;">Dear <strong>${data.applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        Your payment has been successfully verified by our parish accounting team. Your reservation for <strong>${data.facilityName}</strong> is officially confirmed on the Cathedral calendar.
      </p>

      <!-- Confirmed Summary Box -->
      <div style="background-color: #ecfdf5; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #a7f3d0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #047857;">Booking Reference:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #065f46; font-size: 15px;">${data.referenceCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #047857;">Facility:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${data.facilityName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #047857;">Date:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #047857;">Time Slot:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${data.startTime} – ${data.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #047857;">Agreed Amount:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0f172a;">₱${data.agreedAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #047857;">Status:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #059669;">CONFIRMED</td>
          </tr>
        </table>
      </div>

      <!-- Guidelines -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">Facility & Logistical Reminders</h3>
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-line;">
          ${data.facilityInstructions || '• Present this confirmation email or reference code upon arrival at the Parish Office.\n• Ingress is permitted 30 minutes prior to scheduled start time.\n• Please ensure sound and electrical equipment adhere to Cathedral facility rules.'}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0;"><strong>Cathedral Secretariat • Diocese of Cubao</strong></p>
      <p style="margin: 0 0 4px 0;">Lantana St., Brgy. Immaculate Conception, Cubao, Quezon City</p>
      <p style="margin: 0;">Tel: (02) 8725-3180 | Email: cubao.cathedral@gmail.com</p>
    </div>
  </div>
</body>
</html>
`.trim();

  return { html, text, subject };
}

/**
 * Sends administrative operational notification
 */
export async function sendAdminNotification(
  subject: string,
  content: string
): Promise<{ success: boolean }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'cubao.cathedral@gmail.com';
  if (!adminEmail) return { success: true };

  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #0171bb;">[Cathedral Admin Notification]</h2>
      <p style="font-size: 14px; line-height: 1.5; white-space: pre-line;">${content}</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Cathedral Admin] ${subject}`,
    html,
    text: content,
  });
}
