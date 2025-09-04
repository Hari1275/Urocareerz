"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useNavigation } from "@/hooks/use-navigation";
import Breadcrumb from "@/components/Breadcrumb";
import {
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  ArrowLeft,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";

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
    creator: {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
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
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
  const { navigateToOpportunity, navigateToOpportunities, navigateToDashboard } = useNavigation();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  
  // Withdraw confirmation dialog state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/user");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            navigateToDashboard();
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
  }, [navigateToDashboard]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigateToDashboard();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Withdrawn
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
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
    setApplicationToWithdraw(applicationId);
    setShowWithdrawDialog(true);
  };

  const confirmWithdrawApplication = async () => {
    if (!applicationToWithdraw) return;
    
    setWithdrawingId(applicationToWithdraw);
    try {
      const response = await fetch(`/api/applications/${applicationToWithdraw}/withdraw`, {
        method: "POST",
      });

      if (response.ok) {
        // Update the application status locally
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationToWithdraw ? { ...app, status: "WITHDRAWN" } : app
          )
        );
        
        // Show success toast
        toast({
          title: "Success!",
          description: "Application withdrawn successfully",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to withdraw application",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      });
    } finally {
      setWithdrawingId(null);
      setShowWithdrawDialog(false);
      setApplicationToWithdraw(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Premium Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium animate-pulse">Loading...</span>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading applications...</p>
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-red-500 font-medium">Error</span>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-red-100 to-red-200 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Applications</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-indigo-600 rounded-xl px-6"
            >
              Try Again
            </Button>
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
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-slate-600 font-medium">
                  Welcome, {user.firstName || user.email}
                </span>
              )}
              <Link href="/profile" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Profile
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors font-medium">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">My Applications</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">My Applications</h1>
          <p className="text-slate-600">
            Track the status of your opportunity applications
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Start applying for opportunities to see your applications here.
              </p>
              <Button
                onClick={navigateToOpportunities}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-indigo-600 rounded-xl px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Opportunities
              </Button>
            </div>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-slate-900 mb-3">
                        {application.opportunity.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 mb-2">
                        {application.opportunity.opportunityType && (
                          <Badge
                            variant="secondary"
                            className="rounded-lg font-medium"
                            style={{
                              backgroundColor: application.opportunity.opportunityType.color ? application.opportunity.opportunityType.color + '20' : undefined,
                              color: application.opportunity.opportunityType.color || undefined,
                              borderColor: application.opportunity.opportunityType.color || undefined
                            }}
                          >
                            {application.opportunity.opportunityType.name}
                          </Badge>
                        )}
                        {application.opportunity.location && (
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            <span>{application.opportunity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {application.opportunity.description}
                  </p>
                  <div className="space-y-2">
                    {application.opportunity.experienceLevel && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span>{application.opportunity.experienceLevel}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Applied on {formatDate(application.createdAt)}</span>
                    </div>
                    {application.opportunity.creator && (
                      <div className="text-sm text-slate-500">
                        <span>Posted by </span>
                        <span className="font-medium text-slate-700">
                          Dr. {application.opportunity.creator.firstName} {application.opportunity.creator.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToOpportunity(application.opportunity.id)}
                      className="bg-white/80 hover:bg-white border-slate-200 rounded-xl transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {application.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdrawApplication(application.id)}
                        disabled={withdrawingId === application.id}
                        className="bg-white/80 hover:bg-red-50 border-slate-200 text-red-600 hover:text-red-700 hover:border-red-200 rounded-xl transition-all duration-200"
                      >
                        {withdrawingId === application.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        ) : (
                          <ArrowLeft className="w-4 h-4 mr-2" />
                        )}
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Withdraw Application Confirmation Dialog */}
      <ConfirmationDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw Application"
        variant="destructive"
        onConfirm={confirmWithdrawApplication}
        loading={withdrawingId !== null}
      />
    </div>
  );
}
