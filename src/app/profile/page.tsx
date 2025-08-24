"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProfileForm from "@/components/ProfileForm";
import ProfileDisplay from "@/components/ProfileDisplay";
import ProfileStrength from "@/components/ProfileStrength";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, ArrowLeft } from "lucide-react";

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
      <LoadingPage 
        title="Loading your profile..." 
        description="Fetching your profile information and settings"
        size="lg"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Premium Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </div>
              <div className="text-sm text-slate-500">Error</div>
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-96">
            <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-4">
                  <div className="text-4xl mb-2">⚠️</div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">Error Loading Profile</h3>
                  <p className="text-sm text-slate-600">{error}</p>
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-slate-600 font-medium">
                  Welcome, {user.firstName || user.email}
                </span>
              )}
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Profile Navigation Card */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Back to Dashboard</span>
                    </Link>
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile Settings</span>
                    </button>
                  </nav>
                </CardContent>
              </Card>

              {/* Profile Strength */}
              <ProfileStrength user={user} profile={profile} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  My <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Profile</span>
                </h1>
                <p className="text-slate-600">Manage your professional profile and account settings.</p>
              </div>
              {/* Profile Content */}
              <div className="space-y-6">
                {isEditing ? (
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        Edit Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProfileForm
                        profile={combinedProfile}
                        onSubmit={handleSubmitProfile}
                        isSubmitting={isSubmitting}
                        onCancel={handleCancelEdit}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-500">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            Profile Information
                          </CardTitle>
                          <Button 
                            onClick={() => setIsEditing(true)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                          >
                            Edit Profile
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ProfileDisplay
                          profile={combinedProfile}
                          onEdit={() => setIsEditing(true)}
                        />
                      </CardContent>
                    </Card>

                    {/* Account Security Section */}
                    <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          Account Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-100 hover:bg-white/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">Email Address</h3>
                              <p className="text-sm text-slate-600">{user.email}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" disabled className="bg-white/80 border-slate-200 text-slate-400">
                            Change Email
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-100 hover:bg-white/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">Account Role</h3>
                              <p className="text-sm text-slate-600">
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
                          <Button variant="outline" size="sm" disabled className="bg-white/80 border-slate-200 text-slate-400">
                            Contact Support
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {isEditing ? 'Editing...' : 'Edit Profile'}
                  </Button>
                  <Link href="/dashboard">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/80 border-slate-200 hover:bg-white"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-600 space-y-2">
                    <p>Having trouble with your profile?</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-white/80 border-slate-200 hover:bg-white"
                      onClick={() => window.open('mailto:support@urocareerz.com', '_blank')}
                    >
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
