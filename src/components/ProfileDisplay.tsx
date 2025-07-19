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
      {/* Profile Header with Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              {getAvatarUrl() ? (
                <div className="relative">
                  <img
                    src={getAvatarUrl()!}
                    alt="Profile Picture"
                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAvatarView}
                    className="absolute -bottom-2 -right-2 h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {profile.user?.firstName} {profile.user?.lastName}
                </h3>
                <p className="text-gray-600">{profile.user?.email}</p>
                <Badge variant="outline" className="mt-2">
                  {profile.user?.role}
                </Badge>
              </div>

              {profile.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Bio</h4>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <Button onClick={onEdit} variant="outline">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resume Section - Mentee Only */}
      {isMentee && profile.resume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium">{profile.resumeFileName}</p>
                  <p className="text-sm text-gray-500">Resume uploaded</p>
                </div>
              </div>
              <Button onClick={handleResumeDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentee-specific Information */}
      {isMentee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mentee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Education</h4>
                <p className="text-gray-600">{profile.education}</p>
              </div>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.purposeOfRegistration && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Purpose of Registration
                </h4>
                <p className="text-gray-600">{profile.purposeOfRegistration}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mentor-specific Information */}
      {isMentor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mentor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.specialty && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Specialty</h4>
                  <p className="text-gray-600">{profile.specialty}</p>
                </div>
              )}

              {profile.subSpecialty && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Sub-specialty
                  </h4>
                  <p className="text-gray-600">{profile.subSpecialty}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.workplace && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Workplace</h4>
                    <p className="text-gray-600">{profile.workplace}</p>
                  </div>
                </div>
              )}

              {profile.yearsOfExperience && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Experience</h4>
                    <p className="text-gray-600">
                      {profile.yearsOfExperience} years
                    </p>
                  </div>
                </div>
              )}
            </div>

            {profile.availabilityStatus && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Availability Status
                </h4>
                <Badge
                  variant={
                    profile.availabilityStatus === "Available"
                      ? "default"
                      : profile.availabilityStatus === "Busy"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {profile.availabilityStatus}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
