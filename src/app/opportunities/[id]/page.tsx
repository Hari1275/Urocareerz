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
  DollarSign,
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
            return;
          }
          throw new Error("Failed to fetch opportunity details");
        }

        const opportunityData = await opportunityResponse.json();
        setOpportunity(opportunityData.opportunity);

        // Check if opportunity is saved
        const savedResponse = await fetch("/api/saved-opportunities");
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const savedOpportunities = savedData.savedOpportunities || [];
          setIsSaved(
            savedOpportunities.some((saved: any) => saved.opportunityId === id)
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, router]);

  const handleSaveOpportunity = async () => {
    if (!opportunity) return;

    try {
      setSaving(true);
      const method = isSaved ? "DELETE" : "POST";

      const response = await fetch("/api/saved-opportunities", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Failed to save opportunity:", err);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardContent>
              <Button onClick={() => router.push("/opportunities")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The opportunity you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
            </CardContent>
            <CardContent>
              <Button onClick={() => router.push("/opportunities")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/opportunities")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {opportunity.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                {opportunity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>
                    {(() => {
                      const typeInfo = getTypeBadge(
                        opportunity.opportunityType.name
                      );
                      return typeInfo
                        ? typeInfo.name
                        : opportunity.opportunityType.name;
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDate(opportunity.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveOpportunity}
                disabled={saving}
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
              <Button onClick={handleApply} className="btn-primary">
                <FileText className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {opportunity.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {opportunity.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {opportunity.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.experienceLevel && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Experience Level</p>
                      <p className="text-sm text-gray-600">
                        {getExperienceLevelLabel(opportunity.experienceLevel)}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-gray-600">
                        {opportunity.duration}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.compensation && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Compensation</p>
                      <p className="text-sm text-gray-600">
                        {opportunity.compensation}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.applicationDeadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
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
            <Card>
              <CardHeader>
                <CardTitle>Posted by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Dr. {opportunity.mentor.firstName}{" "}
                      {opportunity.mentor.lastName}
                    </p>
                    {opportunity.mentor.profile?.specialty && (
                      <p className="text-sm text-gray-600">
                        {opportunity.mentor.profile.specialty}
                      </p>
                    )}
                    {opportunity.mentor.profile?.workplace && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {opportunity.mentor.profile.workplace}
                      </p>
                    )}
                    {opportunity.mentor.profile?.yearsOfExperience && (
                      <p className="text-sm text-gray-600">
                        {opportunity.mentor.profile.yearsOfExperience} years
                        experience
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply CTA */}
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-primary-900 mb-2">
                    Ready to Apply?
                  </h3>
                  <p className="text-sm text-primary-700 mb-4">
                    Submit your application for this opportunity
                  </p>
                  <Button onClick={handleApply} className="w-full btn-primary">
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
