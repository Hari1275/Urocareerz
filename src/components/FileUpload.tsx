"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, Image, Download, Trash2 } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onFileUpload: () => Promise<void>;
  onFileDelete?: () => Promise<void>;
  selectedFile: File | null;
  uploadedFileUrl?: string;
  uploadedFileName?: string;
  isUploading: boolean;
  isDeleting?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  type?: "resume" | "avatar";
  className?: string;
  autoUpload?: boolean; // New prop for auto-upload functionality
}

export default function FileUpload({
  onFileSelect,
  onFileUpload,
  onFileDelete,
  selectedFile,
  uploadedFileUrl,
  uploadedFileName,
  isUploading,
  isDeleting = false,
  accept = ".pdf,.doc,.docx",
  maxSize = 5,
  type = "resume",
  className = "",
  autoUpload = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(
    null
  );

  const isImage = type === "avatar";
  const fileIcon = isImage ? Image : FileText;
  const fileTypeText = isImage ? "Image" : "Document";

  // Create preview URL for uploaded images
  const createUploadedPreviewUrl = async (downloadUrl: string) => {
    if (!isImage) return;

    try {
      const response = await fetch(downloadUrl, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.downloadUrl) {
          setUploadedPreviewUrl(data.downloadUrl);
        }
      }
    } catch (error) {
      console.error("Error creating uploaded preview URL:", error);
    }
  };

  // Update uploaded preview URL when uploadedFileUrl changes
  React.useEffect(() => {
    if (uploadedFileUrl && isImage) {
      createUploadedPreviewUrl(uploadedFileUrl);
    } else {
      setUploadedPreviewUrl(null);
    }

    // Cleanup function to revoke object URL
    return () => {
      if (uploadedPreviewUrl && uploadedPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [uploadedFileUrl, isImage]);

  // Clear file input when selectedFile becomes null (after deletion)
  React.useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = "";
      // Also clear preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [selectedFile, previewUrl]);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (isImage) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPEG, PNG, GIF, etc.)");
        return;
      }
    } else {
      const validTypes = accept.split(",").map((type) => type.trim());
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!validTypes.includes(fileExtension)) {
        alert(`Please select a valid file type: ${accept}`);
        return;
      }
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    onFileSelect(file);

    // Create preview for images
    if (isImage && file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async () => {
    if (uploadedFileUrl) {
      try {
        // If it's already a direct URL (not our download API), open it directly
        if (
          uploadedFileUrl.startsWith("http") &&
          !uploadedFileUrl.includes("/api/download")
        ) {
          window.open(uploadedFileUrl, "_blank");
          return;
        }

        // Otherwise, call our download API to get the presigned URL
        const response = await fetch(uploadedFileUrl, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (
            response.status === 404 &&
            errorData.error === "No file uploaded yet"
          ) {
            alert("No file has been uploaded yet.");
            return;
          }
          throw new Error(errorData.error || "Download failed");
        }

        const data = await response.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        } else {
          throw new Error("No download URL received");
        }
      } catch (error: any) {
        console.error("Download error:", error);
        alert(`Download failed: ${error.message}`);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <Card
        className={`p-8 sm:p-12 border-2 border-dashed transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <div
          className="flex flex-col items-center justify-center space-y-6 min-h-[200px]"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center max-w-md">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {isImage ? "Upload Profile Picture" : "Upload Resume"}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {isImage
                  ? "Drag and drop an image here, or click to select"
                  : "Drag and drop a file here, or click to select"}
              </p>
              <p className="text-xs text-gray-400">
                {isImage
                  ? `Max size: ${maxSize}MB (JPEG, PNG, GIF)`
                  : `Max size: ${maxSize}MB (${accept})`}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-8 py-3 text-base font-semibold"
          >
            Select {fileTypeText}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={isImage ? "image/*" : accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </Card>

      {/* Selected File Display */}
      {selectedFile && (
        <Card className="p-4 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isImage && previewUrl ? (
                <div className="flex-shrink-0">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border"
                  />
                </div>
              ) : (
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {!autoUpload && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    ⚠️ File selected but not uploaded yet
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
              {/* Show Upload button again since auto-upload is removed */}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onFileUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 text-xs whitespace-nowrap"
                style={{ display: autoUpload ? 'none' : 'inline-flex' }}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    📤 Upload {isImage ? 'Image' : 'Resume'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="px-2 py-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Additional call-to-action */}
          {!isUploading && !autoUpload && (
            <div className="mt-3 p-2 bg-blue-100 rounded-md">
              <p className="text-xs text-blue-800 font-medium">
                💡 Click "Upload Resume" to upload your file before submitting the application
              </p>
            </div>
          )}
        </Card>
      )}

    </div>
  );
}
