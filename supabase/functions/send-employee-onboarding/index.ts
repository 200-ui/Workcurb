
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingRequest {
  employeeEmail: string;
  employeeName: string;
  companyName: string;
  password: string;
  hrName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Request body received:", requestBody);
    
    const { employeeEmail, employeeName, companyName, password, hrName }: OnboardingRequest = requestBody;

    console.log("Preparing to send email to:", employeeEmail);
    console.log("Company name:", companyName);
    console.log("HR name:", hrName);

    const emailResponse = await resend.emails.send({
      from: "WorkCurb <noreply@oscardhamala.com.np>",
      to: [employeeEmail],
      subject: `Welcome to ${companyName} - Your WorkCurb Login Password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; font-size: 28px; margin: 0;">Welcome to WorkCurb!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${employeeName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Congratulations! ${hrName} from ${companyName} has set up your WorkCurb employee account. 
              You can now access your employee dashboard to view your schedule, attendance, performance, and much more.
            </p>
          </div>

          <div style="background: #fff; border: 2px solid #16a34a; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #16a34a; margin-top: 0;">🔑 Your Login Password:</h3>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 5px; border-left: 4px solid #16a34a;">
              <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 16px;">${password}</code></p>
            </div>
            <p style="color: #e11d48; font-size: 14px; margin-top: 15px;">
              <strong>Important:</strong> Please change your password after your first login for security purposes.
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <h3 style="color: #333; margin-top: 0;">What you can do in your dashboard:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>View and manage your work schedule</li>
              <li>Track your attendance and working hours</li>
              <li>Monitor your performance ratings</li>
              <li>Access assigned training courses</li>
              <li>Submit and track support tickets</li>
              <li>Request time off and manage leave</li>
            </ul>
          </div>

          <div style="background: #e0f2fe; border: 2px solid #0369a1; border-radius: 8px; padding: 20px; margin-top: 25px;">
            <h3 style="color: #0369a1; margin-top: 0;">🛡️ Security Tips:</h3>
            <ul style="color: #0369a1; line-height: 1.6;">
              <li>Change your password immediately after first login</li>
              <li>Use a strong, unique password</li>
              <li>Keep your credentials secure and private</li>
              <li>Never share your password with anyone</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              If you have any questions or need assistance, please contact your HR department.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
              This email was sent by WorkCurb Employee Management System
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending onboarding email:", error);
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
