import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Get allowed origins from environment or use default
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
const NotificationSchema = z.object({
  email: z.string().email().max(255),
  firstName: z.string().trim().min(1).max(100),
  status: z.enum(["approved", "rejected"]),
});

type NotificationRequest = z.infer<typeof NotificationSchema>;

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
    // Verify the user is authenticated and is an admin
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

    const userId = claimsData.claims.sub;

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("User is not an admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const parseResult = NotificationSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, firstName, status }: NotificationRequest = parseResult.data;

    console.log(`Sending ${status} notification to ${email}`);

    // Escape user-provided content to prevent HTML injection
    const escapedFirstName = escapeHTML(firstName);

    const isApproved = status === "approved";
    const subject = isApproved
      ? "🎉 Your Taily Sitter Application has been Approved!"
      : "Update on Your Taily Sitter Application";

    const html = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Congratulations, ${escapedFirstName}! 🎉</h1>
          <p>Great news! Your application to become a sitter on Taily has been <strong>approved</strong>.</p>
          <p>You can now:</p>
          <ul>
            <li>Update your profile and availability</li>
            <li>Start receiving booking requests from pet owners</li>
            <li>Build your reputation with reviews</li>
          </ul>
          <p>Log in to your account to get started!</p>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Taily Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #64748b;">Hi ${escapedFirstName},</h1>
          <p>Thank you for your interest in becoming a sitter on Taily.</p>
          <p>After reviewing your application, we've decided not to proceed at this time.</p>
          <p>This could be due to:</p>
          <ul>
            <li>Incomplete profile information</li>
            <li>Insufficient experience details</li>
            <li>Other application criteria</li>
          </ul>
          <p>You're welcome to apply again in the future with an updated application.</p>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Taily Team</p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Taily <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending notification:", error);
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
