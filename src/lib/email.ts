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
    sendSmtpEmail.subject = `UroCareerz Announcement: ${data.announcementTitle}`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>${data.announcementTitle}</h1>
          <p>Hello ${data.userName},</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${data.announcementContent}
          </div>
          <p>Best regards,<br>The UroCareerz Team</p>
        </body>
      </html>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Custom announcement email sent successfully:", response);

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
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
