const { sendCustomAnnouncementEmail } = require('../src/lib/email');

async function testEmail() {
  try {
    console.log('🔍 Testing email sending...\n');

    const testEmailData = {
      email: 'arpit@thewebpeople.in', // Use admin email for testing
      userName: 'Test Admin',
      announcementTitle: 'Test Announcement',
      announcementContent: 'This is a test announcement to verify email functionality.',
    };

    console.log('📧 Sending test email to:', testEmailData.email);
    
    const result = await sendCustomAnnouncementEmail(testEmailData);
    
    console.log('📧 Email result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testEmail();
