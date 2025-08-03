
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { name, email, subject, message }: ContactFormData = await req.json();

    // Insert into Supabase
    const { error: insertError } = await supabase
      .from("contact_submissions")
      .insert([{ name, email, subject, message }]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error("Failed to save contact submission");
    }

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "WorkCurb <noreply@oscardhamala.com.np>",
      to: [email],
      subject: "Thank you for contacting WorkCurb!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We've received your message and will get back to you soon.</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Message Details:</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
              ${message}
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 10px;">
            <p style="color: #64748b; margin: 0;">We typically respond within 24 hours during business days.</p>
            <p style="color: #64748b; margin: 10px 0 0 0;"><strong>Business Hours:</strong> Monday - Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The WorkCurb Team</strong><br>
              IIMS College, Dhobidhara, Kathmandu<br>
              Phone: +977-9869112525 | Email: info.workcurb@gmail.com
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
