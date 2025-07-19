import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail, isValidEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpSecret: otp,
        otpExpiry,
      },
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail({
      email: user.email,
      otp: otp,
      userName: user.firstName || user.email
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    // For development, also return OTP in response
    const response: any = {
      message: 'OTP sent to your email',
      userId: user.id,
      emailSent: true,
      messageId: emailResult.messageId
    };

    // Only include OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      response.devMessage = 'OTP displayed for development purposes';
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 