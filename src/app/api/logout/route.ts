import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    // Clear the token cookie via response headers
    response.cookies.delete('token');
    response.cookies.delete('token_debug');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 