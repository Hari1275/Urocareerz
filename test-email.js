// Test script for email functionality
// Run this with: node test-email.js

require('dotenv').config({ path: '.env.local' });
const { sendApplicationStatusEmail } = require('./src/lib/email.ts');

async function testEmails() {
  console.log('Testing application status emails...');
  
  // Test acceptance email
  console.log('\n1. Testing ACCEPTANCE email...');
  const acceptData = {
    email: 'test@example.com', // Replace with your email for testing
    menteeName: 'John Doe',
    opportunityTitle: 'Senior Urology Resident Position',
    status: 'ACCEPTED',
    mentorName: 'Dr. Sarah Johnson'
  };
  
  try {
    const result1 = await sendApplicationStatusEmail(acceptData);
    console.log('Acceptance email result:', result1);
  } catch (error) {
    console.error('Error sending acceptance email:', error);
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test rejection email
  console.log('\n2. Testing REJECTION email...');
  const rejectData = {
    email: 'test@example.com', // Replace with your email for testing
    menteeName: 'Jane Smith',
    opportunityTitle: 'Research Fellowship Opportunity',
    status: 'REJECTED',
    mentorName: 'Dr. Michael Brown'
  };
  
  try {
    const result2 = await sendApplicationStatusEmail(rejectData);
    console.log('Rejection email result:', result2);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
  
  console.log('\nEmail testing completed!');
}

// Check if Brevo API key is configured
if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY not found in environment variables');
  console.log('Please add your Brevo API key to .env.local file');
  process.exit(1);
}

console.log('✅ Brevo API key found');
testEmails().catch(console.error);