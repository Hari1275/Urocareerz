# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="your_mongodb_connection_string_here"

# JWT
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="1h"

# Brevo (Sendinblue) Email Service
BREVO_API_KEY="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"
BREVO_TEMPLATE_ID="1"

# AWS S3 Configuration (for file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
S3_BUCKET_NAME="urocareerzmedia"

# Environment
NODE_ENV="development"
```

## AWS S3 Setup

1. **Create an S3 Bucket**: 
   - Create a bucket named `urocareerzmedia` (or update `S3_BUCKET_NAME` to match your bucket name)
   - Set the bucket to private (files will be accessed via presigned URLs)

2. **IAM User Setup**:
   - Create an IAM user with S3 access
   - Attach the `AmazonS3FullAccess` policy (or create a custom policy with minimal permissions)
   - Get the Access Key ID and Secret Access Key

3. **Bucket CORS Configuration** (if needed):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

## Brevo Email Template Setup

1. **Template ID**: The system is configured to use template ID `#1`
2. **Template Variables**: Your Brevo template should include these variables:
   - `{{params.OTP}}` - The 6-digit OTP code
   - `{{params.USER_NAME}}` - User's name or email
   - `{{params.APP_NAME}}` - "UroCareerz"
   - `{{params.EXPIRY_TIME}}` - "10 minutes"

## Development Features

- **OTP Display**: In development mode, OTPs are displayed on screen for testing
- **Email Sending**: Real emails are sent via Brevo API
- **File Uploads**: Files are uploaded to S3 and served via presigned URLs
- **Error Handling**: Comprehensive error handling for email and file upload failures

## Testing the System

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Enter an email address
4. Click "Send Login Code"
5. In development mode, the OTP will be displayed on screen
6. Enter the OTP to complete login
7. Navigate to `/profile` to test file uploads

## Production Considerations

- Set `NODE_ENV="production"` to hide OTP display
- Ensure all environment variables are properly configured
- Test email delivery in production environment
- Monitor Brevo API usage and limits
- Ensure S3 bucket has proper security settings
- Consider using CloudFront for better file delivery performance 