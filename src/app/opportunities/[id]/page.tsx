"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import {
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  User,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  FileText,
  Building,
  GraduationCap,
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
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
      specialty?: string;
      workplace?: string;
      yearsOfExperience?: number;
    };
  };
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const { getTypeBadge } = useOpportunityTypes();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch opportunity details
        const { id } = await params;
        const opportunityResponse = await fetch(`/api/opportunities/${id}`);

        if (!opportunityResponse.ok) {
          if (opportunityResponse.status === 404) {
            setError("Opportunity not found");
          } else {
            throw new Error("Failed to fetch opportunity details");
          }
        } else {
          const opportunityData = await opportunityResponse.json();
          setOpportunity(opportunityData.opportunity);
        }

        // Check if opportunity is saved
        const savedResponse = await fetch(`/api/saved-opportunities`);
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setIsSaved(savedData.savedOpportunities.some((saved: any) => saved.opportunityId === id));
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, router]);

  const handleSaveOpportunity = async () => {
    if (!opportunity) return;

    setSaving(true);
    try {
      const response = await fetch("/api/saved-opportunities", {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Error saving opportunity:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = () => {
    if (opportunity) {
      router.push(`/opportunities/${opportunity.id}/apply`);
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      BEGINNER: "Beginner",
      INTERMEDIATE: "Intermediate",
      ADVANCED: "Advanced",
      EXPERT: "Expert",
    };
    return labels[level] || level;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/opportunities")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Opportunity Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The opportunity you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.push("/opportunities")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/opportunities")}
            className="mb-6 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>

          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getTypeBadge(opportunity.opportunityType.name) && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-medium bg-green-100 text-green-800 border-green-200"
                      >
                        {getTypeBadge(opportunity.opportunityType.name)?.name || opportunity.opportunityType.name}
                      </Badge>
                    )}
                    {opportunity.status === "PENDING" && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                    {opportunity.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    {opportunity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatDate(opportunity.createdAt)}</span>
                    </div>
                    {opportunity.experienceLevel && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{getExperienceLevelLabel(opportunity.experienceLevel)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 ml-6">
                  <Button
                    variant="outline"
                    onClick={handleSaveOpportunity}
                    disabled={saving}
                    className="hover:bg-blue-50 border-blue-200 text-blue-700"
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {opportunity.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {opportunity.requirements && (
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {opportunity.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {opportunity.benefits && (
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {opportunity.benefits}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.experienceLevel && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Experience Level</p>
                      <p className="text-sm text-gray-600">
                        {getExperienceLevelLabel(opportunity.experienceLevel)}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.duration && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">
                        {opportunity.duration}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.compensation && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-blue-600 font-bold text-lg">₹</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Compensation</p>
                      <p className="text-sm text-gray-600">
                        {opportunity.compensation}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.applicationDeadline && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Application Deadline
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(opportunity.applicationDeadline)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mentor Info */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Posted by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dr. {opportunity.mentor.firstName}{" "}
                      {opportunity.mentor.lastName}
                    </p>
                    {opportunity.mentor.profile?.specialty && (
                      <p className="text-sm text-gray-600">
                        {opportunity.mentor.profile.specialty}
                      </p>
                    )}
                    {opportunity.mentor.profile?.workplace && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Building className="h-3 w-3" />
                        {opportunity.mentor.profile.workplace}
                      </p>
                    )}
                    {opportunity.mentor.profile?.yearsOfExperience && (
                      <p className="text-sm text-gray-600 mt-1">
                        {opportunity.mentor.profile.yearsOfExperience} years experience
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply CTA */}
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Ready to Apply?
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Submit your application for this opportunity
                  </p>
                  <Button onClick={handleApply} className="w-full bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
