interface NetlifyEvent {
  httpMethod: string;
  body?: string | null;
  headers?: Record<string, string>;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

/**
 * Netlify Serverless Function: Transactional Email Dispatcher via Resend
 * 
 * Invoked securely by client emailService or admin actions.
 * Keeps RESEND_API_KEY protected strictly server-side.
 */
export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Cathedral Secretariat <reservations@cubadiocese.ph>";

  try {
    const payload = JSON.parse(event.body || "{}");
    const { to, subject, html, text } = payload;

    if (!to || !subject || (!html && !text)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: to, subject, and html/text are required." }),
      };
    }

    // In development or when RESEND_API_KEY is not configured, return simulated success log
    if (!resendApiKey) {
      console.log(`[NETLIFY FUNCTION DEV] Email dispatch simulation to ${to}: ${subject}`);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          mode: "mock/development",
          message: "Email queued successfully in development mode (Set RESEND_API_KEY in Netlify environment to send real emails)",
          dispatchedAt: new Date().toISOString(),
          recipient: to,
        }),
      };
    }

    // Call Resend REST API securely from server-side
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || undefined,
        text: text || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to dispatch email via Resend", details: data }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        data,
      }),
    };
  } catch (error: any) {
    console.error("Serverless email error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
    };
  }
};
