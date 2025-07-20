"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
        const response = await fetch("/api/user");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.user.role !== "MENTOR") {
          router.push("/dashboard");
          return;
        }

        setUser(data.user);
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
    return new Date(dateString).toLocaleDateString();
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Find Mentees</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/mentor")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <Card className="mb-8">
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
          <Card>
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
            <Card key={mentee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    {mentee.profile?.avatar ? (
                      <img
                        src={mentee.profile.avatar}
                        alt="Avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary-600" />
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
      </div>
    </div>
  );
}
