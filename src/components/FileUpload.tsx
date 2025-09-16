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
    <div className={`space-y-3 ${className}`}>
      {/* Compact File Upload Area */}
      <Card
        className={`p-4 border-2 border-dashed transition-colors cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div
          className="flex items-center justify-center space-x-4 min-h-[80px]"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Upload className="h-5 w-5 text-slate-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700">
                {isImage ? "Upload Profile Picture" : "Upload Resume"}
              </p>
              <p className="text-xs text-slate-500">
                {isImage
                  ? `Click to select image (Max ${maxSize}MB)`
                  : `Click to select file (Max ${maxSize}MB)`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="h-8 px-3 text-xs font-medium whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse
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

      {/* Compact Selected File Display */}
      {selectedFile && (
        <Card className="p-3 border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isImage && previewUrl ? (
                <div className="flex-shrink-0">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-8 w-8 object-cover rounded border"
                  />
                </div>
              ) : (
                <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-900 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-emerald-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  {!autoUpload && " • Ready to upload"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!autoUpload && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onFileUpload}
                  disabled={isUploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-xs font-medium"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="h-7 w-7 p-0 border-emerald-300 hover:bg-emerald-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
