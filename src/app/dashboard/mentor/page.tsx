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
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/use-pagination";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useMenteeSearch } from "@/hooks/use-mentee-search";

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
  const { opportunityTypes, loading: opportunityTypesLoading, error: opportunityTypesError, getTypeBadge } = useOpportunityTypes();
  const { mentees, loading: searchLoading, error: searchError, filters, pagination, updateFilters, changePage, clearSearch } = useMenteeSearch();
  
  // Debug opportunity types
  useEffect(() => {
    console.log('Opportunity Types:', opportunityTypes);
    console.log('Loading:', opportunityTypesLoading);
    console.log('Error:', opportunityTypesError);
  }, [opportunityTypes, opportunityTypesLoading, opportunityTypesError]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  
  // New state for view management
  const [currentView, setCurrentView] = useState<'main' | 'opportunities' | 'applications' | 'post-opportunity' | 'find-mentees'>('main');

  
  // Modal states for opportunities
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Partial<Opportunity>>({});
  const [savingOpportunity, setSavingOpportunity] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);

  // Form states for Post Opportunity and Find Mentees
  const [postOpportunityForm, setPostOpportunityForm] = useState({
    title: '',
    description: '',
    location: '',
    experienceLevel: '',
    opportunityTypeId: '',
    requirements: '',
    benefits: '',
    duration: '',
    compensation: '',
    applicationDeadline: ''
  });
  const [postingOpportunity, setPostingOpportunity] = useState(false);

  const [findMenteesForm, setFindMenteesForm] = useState({
    search: '',
    location: '',
    experienceLevel: '',
    interests: ''
  });
  const [searchingMentees, setSearchingMentees] = useState(false);

  // Pagination hooks
  const opportunitiesPagination = usePagination({ initialPageSize: 10 });
  const applicationsPagination = usePagination({ initialPageSize: 10 });

  // Optimized data fetching - fetch all data in parallel
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Fetch user data, opportunities, and applications in parallel
        const [userResponse, opportunitiesResponse, applicationsResponse] = await Promise.allSettled([
          fetch("/api/user", { credentials: 'include' }),
          fetch("/api/opportunities", { credentials: 'include' }),
          fetch("/api/applications/mentor", { credentials: 'include' })
        ]);

        // Handle user data
        if (userResponse.status === 'fulfilled' && userResponse.value.ok) {
          const userData = await userResponse.value.json();
          setUser(userData.user);

          // Verify user is a mentor
          if (userData.user.role !== "MENTOR") {
            router.push("/dashboard");
            return;
          }
        } else if (userResponse.status === 'fulfilled' && userResponse.value.status === 401) {
          router.push("/login");
          return;
        } else {
          throw new Error("Failed to fetch user data");
        }

        // Handle opportunities data
        if (opportunitiesResponse.status === 'fulfilled' && opportunitiesResponse.value.ok) {
          const data = await opportunitiesResponse.value.json();
          const opportunitiesData = data.opportunities || [];
          setOpportunities(opportunitiesData);
          opportunitiesPagination.actions.setTotalItems(opportunitiesData.length);
        } else {
          console.error("Failed to fetch opportunities");
        }

        // Handle applications data
        if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.ok) {
          const data = await applicationsResponse.value.json();
          const applicationsData = data.applications || [];
          setApplications(applicationsData);
          applicationsPagination.actions.setTotalItems(applicationsData.length);
        } else {
          console.error("Failed to fetch applications");
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router, opportunitiesPagination.actions, applicationsPagination.actions]);

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

  // Optimized individual fetch functions for manual refresh
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
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: 'include',
      });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Form submission handlers
  const handlePostOpportunity = async () => {
    // Clear any previous form errors
    setFormError(null);
    
    if (!postOpportunityForm.title || !postOpportunityForm.description || !postOpportunityForm.opportunityTypeId) {
      setFormError("Please fill in all required fields (Title, Description, and Opportunity Type)");
      return;
    }

    setPostingOpportunity(true);
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(postOpportunityForm),
      });

      if (response.ok) {
        setSuccessMessage("Opportunity posted successfully! It is now pending approval.");
        // Clear any form errors
        setFormError(null);
        // Reset form
        setPostOpportunityForm({
          title: '',
          description: '',
          location: '',
          experienceLevel: '',
          opportunityTypeId: '',
          requirements: '',
          benefits: '',
          duration: '',
          compensation: '',
          applicationDeadline: ''
        });
        // Go back to main dashboard
        setCurrentView('main');
        // Refresh opportunities list
        fetchOpportunities();
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || "Failed to post opportunity");
      }
    } catch (error) {
      console.error("Error posting opportunity:", error);
      setFormError("Failed to post opportunity. Please try again.");
    } finally {
      setPostingOpportunity(false);
    }
  };

  const handleFindMentees = async () => {
    // Clear any previous form errors
    setFormError(null);
    
    setSearchingMentees(true);
    try {
      // Update search filters with form data
      updateFilters({
        query: findMenteesForm.search,
        location: findMenteesForm.location,
        experienceLevel: findMenteesForm.experienceLevel,
        interests: findMenteesForm.interests
      });
      
      setSuccessMessage("Search completed successfully!");
      setFormError(null);
      setSearchingMentees(false);
    } catch (error) {
      console.error("Error searching mentees:", error);
      setFormError("Failed to search mentees. Please try again.");
      setSearchingMentees(false);
    }
  };

  const handleViewMenteeProfile = (mentee: any) => {
    setSelectedMentee(mentee);
    setShowProfileModal(true);
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

  // Loading skeleton components
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Welcome skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Action cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-lg shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow overflow-hidden">
        <div className="p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
          <DashboardSkeleton />
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
        {formError && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formError}
            </div>
            <button
              onClick={() => setFormError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

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
                onClick={() => setCurrentView('post-opportunity')}
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
              <Button className="w-full mt-2 bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600" onClick={() => setCurrentView('find-mentees')}>
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
                onClick={() => setCurrentView('post-opportunity')}
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
              <TableSkeleton />
            ) : opportunities.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No opportunities posted yet</h3>
                <p className="text-gray-600 mb-4">Start by posting your first opportunity to help mentees.</p>
                <Button 
                  className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" 
                  onClick={() => setCurrentView('post-opportunity')}
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
                            <span className="text-sm text-gray-500" suppressHydrationWarning>
                              {new Date(opportunity.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
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
            <TableSkeleton />
          ) : applications.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No applications received yet</h3>
              <p className="text-gray-600 mb-4">Applications will appear here when mentees apply to your opportunities.</p>
              <Button 
                className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" 
                onClick={() => setCurrentView('post-opportunity')}
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
                            <span className="text-sm text-gray-500" suppressHydrationWarning>
                              {new Date(application.appliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
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

        {/* Post Opportunity Detail View */}
        {currentView === 'post-opportunity' && (
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
                Post New <span className="bg-gradient-to-tr from-green-600 to-blue-500 bg-clip-text text-transparent">Opportunity</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Share fellowships, jobs, or observerships with the urology community.
              </p>
            </div>

            {/* Post Opportunity Form */}
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/70 backdrop-blur-lg shadow-xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white text-4xl shadow-lg mb-4 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Create New Opportunity</h3>
                    <p className="text-gray-600">Fill out the form below to post your opportunity</p>
                  </div>

                  {/* Form-specific error display */}
                  {formError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formError}
                      </div>
                      <button
                        onClick={() => setFormError(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="space-y-6">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <Label htmlFor="title" className="text-sm font-medium text-gray-700">Opportunity Title *</Label>
                         <Input
                           id="title"
                           value={postOpportunityForm.title}
                           onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, title: e.target.value }))}
                           placeholder="e.g., Urology Fellowship Program"
                           className="mt-1"
                         />
                       </div>
                       <div>
                         <Label htmlFor="type" className="text-sm font-medium text-gray-700">Opportunity Type *</Label>
                         {opportunityTypesLoading ? (
                           <div className="mt-1 p-3 border border-gray-200 rounded-md bg-gray-50">
                             <div className="animate-pulse flex space-x-4">
                               <div className="flex-1 space-y-2 py-1">
                                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                               </div>
                             </div>
                           </div>
                         ) : opportunityTypesError ? (
                           <div className="mt-1 p-3 border border-red-200 rounded-md bg-red-50 text-red-700">
                             Error loading opportunity types: {opportunityTypesError}
                           </div>
                         ) : opportunityTypes.length === 0 ? (
                           <div className="mt-1 p-3 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-700">
                             No opportunity types available
                           </div>
                         ) : (
                           <Select value={postOpportunityForm.opportunityTypeId} onValueChange={(value) => setPostOpportunityForm(prev => ({ ...prev, opportunityTypeId: value }))}>
                             <SelectTrigger className="mt-1">
                               <SelectValue placeholder="Select type">
                                 {postOpportunityForm.opportunityTypeId && (() => {
                                   const selectedType = opportunityTypes.find(type => type.id === postOpportunityForm.opportunityTypeId);
                                   if (selectedType) {
                                     const typeInfo = getTypeBadge(selectedType.name);
                                     return typeInfo ? (
                                       <Badge className={typeInfo.colorClass}>
                                         {typeInfo.name}
                                       </Badge>
                                     ) : (
                                       <Badge variant="secondary">{selectedType.name}</Badge>
                                     );
                                   }
                                   return null;
                                 })()}
                               </SelectValue>
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
                         )}
                       </div>
                     </div>

                     <div>
                       <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                       <Textarea
                         id="description"
                         value={postOpportunityForm.description}
                         onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, description: e.target.value }))}
                         placeholder="Provide a detailed description of the opportunity..."
                         className="mt-1 min-h-[120px]"
                       />
                     </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                         <Input
                           id="location"
                           value={postOpportunityForm.location}
                           onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, location: e.target.value }))}
                           placeholder="e.g., New York, NY or Remote"
                           className="mt-1"
                         />
                       </div>
                       <div>
                         <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience Level</Label>
                         <Select value={postOpportunityForm.experienceLevel} onValueChange={(value) => setPostOpportunityForm(prev => ({ ...prev, experienceLevel: value }))}>
                           <SelectTrigger className="mt-1">
                             <SelectValue placeholder="Select level" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="entry">Entry Level</SelectItem>
                             <SelectItem value="mid">Mid Level</SelectItem>
                             <SelectItem value="senior">Senior Level</SelectItem>
                             <SelectItem value="expert">Expert Level</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration</Label>
                         <Select value={postOpportunityForm.duration} onValueChange={(value) => setPostOpportunityForm(prev => ({ ...prev, duration: value }))}>
                           <SelectTrigger className="mt-1 text-gray-900">
                             <SelectValue placeholder="Select duration" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="1-3 months" className="text-gray-900">1-3 months</SelectItem>
                             <SelectItem value="3-6 months" className="text-gray-900">3-6 months</SelectItem>
                             <SelectItem value="6 months" className="text-gray-900">6 months</SelectItem>
                             <SelectItem value="1 year" className="text-gray-900">1 year</SelectItem>
                             <SelectItem value="2 years" className="text-gray-900">2 years</SelectItem>
                             <SelectItem value="Permanent" className="text-gray-900">Permanent</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <Label htmlFor="compensation" className="text-sm font-medium text-gray-700">Compensation</Label>
                         <Input
                           id="compensation"
                           value={postOpportunityForm.compensation}
                           onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, compensation: e.target.value }))}
                           placeholder="e.g., ₹50,000/year, Stipend provided"
                           className="mt-1"
                         />
                       </div>
                     </div>

                     <div>
                       <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements</Label>
                       <Textarea
                         id="requirements"
                         value={postOpportunityForm.requirements}
                         onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, requirements: e.target.value }))}
                         placeholder="List the requirements and qualifications needed..."
                         className="mt-1 min-h-[100px]"
                       />
                     </div>

                     <div>
                       <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits</Label>
                       <Textarea
                         id="benefits"
                         value={postOpportunityForm.benefits}
                         onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, benefits: e.target.value }))}
                         placeholder="Describe the benefits and perks of this opportunity..."
                         className="mt-1 min-h-[100px]"
                       />
                     </div>

                     <div>
                       <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">Application Deadline</Label>
                       <Input
                         id="deadline"
                         type="date"
                         value={postOpportunityForm.applicationDeadline}
                         onChange={(e) => setPostOpportunityForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                         className="mt-1"
                       />
                     </div>

                                         <div className="flex justify-end gap-4 pt-6">
                       <Button
                         variant="outline"
                         onClick={() => setCurrentView('main')}
                         className="px-8"
                         disabled={postingOpportunity}
                       >
                         Cancel
                       </Button>
                       <Button
                         className="bg-gradient-to-tr from-green-600 to-blue-500 text-white font-semibold shadow-md hover:from-green-700 hover:to-blue-600 px-8"
                         onClick={handlePostOpportunity}
                         disabled={postingOpportunity}
                       >
                         {postingOpportunity ? "Posting..." : "Post Opportunity"}
                       </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Find Mentees Detail View */}
        {currentView === 'find-mentees' && (
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
                Find <span className="bg-gradient-to-tr from-cyan-600 to-blue-500 bg-clip-text text-transparent">Mentees</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Search and connect with mentees based on their interests, location, and experience level.
              </p>
            </div>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/70 backdrop-blur-lg shadow-xl border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 text-white text-4xl shadow-lg mb-4 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Search Mentees</h3>
                    <p className="text-gray-600">Use the filters below to find mentees that match your criteria</p>
                  </div>

                  {/* Form-specific error display */}
                  {formError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formError}
                      </div>
                      <button
                        onClick={() => setFormError(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                                     <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search Keywords</Label>
                         <Input
                           id="search"
                           value={findMenteesForm.search}
                           onChange={(e) => {
                             setFindMenteesForm(prev => ({ ...prev, search: e.target.value }));
                             // Real-time search with debouncing
                             updateFilters({ query: e.target.value });
                           }}
                           placeholder="Search by name, interests, or keywords..."
                           className="mt-1"
                         />
                       </div>
                       <div>
                         <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                         <Input
                           id="location"
                           value={findMenteesForm.location}
                           onChange={(e) => {
                             setFindMenteesForm(prev => ({ ...prev, location: e.target.value }));
                             // Real-time search with debouncing
                             updateFilters({ location: e.target.value });
                           }}
                           placeholder="e.g., New York, NY or Remote"
                           className="mt-1"
                         />
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience Level</Label>
                         <Select value={findMenteesForm.experienceLevel} onValueChange={(value) => {
                           setFindMenteesForm(prev => ({ ...prev, experienceLevel: value }));
                           // Real-time search with debouncing
                           updateFilters({ experienceLevel: value });
                         }}>
                           <SelectTrigger className="mt-1">
                             <SelectValue placeholder="Any experience level" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="student">Medical Student</SelectItem>
                             <SelectItem value="resident">Resident</SelectItem>
                             <SelectItem value="fellow">Fellow</SelectItem>
                             <SelectItem value="attending">Attending</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <Label htmlFor="interests" className="text-sm font-medium text-gray-700">Interests</Label>
                         <Select value={findMenteesForm.interests} onValueChange={(value) => {
                           setFindMenteesForm(prev => ({ ...prev, interests: value }));
                           // Real-time search with debouncing
                           updateFilters({ interests: value });
                         }}>
                           <SelectTrigger className="mt-1">
                             <SelectValue placeholder="Select interests" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="oncology">Oncology</SelectItem>
                             <SelectItem value="pediatric">Pediatric Urology</SelectItem>
                             <SelectItem value="reconstructive">Reconstructive</SelectItem>
                             <SelectItem value="endourology">Endourology</SelectItem>
                             <SelectItem value="infertility">Infertility</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                                         <div className="flex justify-end gap-4 pt-6">
                       <Button
                         variant="outline"
                         onClick={() => setCurrentView('main')}
                         className="px-8"
                         disabled={searchingMentees}
                       >
                         Cancel
                       </Button>
                       <Button
                         className="bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600 px-8"
                         onClick={handleFindMentees}
                         disabled={searchingMentees}
                       >
                         {searchingMentees ? "Searching..." : "Search Mentees"}
                       </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            {(searchLoading || mentees.length > 0 || searchError) && (
              <div className="mt-8 max-w-6xl mx-auto">
                <Card className="bg-white/70 backdrop-blur-lg shadow-xl border-0">
                  <CardContent className="p-6">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
                        {!searchLoading && (
                          <p className="text-sm text-gray-600">
                            Found {mentees.length} mentee{mentees.length !== 1 ? 's' : ''} 
                            {pagination.total > mentees.length && ` (showing ${mentees.length} of ${pagination.total})`}
                          </p>
                        )}
                      </div>
                      {mentees.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={clearSearch}
                          className="text-sm"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>

                    {/* Loading State */}
                    {searchLoading && (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Error State */}
                    {searchError && !searchLoading && (
                      <div className="text-center py-8">
                        <div className="text-red-500 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-gray-600">{searchError}</p>
                        <Button
                          onClick={() => updateFilters(filters)}
                          className="mt-4"
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    {/* Results */}
                    {!searchLoading && !searchError && mentees.length > 0 && (
                      <div className="space-y-4">
                        {mentees.map((mentee) => (
                          <div key={mentee.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {mentee.profile?.avatar ? (
                                <img
                                  src={mentee.profile.avatar}
                                  alt={`${mentee.firstName} ${mentee.lastName}`}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                                  {mentee.firstName?.[0]}{mentee.lastName?.[0]}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                  {mentee.firstName} {mentee.lastName}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {mentee.profile?.availabilityStatus || 'Available'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{mentee.email}</p>
                              
                              {mentee.profile?.location && (
                                <p className="text-sm text-gray-500 mb-2">
                                  📍 {mentee.profile.location}
                                </p>
                              )}
                              
                              {mentee.profile?.bio && (
                                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                  {mentee.profile.bio}
                                </p>
                              )}
                              
                              {mentee.profile?.interests && mentee.profile.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {mentee.profile.interests.slice(0, 3).map((interest, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                  {mentee.profile.interests.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{mentee.profile.interests.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {mentee.profile?.yearsOfExperience && (
                                <p className="text-sm text-gray-500">
                                  💼 {mentee.profile.yearsOfExperience} years of experience
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewMenteeProfile(mentee)}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {!searchLoading && !searchError && mentees.length === 0 && (
                      <div className="text-center py-12">
                        <div className="mb-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-500 mb-4">
                          Try adjusting your search criteria or filters to find more mentees.
                        </p>
                        <div className="space-y-2 text-sm text-gray-400">
                          <p>• Check your spelling</p>
                          <p>• Try different keywords</p>
                          <p>• Broaden your location or experience filters</p>
                        </div>
                      </div>
                    )}

                    {/* Pagination */}
                    {!searchLoading && !searchError && mentees.length > 0 && pagination.totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Page {pagination.page} of {pagination.totalPages}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(pagination.page - 1)}
                            disabled={!pagination.hasPrev}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(pagination.page + 1)}
                            disabled={!pagination.hasNext}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
                  onClick={() => setCurrentView('post-opportunity')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      Post Opportunity
                    </Button>
                    <Button
                  onClick={() => setCurrentView('find-mentees')}
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
                        <SelectValue placeholder="Select opportunity type">
                          {(editingOpportunity.opportunityType?.id || selectedOpportunity.opportunityType.id) && (() => {
                            const selectedType = opportunityTypes.find(type => type.id === (editingOpportunity.opportunityType?.id || selectedOpportunity.opportunityType.id));
                            if (selectedType) {
                              const typeInfo = getTypeBadge(selectedType.name);
                              return typeInfo ? (
                                <Badge className={typeInfo.colorClass}>
                                  {typeInfo.name}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">{selectedType.name}</Badge>
                              );
                            }
                            return null;
                          })()}
                        </SelectValue>
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
                      placeholder="e.g., ₹50,000/year, Competitive salary"
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

        {/* Mentee Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="flex-shrink-0">
                  {selectedMentee?.profile?.avatar ? (
                    <img
                      src={selectedMentee.profile.avatar}
                      alt={`${selectedMentee.firstName} ${selectedMentee.lastName}`}
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-white font-semibold text-lg">
                        {selectedMentee?.firstName?.[0]}{selectedMentee?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedMentee?.firstName} {selectedMentee?.lastName}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {selectedMentee?.email}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedMentee && (
              <div className="space-y-8">
                {/* Profile Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedMentee.profile?.location && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-lg">📍</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-gray-900 font-semibold">{selectedMentee.profile.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedMentee.profile?.yearsOfExperience && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">⚡</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Experience</p>
                          <p className="text-gray-900 font-semibold">{selectedMentee.profile.yearsOfExperience} years</p>
                        </div>
                      </div>
                    )}

                    {selectedMentee.profile?.availabilityStatus && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 text-lg">✓</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            {selectedMentee.profile.availabilityStatus}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    About
                  </h3>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    {selectedMentee.profile?.bio ? (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMentee.profile.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">No bio information available</p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Education */}
                    {selectedMentee.profile?.education && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-sm">🎓</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Education</h4>
                        </div>
                        <p className="text-gray-700">{selectedMentee.profile.education}</p>
                      </div>
                    )}

                    {/* Specialty */}
                    {selectedMentee.profile?.specialty && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm">🎯</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Specialty</h4>
                        </div>
                        <p className="text-gray-700">{selectedMentee.profile.specialty}</p>
                      </div>
                    )}

                    {/* Workplace */}
                    {selectedMentee.profile?.workplace && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 text-sm">🏢</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Workplace</h4>
                        </div>
                        <p className="text-gray-700">{selectedMentee.profile.workplace}</p>
                      </div>
                    )}

                    {/* Member Since */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm">📅</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Member Since</h4>
                      </div>
                      <p className="text-gray-700">
                        {new Date(selectedMentee.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interests & Skills */}
                {selectedMentee.profile?.interests && selectedMentee.profile.interests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                      Interests & Skills
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex flex-wrap gap-3">
                        {selectedMentee.profile.interests.map((interest: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200 px-4 py-2 text-sm font-medium"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                  <p className="text-sm text-gray-600 mb-1" suppressHydrationWarning>
                    <strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
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
