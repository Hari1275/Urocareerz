import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEdgeToken } from '@/lib/edge-auth';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const { userId, otp } = await req.json();

    // Validate input
    if (!userId || !otp) {
      return NextResponse.json(
        { error: 'User ID and OTP are required' },
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

    // Check if OTP exists and is valid
    if (!user.otpSecret || !user.otpExpiry) {
      return NextResponse.json(
        { error: 'No OTP has been generated for this user' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otpSecret !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Clear OTP after successful verification
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: null,
        otpExpiry: null,
      },
    });

    // Generate JWT token using Edge-compatible function
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = await generateEdgeToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, secret);

    console.log('Verify-OTP: Generated token for user:', user.email, 'role:', user.role);
    console.log('Verify-OTP: Token length:', token.length);

    // Create response with user data
    const response = NextResponse.json({
      message: 'OTP verification successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    // Set token in cookie via response headers
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours for development
    });

    // Set a 'name' cookie for instant display in the frontend header
    response.cookies.set({
      name: 'name',
      value: user.firstName || user.email,
      httpOnly: false,
      secure: false, // Set to true in production
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours for development
    });

    // Also set a non-httpOnly cookie for debugging
    response.cookies.set({
      name: 'token_debug',
      value: token.substring(0, 20) + '...',
      httpOnly: false,
      secure: false, // Set to false for development
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours for development
    });

    // Log the audit event
    await AuditLogger.logUserLogin(
      user.id,
      {
        email: user.email,
        role: user.role,
        loginMethod: 'OTP',
      },
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      req.headers.get("user-agent") || undefined
    );

    console.log('Verify-OTP: Cookie set in response');
    console.log('Verify-OTP: Response cookies:', response.cookies.getAll());

    return response;

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
} 