
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseData {
  plan_name: string;
  plan_price: number;
  billing_months: number;
  total_amount: number;
  organization_name: string;
  buyer_name: string;
  buyer_designation: string;
  buyer_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const purchaseData: PurchaseData = await req.json();
    console.log("Processing purchase:", purchaseData);

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate random password
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const userPassword = generatePassword();

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: purchaseData.buyer_email,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: purchaseData.buyer_name,
        organization_name: purchaseData.organization_name,
        designation: purchaseData.buyer_designation
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    console.log("User created successfully:", authData.user?.id);

    // Create order record
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: authData.user?.id,
        plan_name: purchaseData.plan_name,
        plan_price: purchaseData.plan_price,
        billing_months: purchaseData.billing_months,
        total_amount: purchaseData.total_amount,
        organization_name: purchaseData.organization_name,
        buyer_name: purchaseData.buyer_name,
        buyer_designation: purchaseData.buyer_designation,
        buyer_email: purchaseData.buyer_email,
        status: "completed"
      });

    if (orderError) {
      console.error("Order error:", orderError);
      throw orderError;
    }

    console.log("Order created successfully");

    // Send first email - Congratulations with username/email only
    const firstEmailResponse = await resend.emails.send({
      from: "WorkCurb <noreply@oscardhamala.com.np>",
      to: [purchaseData.buyer_email],
      subject: "🎉 Welcome to WorkCurb! Your Purchase is Complete",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to WorkCurb!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Welcome to WorkCurb</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h2 style="color: #10b981; margin-top: 0;">Purchase Confirmation</h2>
            <p>Dear <strong>${purchaseData.buyer_name}</strong>,</p>
            <p>Thank you for choosing WorkCurb! Your purchase has been successfully processed and your account is now active.</p>
          </div>
          
          <div style="background: white; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #10b981; margin-top: 0;">📋 Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Plan:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${purchaseData.plan_name.charAt(0).toUpperCase() + purchaseData.plan_name.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Billing Period:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${purchaseData.billing_months} month${purchaseData.billing_months > 1 ? 's' : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Organization:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${purchaseData.organization_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Designation:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${purchaseData.buyer_designation}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-size: 18px;"><strong>Total Amount:</strong></td>
                <td style="padding: 12px 0; text-align: right; font-size: 18px; color: #10b981; font-weight: bold;">NPR ${purchaseData.total_amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #d97706; margin-top: 0;">🔐 Your Login Username</h3>
            <p style="margin-bottom: 15px;"><strong>Please save this username securely:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <p style="margin: 5px 0;"><strong>Username/Email:</strong> ${purchaseData.buyer_email}</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #10b981; margin-top: 0;">🚀 What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Wait for your password email (arriving shortly)</li>
              <li>Visit our platform and log in with your credentials</li>
              <li>Complete your organization setup</li>
              <li>Start adding your employees</li>
              <li>Explore all the powerful features of WorkCurb</li>
            </ul>
          </div>
          
          <div style="background: #e0f2fe; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #0369a1; margin-top: 0;">📞 Need Help?</h3>
            <p style="margin-bottom: 10px;">Our support team is here to help you get started:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> support@oscardhamala.com.np</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> Available on our website</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0;">Thank you for choosing WorkCurb!</p>
            <p style="color: #6b7280; margin: 5px 0 0 0;">We're excited to help you streamline your workforce management.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (firstEmailResponse.error) {
      console.error("First email error:", firstEmailResponse.error);
      throw firstEmailResponse.error;
    }

    console.log("First email (congratulations) sent successfully:", firstEmailResponse.data);

    // Send second email - Password only
    const secondEmailResponse = await resend.emails.send({
      from: "WorkCurb <noreply@oscardhamala.com.np>",
      to: [purchaseData.buyer_email],
      subject: "🔐 WorkCurb - Your Login Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your WorkCurb Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Your Login Password</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">WorkCurb Account Access</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <p>Dear <strong>${purchaseData.buyer_name}</strong>,</p>
            <p>Here is your secure login password for accessing your WorkCurb dashboard.</p>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #d97706; margin-top: 0;">🔑 Your Secure Password</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
              <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 16px;">${userPassword}</code></p>
            </div>
            <p style="margin-top: 15px; color: #d97706;"><strong>⚠️ Important:</strong> Please change your password after your first login for enhanced security.</p>
          </div>
          
          <div style="background: #e0f2fe; border: 2px solid #0369a1; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #0369a1; margin-top: 0;">🛡️ Security Recommendations</h3>
            <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
              <li>Change your password immediately after first login</li>
              <li>Use a strong, unique password for your account</li>
              <li>Keep your login credentials secure and private</li>
              <li>Never share your password with anyone</li>
              <li>Log out from shared devices after use</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #10b981; margin-top: 0;">🚀 Ready to Get Started?</h3>
            <p>You now have both your username and password. Visit our platform to access your dashboard and start managing your workforce efficiently.</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0;">Keep this password secure!</p>
            <p style="color: #6b7280; margin: 5px 0 0 0;">If you need assistance, contact our support team.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (secondEmailResponse.error) {
      console.error("Second email error:", secondEmailResponse.error);
      throw secondEmailResponse.error;
    }

    console.log("Second email (password) sent successfully:", secondEmailResponse.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Purchase completed successfully and credentials sent via separate emails",
        user_id: authData.user?.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-purchase-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your purchase" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
