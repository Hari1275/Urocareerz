import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail, isValidEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, role } = await req.json();

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Validate role
    const validRole = role === 'MENTOR' || role === 'MENTEE' || role === 'ADMIN' ? role : 'MENTEE';

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: validRole,
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
      message: 'Registration successful. Please check your email for verification code.',
      userId: user.id,
      emailSent: true,
      messageId: emailResult.messageId
    };

    // Only include OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      response.devMessage = 'OTP displayed for development purposes';
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 