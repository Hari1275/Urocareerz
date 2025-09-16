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
  FileText,
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
      <Card className="border-slate-200/60">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Basic Information
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Your personal details and bio
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                First Name
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Read-only
                </span>
              </Label>
              <Input
                id="firstName"
                value={profile?.user?.firstName || ""}
                disabled
                className="h-10 bg-slate-50 border-slate-200 text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                Last Name
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Read-only
                </span>
              </Label>
              <Input
                id="lastName"
                value={profile?.user?.lastName || ""}
                disabled
                className="h-10 bg-slate-50 border-slate-200 text-slate-600"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-slate-700">
              Professional Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Write a brief professional bio..."
              className="min-h-[100px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Visible to other users</span>
              <span>{formData.bio.length}/500</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-slate-700">
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., New York, NY, USA"
                className="h-10 pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {profile?.user?.role === "MENTEE" ? (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Education & Interests
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Your academic background and areas of interest
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Education */}
            <div className="space-y-2">
              <Label htmlFor="education" className="text-sm font-medium text-slate-700">
                Educational Background
              </Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="e.g., MD from Harvard Medical School, BS in Biology from MIT"
                className="h-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purposeOfRegistration" className="text-sm font-medium text-slate-700">
                Goals & Aspirations
              </Label>
              <Textarea
                id="purposeOfRegistration"
                value={formData.purposeOfRegistration}
                onChange={(e) => handleInputChange("purposeOfRegistration", e.target.value)}
                placeholder="What are your career goals? What kind of mentorship are you seeking?"
                className="min-h-[80px] resize-none border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                maxLength={300}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Help mentors understand your goals</span>
                <span>{formData.purposeOfRegistration.length}/300</span>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Areas of Interest
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="e.g., Cardiology, Research, Surgery"
                    className="h-10 flex-1 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInterestAdd();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleInterestAdd}
                    disabled={!newInterest.trim() || formData.interests.length >= 10}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 h-10"
                  >
                    Add
                  </Button>
                </div>
                {formData.interests.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleInterestRemove(interest)}
                            className="ml-2 text-emerald-600 hover:text-emerald-800 font-bold"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {formData.interests.length}/10 interests
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Professional Information
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Your medical expertise and practice details
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Specialty Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-sm font-medium text-slate-700">
                  Primary Specialty
                </Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange("specialty", e.target.value)}
                  placeholder="e.g., Urology, Internal Medicine"
                  className="h-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subSpecialty" className="text-sm font-medium text-slate-700">
                  Sub-specialty
                </Label>
                <Input
                  id="subSpecialty"
                  value={formData.subSpecialty}
                  onChange={(e) => handleInputChange("subSpecialty", e.target.value)}
                  placeholder="e.g., Pediatric Urology, Oncology"
                  className="h-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Workplace and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workplace" className="text-sm font-medium text-slate-700">
                  Current Workplace
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="workplace"
                    value={formData.workplace}
                    onChange={(e) => handleInputChange("workplace", e.target.value)}
                    placeholder="e.g., Mayo Clinic, Johns Hopkins"
                    className="h-10 pl-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-slate-700">
                  Years of Experience
                </Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                  placeholder="e.g., 10"
                  className="h-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Availability Status */}
            <div className="space-y-2">
              <Label htmlFor="availabilityStatus" className="text-sm font-medium text-slate-700">
                Mentorship Availability
              </Label>
              <Select
                value={formData.availabilityStatus}
                onValueChange={(value) => handleInputChange("availabilityStatus", value)}
              >
                <SelectTrigger className="h-10 border-slate-200 focus:border-purple-400">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Available - Actively mentoring
                    </div>
                  </SelectItem>
                  <SelectItem value="Limited">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Limited - Selective mentoring
                    </div>
                  </SelectItem>
                  <SelectItem value="Unavailable">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Unavailable - Not mentoring
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Helps mentees understand your availability
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Files & Documents
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {profile?.user?.role === "MENTEE" 
                  ? "Upload your profile picture and resume"
                  : "Upload your professional profile picture"
                }
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <Label className="text-sm font-medium text-slate-700">
                Profile Picture
              </Label>
            </div>
            
            {getAvatarUrl() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-green-800">Profile Picture Uploaded</p>
                    </div>
                    {formData.avatarFileName && (
                      <p className="text-xs text-green-600 truncate" title={formData.avatarFileName}>
                        {formData.avatarFileName}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const avatarUrl = getAvatarUrl();
                          if (avatarUrl) {
                            window.open(avatarUrl, '_blank');
                          }
                        }}
                        className="text-green-700 border-green-300 hover:bg-green-100 text-xs h-7 px-2"
                      >
                        Preview
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarDelete}
                        disabled={isDeletingAvatar}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs h-7 px-2"
                      >
                        {isDeletingAvatar ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                </div>
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

          {/* Resume Upload (Mentee only) */}
          {profile?.user?.role === "MENTEE" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-purple-100">
                  <FileText className="w-3 h-3 text-purple-600" />
                </div>
                <Label className="text-sm font-medium text-slate-700">
                  Resume/CV
                </Label>
              </div>
              
              {getResumeUrl() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-sm font-medium text-blue-800">Resume Uploaded</p>
                      </div>
                      {formData.resumeFileName && (
                        <p className="text-xs text-blue-600 truncate" title={formData.resumeFileName}>
                          {formData.resumeFileName}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const resumeUrl = getResumeUrl();
                            if (resumeUrl) {
                              window.open(resumeUrl, '_blank');
                            }
                          }}
                          className="text-blue-700 border-blue-300 hover:bg-blue-100 text-xs h-7 px-2"
                        >
                          Preview
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResumeDelete}
                          disabled={isDeletingResume}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs h-7 px-2"
                        >
                          {isDeletingResume ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </div>
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
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 h-10 border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploadingAvatar || isUploadingResume}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Save Profile
            </div>
          )}
        </Button>
      </div>
      
      {/* Progress indicator */}
      {(isUploadingAvatar || isUploadingResume || isSubmitting) && (
        <div className="text-center pt-3">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            {isUploadingAvatar && "Uploading profile picture..."}
            {isUploadingResume && "Uploading resume..."}
            {isSubmitting && "Saving profile changes..."}
          </div>
        </div>
      )}
    </div>
  );
}
