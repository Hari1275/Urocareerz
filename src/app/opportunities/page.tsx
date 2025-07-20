"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunityType: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  location?: string;
  experienceLevel?: string;
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
  mentor: {
    firstName: string;
    lastName: string;
    specialty?: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
  const [user, setUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchUserAndOpportunities = async () => {
      try {
        // Fetch user data
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

        // Fetch opportunities
        const opportunitiesResponse = await fetch("/api/opportunities");
        if (opportunitiesResponse.ok) {
          const data = await opportunitiesResponse.json();
          // Only show approved opportunities for mentees
          const approvedOpportunities =
            data.opportunities?.filter(
              (opp: Opportunity) => opp.status === "APPROVED"
            ) || [];
          setOpportunities(approvedOpportunities);
        }

        // Fetch saved opportunities
        const savedResponse = await fetch("/api/saved-opportunities");
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setSavedOpportunities(
            savedData.savedOpportunities?.map(
              (opp: any) => opp.opportunityId
            ) || []
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOpportunities();
  }, [router]);

  const handleSaveOpportunity = async (opportunityId: string) => {
    try {
      const isSaved = savedOpportunities.includes(opportunityId);
      const method = isSaved ? "DELETE" : "POST";

      const response = await fetch("/api/saved-opportunities", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId }),
      });

      if (response.ok) {
        if (isSaved) {
          setSavedOpportunities((prev) =>
            prev.filter((id) => id !== opportunityId)
          );
        } else {
          setSavedOpportunities((prev) => [...prev, opportunityId]);
        }
      }
    } catch (err) {
      console.error("Failed to save opportunity:", err);
    }
  };

  const handleApply = (opportunityId: string) => {
    router.push(`/opportunities/${opportunityId}/apply`);
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case "entry":
        return "Entry Level";
      case "mid":
        return "Mid-Career";
      case "senior":
        return "Senior Level";
      case "expert":
        return "Expert Level";
      default:
        return level || "Not specified";
    }
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      !locationFilter ||
      (opportunity.location &&
        opportunity.location
          .toLowerCase()
          .includes(locationFilter.toLowerCase()));
    const matchesExperience =
      !experienceFilter ||
      experienceFilter === "all" ||
      opportunity.experienceLevel === experienceFilter;
    const matchesType =
      !typeFilter ||
      typeFilter === "all" ||
      opportunity.opportunityType.name === typeFilter;

    return matchesSearch && matchesLocation && matchesExperience && matchesType;
  });

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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">
                Opportunity Board
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user.firstName || user.email}
              </span>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filters Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Location Filter */}
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />

                {/* Experience Level Filter */}
                <Select
                  value={experienceFilter}
                  onValueChange={setExperienceFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid-Career</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="expert">Expert Level</SelectItem>
                  </SelectContent>
                </Select>

                {/* Opportunity Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opportunity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {opportunityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredOpportunities.length} of {opportunities.length}{" "}
              opportunities
            </p>
          </div>

          {/* Opportunities Grid */}
          {filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No opportunities found matching your criteria.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setLocationFilter("");
                      setExperienceFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <Card
                  key={opportunity.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {opportunity.title}
                        </CardTitle>
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {opportunity.location || "Location not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveOpportunity(opportunity.id)}
                        className="text-gray-500 hover:text-primary-600"
                      >
                        {savedOpportunities.includes(opportunity.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Opportunity Type and Experience */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          const typeInfo = getTypeBadge(
                            opportunity.opportunityType.name
                          );
                          return typeInfo ? (
                            <Badge className={typeInfo.colorClass}>
                              {typeInfo.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {opportunity.opportunityType.name}
                            </Badge>
                          );
                        })()}
                        {opportunity.experienceLevel && (
                          <Badge variant="secondary">
                            {getExperienceLevelLabel(
                              opportunity.experienceLevel
                            )}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {opportunity.description}
                      </p>

                      {/* Mentor Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase className="h-4 w-4" />
                        <span>
                          {opportunity.mentor.firstName}{" "}
                          {opportunity.mentor.lastName}
                          {opportunity.mentor.specialty &&
                            ` • ${opportunity.mentor.specialty}`}
                        </span>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {opportunity.duration && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{opportunity.duration}</span>
                          </div>
                        )}
                        {opportunity.compensation && (
                          <div>
                            <span className="font-medium">Compensation:</span>{" "}
                            {opportunity.compensation}
                          </div>
                        )}
                      </div>

                      {/* Application Deadline */}
                      {opportunity.applicationDeadline && (
                        <div className="text-sm">
                          <span className="font-medium">Deadline:</span>{" "}
                          {new Date(
                            opportunity.applicationDeadline
                          ).toLocaleDateString()}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleApply(opportunity.id)}
                        >
                          Apply Now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/opportunities/${opportunity.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
