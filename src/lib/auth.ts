import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate a random OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  // Bypass TypeScript error with @ts-ignore
  // @ts-ignore
  return jwt.sign(
    payload, 
    secret, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  // Bypass TypeScript error with @ts-ignore
  // @ts-ignore
  return jwt.verify(token, secret) as JWTPayload;
}

// Set JWT token in cookie
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
}

// Get JWT token from cookie
export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

// Clear JWT token cookie
export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

// Authentication middleware
export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get('token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const decoded = verifyToken(token);
      
      // Add user to request
      (req as any).user = decoded;
      
      return await handler(req);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
} 