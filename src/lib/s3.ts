import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "urocareerzmedia";

// Log S3 configuration (without exposing sensitive data)
console.log("S3: Configuration loaded:", {
  region: process.env.AWS_REGION || "us-east-1",
  bucketName: BUCKET_NAME,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
});

// Check if S3 is properly configured
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error(
    "S3: Missing AWS credentials! Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
  );
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

// Generate a unique file key for S3
export function generateFileKey(
  userId: string,
  fileName: string,
  fileType: string
): string {
  const timestamp = Date.now();

  if (fileType === "avatar") {
    return `avatars/${userId}/${timestamp}-${fileName}`;
  } else {
    return `resumes/${userId}/${timestamp}-${fileName}`;
  }
}

// Upload file to S3
export async function uploadFileToS3(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  try {
    console.log("S3: Starting upload with params:", {
      bucket: BUCKET_NAME,
      key,
      contentType,
      bufferSize: fileBuffer.length,
    });

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: "private", // Make files private for security
    });

    console.log("S3: Sending PutObjectCommand...");
    await s3Client.send(command);
    console.log("S3: Upload successful");

    const result = {
      success: true,
      key,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
    };

    console.log("S3: Returning result:", result);
    return result;
  } catch (error) {
    console.error("S3: Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Delete file from S3
export async function deleteFileFromS3(key: string): Promise<UploadResult> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return {
      success: true,
      key,
    };
  } catch (error) {
    console.error("S3 delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

// Generate presigned URL for file download (for private files)
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate download URL");
  }
}

// Validate file type based on file type
export function isValidFileType(fileName: string, fileType: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));

  if (fileType === "avatar") {
    const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return allowedImageExtensions.includes(extension);
  } else {
    const allowedDocumentExtensions = [".pdf", ".doc", ".docx"];
    return allowedDocumentExtensions.includes(extension);
  }
}

// Validate file size based on file type
export function isValidFileSize(fileSize: number, fileType: string): boolean {
  const maxSize = fileType === "avatar" ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for avatars, 5MB for resumes
  return fileSize <= maxSize;
}
