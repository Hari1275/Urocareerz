"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import ProfileDisplay from "@/components/ProfileDisplay";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";

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

// Utility to read a cookie value by name (client-side only)
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
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
      hasPlaceholderAvatar:
        (combined as any).avatar === "https://example.com",
      hasPlaceholderResume:
        (combined as any).resume === "https://example.com",
    });
    return combined;
  }, [profile, user]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Unified Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Loading...</span>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Unified Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Error</span>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium mb-2">Error Loading Profile</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Unified Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {user === null ? (
                <span className="text-sm text-gray-400 font-medium animate-pulse">Loading...</span>
              ) : (
                <span className="text-sm text-gray-600 font-medium">
                  Welcome, <span className="text-gray-900 font-semibold">{user.firstName || user.email || "User"}</span>
                </span>
              )}
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
              <Button variant="outline" onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</Button>
            </div>
            <div className="md:hidden flex items-center justify-end gap-2 w-full">
              <div className="flex flex-row items-center gap-x-1 min-w-0 max-w-xs flex-shrink overflow-hidden">
                {user === null ? (
                  <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
                ) : (
                  <>
                    <span className="text-xs text-gray-500 whitespace-nowrap">Welcome,</span>
                    <span className="text-sm text-gray-900 font-medium truncate max-w-[6rem] ml-1">
                      {user.firstName || user.email || "User"}
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shouldLogout = confirm("Would you like to logout?");
                  if (shouldLogout) handleLogout();
                }}
                className="p-2 text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Profile</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              My <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your professional profile and account settings.
            </p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto">
          {isEditing ? (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                </div>
                <ProfileForm
                  profile={combinedProfile}
                  onSubmit={handleSubmitProfile}
                  isSubmitting={isSubmitting}
                  onCancel={handleCancelEdit}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  </div>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
                  >
                    Edit Profile
                  </Button>
                </div>
                <ProfileDisplay
                  profile={combinedProfile}
                  onEdit={() => setIsEditing(true)}
                />
              </div>

              {/* Account Security Section */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Account Security</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:bg-white/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Email Address</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled className="bg-white/80 border-gray-200 text-gray-400">
                      Change Email
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:bg-white/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Account Role</h3>
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
                    </div>
                    <Button variant="outline" size="sm" disabled className="bg-white/80 border-gray-200 text-gray-400">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
