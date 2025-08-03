
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CallBookingData {
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
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

    const { fullName, email, company, phone, preferredDate, preferredTime, message }: CallBookingData = await req.json();

    // Insert into Supabase
    const { error: insertError } = await supabase
      .from("call_bookings")
      .insert([{ 
        full_name: fullName, 
        email, 
        company, 
        phone, 
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message 
      }]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error("Failed to save call booking");
    }

    // Format date for display
    const formattedDate = preferredDate ? new Date(preferredDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not specified';

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "WorkCurb <noreply@oscardhamala.com.np>",
      to: [email],
      subject: "Your Call Booking Confirmation - WorkCurb",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Call Booking Confirmed!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for booking a call with WorkCurb. We're excited to discuss your workforce management needs!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Booking Details:</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              ${company ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${company}</p>` : ''}
              ${phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Preferred Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Preferred Time:</strong> ${preferredTime || 'Not specified'}</p>
              ${message ? `
                <p style="margin: 15px 0 5px 0;"><strong>Your Message:</strong></p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                  ${message}
                </div>
              ` : ''}
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">What's Next?</h3>
            <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
              <li>Our team will review your booking request</li>
              <li>We'll confirm the exact time and send you a meeting link</li>
              <li>You'll receive a calendar invite with all the details</li>
              <li>We'll contact you within 24 hours to confirm the appointment</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 10px;">
            <p style="color: #64748b; margin: 0;">Questions about your booking? Feel free to reach out!</p>
            <p style="color: #64748b; margin: 10px 0 0 0;"><strong>Contact:</strong> +977-9869112525 | info.workcurb@gmail.com</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The WorkCurb Team</strong><br>
              IIMS College, Dhobidhara, Kathmandu
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
    console.error("Error in send-booking-email function:", error);
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
