import * as SibApiV3Sdk from "@getbrevo/brevo";

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
);

// Email data interfaces
export interface EmailOTPData {
  email: string;
  otp: string;
  userName?: string;
}

export interface EmailApplicationStatusData {
  email: string;
  menteeName: string;
  opportunityTitle: string;
  status: string;
  mentorName?: string;
}

export interface EmailApplicationSubmissionData {
  email: string;
  mentorName: string;
  menteeName: string;
  opportunityTitle: string;
  menteeEmail: string;
}

export interface EmailOpportunityApprovalData {
  email: string;
  mentorName: string;
  opportunityTitle: string;
  adminName?: string;
}

export interface EmailUserApprovalData {
  email: string;
  userName: string;
  adminName?: string;
}

export interface EmailCustomAnnouncementData {
  email: string;
  userName: string;
  announcementTitle: string;
  announcementContent: string;
  adminName?: string;
}

export interface EmailMenteeOpportunityApprovalData {
  menteeEmail: string;
  menteeName: string;
  opportunityTitle: string;
  opportunityType: string;
  isConverted: boolean;
  adminNotes: string;
  adminName?: string;
}

export interface EmailMenteeOpportunityRejectionData {
  menteeEmail: string;
  menteeName: string;
  opportunityTitle: string;
  opportunityType: string;
  adminNotes: string;
  adminName?: string;
}

export interface EmailMentorMessageData {
  mentorEmail: string;
  mentorName: string;
  menteeEmail: string;
  menteeName: string;
  subject: string;
  message: string;
}

export interface EmailMenteeApplicationConfirmationData {
  menteeEmail: string;
  menteeName: string;
  opportunityTitle: string;
  mentorName: string;
}

export interface EmailMenteeOpportunitySubmissionConfirmationData {
  menteeEmail: string;
  menteeName: string;
  opportunityTitle: string;
  opportunityType: string;
}

export interface EmailAdminOpportunitySubmissionNotificationData {
  adminEmail: string;
  menteeName: string;
  menteeEmail: string;
  opportunityTitle: string;
  opportunityType: string;
  description: string;
  location?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send OTP email using Brevo
 */
export async function sendOTPEmail(data: EmailOTPData): Promise<EmailResponse> {
  try {
    // Create email content
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.templateId = parseInt(process.env.BREVO_TEMPLATE_ID || "1");
    sendSmtpEmail.params = {
      OTP: data.otp,
      USER_NAME: data.userName || "User",
      APP_NAME: "UroCareerz",
      EXPIRY_TIME: "10 minutes",
    };

    // Send email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email (for future use)
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Welcome to UroCareerz!";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Welcome to UroCareerz!</h1>
          <p>Hello ${userName},</p>
          <p>Thank you for joining UroCareerz. We're excited to have you on board!</p>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send application status email with simple, clean HTML templates
 */
export async function sendApplicationStatusEmail(
  data: EmailApplicationStatusData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.sender = { email: "urocareerz@gmail.com", name: "UroCareerz" };

    if (data.status === "ACCEPTED") {
      // ACCEPTED Application Email
      sendSmtpEmail.subject = `✅ Application Accepted - ${data.opportunityTitle}`;
      sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600;">🎉 Congratulations!</h1>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your application has been accepted</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937;">Hi ${data.menteeName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Great news! <strong>${data.mentorName}</strong> has accepted your application for:
        </p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 24px;">
          <h3 style="margin: 0; font-size: 18px; color: #065f46;">${data.opportunityTitle}</h3>
        </div>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          The mentor will be in touch with you soon with next steps.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://urocareerz.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">View Dashboard</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Best regards,<br>
          <strong>The UroCareerz Team</strong>
        </p>
      </div>
    </div>
  </body>
</html>`;
    } else {
      // REJECTED Application Email
      sendSmtpEmail.subject = `Application Update - ${data.opportunityTitle}`;
      sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Application Update</h1>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Regarding your recent application</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937;">Hi ${data.menteeName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Thank you for your interest in the following opportunity:
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <h3 style="margin: 0; font-size: 18px; color: #1f2937;">${data.opportunityTitle}</h3>
        </div>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          After careful consideration, <strong>${data.mentorName}</strong> has decided to move forward with other candidates at this time.
        </p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Don't be discouraged! There are many other opportunities available on the platform.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://urocareerz.com/opportunities" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Browse More Opportunities</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Keep applying and don't give up!<br>
          <strong>The UroCareerz Team</strong>
        </p>
      </div>
    </div>
  </body>
</html>`;
    }

    // Send email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`Application ${data.status.toLowerCase()} email sent successfully to ${data.email}`);

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send application status email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send application confirmation to mentee (simple and clean)
 */
export async function sendMenteeApplicationConfirmationEmail(
  data: EmailMenteeApplicationConfirmationData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.menteeEmail }];
    sendSmtpEmail.sender = { email: "urocareerz@gmail.com", name: "UroCareerz" };
    sendSmtpEmail.subject = `Application Submitted - ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Application Submitted</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 16px 0; font-size: 18px;">Hi ${data.menteeName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Your application has been successfully submitted for:
        </p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #4f46e5; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1e40af;">${data.opportunityTitle}</h3>
          <p style="margin: 0; font-size: 14px; color: #3b82f6;">Mentor: ${data.mentorName}</p>
        </div>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          The mentor will review your application and get back to you soon.
        </p>
        
        <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">
          You can check your application status anytime in your dashboard.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Best regards,<br>
          <strong>The UroCareerz Team</strong>
        </p>
      </div>
    </div>
  </body>
</html>`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Mentee application confirmation email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send mentee application confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send application submission notification to mentor (improved and clean)
 */
export async function sendApplicationSubmissionEmail(
  data: EmailApplicationSubmissionData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.sender = { email: "urocareerz@gmail.com", name: "UroCareerz" };
    sendSmtpEmail.subject = `New Application - ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #10b981; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">New Application Received</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 16px 0; font-size: 18px;">Hi ${data.mentorName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          You have received a new application for your opportunity:
        </p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #065f46;">${data.opportunityTitle}</h3>
          <div style="margin: 0;">
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #059669;"><strong>Applicant:</strong> ${data.menteeName}</p>
            <p style="margin: 0; font-size: 14px; color: #059669;"><strong>Email:</strong> ${data.menteeEmail}</p>
          </div>
        </div>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Please review this application in your dashboard and respond to the candidate.
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://urocareerz.com/dashboard/mentor" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Review Application</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Best regards,<br>
          <strong>The UroCareerz Team</strong>
        </p>
      </div>
    </div>
  </body>
</html>`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Application submission email sent successfully to mentor");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send application submission email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send opportunity approval notification to mentor
 */
export async function sendOpportunityApprovalEmail(
  data: EmailOpportunityApprovalData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.subject = `Opportunity Approved: ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Opportunity Approved!</h1>
          <p>Hello ${data.mentorName},</p>
          <p>Great news! Your opportunity <strong>${data.opportunityTitle}</strong> has been approved and is now live on the platform.</p>
          <p>Mentees can now view and apply for this opportunity.</p>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Opportunity approval email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send opportunity approval email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send user approval notification
 */
export async function sendUserApprovalEmail(
  data: EmailUserApprovalData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.subject = "Welcome to UroCareerz - Account Approved!";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Account Approved!</h1>
          <p>Hello ${data.userName},</p>
          <p>Great news! Your UroCareerz account has been approved by our admin team.</p>
          <p>You can now access all platform features and start connecting with mentors and mentees.</p>
          <p>Welcome to the UroCareerz community!</p>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("User approval email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send user approval email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send custom announcement to all users
 */
export async function sendCustomAnnouncementEmail(
  data: EmailCustomAnnouncementData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.templateId = 2; // Announcement template ID
    sendSmtpEmail.params = {
      userName: data.userName,
      content: data.announcementContent,
      title: data.announcementTitle
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Custom announcement email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send custom announcement email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send mentee opportunity approval notification
 */
export async function sendMenteeOpportunityApprovalEmail(
  data: EmailMenteeOpportunityApprovalData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.menteeEmail }];
    sendSmtpEmail.subject = `Opportunity Submission ${
      data.isConverted ? "Approved & Converted" : "Approved"
    }: ${data.opportunityTitle}`;

    const statusMessage = data.isConverted
      ? "Your opportunity has been approved and converted to a regular opportunity on the platform!"
      : "Your opportunity submission has been approved!";

    const conversionNote = data.isConverted
      ? "<p><strong>Note:</strong> Your opportunity has been converted to a regular opportunity and is now available for all mentees to view and apply.</p>"
      : "";

    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Opportunity Submission Approved!</h1>
          <p>Hello ${data.menteeName},</p>
          <p>${statusMessage}</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Opportunity Details:</h3>
            <p><strong>Title:</strong> ${data.opportunityTitle}</p>
            <p><strong>Type:</strong> ${data.opportunityType}</p>
            ${conversionNote}
            ${
              data.adminNotes
                ? `<p><strong>Admin Notes:</strong> ${data.adminNotes}</p>`
                : ""
            }
          </div>
          <p>Thank you for contributing to the UroCareerz community!</p>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Mentee opportunity approval email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send mentee opportunity approval email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send mentee opportunity rejection notification
 */
export async function sendMenteeOpportunityRejectionEmail(
  data: EmailMenteeOpportunityRejectionData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.menteeEmail }];
    sendSmtpEmail.subject = `Opportunity Submission Rejected: ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Opportunity Submission Rejected!</h1>
          <p>Hello ${data.menteeName},</p>
          <p>We regret to inform you that your opportunity submission for <strong>${data.opportunityTitle}</strong> has been rejected.</p>
          <p>Reason: ${data.adminNotes}</p>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Mentee opportunity rejection email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send mentee opportunity rejection email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send opportunity submission confirmation to mentee (simple and clean)
 */
export async function sendMenteeOpportunitySubmissionConfirmationEmail(
  data: EmailMenteeOpportunitySubmissionConfirmationData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.menteeEmail }];
    sendSmtpEmail.sender = { email: "urocareerz@gmail.com", name: "UroCareerz" };
    sendSmtpEmail.subject = `Opportunity Submitted for Review - ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #059669; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Submission Received</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 16px 0; font-size: 18px;">Hi ${data.menteeName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Thank you for submitting an opportunity to the UroCareerz community:
        </p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 6px; border-left: 4px solid #059669; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #065f46;">${data.opportunityTitle}</h3>
          <p style="margin: 0; font-size: 14px; color: #047857;">Type: ${data.opportunityType}</p>
        </div>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Your submission is now under review by our admin team. You'll receive an update once it's been reviewed.
        </p>
        
        <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">
          You can track the status in your "My Submissions" section.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Thank you for contributing to the community!<br>
          <strong>The UroCareerz Team</strong>
        </p>
      </div>
    </div>
  </body>
</html>`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Mentee opportunity submission confirmation email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send mentee opportunity submission confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send opportunity submission notification to admin (simple and clean)
 */
export async function sendAdminOpportunitySubmissionNotificationEmail(
  data: EmailAdminOpportunitySubmissionNotificationData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.adminEmail }];
    sendSmtpEmail.sender = { email: "urocareerz@gmail.com", name: "UroCareerz" };
    sendSmtpEmail.subject = `New Opportunity Submission - ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #dc2626; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">New Opportunity Submission</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 16px 0; font-size: 18px;">Admin Review Required</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          A new opportunity has been submitted by a mentee and requires your review:
        </p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #991b1b;">${data.opportunityTitle}</h3>
          <div style="margin: 0 0 12px 0;">
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #dc2626;"><strong>Type:</strong> ${data.opportunityType}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #dc2626;"><strong>Submitted by:</strong> ${data.menteeName}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #dc2626;"><strong>Email:</strong> ${data.menteeEmail}</p>
            ${data.location ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #dc2626;"><strong>Location:</strong> ${data.location}</p>` : ""}
          </div>
          <div style="background-color: #ffffff; padding: 12px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.4;"><strong>Description:</strong></p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151; line-height: 1.4;">${data.description}</p>
          </div>
        </div>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #374151;">
          Please log into the admin dashboard to review and approve or reject this submission.
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://urocareerz.com/admin" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Review Submission</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          UroCareerz Admin System<br>
          <strong>Automated Notification</strong>
        </p>
      </div>
    </div>
  </body>
</html>`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Admin opportunity submission notification email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send admin opportunity submission notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send mentor message to mentee
 */
export async function sendMentorMessageEmail(
  data: EmailMentorMessageData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.menteeEmail }];
    sendSmtpEmail.sender = { email: "urocareerz@gmail.com", name: "UroCareerz" };
    sendSmtpEmail.replyTo = { email: data.mentorEmail, name: data.mentorName };
    sendSmtpEmail.subject = data.subject;
    sendSmtpEmail.htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center; border-radius: 6px 6px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">UroCareerz</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px; text-align: left;">
        
        <!-- From Section -->
        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 500;">Message from</p>
          <h2 style="margin: 0; font-size: 18px; color: #1f2937;">${data.mentorName}</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${data.mentorEmail}</p>
        </div>
        
        <!-- Subject -->
        <h3 style="margin: 0 0 20px 0; font-size: 20px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
          ${data.subject}
        </h3>
        
        <!-- Message -->
        <div style="line-height: 1.6; color: #374151; font-size: 16px; white-space: pre-line; margin-bottom: 32px; text-align: left;">${data.message.trim()}</div>
        
        <!-- Reply Instructions -->
        <div style="background-color: #eff6ff; padding: 16px; border-radius: 4px; border-left: 3px solid #4f46e5;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            <strong>Reply directly to this email</strong> to respond to ${data.mentorName}.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 6px 6px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          Sent via UroCareerz mentorship platform
        </p>
      </div>
      
    </div>
  </body>
</html>`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Mentor message email sent successfully");

    return {
      success: true,
      messageId: "sent",
    };
  } catch (error) {
    console.error("Failed to send mentor message email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
