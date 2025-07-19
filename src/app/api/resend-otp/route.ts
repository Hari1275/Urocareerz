import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { id: userId },
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
      message: 'OTP resent successfully',
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
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
} 