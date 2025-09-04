"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "./FileUpload";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Target,
  Award,
} from "lucide-react";

interface ProfileFormProps {
  profile: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function ProfileForm({
  profile,
  onSubmit,
  isSubmitting,
  onCancel,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    education: "",
    interests: [] as string[],
    purposeOfRegistration: "",
    specialty: "",
    subSpecialty: "",
    workplace: "",
    availabilityStatus: "Available",
    yearsOfExperience: "",
    resume: "",
    resumeFileName: "",
    avatar: "",
    avatarFileName: "",
  });

  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(
    null
  );
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const isInitialized = useRef(false);

  // Reset initialization when component unmounts or profile changes
  useEffect(() => {
    return () => {
      isInitialized.current = false;
    };
  }, []);

  // Also reset when profile ID changes
  useEffect(() => {
    isInitialized.current = false;
  }, [profile?.id]);

  // Helper to check if form is pristine (no uploaded files or filenames)
  const isFormPristine = () => {
    return (
      !formData.avatar &&
      !formData.resume &&
      !formData.avatarFileName &&
      !formData.resumeFileName &&
      !formData.bio &&
      !formData.location &&
      !formData.education &&
      !formData.purposeOfRegistration &&
      !formData.specialty &&
      !formData.subSpecialty &&
      !formData.workplace &&
      !formData.yearsOfExperience &&
      (!formData.interests || formData.interests.length === 0)
    );
  };

  useEffect(() => {
    console.log("ProfileForm: useEffect triggered with profile:", {
      profileId: profile?.id,
      avatar: profile?.avatar,
      resume: profile?.resume,
      isInitialized: isInitialized.current,
    });

    if (profile && !isInitialized.current && isFormPristine()) {
      console.log("ProfileForm: Initializing form data from profile:", {
        avatar: profile.avatar,
        resume: profile.resume,
        avatarFileName: profile.avatarFileName,
        resumeFileName: profile.resumeFileName,
      });

      // Helper function to convert S3 URL to file key
      const convertUrlToFileKey = (url: string | null | undefined): string => {
        if (!url || url === "https://example.com" || url === "example.com") {
          return "";
        }

        // If it's a mock file key, return as is
        if (url.startsWith("local-")) {
          return url;
        }

        // If it's a full S3 URL, extract the file key
        if (url.startsWith("http")) {
          try {
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1); // Remove leading slash
          } catch (error) {
            console.error("Error parsing URL:", error);
            return url; // Return as is if parsing fails
          }
        }

        // If it's already a file key, return as is
        return url;
      };

      setFormData({
        bio: profile.bio || "",
        location: profile.location || "",
        education: profile.education || "",
        interests: profile.interests || [],
        purposeOfRegistration: profile.purposeOfRegistration || "",
        specialty: profile.specialty || "",
        subSpecialty: profile.subSpecialty || "",
        workplace: profile.workplace || "",
        availabilityStatus: profile.availabilityStatus || "Available",
        yearsOfExperience: profile.yearsOfExperience?.toString() || "",
        resume: convertUrlToFileKey(profile.resume),
        resumeFileName: profile.resumeFileName || "",
        avatar: convertUrlToFileKey(profile.avatar),
        avatarFileName: profile.avatarFileName || "",
      });

      isInitialized.current = true;
      console.log("ProfileForm: Form initialized, isInitialized set to true");
    } else if (profile && isInitialized.current) {
      console.log(
        "ProfileForm: Profile changed but form already initialized or not pristine, skipping reset"
      );
    }
  }, [profile?.id]); // Only depend on profile.id, not the entire profile object

  // Auto-upload when a file is selected
  useEffect(() => {
    if (selectedAvatarFile) {
      handleAvatarUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAvatarFile]);

  useEffect(() => {
    if (selectedResumeFile) {
      handleResumeUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResumeFile]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestAdd = () => {
    if (
      newInterest.trim() &&
      !formData.interests.includes(newInterest.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const handleInterestRemove = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleResumeUpload = async () => {
    if (!selectedResumeFile) return;

    console.log("ProfileForm: Starting resume upload with file:", {
      name: selectedResumeFile.name,
      size: selectedResumeFile.size,
      type: selectedResumeFile.type,
    });

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedResumeFile);
      formData.append("fileType", "resume");

      console.log("ProfileForm: Sending resume upload request...");
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log(
        "ProfileForm: Resume upload response status:",
        response.status
      );
      const data = await response.json();
      console.log("ProfileForm: Resume upload response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      console.log("ProfileForm: Resume upload successful, updating form data");
      setFormData((prev) => {
        const newData = {
          ...prev,
          resume: data.fileKey, // Store the file key, not the URL
          resumeFileName: data.fileName,
        };
        console.log(
          "ProfileForm: Updated form data after resume upload:",
          newData
        );
        console.log("ProfileForm: Previous form data was:", prev);
        return newData;
      });

      setSelectedResumeFile(null);
    } catch (error: any) {
      console.error("ProfileForm: Resume upload error:", error);
      alert(error.message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;

    console.log("ProfileForm: Starting avatar upload with file:", {
      name: selectedAvatarFile.name,
      size: selectedAvatarFile.size,
      type: selectedAvatarFile.type,
    });

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedAvatarFile);
      formData.append("fileType", "avatar");

      console.log("ProfileForm: Sending avatar upload request...");
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log(
        "ProfileForm: Avatar upload response status:",
        response.status
      );
      const data = await response.json();
      console.log("ProfileForm: Avatar upload response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      console.log("ProfileForm: Avatar upload successful, updating form data");
      setFormData((prev) => {
        const newData = {
          ...prev,
          avatar: data.fileKey, // Store the file key, not the URL
          avatarFileName: data.fileName,
        };
        console.log(
          "ProfileForm: Updated form data after avatar upload:",
          newData
        );
        console.log("ProfileForm: Previous form data was:", prev);
        return newData;
      });

      setSelectedAvatarFile(null);
    } catch (error: any) {
      console.error("ProfileForm: Avatar upload error:", error);
      alert(error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!formData.resume) return;

    setIsDeletingResume(true);
    try {
      const response = await fetch(
        `/api/upload?key=${encodeURIComponent(formData.resume)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      // Clear all resume-related state
      setFormData((prev) => ({
        ...prev,
        resume: "",
        resumeFileName: "",
      }));
      
      // Reset selected file state to allow re-upload
      setSelectedResumeFile(null);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeletingResume(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!formData.avatar) return;

    setIsDeletingAvatar(true);
    try {
      const response = await fetch(
        `/api/upload?key=${encodeURIComponent(formData.avatar)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      // Clear all avatar-related state
      setFormData((prev) => ({
        ...prev,
        avatar: "",
        avatarFileName: "",
      }));
      
      // Reset selected file state to allow re-upload
      setSelectedAvatarFile(null);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent submission if a file is selected but not uploaded
    if (selectedAvatarFile || selectedResumeFile) {
      alert(
        "Please upload your selected avatar and/or resume before submitting the form."
      );
      return;
    }
    if (isUploadingAvatar || isUploadingResume) {
      alert(
        "Please wait for the file upload to complete before submitting the form."
      );
      return;
    }
    const submitData = {
      ...formData,
      yearsOfExperience: formData.yearsOfExperience
        ? parseInt(formData.yearsOfExperience)
        : null,
    };

    console.log("ProfileForm: Submitting data:", submitData);
    console.log("ProfileForm: Form data state at submit:", formData);
    console.log("ProfileForm: Avatar field value:", formData.avatar);
    console.log("ProfileForm: Resume field value:", formData.resume);
    console.log("ProfileForm: Avatar filename:", formData.avatarFileName);
    console.log("ProfileForm: Resume filename:", formData.resumeFileName);
    console.log("ProfileForm: Submit data avatar:", submitData.avatar);
    console.log("ProfileForm: Submit data resume:", submitData.resume);

    await onSubmit(submitData);
  };

  const getAvatarUrl = () => {
    if (formData.avatar) {
      if (
        formData.avatar === "https://example.com" ||
        formData.avatar === "example.com"
      ) {
        return undefined;
      }
      // If it's a full URL, use it directly
      if (formData.avatar.startsWith("http")) {
        return formData.avatar;
      }
      // Otherwise, use the download API
      return `/api/download?key=${encodeURIComponent(formData.avatar)}`;
    }
    return undefined;
  };

  const getResumeUrl = () => {
    if (formData.resume) {
      // Check if it's a placeholder URL
      if (
        formData.resume === "https://example.com" ||
        formData.resume === "example.com"
      ) {
        return undefined;
      }

      // Check if it's a mock file key (for testing without S3)
      if (formData.resume.startsWith("local-")) {
        console.log("ProfileForm: Mock resume file key detected");
        return undefined; // Don't show preview for mock files
      }

      // If it's already a full S3 URL, convert it to a download URL
      if (formData.resume.startsWith("http")) {
        // Extract the file key from the S3 URL
        const url = new URL(formData.resume);
        const fileKey = url.pathname.substring(1); // Remove leading slash
        return `/api/download?key=${encodeURIComponent(fileKey)}`;
      }

      // If it's a file key, use it directly
      return `/api/download?key=${encodeURIComponent(formData.resume)}`;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              value={profile?.user?.firstName || ""}
              disabled
              className="input-primary h-11 bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              value={profile?.user?.lastName || ""}
              disabled
              className="input-primary h-11 bg-gray-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell us about yourself..."
            className="input-primary min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="location"
            className="text-sm font-medium text-gray-700"
          >
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="City, Country"
              className="input-primary h-11 pl-10"
            />
          </div>
        </div>
      </div>

      {/* Role-specific Information */}
      {profile?.user?.role === "MENTEE" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Education & Interests
            </h3>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="education"
              className="text-sm font-medium text-gray-700"
            >
              Education
            </Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange("education", e.target.value)}
              placeholder="Your educational background"
              className="input-primary h-11"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="purposeOfRegistration"
              className="text-sm font-medium text-gray-700"
            >
              Purpose of Registration
            </Label>
            <Textarea
              id="purposeOfRegistration"
              value={formData.purposeOfRegistration}
              onChange={(e) =>
                handleInputChange("purposeOfRegistration", e.target.value)
              }
              placeholder="Why are you joining our platform?"
              className="input-primary min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Interests
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  className="input-primary h-11 flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleInterestAdd()}
                />
                <Button
                  type="button"
                  onClick={handleInterestAdd}
                  disabled={!newInterest.trim()}
                  className="bg-gradient-to-tr from-green-600 to-blue-600 text-white font-semibold shadow-md hover:from-green-700 hover:to-blue-700 h-11 px-4"
                >
                  Add
                </Button>
              </div>
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleInterestRemove(interest)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Professional Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="specialty"
                className="text-sm font-medium text-gray-700"
              >
                Specialty
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                placeholder="Your specialty"
                className="input-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="subSpecialty"
                className="text-sm font-medium text-gray-700"
              >
                Sub-specialty
              </Label>
              <Input
                id="subSpecialty"
                value={formData.subSpecialty}
                onChange={(e) =>
                  handleInputChange("subSpecialty", e.target.value)
                }
                placeholder="Your sub-specialty"
                className="input-primary h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="workplace"
                className="text-sm font-medium text-gray-700"
              >
                Workplace
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="workplace"
                  value={formData.workplace}
                  onChange={(e) =>
                    handleInputChange("workplace", e.target.value)
                  }
                  placeholder="Hospital/Institution"
                  className="input-primary h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="yearsOfExperience"
                className="text-sm font-medium text-gray-700"
              >
                Years of Experience
              </Label>
              <Input
                id="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  handleInputChange("yearsOfExperience", e.target.value)
                }
                placeholder="Number of years"
                className="input-primary h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="availabilityStatus"
              className="text-sm font-medium text-gray-700"
            >
              Availability Status
            </Label>
            <Select
              value={formData.availabilityStatus}
              onValueChange={(value) =>
                handleInputChange("availabilityStatus", value)
              }
            >
              <SelectTrigger className="input-primary h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Limited">Limited</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Files & Documents
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Avatar Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Profile Picture
            </Label>
            <div className="space-y-3">
              {getAvatarUrl() && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Avatar uploaded
                    </p>
                    <p className="text-xs text-green-600">
                      {formData.avatarFileName || "Profile picture"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarDelete}
                    disabled={isDeletingAvatar}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    {isDeletingAvatar ? "Deleting..." : "Remove"}
                  </Button>
                </div>
              )}
              <FileUpload
                key={`avatar-${formData.avatar || 'empty'}`}
                onFileSelect={setSelectedAvatarFile}
                onFileUpload={handleAvatarUpload}
                selectedFile={selectedAvatarFile}
                uploadedFileUrl={getAvatarUrl()}
                uploadedFileName={formData.avatarFileName}
                isUploading={isUploadingAvatar}
                isDeleting={isDeletingAvatar}
                accept="image/*"
                maxSize={5}
                type="avatar"
              />
            </div>
          </div>

          {/* Resume Upload (Mentee only) */}
          {profile?.user?.role === "MENTEE" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Resume/CV
              </Label>
              <div className="space-y-3">
                {getResumeUrl() && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Resume uploaded
                      </p>
                      <p className="text-xs text-blue-600">
                        {formData.resumeFileName || "Resume document"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResumeDelete}
                      disabled={isDeletingResume}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {isDeletingResume ? "Deleting..." : "Remove"}
                    </Button>
                  </div>
                )}
                <FileUpload
                  key={`resume-${formData.resume || 'empty'}`}
                  onFileSelect={setSelectedResumeFile}
                  onFileUpload={handleResumeUpload}
                  selectedFile={selectedResumeFile}
                  uploadedFileUrl={getResumeUrl()}
                  uploadedFileName={formData.resumeFileName}
                  isUploading={isUploadingResume}
                  isDeleting={isDeletingResume}
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                  type="resume"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 sm:h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600 h-11 sm:h-12"
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
