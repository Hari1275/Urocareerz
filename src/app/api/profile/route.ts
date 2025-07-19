import { NextRequest, NextResponse } from 'next/server';
import { verifyEdgeToken } from '@/lib/edge-auth';
import { prisma } from '@/lib/prisma';

// GET - Retrieve user's profile
export async function GET(req: NextRequest) {
  try {
    console.log('Profile API: Starting profile retrieval');
    console.log('Profile API: JWT_SECRET defined:', !!process.env.JWT_SECRET);
    
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    console.log('Profile API: Token found:', !!token);
    
    if (!token) {
      console.log('Profile API: No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('Profile API: JWT_SECRET is not defined');
      throw new Error('JWT_SECRET is not defined');
    }

    console.log('Profile API: Verifying token...');
    const decoded = await verifyEdgeToken(token, secret);
    console.log('Profile API: Token verified successfully, user ID:', decoded.userId);
    
    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Profile API: Retrieved profile data:', {
      userId: user.id,
      avatar: user.profile?.avatar,
      resume: user.profile?.resume,
      avatarFileName: user.profile?.avatarFileName,
      resumeFileName: user.profile?.resumeFileName
    });

    // Check if profile has placeholder data
    if (user.profile) {
      console.log('Profile API: Profile data details:', {
        id: user.profile.id,
        avatar: user.profile.avatar,
        resume: user.profile.resume,
        avatarFileName: user.profile.avatarFileName,
        resumeFileName: user.profile.resumeFileName,
        hasPlaceholderAvatar: user.profile.avatar === 'https://example.com',
        hasPlaceholderResume: user.profile.resume === 'https://example.com'
      });
    }

    return NextResponse.json({
      user,
      profile: user.profile,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

// POST - Create new profile
export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = await verifyEdgeToken(token, secret);
    
    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: decoded.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Get request body
    const body = await req.json();
    
    // Validate required fields based on user role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Helper function to convert file key to S3 URL
    const convertFileKeyToUrl = (fileKey: string | null | undefined): string | null => {
      console.log('Profile API PUT: Converting file key to URL:', fileKey);
      
      if (!fileKey || fileKey === 'https://example.com' || fileKey === '') {
        console.log('Profile API PUT: File key is empty or placeholder, returning null');
        return null;
      }
      
      // If it's already a full URL, return as is
      if (fileKey.startsWith('http')) {
        console.log('Profile API PUT: File key is already a URL, returning as is');
        return fileKey;
      }
      
      // If it's a mock file key (for testing without S3), return a placeholder URL
      if (fileKey.startsWith('local-')) {
        console.log('Profile API PUT: Mock file key detected, returning placeholder URL');
        return 'https://example.com/mock-file'; // Placeholder for testing
      }
      
      // If it's a file key, convert to S3 URL
      const bucketName = process.env.S3_BUCKET_NAME || 'urocareerzmedia';
      const s3Url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
      console.log('Profile API PUT: Converted file key to S3 URL:', s3Url);
      return s3Url;
    };

    // Prepare profile data
    const profileData: any = {
      userId: decoded.userId,
      bio: body.bio || null,
      location: body.location || null,
      avatar: convertFileKeyToUrl(body.avatar),
      avatarFileName: body.avatarFileName || null,
      resume: convertFileKeyToUrl(body.resume),
      resumeFileName: body.resumeFileName || null,
    };

    // Add role-specific fields
    if (user.role === 'MENTEE') {
      profileData.education = body.education || null;
      profileData.interests = body.interests || [];
      profileData.purposeOfRegistration = body.purposeOfRegistration || null;
    } else if (user.role === 'MENTOR') {
      profileData.specialty = body.specialty || null;
      profileData.subSpecialty = body.subSpecialty || null;
      profileData.workplace = body.workplace || null;
      profileData.availabilityStatus = body.availabilityStatus || 'Available';
      profileData.yearsOfExperience = body.yearsOfExperience || null;
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: profileData,
    });

    return NextResponse.json({
      profile,
      message: 'Profile created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

// PUT - Update existing profile
export async function PUT(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = await verifyEdgeToken(token, secret);
    
    // Get request body
    const body = await req.json();
    console.log('Profile API PUT: Received body:', body);
    console.log('Profile API PUT: Avatar field:', body.avatar);
    console.log('Profile API PUT: Resume field:', body.resume);
    console.log('Profile API PUT: Avatar filename:', body.avatarFileName);
    console.log('Profile API PUT: Resume filename:', body.resumeFileName);
    
    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Helper function to convert file key to S3 URL
    const convertFileKeyToUrl = (fileKey: string | null | undefined): string | null => {
      console.log('Profile API PUT: Converting file key to URL:', fileKey);
      
      if (!fileKey || fileKey === 'https://example.com' || fileKey === '') {
        console.log('Profile API PUT: File key is empty or placeholder, returning null');
        return null;
      }
      
      // If it's already a full URL, return as is
      if (fileKey.startsWith('http')) {
        console.log('Profile API PUT: File key is already a URL, returning as is');
        return fileKey;
      }
      
      // If it's a mock file key (for testing without S3), return a placeholder URL
      if (fileKey.startsWith('local-')) {
        console.log('Profile API PUT: Mock file key detected, returning placeholder URL');
        return 'https://example.com/mock-file'; // Placeholder for testing
      }
      
      // If it's a file key, convert to S3 URL
      const bucketName = process.env.S3_BUCKET_NAME || 'urocareerzmedia';
      const s3Url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
      console.log('Profile API PUT: Converted file key to S3 URL:', s3Url);
      return s3Url;
    };

    // Prepare update data
    const updateData: any = {
      bio: body.bio,
      location: body.location,
      avatar: convertFileKeyToUrl(body.avatar),
      avatarFileName: body.avatarFileName,
      resume: convertFileKeyToUrl(body.resume),
      resumeFileName: body.resumeFileName,
    };
    
    console.log('Profile API PUT: Update data before cleanup:', updateData);

    // Add role-specific fields
    if (user.role === 'MENTEE') {
      updateData.education = body.education;
      updateData.interests = body.interests;
      updateData.purposeOfRegistration = body.purposeOfRegistration;
    } else if (user.role === 'MENTOR') {
      updateData.specialty = body.specialty;
      updateData.subSpecialty = body.subSpecialty;
      updateData.workplace = body.workplace;
      updateData.availabilityStatus = body.availabilityStatus;
      updateData.yearsOfExperience = body.yearsOfExperience;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    console.log('Profile API PUT: Update data after cleanup:', updateData);

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: decoded.userId },
      update: updateData,
      create: {
        userId: decoded.userId,
        ...updateData,
      },
    });
    
    console.log('Profile API PUT: Profile saved to database:', {
      id: profile.id,
      avatar: profile.avatar,
      resume: profile.resume,
      avatarFileName: profile.avatarFileName,
      resumeFileName: profile.resumeFileName
    });

    return NextResponse.json({
      profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 