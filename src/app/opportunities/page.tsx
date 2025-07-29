"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useNavigation } from "@/hooks/use-navigation";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  Bookmark,
  BookmarkCheck,
  FileText,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SharedHeader from "@/components/shared-header";

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
  creator: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface OpportunityType {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTypeBadge } = useOpportunityTypes();
  const { navigateToOpportunity, navigateToApply, navigateToDashboard } = useNavigation();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [savedFilter, setSavedFilter] = useState("all");
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userApplications, setUserApplications] = useState<string[]>([]);

  // Handle URL parameters on mount
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'saved') {
      setSavedFilter('saved');
    } else if (filterParam === 'applied') {
      setSavedFilter('applied');
    }
  }, [searchParams]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch opportunities
        const response = await fetch("/api/opportunities");
        if (!response.ok) {
          throw new Error("Failed to fetch opportunities");
        }
        const data = await response.json();
        setOpportunities(data.opportunities || []);

        // Fetch user data
        const userResponse = await fetch("/api/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);

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

          // Fetch opportunity types
          const typesResponse = await fetch("/api/opportunity-types");
          if (typesResponse.ok) {
            const typesData = await typesResponse.json();
            setOpportunityTypes(typesData.opportunityTypes || []);
          }

          // Fetch user applications (only for mentees)
          if (userData.user.role === "MENTEE") {
            const applicationsResponse = await fetch("/api/applications");
            if (applicationsResponse.ok) {
              const applicationsData = await applicationsResponse.json();
              const appliedOpportunityIds = applicationsData.applications?.map(
                (app: any) => app.opportunityId
              ) || [];
              setUserApplications(appliedOpportunityIds);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    navigateToApply(opportunityId);
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
      locationFilter === "all" ||
      (opportunity.location &&
        opportunity.location
          .toLowerCase()
          .includes(locationFilter.toLowerCase()));
    const matchesExperience =
      experienceFilter === "all" ||
      opportunity.experienceLevel === experienceFilter;
    const matchesType =
      typeFilter === "all" ||
      (opportunity.opportunityType &&
        opportunity.opportunityType.name === typeFilter);
    const matchesSaved = 
      savedFilter === "all" || 
      (savedFilter === "saved" && savedOpportunities.includes(opportunity.id)) ||
      (savedFilter === "not_saved" && !savedOpportunities.includes(opportunity.id)) ||
      (savedFilter === "applied" && userApplications.includes(opportunity.id)) ||
      (savedFilter === "not_applied" && !userApplications.includes(opportunity.id));

    return matchesSearch && matchesLocation && matchesExperience && matchesType && matchesSaved;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Unified Header */}
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Browse Opportunities</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opportunities</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing opportunities posted by mentors and take your career to the next level.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State for Data */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-700 text-sm">Loading opportunities...</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="bg-white/80">
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/80">
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
            <Select value={savedFilter} onValueChange={setSavedFilter}>
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Opportunities</SelectItem>
                <SelectItem value="saved">Only Saved</SelectItem>
                <SelectItem value="not_saved">Only Not Saved</SelectItem>
                <SelectItem value="applied">Applied To</SelectItem>
                <SelectItem value="not_applied">Not Applied To</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found {filteredOpportunities.length} opportunity{filteredOpportunities.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="bg-white/70 backdrop-blur-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {opportunity.title}
                    </CardTitle>
                                         <div className="flex items-center gap-2 mb-2">
                       <Badge variant="outline" style={{ borderColor: opportunity.opportunityType.color || undefined, color: opportunity.opportunityType.color || undefined }}>
                         {opportunity.opportunityType.name}
                       </Badge>
                       {opportunity.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {opportunity.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveOpportunity(opportunity.id)}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    {savedOpportunities.includes(opportunity.id) ? (
                      <BookmarkCheck className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {opportunity.description}
                </p>
                <div className="space-y-2">
                  {opportunity.experienceLevel && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Briefcase className="h-4 w-4" />
                      {getExperienceLevelLabel(opportunity.experienceLevel)}
                    </div>
                  )}
                  {opportunity.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {opportunity.duration}
                    </div>
                  )}
                  {opportunity.creator && (
                    <div className="text-sm text-gray-500">
                      Posted by Dr. {opportunity.creator.firstName} {opportunity.creator.lastName}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleApply(opportunity.id)}
                  disabled={userApplications.includes(opportunity.id)}
                  className={
                    userApplications.includes(opportunity.id)
                      ? "w-full bg-green-100 text-green-700 border border-green-300 font-semibold shadow-md cursor-not-allowed"
                      : "w-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
                  }
                >
                  {userApplications.includes(opportunity.id) ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Applied
                    </div>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
                setExperienceFilter("all");
                setTypeFilter("all");
                setSavedFilter("all");
              }}
              variant="outline"
              className="bg-white/70 backdrop-blur-lg border-gray-200 hover:bg-white hover:shadow-lg"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
