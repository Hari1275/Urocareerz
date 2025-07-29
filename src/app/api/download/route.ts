import { NextRequest, NextResponse } from 'next/server';
import { verifyEdgeToken } from '@/lib/edge-auth';
import { generatePresignedUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = await verifyEdgeToken(token, secret);
    
    // Get file key from query parameters
    const { searchParams } = new URL(req.url);
    const fileKeyParam = searchParams.get('key');

    if (!fileKeyParam) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // Check if this is a placeholder or invalid URL
    if (fileKeyParam === 'https://example.com' || fileKeyParam === 'example.com') {
      return NextResponse.json(
        { error: 'No file uploaded yet' },
        { status: 404 }
      );
    }

    // Check if this is a mock file key (for testing without S3)
    if (fileKeyParam.startsWith('local-')) {
      return NextResponse.json(
        { error: 'Mock file - S3 not configured for download' },
        { status: 404 }
      );
    }

    // Extract the actual file key from the URL if it's a full S3 URL
    let fileKey = fileKeyParam;
    if (fileKeyParam.startsWith('http')) {
      try {
        const url = new URL(fileKeyParam);
        // Extract the key from the path (remove leading slash)
        fileKey = url.pathname.substring(1);
        console.log('Download API: Extracted file key from URL:', fileKey);
        
        // If the extracted key is empty, it's not a valid S3 URL
        if (!fileKey) {
          console.log('Download API: Empty file key extracted from URL');
          return NextResponse.json(
            { error: 'Invalid file URL - no file key found' },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Download API: Error parsing URL:', error);
        return NextResponse.json(
          { error: 'Invalid file URL' },
          { status: 400 }
        );
      }
    }

    console.log('Download API: Original key param:', fileKeyParam);
    console.log('Download API: Final file key:', fileKey);
    console.log('Download API: User ID:', decoded?.userId);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }

    console.log('Download API: User ID:', decoded.userId);

    // Check if the file belongs to the user
    if (!fileKey.includes(decoded.userId)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Generate presigned URL for download
    const presignedUrl = await generatePresignedUrl(fileKey, 3600); // 1 hour expiry

    return NextResponse.json({
      success: true,
      downloadUrl: presignedUrl,
      message: 'Download URL generated successfully'
    });

  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
} 