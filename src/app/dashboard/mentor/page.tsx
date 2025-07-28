"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/hooks/use-pagination";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";

// Utility to read a cookie value by name (client-side only)
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}


interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location?: string;
  experienceLevel?: string;
  opportunityType: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  status: string;
  mentorId: string;
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  opportunityId: string;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  status: string;
  appliedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
}


export default function MentorDashboardPage() {
  const router = useRouter();
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  
  // New state for view management
  const [currentView, setCurrentView] = useState<'main' | 'opportunities' | 'applications'>('main');

  
  // Modal states for opportunities
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Partial<Opportunity>>({});
  const [savingOpportunity, setSavingOpportunity] = useState(false);

  // Pagination hooks
  const opportunitiesPagination = usePagination({ initialPageSize: 10 });
  const applicationsPagination = usePagination({ initialPageSize: 10 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch("/api/user", {
          credentials: 'include',
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

  // Check for success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    if (success === "opportunity-posted") {
      setSuccessMessage(
        "Opportunity posted successfully! It is now pending approval."
      );
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh opportunities list
      fetchOpportunities();
    }
  }, []);

  // Fetch opportunities when user is loaded
  useEffect(() => {
    if (user) {
      fetchOpportunities();
      fetchApplications();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const response = await fetch("/api/opportunities", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const opportunitiesData = data.opportunities || [];
        setOpportunities(opportunitiesData);
        opportunitiesPagination.actions.setTotalItems(opportunitiesData.length);
      } else {
        console.error("Failed to fetch opportunities");
      }
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await fetch("/api/applications/mentor", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const applicationsData = data.applications || [];
        setApplications(applicationsData);
        applicationsPagination.actions.setTotalItems(applicationsData.length);
      } else {
        console.error("Failed to fetch applications");
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleReviewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowViewModal(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setEditingOpportunity({
      title: opportunity.title,
      description: opportunity.description,
      location: opportunity.location,
      experienceLevel: opportunity.experienceLevel,
      requirements: opportunity.requirements,
      benefits: opportunity.benefits,
      duration: opportunity.duration,
      compensation: opportunity.compensation,
      applicationDeadline: opportunity.applicationDeadline,
      opportunityType: opportunity.opportunityType,
    });
    setShowEditModal(true);
  };

  const handleSaveOpportunity = async () => {
    if (!selectedOpportunity) return;
    
    setSavingOpportunity(true);
    try {
      const response = await fetch(`/api/opportunities/${selectedOpportunity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...editingOpportunity,
          opportunityTypeId: editingOpportunity.opportunityType?.id || selectedOpportunity.opportunityType.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error('Failed to update opportunity');
      }

      // Refresh the opportunities list
      await fetchOpportunities();
      setShowEditModal(false);
      setSelectedOpportunity(null);
      setEditingOpportunity({});
    } catch (error) {
      console.error('Error updating opportunity:', error);
      setError('Failed to update opportunity. Please try again.');
    } finally {
      setSavingOpportunity(false);
    }
  };

  const handleUpdateApplicationStatus = async (
    status: "ACCEPTED" | "REJECTED"
  ) => {
    if (!selectedApplication) return;

    setReviewing(true);
    try {
      const response = await fetch(
        `/api/applications/${selectedApplication.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        // Update the application in the local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id ? { ...app, status } : app
          )
        );
        setShowReviewModal(false);
        setSelectedApplication(null);
        setSuccessMessage(`Application ${status.toLowerCase()} successfully!`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        const errorData = await response.json();
        alert(errorData.error || "Failed to update application status");
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
      alert("Failed to update application status");
    } finally {
      setReviewing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { 
        method: "POST",
        credentials: 'include',
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending Approval</Badge>;
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "CLOSED":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "ACCEPTED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "WITHDRAWN":
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Helper functions for status counts
  const getOpportunityStatusCounts = () => {
    const counts = {
      total: opportunities.length,
      pending: opportunities.filter(opp => opp.status === 'PENDING').length,
      approved: opportunities.filter(opp => opp.status === 'APPROVED').length,
      rejected: opportunities.filter(opp => opp.status === 'REJECTED').length,
      closed: opportunities.filter(opp => opp.status === 'CLOSED').length,
    };
    return counts;
  };

  const getApplicationStatusCounts = () => {
    const counts = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      withdrawn: applications.filter(app => app.status === 'WITHDRAWN').length,
    };
    return counts;
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
                <span className="text-sm text-gray-500 font-medium">Loading...</span>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading mentor dashboard...</p>
            </div>
          </div>
        </div>
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
                <span className="text-sm text-gray-500 font-medium">Error</span>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <Button 
              onClick={() => router.push("/login")} 
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
                  Welcome, <span className="text-gray-900 font-semibold">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email || "User"}</span>
                </span>
              )}
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
              <Button variant="outline" onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</Button>
            </div>

            <div className="md:hidden flex items-center justify-end gap-2 w-full">
              <div className="flex flex-row items-center gap-x-1 min-w-0 max-w-xs flex-shrink overflow-hidden">
                {user === null ? (
                  <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
                ) : (
                  <>
                    <span className="text-xs text-gray-500 whitespace-nowrap">Welcome,</span>
                    <span className="text-sm text-gray-900 font-medium truncate max-w-[6rem] ml-1">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email || "User"}
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shouldLogout = confirm("Would you like to logout?");
                  if (shouldLogout) handleLogout();
                }}
                className="p-2 text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Dr. {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || "User"}</span>!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Guide the next generation of urologists through mentorship and opportunities.
          </p>
        </div>

        {successMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Main Action Cards - Initial View */}
        {currentView === 'main' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12 max-w-5xl mx-auto">
            {/* Post Opportunity Card */}
            <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white text-3xl shadow-lg mb-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Post Opportunity</h3>
              <p className="text-sm text-gray-500 text-center">Share fellowships, jobs, or observerships</p>
              <Button 
                className="w-full mt-2 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" 
                onClick={() => router.push("/dashboard/mentor/post-opportunity")}
              >
                Post Opportunity
              </Button>
            </div>

            {/* My Opportunities Card */}
            <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-white text-3xl shadow-lg mb-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">My Opportunities</h3>
              <p className="text-sm text-gray-500 text-center">Manage your posted opportunities</p>
              <Button 
                className="w-full mt-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-semibold shadow-md hover:from-emerald-700 hover:to-teal-600" 
                onClick={() => setCurrentView('opportunities')}
              >
                View Opportunities
              </Button>
            </div>

            {/* Applications Card */}
            <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 text-white text-3xl shadow-lg mb-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Applications</h3>
              <p className="text-sm text-gray-500 text-center">View applications from mentees</p>
              <Button 
                className="w-full mt-2 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600" 
                onClick={() => setCurrentView('applications')}
              >
                View Applications
              </Button>
            </div>

            {/* Search Mentees Card */}
            <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 text-white text-3xl shadow-lg mb-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Find Mentees</h3>
              <p className="text-sm text-gray-500 text-center">Search mentees by interests and location</p>
              <Button className="w-full mt-2 bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600" onClick={() => router.push("/dashboard/mentor/search")}>
                Search Mentees
              </Button>
            </div>
          </div>
        )}

        {/* Opportunities Detail View */}
        {currentView === 'opportunities' && (
          <div className="mb-8 sm:mb-10 lg:mb-12">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('main')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                My <span className="bg-gradient-to-tr from-emerald-600 to-teal-500 bg-clip-text text-transparent">Opportunities</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track opportunities you've posted and manage their status.
              </p>
            </div>

            {/* Action Button */}
            <div className="text-center mb-8">
              <Button 
                className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600 px-8 py-3"
                onClick={() => router.push("/dashboard/mentor/post-opportunity")}
              >
                Post New Opportunity
              </Button>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(() => {
                const counts = getOpportunityStatusCounts();
                return [
                  { title: "Total Opportunities", count: counts.total, color: "text-blue-600", icon: "📄" },
                  { title: "Pending Review", count: counts.pending, color: "text-yellow-600", icon: "⏳" },
                  { title: "Approved", count: counts.approved, color: "text-green-600", icon: "✅" },
                  { title: "Rejected", count: counts.rejected, color: "text-red-600", icon: "❌" },
                ].map((item, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.count}</div>
                    <div className="text-sm text-gray-600">{item.title}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Applications Detail View */}
        {currentView === 'applications' && (
          <div className="mb-8 sm:mb-10 lg:mb-12">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('main')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Applications from <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Mentees</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Review and manage applications from mentees for your opportunities.
              </p>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(() => {
                const counts = getApplicationStatusCounts();
                return [
                  { title: "Total Applications", count: counts.total, color: "text-blue-600", icon: "📋" },
                  { title: "Pending Review", count: counts.pending, color: "text-yellow-600", icon: "⏳" },
                  { title: "Accepted", count: counts.accepted, color: "text-green-600", icon: "✅" },
                  { title: "Rejected", count: counts.rejected, color: "text-red-600", icon: "❌" },
                ].map((item, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.count}</div>
                    <div className="text-sm text-gray-600">{item.title}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* My Opportunities Section with Cards - Only show in opportunities view */}
        {currentView === 'opportunities' && (
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Opportunities</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show:</span>
                  <Select
                    value={opportunitiesPagination.state.pageSize.toString()}
                    onValueChange={(value) => opportunitiesPagination.actions.setPageSize(parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                </div>
                <Button onClick={fetchOpportunities} variant="outline" disabled={loadingOpportunities} className="w-full sm:w-auto">
                  {loadingOpportunities ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            {loadingOpportunities ? (
              <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading opportunities...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No opportunities posted yet</h3>
                <p className="text-gray-600 mb-4">Start by posting your first opportunity to help mentees.</p>
                <Button 
                  className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" 
                  onClick={() => router.push("/dashboard/mentor/post-opportunity")}
                >
                  Post Your First Opportunity
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {opportunitiesPagination.state.startIndex + 1} to {opportunitiesPagination.state.endIndex} of {opportunitiesPagination.state.totalItems} opportunities
                </div>
                
                {/* Table Layout */}
                <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Posted Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opportunitiesPagination.paginateData(opportunities).map((opportunity) => (
                        <TableRow key={opportunity.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{opportunity.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2">{opportunity.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const typeBadge = getTypeBadge(opportunity.opportunityType.name);
                              return typeBadge ? (
                                <Badge variant="outline" className={typeBadge.colorClass}>
                                  {typeBadge.name}
                                </Badge>
                              ) : (
                                <Badge variant="outline">{opportunity.opportunityType.name}</Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(opportunity.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">{opportunity.location || "Remote"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(opportunity.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOpportunity(opportunity)}
                                className="text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditOpportunity(opportunity)}
                                className="text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {opportunitiesPagination.state.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={opportunitiesPagination.actions.previousPage}
                            className={!opportunitiesPagination.state.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {opportunitiesPagination.getPageNumbers().map((pageNumber, index) => (
                          <PaginationItem key={index}>
                            {pageNumber === -1 ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => opportunitiesPagination.actions.setCurrentPage(pageNumber)}
                                isActive={pageNumber === opportunitiesPagination.state.currentPage}
                                className="cursor-pointer min-w-[2rem] sm:min-w-[2.5rem]"
                              >
                                {pageNumber}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={opportunitiesPagination.actions.nextPage}
                            className={!opportunitiesPagination.state.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                              )}
            </>
          )}
        </div>
        )}

        {/* Applications Section with Cards - Only show in applications view */}
        {currentView === 'applications' && (
          <div id="applications-section" className="mt-8 sm:mt-10 lg:mt-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Applications from Mentees</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show:</span>
                <Select
                  value={applicationsPagination.state.pageSize.toString()}
                  onValueChange={(value) => applicationsPagination.actions.setPageSize(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>
              <Button onClick={fetchApplications} variant="outline" disabled={loadingApplications} className="w-full sm:w-auto">
                {loadingApplications ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          
          {loadingApplications ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No applications received yet</h3>
              <p className="text-gray-600 mb-4">Applications will appear here when mentees apply to your opportunities.</p>
              <Button 
                className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" 
                onClick={() => router.push("/dashboard/mentor/post-opportunity")}
              >
                Post an Opportunity
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {applicationsPagination.state.startIndex + 1} to {applicationsPagination.state.endIndex} of {applicationsPagination.state.totalItems} applications
              </div>
              
              {/* Table Layout */}
              <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicationsPagination.paginateData(applications).map((application) => {
                      const opportunity = opportunities.find((opp) => opp.id === application.opportunityId);
                      return (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{application.menteeName}</div>
                              <div className="text-sm text-gray-500">{application.menteeEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900 truncate">{opportunity?.title || "Unknown Opportunity"}</div>
                              {opportunity?.location && (
                                <div className="text-sm text-gray-500">{opportunity.location}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getApplicationStatusBadge(application.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {application.resumeUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(application.resumeUrl, "_blank")}
                                  className="text-xs"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Resume
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewApplication(application)}
                                className="text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Review
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {applicationsPagination.state.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={applicationsPagination.actions.previousPage}
                          className={!applicationsPagination.state.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {applicationsPagination.getPageNumbers().map((pageNumber, index) => (
                        <PaginationItem key={index}>
                          {pageNumber === -1 ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => applicationsPagination.actions.setCurrentPage(pageNumber)}
                              isActive={pageNumber === applicationsPagination.state.currentPage}
                              className="cursor-pointer min-w-[2rem] sm:min-w-[2.5rem]"
                            >
                              {pageNumber}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={applicationsPagination.actions.nextPage}
                          className={!applicationsPagination.state.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Quick Actions - integrated into main flow */}
        <div className="mt-8 px-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-lg font-semibold text-gray-800 text-center sm:text-left whitespace-nowrap">Ready to take action?</span>
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end">
                    <Button
                  onClick={() => router.push("/dashboard/mentor/post-opportunity")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      Post Opportunity
                    </Button>
                    <Button
                  onClick={() => router.push("/dashboard/mentor/search")}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Search Mentees
                    </Button>
                  </div>
                </div>
          </div>
        </div>

        {/* Opportunity View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {selectedOpportunity?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedOpportunity && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Type:</span>
                    {(() => {
                      const typeBadge = getTypeBadge(selectedOpportunity.opportunityType.name);
                      return typeBadge ? (
                        <Badge variant="outline" className={typeBadge.colorClass}>
                          {typeBadge.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{selectedOpportunity.opportunityType.name}</Badge>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    {getStatusBadge(selectedOpportunity.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Location:</span>
                    <span className="text-sm text-gray-600">{selectedOpportunity.location || "Remote"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Experience Level:</span>
                    <span className="text-sm text-gray-600">{selectedOpportunity.experienceLevel || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Duration:</span>
                    <span className="text-sm text-gray-600">{selectedOpportunity.duration || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Compensation:</span>
                    <span className="text-sm text-gray-600">{selectedOpportunity.compensation || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Posted:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedOpportunity.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedOpportunity.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {selectedOpportunity.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Application Deadline:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(selectedOpportunity.applicationDeadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedOpportunity.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedOpportunity.requirements}</p>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {selectedOpportunity.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedOpportunity.benefits}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditOpportunity(selectedOpportunity);
                    }}
                    className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
                  >
                    Edit Opportunity
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Opportunity Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Edit Opportunity
              </DialogTitle>
            </DialogHeader>
            {selectedOpportunity && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</Label>
                    <Input
                      id="title"
                      value={editingOpportunity.title || ''}
                      onChange={(e) => setEditingOpportunity(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                      placeholder="Enter opportunity title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="opportunityType" className="text-sm font-medium text-gray-700">Type *</Label>
                    <Select
                      value={editingOpportunity.opportunityType?.id || selectedOpportunity.opportunityType.id}
                      onValueChange={(value) => {
                        const selectedType = opportunityTypes.find(type => type.id === value);
                        if (selectedType) {
                          setEditingOpportunity(prev => ({ 
                            ...prev, 
                            opportunityType: {
                              id: selectedType.id,
                              name: selectedType.name,
                              description: selectedType.description,
                              color: selectedType.color
                            }
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {opportunityTypes.map((type) => {
                          const typeInfo = getTypeBadge(type.name);
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              {typeInfo ? (
                                <Badge className={typeInfo.colorClass}>
                                  {typeInfo.name}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">{type.name}</Badge>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      value={editingOpportunity.location || ''}
                      onChange={(e) => setEditingOpportunity(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g., New York, NY or Remote"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700">Experience Level</Label>
                    <Input
                      id="experienceLevel"
                      value={editingOpportunity.experienceLevel || ''}
                      onChange={(e) => setEditingOpportunity(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g., Entry Level, Mid-Level, Senior"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration</Label>
                    <Input
                      id="duration"
                      value={editingOpportunity.duration || ''}
                      onChange={(e) => setEditingOpportunity(prev => ({ ...prev, duration: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g., 6 months, 1 year, Permanent"
                    />
                  </div>

                  <div>
                    <Label htmlFor="compensation" className="text-sm font-medium text-gray-700">Compensation</Label>
                    <Input
                      id="compensation"
                      value={editingOpportunity.compensation || ''}
                      onChange={(e) => setEditingOpportunity(prev => ({ ...prev, compensation: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g., $50,000/year, Competitive salary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="applicationDeadline" className="text-sm font-medium text-gray-700">Application Deadline</Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={editingOpportunity.applicationDeadline ? editingOpportunity.applicationDeadline.split('T')[0] : ''}
                      onChange={(e) => setEditingOpportunity(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={editingOpportunity.description || ''}
                    onChange={(e) => setEditingOpportunity(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 min-h-[120px]"
                    placeholder="Provide a detailed description of the opportunity..."
                  />
                </div>

                {/* Requirements */}
                <div>
                  <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={editingOpportunity.requirements || ''}
                    onChange={(e) => setEditingOpportunity(prev => ({ ...prev, requirements: e.target.value }))}
                    className="mt-1 min-h-[100px]"
                    placeholder="List the requirements for this opportunity..."
                  />
                </div>

                {/* Benefits */}
                <div>
                  <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={editingOpportunity.benefits || ''}
                    onChange={(e) => setEditingOpportunity(prev => ({ ...prev, benefits: e.target.value }))}
                    className="mt-1 min-h-[100px]"
                    placeholder="Describe the benefits of this opportunity..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedOpportunity(null);
                      setEditingOpportunity({});
                    }}
                    disabled={savingOpportunity}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveOpportunity}
                    disabled={savingOpportunity || !editingOpportunity.title || !editingOpportunity.description}
                    className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingOpportunity ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Application Review Modal (unchanged) */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
                <Button variant="ghost" size="sm" onClick={() => {setShowReviewModal(false);setSelectedApplication(null);}}>✕</Button>
            </div>
            <div className="space-y-4">
              {/* Application Details */}
              <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedApplication.menteeName}</h3>
                  <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {selectedApplication.menteeEmail}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {selectedApplication.status}</p>
                {selectedApplication.coverLetter && (
                  <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedApplication.coverLetter}</p>
                  </div>
                )}
              </div>
              {/* Resume Section */}
              {selectedApplication.resumeUrl && (
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedApplication.resumeUrl, "_blank")}>View Resume</Button>
                </div>
              )}
              {/* Review Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => {setShowReviewModal(false);setSelectedApplication(null);}} disabled={reviewing}>Cancel</Button>
                  <Button variant="destructive" onClick={() => handleUpdateApplicationStatus("REJECTED")} disabled={reviewing}>{reviewing ? "Rejecting..." : "Reject Application"}</Button>
                  <Button className="btn-primary" onClick={() => handleUpdateApplicationStatus("ACCEPTED")} disabled={reviewing}>{reviewing ? "Accepting..." : "Accept Application"}</Button>
                </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
