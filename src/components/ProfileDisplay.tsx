"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Target,
  Award,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

interface ProfileDisplayProps {
  profile: any;
  onEdit: () => void;
}

export default function ProfileDisplay({
  profile,
  onEdit,
}: ProfileDisplayProps) {
  const getAvatarUrl = () => {
    if (profile?.avatar) {
      if (
        profile.avatar === "https://example.com" ||
        profile.avatar === "example.com"
      ) {
        return null;
      }
      // If it's a full URL, use it directly
      if (profile.avatar.startsWith("http")) {
        return profile.avatar;
      }
      // Otherwise, use the download API
      return `/api/download?key=${encodeURIComponent(profile.avatar)}`;
    }
    return null;
  };

  const getResumeUrl = () => {
    if (profile?.resume) {
      return `/api/download?key=${encodeURIComponent(profile.resume)}`;
    }
    return null;
  };

  const handleResumeDownload = async () => {
    const resumeUrl = getResumeUrl();
    if (resumeUrl) {
      try {
        const response = await fetch(resumeUrl, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (
            response.status === 404 &&
            errorData.error === "No file uploaded yet"
          ) {
            alert("No resume has been uploaded yet.");
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
        console.error("Resume download error:", error);
        alert(`Download failed: ${error.message}`);
      }
    }
  };

  const handleAvatarView = async () => {
    const avatarUrl = getAvatarUrl();
    if (avatarUrl) {
      try {
        const response = await fetch(avatarUrl, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (
            response.status === 404 &&
            errorData.error === "No file uploaded yet"
          ) {
            alert("No avatar has been uploaded yet.");
            return;
          }
          throw new Error(errorData.error || "View failed");
        }

        const data = await response.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        } else {
          throw new Error("No download URL received");
        }
      } catch (error: any) {
        console.error("Avatar view error:", error);
        alert(`View failed: ${error.message}`);
      }
    }
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No profile information available.</p>
          <Button onClick={onEdit} className="mt-4">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isMentee = profile.user?.role === "MENTEE";
  const isMentor = profile.user?.role === "MENTOR";

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative">
          {getAvatarUrl() ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={getAvatarUrl()!}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/96x96?text=Profile";
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center border-4 border-white shadow-lg">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {profile?.user?.firstName} {profile?.user?.lastName}
          </h2>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">{profile?.user?.email}</p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <Badge 
              variant="outline" 
              className={profile?.user?.role === "MENTOR" 
                ? "border-purple-200 text-purple-700 bg-purple-50" 
                : "border-green-200 text-green-700 bg-green-50"
              }
            >
              {profile?.user?.role === "MENTOR" ? "Mentor" : "Mentee"}
            </Badge>
            {profile?.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile?.bio && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            About
          </h3>
          <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-100">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Role-specific Information */}
      {profile?.user?.role === "MENTEE" ? (
        <div className="space-y-4">
          {/* Education */}
          {profile?.education && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <GraduationCap className="w-3 h-3 text-green-600" />
                </div>
                Education
              </h3>
              <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-100">
                {profile.education}
              </p>
            </div>
          )}

          {/* Purpose of Registration */}
          {profile?.purposeOfRegistration && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <Target className="w-3 h-3 text-orange-600" />
                </div>
                Purpose of Registration
              </h3>
              <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-100">
                {profile.purposeOfRegistration}
              </p>
            </div>
          )}

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="w-3 h-3 text-purple-600" />
                </div>
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Specialty */}
          {profile?.specialty && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <Award className="w-3 h-3 text-purple-600" />
                </div>
                Specialty
              </h3>
              <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-100">
                {profile.specialty}
                {profile?.subSpecialty && ` - ${profile.subSpecialty}`}
              </p>
            </div>
          )}

          {/* Workplace */}
          {profile?.workplace && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Briefcase className="w-3 h-3 text-indigo-600" />
                </div>
                Workplace
              </h3>
              <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-100">
                {profile.workplace}
              </p>
            </div>
          )}

          {/* Experience and Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.yearsOfExperience && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-yellow-600" />
                  </div>
                  Experience
                </h3>
                <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-100">
                  {profile.yearsOfExperience} years
                </p>
              </div>
            )}

            {profile?.availabilityStatus && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Target className="w-3 h-3 text-green-600" />
                  </div>
                  Availability
                </h3>
                <Badge 
                  variant="outline" 
                  className={
                    profile.availabilityStatus === "Available" 
                      ? "border-green-200 text-green-700 bg-green-50"
                      : profile.availabilityStatus === "Limited"
                      ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                      : "border-red-200 text-red-700 bg-red-50"
                  }
                >
                  {profile.availabilityStatus}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Section */}
      {profile?.user?.role === "MENTEE" && getResumeUrl() && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-3 h-3 text-blue-600" />
            </div>
            Resume/CV
          </h3>
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {profile.resumeFileName || "Resume"}
              </p>
              <p className="text-xs text-gray-500">Click to download</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResumeDownload}
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
