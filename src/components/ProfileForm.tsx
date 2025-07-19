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
}

export default function ProfileForm({
  profile,
  onSubmit,
  isSubmitting,
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

      setFormData((prev) => ({
        ...prev,
        resume: "",
        resumeFileName: "",
      }));
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

      setFormData((prev) => ({
        ...prev,
        avatar: "",
        avatarFileName: "",
      }));
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            type="avatar"
            onFileSelect={setSelectedAvatarFile}
            onFileUpload={handleAvatarUpload}
            onFileDelete={handleAvatarDelete}
            selectedFile={selectedAvatarFile}
            uploadedFileUrl={getAvatarUrl()}
            uploadedFileName={formData.avatarFileName}
            isUploading={isUploadingAvatar}
            isDeleting={isDeletingAvatar}
            maxSize={2}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Resume Upload Section - Mentee Only */}
      {profile?.user?.role === "MENTEE" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              type="resume"
              onFileSelect={setSelectedResumeFile}
              onFileUpload={handleResumeUpload}
              onFileDelete={handleResumeDelete}
              selectedFile={selectedResumeFile}
              uploadedFileUrl={getResumeUrl()}
              uploadedFileName={formData.resumeFileName}
              isUploading={isUploadingResume}
              isDeleting={isDeletingResume}
              maxSize={5}
              className="max-w-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="City, Country"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentee-specific fields */}
      {profile?.user?.role === "MENTEE" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mentee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="Your educational background"
              />
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleInterestRemove(interest)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e: React.KeyboardEvent) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleInterestAdd())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleInterestAdd}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purposeOfRegistration">
                Purpose of Registration
              </Label>
              <Textarea
                id="purposeOfRegistration"
                value={formData.purposeOfRegistration}
                onChange={(e) =>
                  handleInputChange("purposeOfRegistration", e.target.value)
                }
                placeholder="Why are you seeking mentorship?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentor-specific fields */}
      {profile?.user?.role === "MENTOR" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mentor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) =>
                    handleInputChange("specialty", e.target.value)
                  }
                  placeholder="Your main specialty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subSpecialty">Sub-specialty</Label>
                <Input
                  id="subSpecialty"
                  value={formData.subSpecialty}
                  onChange={(e) =>
                    handleInputChange("subSpecialty", e.target.value)
                  }
                  placeholder="Your sub-specialty (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workplace">Workplace</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="workplace"
                    value={formData.workplace}
                    onChange={(e) =>
                      handleInputChange("workplace", e.target.value)
                    }
                    placeholder="Company/Institution"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("yearsOfExperience", e.target.value)
                    }
                    placeholder="Number of years"
                    className="pl-10"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availabilityStatus">Availability Status</Label>
              <Select
                value={formData.availabilityStatus}
                onValueChange={(value) =>
                  handleInputChange("availabilityStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !!selectedAvatarFile ||
            !!selectedResumeFile ||
            isUploadingAvatar ||
            isUploadingResume
          }
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
