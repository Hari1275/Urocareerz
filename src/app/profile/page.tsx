"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProfileForm from "@/components/ProfileForm";
import ProfileDisplay from "@/components/ProfileDisplay";

interface Profile {
  id?: string;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
  resume?: string | null; // S3 key for resume file
  resumeFileName?: string | null; // Original filename
  // Mentee fields
  education?: string | null;
  interests?: string[];
  purposeOfRegistration?: string | null;
  // Mentor fields
  specialty?: string | null;
  subSpecialty?: string | null;
  workplace?: string | null;
  availabilityStatus?: string;
  yearsOfExperience?: number | null;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        console.log("Profile page: Starting to fetch user and profile data");

        // Fetch user data
        const userResponse = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Profile page: User response status:", userResponse.status);

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            console.log("Profile page: Unauthorized, redirecting to login");
            router.push("/login");
            return;
          }
          const errorData = await userResponse.json();
          console.error("Profile page: User fetch error:", errorData);
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const userData = await userResponse.json();
        console.log("Profile page: User data received:", userData);
        setUser(userData.user);

        // Fetch profile data
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(
          "Profile page: Profile response status:",
          profileResponse.status
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log("Profile page: Profile data received:", profileData);
          console.log("Profile page: Profile details:", {
            id: profileData.profile?.id,
            avatar: profileData.profile?.avatar,
            resume: profileData.profile?.resume,
            avatarFileName: profileData.profile?.avatarFileName,
            resumeFileName: profileData.profile?.resumeFileName,
            hasPlaceholderAvatar:
              profileData.profile?.avatar === "https://example.com",
            hasPlaceholderResume:
              profileData.profile?.resume === "https://example.com",
          });
          setProfile(profileData.profile);
        } else if (profileResponse.status === 404) {
          console.log("Profile page: No profile found (404)");
          // Profile doesn't exist yet, which is fine
        } else {
          const errorData = await profileResponse.json();
          console.error("Profile page: Profile fetch error:", errorData);
          throw new Error(errorData.error || "Failed to fetch profile data");
        }
      } catch (err: any) {
        console.error("Profile page: Error in fetchUserAndProfile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const handleSubmitProfile = async (profileData: Profile) => {
    try {
      setIsSubmitting(true);
      const method = profile ? "PUT" : "POST";
      const response = await fetch("/api/profile", {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile(savedProfile.profile);
      setIsEditing(false);
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Memoize the combined profile object to prevent unnecessary re-renders
  const combinedProfile = useMemo(() => {
    if (!profile && !user) return null;
    const combined = { ...profile, user };
    console.log("Profile page: Combined profile object created:", {
      profileId: combined.id,
      avatar: combined.avatar,
      resume: combined.resume,
      avatarFileName: (combined as any).avatarFileName,
      resumeFileName: (combined as any).resumeFileName,
      hasPlaceholderAvatar: combined.avatar === "https://example.com",
      hasPlaceholderResume: combined.resume === "https://example.com",
    });
    return combined;
  }, [profile, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => {
                if (user.role === "MENTOR") {
                  router.push("/dashboard/mentor");
                } else {
                  router.push("/dashboard");
                }
              }}
            >
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <ProfileForm
          profile={combinedProfile}
          onSubmit={handleSubmitProfile}
          isSubmitting={isSubmitting}
        />
      ) : (
        <ProfileDisplay
          profile={combinedProfile}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {/* Account Security Section */}
      {!isEditing && (
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Email Address</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Change Email
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Account Role</h3>
                  <p className="text-sm text-gray-600">
                    {user.role === "MENTOR"
                      ? "Mentor"
                      : user.role === "MENTEE"
                      ? "Mentee"
                      : user.role === "ADMIN"
                      ? "Administrator"
                      : user.role}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
