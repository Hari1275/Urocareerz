import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export interface EmailOTPData {
  email: string;
  otp: string;
  userName?: string;
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
    sendSmtpEmail.templateId = parseInt(process.env.BREVO_TEMPLATE_ID || '1');
    sendSmtpEmail.params = {
      OTP: data.otp,
      USER_NAME: data.userName || 'User',
      APP_NAME: 'UroCareerz',
      EXPIRY_TIME: '10 minutes'
    };

    // Send email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('Email sent successfully:', response);
    
    return {
      success: true,
      messageId: 'sent'
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send welcome email (for future use)
 */
export async function sendWelcomeEmail(email: string, userName: string): Promise<EmailResponse> {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Welcome to UroCareerz!';
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

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    return {
      success: true,
      messageId: 'sent'
    };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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