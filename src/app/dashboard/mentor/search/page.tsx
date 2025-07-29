"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, User, GraduationCap, Target } from "lucide-react";

interface Mentee {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
  profile: {
    bio: string | null;
    location: string | null;
    interests: string[];
    education: string | null;
    purposeOfRegistration: string | null;
    avatar: string | null;
  } | null;
}

export default function MentorSearchPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentees, setMentees] = useState<Mentee[]>([]);

  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [interestsFilter, setInterestsFilter] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch("/api/user");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Verify user is a mentor
        if (userData.user.role !== "MENTOR") {
          router.push("/dashboard");
          return;
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (locationFilter) params.append("location", locationFilter);
      if (interestsFilter) params.append("interests", interestsFilter);

      const response = await fetch(`/api/mentees/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to search mentees");
      }

      const data = await response.json();
      setMentees(data.mentees || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setInterestsFilter("");
    setMentees([]);
  };

  const formatDate = (dateString: string) => {
    // Use a consistent date format to prevent hydration mismatches
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
              <div className="md:hidden">
                <Button variant="outline" size="sm" disabled>
                  Loading...
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
              <div className="h-4 w-32 bg-blue-200 rounded"></div>
            </div>
          </div>
        </main>
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
                <span className="text-sm text-gray-600">Error occurred</span>
              </div>
              <div className="md:hidden">
                <Button variant="outline" size="sm" disabled>
                  Error
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
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
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    fetch("/api/logout", { method: "POST" })
                      .then(() => router.push("/login"));
                  }
                }}
              >
                Logout
              </Button>
            </div>

            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    fetch("/api/logout", { method: "POST" })
                      .then(() => router.push("/login"));
                  }
                }}
              >
                Logout
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
            <Link href="/dashboard/mentor" className="hover:text-blue-600 transition-colors">
              Mentor Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Find Mentees</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Find <span className="bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent">Mentees</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search and connect with mentees who match your expertise and interests
            </p>
          </div>
        </div>

        {/* Search Filters */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Mentees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name or Email
                </label>
                <Input
                  placeholder="Search mentees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="e.g., New York, NY"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests (comma-separated)
                </label>
                <Input
                  placeholder="e.g., urology, research, surgery"
                  value={interestsFilter}
                  onChange={(e) => setInterestsFilter(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {mentees.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Found {mentees.length} mentee{mentees.length !== 1 ? "s" : ""}
            </h2>
          </div>
        )}

        {mentees.length === 0 && !searching && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No mentees found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria to find mentees.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mentee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentees.map((mentee) => (
            <Card key={mentee.id} className="hover:shadow-lg transition-shadow shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {mentee.profile?.avatar ? (
                      <img
                        src={mentee.profile.avatar}
                        alt="Avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {mentee.firstName} {mentee.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{mentee.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mentee.profile?.location && (
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {mentee.profile.location}
                    </span>
                  </div>
                )}

                {mentee.profile?.education && (
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {mentee.profile.education}
                    </span>
                  </div>
                )}

                {mentee.profile?.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {mentee.profile.bio}
                  </p>
                )}

                {mentee.profile?.interests &&
                  mentee.profile.interests.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Interests:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mentee.profile.interests.map((interest, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {mentee.profile?.purposeOfRegistration && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Purpose:
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {mentee.profile.purposeOfRegistration}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Joined: {formatDate(mentee.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
