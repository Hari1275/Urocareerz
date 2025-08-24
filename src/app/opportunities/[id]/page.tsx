"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { useNavigation } from "@/hooks/use-navigation";

import { cn } from "@/lib/utils";
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
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
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
  const { getTypeBadge } = useOpportunityTypes();
  const { goBack, navigateToApply } = useNavigation();
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
            goBack();
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
  }, [params, goBack]);

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
      navigateToApply(opportunity.id);
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
              <div className="text-sm text-slate-500">Loading...</div>
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-48 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-6 space-y-6">
                <div className="h-64 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="h-48 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button onClick={goBack} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
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
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-96">
            <Card className="w-full max-w-md bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
              <CardHeader>
                <CardTitle>Opportunity Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  The opportunity you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button onClick={goBack} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goBack} className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Back Navigation Card */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardContent className="p-4">
                  <Button 
                    onClick={goBack}
                    variant="ghost" 
                    className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveOpportunity}
                    disabled={saving}
                    className={cn(
                      "w-full bg-white/80 border-slate-200 hover:bg-white transition-colors",
                      isSaved ? "text-pink-600 border-pink-200" : "text-slate-600"
                    )}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : isSaved ? (
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Opportunity Header */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getTypeBadge(opportunity.opportunityType.name) && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-medium",
                          getTypeBadge(opportunity.opportunityType.name)?.colorClass || 'bg-slate-100 text-slate-800'
                        )}
                      >
                        {getTypeBadge(opportunity.opportunityType.name)?.name || opportunity.opportunityType.name}
                      </Badge>
                    )}
                    {opportunity.status === "PENDING" && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {opportunity.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm">
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
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {opportunity.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {opportunity.requirements && (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {opportunity.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {opportunity.benefits && (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {opportunity.benefits}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Quick Info */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opportunity.experienceLevel && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Experience Level</p>
                        <p className="text-sm text-slate-600">
                          {getExperienceLevelLabel(opportunity.experienceLevel)}
                        </p>
                      </div>
                    </div>
                  )}

                  {opportunity.duration && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Duration</p>
                        <p className="text-sm text-slate-600">
                          {opportunity.duration}
                        </p>
                      </div>
                    </div>
                  )}

                  {opportunity.compensation && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="h-5 w-5 text-blue-600 font-bold text-lg">₹</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Compensation</p>
                        <p className="text-sm text-slate-600">
                          {opportunity.compensation}
                        </p>
                      </div>
                    </div>
                  )}

                  {opportunity.applicationDeadline && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Application Deadline
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatDate(opportunity.applicationDeadline)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mentor Info */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">Posted by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Dr. {opportunity.creator.firstName}{" "}
                        {opportunity.creator.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {opportunity.creator.email}
                      </p>
                      <p className="text-sm text-slate-600">
                        {opportunity.creator.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Apply CTA */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-lg shadow-slate-900/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-bold text-blue-900 mb-2">
                      Ready to Apply?
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Submit your application for this opportunity
                    </p>
                    <Button onClick={handleApply} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md">
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
    </div>
  );
}
