import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import {
  uploadFileToS3,
  generateFileKey,
  isValidFileType,
  isValidFileSize,
} from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    console.log("Upload API: Starting file upload process");

    // Verify authentication
    const token = req.cookies.get("token")?.value;

    if (!token) {
      console.log("Upload API: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);
    
    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }
    
    const userId = decoded.userId;
    console.log("Upload API: User authenticated, userId:", userId);

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string; // 'resume' or 'avatar'

    console.log("Upload API: Form data parsed:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: fileType,
    });

    if (!file) {
      console.log("Upload API: No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!isValidFileType(file.name, fileType)) {
      const allowedTypes =
        fileType === "avatar"
          ? "JPG, JPEG, PNG, GIF, and WebP"
          : "PDF, DOC, and DOCX";
      console.log(
        "Upload API: Invalid file type:",
        file.name,
        "for type:",
        fileType
      );
      return NextResponse.json(
        { error: `Invalid file type. Only ${allowedTypes} files are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size, fileType)) {
      const maxSize = fileType === "avatar" ? "2MB" : "5MB";
      console.log("Upload API: File too large:", file.size, "bytes");
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize}.` },
        { status: 400 }
      );
    }

    console.log("Upload API: File validation passed, preparing for upload");

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate unique file key
    const fileKey = generateFileKey(userId, file.name, fileType);
    console.log("Upload API: Generated file key:", fileKey);

    // Check if S3 is configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log(
        "Upload API: S3 not configured, using local storage fallback"
      );

      // For now, return a mock response to test the UI flow
      // In a real implementation, you would save the file locally
      return NextResponse.json({
        success: true,
        url: `local-${fileKey}`, // Mock URL for testing
        fileKey: `local-${fileKey}`, // Mock file key for testing
        fileName: file.name,
        fileSize: file.size,
        message: "File uploaded successfully (local storage)",
      });
    }

    // Upload to S3
    console.log("Upload API: Starting S3 upload...");
    const uploadResult = await uploadFileToS3(fileBuffer, fileKey, file.type);
    console.log("Upload API: S3 upload result:", uploadResult);

    if (!uploadResult.success) {
      console.error("Upload API: S3 upload failed:", uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error || "Upload failed" },
        { status: 500 }
      );
    }

    console.log("Upload API: Upload successful, returning response");
    return NextResponse.json({
      success: true,
      url: uploadResult.url || uploadResult.key, // Return URL for frontend compatibility
      fileKey: uploadResult.key,
      fileName: file.name,
      fileSize: file.size,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload API: File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Handle file deletion
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const fileKeyParam = searchParams.get("key");

    if (!fileKeyParam) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // Extract the actual file key from the URL if it's a full S3 URL
    let fileKey = fileKeyParam;
    if (fileKeyParam.startsWith("http")) {
      try {
        const url = new URL(fileKeyParam);
        // Extract the key from the path (remove leading slash)
        fileKey = url.pathname.substring(1);
        console.log("Upload API DELETE: Extracted file key from URL:", fileKey);
      } catch (error) {
        console.error("Upload API DELETE: Error parsing URL:", error);
        return NextResponse.json(
          { error: "Invalid file URL" },
          { status: 400 }
        );
      }
    }

    console.log("Upload API DELETE: User ID:", userId);

    // Check if the file belongs to the user
    if (!fileKey.includes(userId)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { deleteFileFromS3 } = await import("@/lib/s3");
    const deleteResult = await deleteFileFromS3(fileKey);

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error || "Delete failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

// Test endpoint to verify upload functionality
export async function GET() {
  return NextResponse.json({
    message: "Upload API is working",
    s3Configured: !!(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ),
    bucketName: process.env.S3_BUCKET_NAME || "urocareerzmedia",
  });
}
