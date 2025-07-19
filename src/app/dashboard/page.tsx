"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui";

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch profile data
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.profile);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary-200 mb-4"></div>
          <div className="h-4 w-32 bg-primary-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/login")}>Back to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Render different dashboard based on user role
  if (user.role === "ADMIN") {
    // Redirect admins to the dedicated admin dashboard
    router.push("/admin");
    return null;
  } else if (user.role === "MENTOR") {
    // Redirect mentors to the dedicated mentor dashboard
    router.push("/dashboard/mentor");
    return null;
  } else {
    return (
      <MenteeDashboard user={user} profile={profile} onLogout={handleLogout} />
    );
  }
}

function DashboardHeader({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Profile | null;
  onLogout: () => void;
}) {
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

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold gradient-text">UroCareerz</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()!}
                  alt="Profile Picture"
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <span className="text-sm text-gray-500">
                Welcome, {user.firstName || user.email}
              </span>
            </div>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Profile
            </Link>
            <Button
              variant="outline"
              onClick={onLogout}
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileCompletionBanner({
  user,
  profile,
}: {
  user: User;
  profile: Profile | null;
}) {
  if (profile) return null; // Profile is complete

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-amber-800">
                Complete Your Profile
              </h3>
              <p className="text-sm text-amber-700">
                {user.role === "MENTEE"
                  ? "Add your education, interests, and goals to help mentors find you"
                  : "Add your specialty, experience, and availability to help mentees find you"}
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Complete Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MenteeDashboard({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Profile | null;
  onLogout: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <DashboardHeader user={user} profile={profile} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ProfileCompletionBanner user={user} profile={profile} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Discover opportunities and connect with mentors in urology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Opportunity Board Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Browse Opportunities</CardTitle>
                <div className="text-sm text-gray-600">
                  Find fellowships, jobs, and research positions
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-primary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-primary"
                  onClick={() => router.push("/opportunities")}
                >
                  Explore Opportunities
                </Button>
              </CardFooter>
            </Card>

            {/* My Applications Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <div className="text-sm text-gray-600">
                  View and track your applications
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-secondary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-secondary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-secondary"
                  onClick={() => router.push("/applications")}
                >
                  View Applications
                </Button>
              </CardFooter>
            </Card>

            {/* Find Mentors Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Find Mentors</CardTitle>
                <div className="text-sm text-gray-600">
                  Connect with experienced urologists
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-accent-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-accent-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!profile}
                >
                  Browse Mentors
                </Button>
              </CardFooter>
            </Card>

            {/* Resources Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <div className="text-sm text-gray-600">
                  Access educational materials and guides
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-green-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Browse Resources
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Ready to take the next step in your career?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="btn-primary"
                      onClick={() => router.push("/opportunities")}
                    >
                      Browse Opportunities
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/profile")}
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function MentorDashboard({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Profile | null;
  onLogout: () => void;
}) {
  const router = useRouter();
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Busy":
        return "bg-yellow-100 text-yellow-800";
      case "Away":
        return "bg-orange-100 text-orange-800";
      case "Unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <DashboardHeader user={user} profile={profile} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ProfileCompletionBanner user={user} profile={profile} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, Dr. {user.lastName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Guide the next generation of urologists
            </p>
            {profile && (
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  className={getAvailabilityColor(
                    profile.availabilityStatus || "Available"
                  )}
                >
                  {profile.availabilityStatus || "Available"}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manage Mentees Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>My Mentees</CardTitle>
                <div className="text-sm text-gray-600">
                  View and manage your mentees
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-primary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-primary" disabled={!profile}>
                  View Mentees
                </Button>
              </CardFooter>
            </Card>

            {/* Schedule Sessions Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>My Schedule</CardTitle>
                <div className="text-sm text-gray-600">
                  Manage availability and bookings
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-secondary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-secondary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-secondary" disabled={!profile}>
                  Manage Schedule
                </Button>
              </CardFooter>
            </Card>

            {/* Resources Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Share Resources</CardTitle>
                <div className="text-sm text-gray-600">
                  Upload educational materials
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-accent-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-accent-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!profile}
                >
                  Upload Resources
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Ready to help mentees grow?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="btn-primary" disabled={!profile}>
                      View Mentees
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/profile")}
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminDashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <DashboardHeader user={user} profile={null} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage users and platform activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Management Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="text-sm text-gray-600">
                  Manage users, roles, and permissions
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-primary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-primary">Manage Users</Button>
              </CardFooter>
            </Card>

            {/* Analytics Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <div className="text-sm text-gray-600">
                  View usage statistics and metrics
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-secondary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-secondary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-secondary">View Analytics</Button>
              </CardFooter>
            </Card>

            {/* Settings Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <div className="text-sm text-gray-600">
                  Configure system settings and preferences
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-accent-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-accent-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Manage Settings
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Platform Activity
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No recent activity to display.
                  </p>
                  <Button className="mt-4 btn-primary">
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
