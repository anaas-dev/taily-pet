import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Get allowed origins from environment - same pattern as send-sitter-notification
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] || "";
  
  const allowedOrigins = [
    `https://${projectId}.lovableproject.com`,
    `https://${projectId}.lovable.app`,
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  return allowedOrigins[0] || "";
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(requestOrigin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

// Input validation schema
const BookingNotificationSchema = z.object({
  sitterEmail: z.string().email().max(255),
  sitterFirstName: z.string().trim().min(1).max(100),
  ownerName: z.string().trim().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
  endTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
  notes: z.string().max(1000).optional(),
});

type BookingNotificationRequest = z.infer<typeof BookingNotificationSchema>;

// HTML escaping function to prevent HTML injection
const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Failed to verify token:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const parseResult = BookingNotificationSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { 
      sitterEmail, 
      sitterFirstName, 
      ownerName, 
      date, 
      startTime, 
      endTime, 
      notes 
    }: BookingNotificationRequest = parseResult.data;

    console.log(`Sending booking notification to ${sitterEmail} for booking on ${date}`);

    const formattedDate = new Date(date).toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Escape all user-provided content to prevent HTML injection
    const escapedFirstName = escapeHTML(sitterFirstName);
    const escapedOwnerName = escapeHTML(ownerName);
    const escapedNotes = notes ? escapeHTML(notes) : null;
    const escapedFormattedDate = escapeHTML(formattedDate);
    const escapedStartTime = escapeHTML(startTime);
    const escapedEndTime = escapeHTML(endTime);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">New Booking Request! 🐾</h1>
        <p>Hi ${escapedFirstName},</p>
        <p>Great news! You've received a new booking request from <strong>${escapedOwnerName}</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">Booking Details</h3>
          <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${escapedFormattedDate}</p>
          <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${escapedStartTime} - ${escapedEndTime}</p>
          ${escapedNotes ? `<p style="margin: 8px 0;"><strong>📝 Notes:</strong> ${escapedNotes}</p>` : ''}
        </div>
        
        <p>Log in to your Sitter Dashboard to accept or decline this request.</p>
        
        <p style="margin-top: 30px; color: #666;">Best regards,<br>The Taily Team</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Taily <onboarding@resend.dev>",
      to: [sitterEmail],
      subject: `New Booking Request from ${escapedOwnerName}`,
      html,
    });

    console.log("Booking notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending booking notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
