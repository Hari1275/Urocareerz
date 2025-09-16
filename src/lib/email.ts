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
 * Send application status email using different template IDs based on status
 */
export async function sendApplicationStatusEmail(
  data: EmailApplicationStatusData
): Promise<EmailResponse> {
  try {
    // Create email content
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.email }];

    // Use different template IDs based on status
    if (data.status === "ACCEPTED") {
      sendSmtpEmail.templateId = 2; // Template ID 2 for accepted applications
    } else {
      sendSmtpEmail.templateId = 3; // Template ID 3 for rejected applications
    }

    sendSmtpEmail.params = {
      MENTEE_NAME: data.menteeName,
      OPPORTUNITY_TITLE: data.opportunityTitle,
      STATUS: data.status,
      MENTOR_NAME: data.mentorName || "Mentor",
      APP_NAME: "UroCareerz",
    };

    // Send email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Application status email sent successfully");

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
 * Send application submission notification to mentor
 */
export async function sendApplicationSubmissionEmail(
  data: EmailApplicationSubmissionData
): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: data.email }];
    sendSmtpEmail.subject = `New Application for ${data.opportunityTitle}`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>New Application Received</h1>
          <p>Hello ${data.mentorName},</p>
          <p>You have received a new application for your opportunity: <strong>${data.opportunityTitle}</strong></p>
          <p><strong>Applicant:</strong> ${data.menteeName}</p>
          <p><strong>Applicant Email:</strong> ${data.menteeEmail}</p>
          <p>Please log in to your dashboard to review this application.</p>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Application submission email sent successfully");

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
