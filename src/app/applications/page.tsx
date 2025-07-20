"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import {
  FileText,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ArrowLeft,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  coverLetter: string;
  cvFile?: string;
  cvFileName?: string;
  createdAt: string;
  updatedAt: string;
  opportunity: {
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
    mentor: {
      firstName: string;
      lastName: string;
      specialty?: string;
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

export default function ApplicationsPage() {
  const router = useRouter();
  const { getTypeBadge } = useOpportunityTypes();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

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

        // Verify user is a mentee
        if (userData.user.role !== "MENTEE") {
          setError("Only mentees can view applications");
          setLoading(false);
          return;
        }

        // Fetch applications
        const applicationsResponse = await fetch("/api/applications");
        if (applicationsResponse.ok) {
          const data = await applicationsResponse.json();
          setApplications(data.applications || []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Under Review
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-600"
          >
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Withdrawn
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (
      !confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setWithdrawingId(applicationId);

      const response = await fetch(
        `/api/applications/${applicationId}/withdraw`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to withdraw application");
      }

      // Update the application in the local state
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId ? { ...app, status: "WITHDRAWN" } : app
        )
      );

      // Show success message
      alert("Application withdrawn successfully");
    } catch (error: unknown) {
      console.error("Error withdrawing application:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to withdraw application"
      );
    } finally {
      setWithdrawingId(null);
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
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
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
                My Applications
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
          {/* Header with navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/opportunities")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Opportunities
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              Application History
            </h2>
            <p className="text-gray-600 mt-1">
              Track the status of your submitted applications
            </p>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Applications Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You haven&apos;t submitted any applications yet. Start by
                    browsing available opportunities.
                  </p>
                  <Button onClick={() => router.push("/opportunities")}>
                    Browse Opportunities
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <Card
                  key={application.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {application.opportunity.title}
                        </CardTitle>
                        <div className="mt-2">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {application.opportunity.location ||
                                  "Location not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>
                                {application.opportunity.opportunityType
                                  ? (() => {
                                      const typeInfo = getTypeBadge(
                                        application.opportunity.opportunityType
                                          .name
                                      );
                                      return typeInfo
                                        ? typeInfo.name
                                        : application.opportunity
                                            .opportunityType.name;
                                    })()
                                  : "Unknown Type"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mentor Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">Mentor:</span>
                        <span>
                          {application.opportunity.mentor.firstName}{" "}
                          {application.opportunity.mentor.lastName}
                          {application.opportunity.mentor.specialty &&
                            ` • ${application.opportunity.mentor.specialty}`}
                        </span>
                      </div>

                      {/* Application Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            <span className="font-medium">Applied:</span>{" "}
                            {formatDate(application.createdAt)}
                          </span>
                        </div>
                        {application.updatedAt !== application.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              <span className="font-medium">Updated:</span>{" "}
                              {formatDate(application.updatedAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Cover Letter Preview
                          </h4>
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* CV File */}
                      {application.cvFileName && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">CV:</span>
                          <span>{application.cvFileName}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/opportunities/${application.opportunity.id}`
                            )
                          }
                        >
                          View Opportunity
                        </Button>
                        {application.status === "PENDING" && (
                          <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              handleWithdrawApplication(application.id)
                            }
                            disabled={withdrawingId === application.id}
                          >
                            {withdrawingId === application.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Withdrawing...
                              </>
                            ) : (
                              "Withdraw Application"
                            )}
                          </Button>
                        )}
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
