// @ts-nocheck
// @ts-ignore
/* eslint-disable */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LoadingSpinner,
  LoadingPage,
  LoadingCard,
  LoadingButton,
  LoadingText,
} from "@/components/ui/loading-spinner";
import SharedHeader from "@/components/shared-header";
import ProfileForm from "@/components/ProfileForm";
import MentorDashboardSidebar from "@/components/mentor-dashboard-sidebar";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useMenteeSearch } from "@/hooks/use-mentee-search";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  FileText,
  Send,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Plus,
  Eye,
  Heart,
  Target,
  Award,
  Users,
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Edit3,
  Loader2,
} from "lucide-react";

// Utility to read a cookie value by name (client-side only)
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

// Format date string to yyyy-mm-dd for date input
function toInputDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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
  const {
    opportunityTypes,
    loading: opportunityTypesLoading,
    error: opportunityTypesError,
    getTypeBadge,
  } = useOpportunityTypes();
  const {
    mentees,
    loading: searchLoading,
    error: searchError,
    filters,
    pagination,
    updateFilters,
    changePage,
    clearSearch,
  } = useMenteeSearch();

  // Debug opportunity types
  useEffect(() => {
    console.log("Opportunity Types:", opportunityTypes);
    console.log("Loading:", opportunityTypesLoading);
    console.log("Error:", opportunityTypesError);
  }, [opportunityTypes, opportunityTypesLoading, opportunityTypesError]);

  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    | "main"
    | "opportunities"
    | "applications"
    | "post-opportunity"
    | "find-mentees"
    | "discussions"
  >("main");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Data state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  // Modal states for opportunities
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<
    Partial<Opportunity>
  >({});
  const [savingOpportunity, setSavingOpportunity] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);

  // Form states for Post Opportunity and Find Mentees
  const [postOpportunityForm, setPostOpportunityForm] = useState({
    title: "",
    description: "",
    location: "",
    experienceLevel: "",
    opportunityTypeId: "",
    requirements: "",
    benefits: "",
    duration: "",
    compensation: "",
    applicationDeadline: "",
  });
  const [postingOpportunity, setPostingOpportunity] = useState(false);

  // Opportunity filters state
  const [opportunitySearchTerm, setOpportunitySearchTerm] = useState("");
  // Removed status filter for opportunities
  const [opportunityTypeFilter, setOpportunityTypeFilter] = useState("all");

  // Application filters state
  const [applicationSearchTerm, setApplicationSearchTerm] = useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  const [applicationOpportunityFilter, setApplicationOpportunityFilter] =
    useState("all");

  const [findMenteesForm, setFindMenteesForm] = useState({
    search: "",
    location: "",
    experienceLevel: "",
    interests: "",
  });
  const [searchingMentees, setSearchingMentees] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    pendingApplications: 0,
    totalApplications: 0,
    approvedOpportunities: 0,
    rejectedOpportunities: 0,
  });

  // Pagination state
  const [opportunityPage, setOpportunityPage] = useState(1);
  const [applicationPage, setApplicationPage] = useState(1);
  const itemsPerPage = 10;

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Optimized data fetching - fetch all data in parallel
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);

        // Fetch user data, opportunities, and applications in parallel
        const [userResponse, opportunitiesResponse, applicationsResponse] =
          await Promise.allSettled([
            fetch("/api/user", { credentials: "include" }),
            fetch("/api/opportunities", { credentials: "include" }),
            fetch("/api/applications/mentor", { credentials: "include" }),
          ]);

        // Handle user data
        if (userResponse.status === "fulfilled" && userResponse.value.ok) {
          const userData = await userResponse.value.json();
          setUser(userData.user);

          // Verify user is a mentor
          if (userData.user.role !== "MENTOR") {
            router.push("/dashboard");
            return;
          }
        } else if (
          userResponse.status === "fulfilled" &&
          userResponse.value.status === 401
        ) {
          router.push("/login");
          return;
        } else {
          throw new Error("Failed to fetch user data");
        }

        // Handle opportunities data
        let opportunitiesData = [];
        if (
          opportunitiesResponse.status === "fulfilled" &&
          opportunitiesResponse.value.ok
        ) {
          const data = await opportunitiesResponse.value.json();
          opportunitiesData = data.opportunities || [];
          setOpportunities(opportunitiesData);
        } else {
          console.error("Failed to fetch opportunities");
        }

        // Handle applications data
        let applicationsData = [];
        if (
          applicationsResponse.status === "fulfilled" &&
          applicationsResponse.value.ok
        ) {
          const data = await applicationsResponse.value.json();
          applicationsData = data.applications || [];
          setApplications(applicationsData);
        } else {
          console.error("Failed to fetch applications");
        }

        // Calculate stats
        const pendingApps = applicationsData.filter(
          (app: any) => app.status === "PENDING"
        );
        const approvedOpps = opportunitiesData.filter(
          (opp: any) => opp.status === "APPROVED"
        );
        const rejectedOpps = opportunitiesData.filter(
          (opp: any) => opp.status === "REJECTED"
        );

        setStats({
          totalOpportunities: opportunitiesData.length,
          pendingApplications: pendingApps.length,
          totalApplications: applicationsData.length,
          approvedOpportunities: approvedOpps.length,
          rejectedOpportunities: rejectedOpps.length,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      initializeDashboard();
    }
  }, [isClient, router]);

  // Check for success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const tab = urlParams.get("tab");
    if (success === "opportunity-posted") {
      setSuccessMessage(
        "Opportunity posted successfully! It is now pending approval."
      );
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh opportunities list
      fetchOpportunities();
    }
    if (tab) {
      const allowed = [
        "main",
        "opportunities",
        "applications",
        "post-opportunity",
        "find-mentees",
        "discussions",
      ];
      if (allowed.includes(tab)) {
        setActiveSection(tab as any);
      }
    }
  }, []);

  // Keep sidebar stats in sync with current state
  useEffect(() => {
    const pendingApps = applications.filter(
      (app) => app.status === "PENDING"
    ).length;
    setStats({
      totalOpportunities: opportunities.length,
      pendingApplications: pendingApps,
      totalApplications: applications.length,
    });
  }, [opportunities, applications]);

  // Auto-remove success message when switching navigation
  useEffect(() => {
    if (successMessage) {
      setSuccessMessage(null);
    }
  }, [activeSection]);

  // Auto-remove form error when switching navigation
  useEffect(() => {
    if (formError) {
      setFormError(null);
    }
  }, [activeSection]);

  // Optimized individual fetch functions for manual refresh
  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const response = await fetch("/api/opportunities", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const opportunitiesData = data.opportunities || [];
        setOpportunities(opportunitiesData);
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
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const applicationsData = data.applications || [];
        setApplications(applicationsData);
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
      applicationDeadline: toInputDate(opportunity.applicationDeadline as any),
      opportunityType: opportunity.opportunityType,
    });
    setShowEditModal(true);
  };

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Opportunity | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState(false);

  const requestDeleteOpportunity = (opportunity: Opportunity) => {
    setPendingDelete(opportunity);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteOpportunity = async () => {
    if (!pendingDelete) return;
    try {
      setDeletingOpportunity(true);
      const response = await fetch(`/api/opportunities/${pendingDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Failed to delete opportunity");
      }
      // Optimistically remove from local list to avoid global loaders
      setOpportunities((prev) => prev.filter((o) => o.id !== pendingDelete.id));
      // Silent refresh to keep counts accurate without skeletons
      try {
        const resp = await fetch("/api/opportunities", {
          credentials: "include",
        });
        if (resp.ok) {
          const data = await resp.json();
          setOpportunities(data.opportunities || []);
        }
      } catch {}
      setSuccessMessage("Opportunity deleted successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setConfirmDeleteOpen(false);
      setPendingDelete(null);
      setDeletingOpportunity(false);
    }
  };

  const handleSaveOpportunity = async () => {
    if (!selectedOpportunity) return;

    setSavingOpportunity(true);
    try {
      const response = await fetch(
        `/api/opportunities/${selectedOpportunity.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...editingOpportunity,
            opportunityTypeId:
              editingOpportunity.opportunityType?.id ||
              selectedOpportunity.opportunityType.id,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to update opportunity");
      }

      // Refresh the opportunities list
      await fetchOpportunities();
      setShowEditModal(false);
      setSelectedOpportunity(null);
      setEditingOpportunity({});
    } catch (error) {
      console.error("Error updating opportunity:", error);
      setError("Failed to update opportunity. Please try again.");
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
          credentials: "include",
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
        credentials: "include",
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

    if (
      !postOpportunityForm.title ||
      !postOpportunityForm.description ||
      !postOpportunityForm.opportunityTypeId
    ) {
      setFormError(
        "Please fill in all required fields (Title, Description, and Opportunity Type)"
      );
      return;
    }

    setPostingOpportunity(true);
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...postOpportunityForm,
          status: "APPROVED", // Auto-approve mentor opportunities
        }),
      });

      if (response.ok) {
        setSuccessMessage("Opportunity posted successfully and is now live!");
        // Clear any form errors
        setFormError(null);
        // Reset form
        setPostOpportunityForm({
          title: "",
          description: "",
          location: "",
          experienceLevel: "",
          opportunityTypeId: "",
          requirements: "",
          benefits: "",
          duration: "",
          compensation: "",
          applicationDeadline: "",
        });
        // Stay on current route - don't redirect to main dashboard
        // Refresh opportunities list
        fetchOpportunities();
        // Auto-remove success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
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
        interests: findMenteesForm.interests,
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

  // Filter opportunities based on search and filters
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunitySearchTerm === "" ||
      opportunity.title
        .toLowerCase()
        .includes(opportunitySearchTerm.toLowerCase()) ||
      opportunity.description
        .toLowerCase()
        .includes(opportunitySearchTerm.toLowerCase());

    const matchesType =
      opportunityTypeFilter === "all" ||
      opportunity.opportunityType?.name === opportunityTypeFilter;

    return matchesSearch && matchesType;
  });

  // Filter applications based on search and filters
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      applicationSearchTerm === "" ||
      application.menteeName
        ?.toLowerCase()
        .includes(applicationSearchTerm.toLowerCase()) ||
      application.menteeEmail
        ?.toLowerCase()
        .includes(applicationSearchTerm.toLowerCase());

    const matchesStatus =
      applicationStatusFilter === "all" ||
      application.status === applicationStatusFilter;

    const opportunity = opportunities.find(
      (opp) => opp.id === application.opportunityId
    );
    const matchesOpportunity =
      applicationOpportunityFilter === "all" ||
      opportunity?.id === applicationOpportunityFilter;

    return matchesSearch && matchesStatus && matchesOpportunity;
  });

  // Pagination logic for opportunities (after filter definitions)
  const startOpportunityIndex = (opportunityPage - 1) * itemsPerPage;
  const endOpportunityIndex = startOpportunityIndex + itemsPerPage;
  const paginatedOpportunities = filteredOpportunities.slice(
    startOpportunityIndex,
    endOpportunityIndex
  );
  const totalOpportunityPages = Math.ceil(
    filteredOpportunities.length / itemsPerPage
  );

  // Pagination logic for applications (after filter definitions)
  const startApplicationIndex = (applicationPage - 1) * itemsPerPage;
  const endApplicationIndex = startApplicationIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(
    startApplicationIndex,
    endApplicationIndex
  );
  const totalApplicationPages = Math.ceil(
    filteredApplications.length / itemsPerPage
  );

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
      pending: opportunities.filter((opp) => opp.status === "PENDING").length,
      approved: opportunities.filter((opp) => opp.status === "APPROVED").length,
      rejected: opportunities.filter((opp) => opp.status === "REJECTED").length,
      closed: opportunities.filter((opp) => opp.status === "CLOSED").length,
    };
    return counts;
  };

  const getApplicationStatusCounts = () => {
    const counts = {
      total: applications.length,
      pending: applications.filter((app) => app.status === "PENDING").length,
      accepted: applications.filter((app) => app.status === "ACCEPTED").length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
      withdrawn: applications.filter((app) => app.status === "WITHDRAWN")
        .length,
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
          <Card
            key={i}
            className="bg-white/70 backdrop-blur-lg shadow-xl border-0"
          >
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
          <Card
            key={i}
            className="bg-white/70 backdrop-blur-lg shadow-xl border-0 hover:shadow-2xl transition-all duration-300"
          >
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
            <div
              key={i}
              className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0"
            >
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
      <LoadingPage
        title="Loading your mentor dashboard..."
        description="Please wait while we prepare your mentoring activities and opportunities."
        size="lg"
        variant="elegant"
        color="blue"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <SharedHeader />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              <Card className="bg-white/70 backdrop-blur-sm border border-red-200/60 shadow-xl shadow-red-900/5">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-tr from-red-100 to-pink-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Unable to Load Dashboard
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      We encountered an issue while loading your mentor
                      dashboard. This might be a temporary problem.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
                      >
                        <ArrowRight className="h-4 w-4 mr-2 rotate-[-90deg]" />
                        Try Again
                      </Button>
                      <Button
                        onClick={() => router.push("/login")}
                        variant="outline"
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <SharedHeader
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileMenuOpen={isMobileSidebarOpen}
        onEditProfile={async () => {
          setShowProfileModal(true);
          try {
            const res = await fetch("/api/profile", { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              setProfile(data.profile || null);
            }
          } catch (e) {
            console.error("Failed to load profile", e);
          }
        }}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar */}
          <MentorDashboardSidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setIsMobileSidebarOpen(false);
            }}
            stats={{
              pendingApplications: stats.pendingApplications,
              totalOpportunities: stats.totalOpportunities,
              totalApplications: stats.totalApplications,
            }}
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Enhanced Alert Messages */}
            {formError && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 text-red-700 p-4 rounded-xl shadow-lg shadow-red-900/5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                    <p className="text-sm leading-relaxed">{formError}</p>
                  </div>
                  <button
                    onClick={() => setFormError(null)}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                  >
                    <XCircle className="h-4 w-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 text-green-700 p-4 rounded-xl shadow-lg shadow-green-900/5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800 mb-1">
                      Success
                    </h4>
                    <p className="text-sm leading-relaxed">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors duration-200"
                  >
                    <XCircle className="h-4 w-4 text-green-500 hover:text-green-700" />
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard Overview Section */}
            {activeSection === "main" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Welcome back, {user?.firstName || "Dr."}!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Here's an overview of your mentoring activities and
                    opportunities.
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg">
                          <Briefcase className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">
                            {stats.totalOpportunities}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            My Opportunities
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg">
                          <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">
                            {stats.pendingApplications}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Pending Review
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg">
                          <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">
                            {stats.totalApplications}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Applications
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg">
                          <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">
                            {stats.approvedOpportunities}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Approved
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="text-base sm:text-xl">
                        Quick Actions
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <Button
                        onClick={() => setActiveSection("post-opportunity")}
                        className="h-auto p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg flex flex-col items-center gap-1 sm:gap-2"
                      >
                        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-xs sm:text-sm font-medium">
                          Post Opportunity
                        </span>
                        <span className="text-xs opacity-90 hidden sm:block">
                          Share new opportunities
                        </span>
                      </Button>

                      <Button
                        onClick={() => setActiveSection("opportunities")}
                        variant="outline"
                        className="h-auto p-3 sm:p-4 border-emerald-200 hover:bg-emerald-50 flex flex-col items-center gap-1 sm:gap-2"
                      >
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-medium text-emerald-700">
                          My Opportunities
                        </span>
                        <span className="text-xs text-emerald-600 hidden sm:block">
                          Manage posted items
                        </span>
                      </Button>

                      <Button
                        onClick={() => setActiveSection("applications")}
                        variant="outline"
                        className="h-auto p-3 sm:p-4 border-purple-200 hover:bg-purple-50 flex flex-col items-center gap-1 sm:gap-2"
                      >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        <span className="text-xs sm:text-sm font-medium text-purple-700">
                          Review Applications
                        </span>
                        <span className="text-xs text-purple-600 hidden sm:block">
                          Check mentee responses
                        </span>
                      </Button>

                      <Button
                        onClick={() => setActiveSection("find-mentees")}
                        variant="outline"
                        className="h-auto p-3 sm:p-4 border-cyan-200 hover:bg-cyan-50 flex flex-col items-center gap-1 sm:gap-2"
                      >
                        <Search className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                        <span className="text-xs sm:text-sm font-medium text-cyan-700">
                          Find Mentees
                        </span>
                        <span className="text-xs text-cyan-600 hidden sm:block">
                          Search candidates
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Opportunities Section */}
            {activeSection === "opportunities" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                      My Opportunities
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600">
                      Manage and track all your posted opportunities.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveSection("post-opportunity")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New
                  </Button>
                </div>

                {/* Filters and Search */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search opportunities..."
                          className="bg-white/80"
                          value={opportunitySearchTerm}
                          onChange={(e) =>
                            setOpportunitySearchTerm(e.target.value)
                          }
                        />
                      </div>
                      <Select
                        value={opportunityTypeFilter}
                        onValueChange={setOpportunityTypeFilter}
                      >
                        <SelectTrigger className="w-full sm:w-[150px] bg-white/80">
                          <SelectValue placeholder="Type" />
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
                      <Button
                        variant="outline"
                        className="shrink-0"
                        onClick={() => {
                          // No-op apply: filters are already controlled; this gives explicit UX
                          // Optionally refetch if server-driven in future
                        }}
                      >
                        Apply Filters
                      </Button>
                      {(opportunitySearchTerm ||
                        opportunityTypeFilter !== "all") && (
                        <Button
                          variant="ghost"
                          className="shrink-0"
                          onClick={() => {
                            setOpportunitySearchTerm("");
                            setOpportunityTypeFilter("all");
                            setOpportunityPage(1);
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities Grid */}
                {loadingOpportunities ? (
                  <div className="grid gap-4 sm:gap-6">
                    {[1, 2, 3].map((i) => (
                      <LoadingCard
                        key={i}
                        title="Loading opportunities..."
                        description="Please wait while we fetch your opportunities"
                        size="md"
                        variant="pulse"
                        color="blue"
                        className="text-left"
                      />
                    ))}
                  </div>
                ) : filteredOpportunities.length === 0 ? (
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {opportunities.length === 0
                          ? "No opportunities yet"
                          : "No opportunities match your filters"}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {opportunities.length === 0
                          ? "Start by posting your first opportunity to help mentees find great opportunities."
                          : "Try adjusting your search criteria or filters to find opportunities."}
                      </p>
                      {opportunities.length === 0 && (
                        <Button
                          onClick={() => setActiveSection("post-opportunity")}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Post Your First Opportunity
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Results count and pagination info */}
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">
                        Showing {startOpportunityIndex + 1}-
                        {Math.min(
                          endOpportunityIndex,
                          filteredOpportunities.length
                        )}{" "}
                        of {filteredOpportunities.length} opportunities
                      </p>
                      {(opportunitySearchTerm ||
                        opportunityTypeFilter !== "all") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpportunitySearchTerm("");
                            setOpportunityTypeFilter("all");
                            setOpportunityPage(1);
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                    {paginatedOpportunities.map((opportunity) => (
                      <Card
                        key={opportunity.id}
                        className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                              <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                                    {opportunity.title}
                                  </h3>
                                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                    {opportunity.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        opportunity.status === "APPROVED" &&
                                          "bg-green-50 text-green-700 border-green-200",
                                        opportunity.status === "PENDING" &&
                                          "bg-yellow-50 text-yellow-700 border-yellow-200",
                                        opportunity.status === "REJECTED" &&
                                          "bg-red-50 text-red-700 border-red-200"
                                      )}
                                    >
                                      {opportunity.status}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {opportunity.opportunityType?.name ||
                                        "No Type"}
                                    </Badge>
                                    {opportunity.location && (
                                      <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="h-3 w-3" />
                                        <span>{opportunity.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Posted on{" "}
                                    {new Date(
                                      opportunity.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewOpportunity(opportunity)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleEditOpportunity(opportunity)
                                    }
                                  >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      requestDeleteOpportunity(opportunity)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination Controls */}
                    {totalOpportunityPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setOpportunityPage((prev) =>
                                Math.max(1, prev - 1)
                              )
                            }
                            disabled={opportunityPage === 1}
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(5, totalOpportunityPages) },
                              (_, i) => {
                                let pageNum;
                                if (totalOpportunityPages <= 5) {
                                  pageNum = i + 1;
                                } else if (opportunityPage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  opportunityPage >=
                                  totalOpportunityPages - 2
                                ) {
                                  pageNum = totalOpportunityPages - 4 + i;
                                } else {
                                  pageNum = opportunityPage - 2 + i;
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      opportunityPage === pageNum
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className={cn(
                                      "w-8 h-8 p-0",
                                      opportunityPage === pageNum &&
                                        "bg-blue-600 text-white"
                                    )}
                                    onClick={() => setOpportunityPage(pageNum)}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setOpportunityPage((prev) =>
                                Math.min(totalOpportunityPages, prev + 1)
                              )
                            }
                            disabled={opportunityPage === totalOpportunityPages}
                          >
                            Next
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Applications Section */}
            {activeSection === "applications" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                      Applications
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600">
                      Review and manage applications from mentees.
                    </p>
                  </div>
                  <Button
                    onClick={fetchApplications}
                    variant="outline"
                    className="bg-white/80 border-slate-200 hover:bg-white w-full sm:w-auto transition-all duration-200"
                    disabled={loadingApplications}
                  >
                    {loadingApplications ? (
                      <>
                        <LoadingSpinner
                          size="sm"
                          variant="minimal"
                          color="slate"
                          showText={false}
                          className="mr-2"
                        />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2 rotate-45" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {applications.length}
                          </p>
                          <p className="text-xs text-slate-600">Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {
                              applications.filter(
                                (app) => app.status === "PENDING"
                              ).length
                            }
                          </p>
                          <p className="text-xs text-slate-600">Pending</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {
                              applications.filter(
                                (app) => app.status === "ACCEPTED"
                              ).length
                            }
                          </p>
                          <p className="text-xs text-slate-600">Accepted</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-red-500 to-pink-500 shadow-lg">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {
                              applications.filter(
                                (app) => app.status === "REJECTED"
                              ).length
                            }
                          </p>
                          <p className="text-xs text-slate-600">Rejected</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters and Search */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search by mentee name or email..."
                          className="bg-white/80"
                          value={applicationSearchTerm}
                          onChange={(e) => {
                            setApplicationSearchTerm(e.target.value);
                            setApplicationPage(1);
                          }}
                        />
                      </div>
                      {/* Status Filter */}
                      <Select
                        value={applicationStatusFilter}
                        onValueChange={(v) => {
                          setApplicationStatusFilter(v);
                          setApplicationPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-[150px] bg-white/80">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="ACCEPTED">Accepted</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={applicationOpportunityFilter}
                        onValueChange={(v) => {
                          setApplicationOpportunityFilter(v);
                          setApplicationPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-[150px] bg-white/80">
                          <SelectValue placeholder="Opportunity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Opportunities</SelectItem>
                          {opportunities.map((opp) => (
                            <SelectItem key={opp.id} value={opp.id}>
                              {opp.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications Table */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        Applications Management
                      </CardTitle>
                      <Badge variant="outline" className="bg-slate-50">
                        {applications.length} Total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingApplications ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <LoadingCard
                            key={i}
                            title="Loading applications..."
                            description="Fetching mentee applications for review"
                            size="sm"
                            variant="dots"
                            color="purple"
                            className="text-left h-24"
                          />
                        ))}
                      </div>
                    ) : filteredApplications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                          <FileText className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">
                          {applications.length === 0
                            ? "No applications yet"
                            : "No applications match your filters"}
                        </h3>
                        <p className="text-slate-600 max-w-sm mx-auto mb-6">
                          {applications.length === 0
                            ? "Applications will appear here when mentees apply to your opportunities. Make sure you have posted some opportunities to receive applications."
                            : "Try adjusting your search criteria or filters to find applications."}
                        </p>
                        {applications.length === 0 && (
                          <Button
                            onClick={() => setActiveSection("post-opportunity")}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Post an Opportunity
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Results count */}
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-slate-600">
                            Showing {startApplicationIndex + 1}-
                            {Math.min(
                              endApplicationIndex,
                              filteredApplications.length
                            )}{" "}
                            of {filteredApplications.length} applications
                          </p>
                          {(applicationSearchTerm ||
                            applicationOpportunityFilter !== "all" ||
                            applicationStatusFilter !== "all") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setApplicationSearchTerm("");
                                setApplicationStatusFilter("all");
                                setApplicationOpportunityFilter("all");
                                setApplicationPage(1);
                              }}
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                        {paginatedApplications.map((application) => {
                          const opportunity = opportunities.find(
                            (opp) => opp.id === application.opportunityId
                          );
                          return (
                            <div
                              key={application.id}
                              className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                  {application.menteeName?.[0]?.toUpperCase() ||
                                    "M"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 text-base sm:text-lg leading-tight">
                                    {application.menteeName}
                                  </p>
                                  <p className="text-sm text-slate-600 mt-1 truncate">
                                    {application.menteeEmail}
                                  </p>
                                  {opportunity && (
                                    <div className="flex items-center gap-2 mt-1 sm:mt-2">
                                      <Briefcase className="h-3 w-3 text-slate-400" />
                                      <p className="text-xs text-slate-500 font-medium truncate">
                                        {opportunity.title}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <p className="text-xs text-slate-500">
                                      Applied on{" "}
                                      {new Date(
                                        application.appliedAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-medium px-2 sm:px-3 py-1",
                                    application.status === "ACCEPTED" &&
                                      "bg-green-50 text-green-700 border-green-200",
                                    application.status === "PENDING" &&
                                      "bg-amber-50 text-amber-700 border-amber-200",
                                    application.status === "REJECTED" &&
                                      "bg-red-50 text-red-700 border-red-200"
                                  )}
                                >
                                  {application.status === "PENDING" && (
                                    <Clock className="h-3 w-3 mr-1" />
                                  )}
                                  {application.status === "ACCEPTED" && (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {application.status === "REJECTED" && (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {application.status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleReviewApplication(application)
                                  }
                                  className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 font-medium text-xs sm:text-sm"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  Review
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Pagination Controls for Applications */}
                        {totalApplicationPages > 1 && (
                          <div className="flex justify-center mt-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setApplicationPage((prev) =>
                                    Math.max(1, prev - 1)
                                  )
                                }
                                disabled={applicationPage === 1}
                              >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Previous
                              </Button>

                              <div className="flex items-center gap-1">
                                {Array.from(
                                  {
                                    length: Math.min(5, totalApplicationPages),
                                  },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalApplicationPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (applicationPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (
                                      applicationPage >=
                                      totalApplicationPages - 2
                                    ) {
                                      pageNum = totalApplicationPages - 4 + i;
                                    } else {
                                      pageNum = applicationPage - 2 + i;
                                    }

                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={
                                          applicationPage === pageNum
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        className={cn(
                                          "w-8 h-8 p-0",
                                          applicationPage === pageNum &&
                                            "bg-purple-600 text-white"
                                        )}
                                        onClick={() =>
                                          setApplicationPage(pageNum)
                                        }
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  }
                                )}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setApplicationPage((prev) =>
                                    Math.min(totalApplicationPages, prev + 1)
                                  )
                                }
                                disabled={
                                  applicationPage === totalApplicationPages
                                }
                              >
                                Next
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Post Opportunity Section */}
            {activeSection === "post-opportunity" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Post New Opportunity
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Share a new opportunity with mentees in the community.
                  </p>
                </div>

                {/* Form Card */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Plus className="h-5 w-5" />
                      Opportunity Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePostOpportunity();
                      }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={postOpportunityForm.title}
                            onChange={(e) =>
                              setPostOpportunityForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Enter opportunity title"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="opportunityType">Type *</Label>
                          <Select
                            value={postOpportunityForm.opportunityTypeId || ""}
                            onValueChange={(value) =>
                              setPostOpportunityForm((prev) => ({
                                ...prev,
                                opportunityTypeId: value,
                              }))
                            }
                          >
                            <SelectTrigger>
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
                                      <Badge variant="secondary">
                                        {type.name}
                                      </Badge>
                                    )}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={postOpportunityForm.description}
                          onChange={(e) =>
                            setPostOpportunityForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter detailed description"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={postOpportunityForm.location}
                            onChange={(e) =>
                              setPostOpportunityForm((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            placeholder="Enter location"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experienceLevel">
                            Experience Level
                          </Label>
                          <Select
                            value={postOpportunityForm.experienceLevel || ""}
                            onValueChange={(value) =>
                              setPostOpportunityForm((prev) => ({
                                ...prev,
                                experienceLevel: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ENTRY">Entry Level</SelectItem>
                              <SelectItem value="MID">Mid Level</SelectItem>
                              <SelectItem value="SENIOR">
                                Senior Level
                              </SelectItem>
                              <SelectItem value="EXPERT">
                                Expert Level
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration</Label>
                          <Select
                            value={postOpportunityForm.duration || ""}
                            onValueChange={(value) =>
                              setPostOpportunityForm((prev) => ({
                                ...prev,
                                duration: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-3 months">
                                1-3 months
                              </SelectItem>
                              <SelectItem value="3-6 months">
                                3-6 months
                              </SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                              <SelectItem value="2 years">2 years</SelectItem>
                              <SelectItem value="Permanent">
                                Permanent
                              </SelectItem>
                              <SelectItem value="Part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="Full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="Flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compensation">Compensation</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                ₹
                              </span>
                            </div>
                            <Input
                              id="compensation"
                              value={postOpportunityForm.compensation}
                              onChange={(e) =>
                                setPostOpportunityForm((prev) => ({
                                  ...prev,
                                  compensation: e.target.value,
                                }))
                              }
                              className="pl-8"
                              placeholder="50,000/year, Stipend provided, Free"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea
                          id="requirements"
                          value={postOpportunityForm.requirements}
                          onChange={(e) =>
                            setPostOpportunityForm((prev) => ({
                              ...prev,
                              requirements: e.target.value,
                            }))
                          }
                          placeholder="Enter requirements and qualifications"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="benefits">Benefits</Label>
                        <Textarea
                          id="benefits"
                          value={postOpportunityForm.benefits}
                          onChange={(e) =>
                            setPostOpportunityForm((prev) => ({
                              ...prev,
                              benefits: e.target.value,
                            }))
                          }
                          placeholder="Enter benefits and perks"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicationDeadline">
                          Application Deadline
                        </Label>
                        <Input
                          id="applicationDeadline"
                          type="date"
                          value={postOpportunityForm.applicationDeadline}
                          onChange={(e) =>
                            setPostOpportunityForm((prev) => ({
                              ...prev,
                              applicationDeadline: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveSection("main")}
                          disabled={postingOpportunity}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={postingOpportunity}>
                          {postingOpportunity ? (
                            <span className="inline-flex items-center gap-2">
                              <LoadingSpinner
                                size="sm"
                                variant="minimal"
                                showText={false}
                              />
                              <span>Creating...</span>
                            </span>
                          ) : (
                            <span>Create Opportunity</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Find Mentees Section */}
            {activeSection === "find-mentees" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Find Mentees
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Search and connect with potential mentees.
                  </p>
                </div>

                {/* Search Form */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search Mentees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Search by Name or Email
                        </Label>
                        <Input
                          placeholder="Search mentees..."
                          value={findMenteesForm.search}
                          onChange={(e) =>
                            setFindMenteesForm((prev) => ({
                              ...prev,
                              search: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleFindMentees()
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Location
                        </Label>
                        <Input
                          placeholder="e.g., New York, NY"
                          value={findMenteesForm.location}
                          onChange={(e) =>
                            setFindMenteesForm((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleFindMentees()
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Interests (comma-separated)
                        </Label>
                        <Input
                          placeholder="e.g., urology, research, surgery"
                          value={findMenteesForm.interests}
                          onChange={(e) =>
                            setFindMenteesForm((prev) => ({
                              ...prev,
                              interests: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleFindMentees()
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleFindMentees}
                        disabled={searchingMentees}
                      >
                        {searchingMentees ? "Searching..." : "Search"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFindMenteesForm({
                            search: "",
                            location: "",
                            experienceLevel: "",
                            interests: "",
                          });
                          clearSearch();
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Search Results */}
                {mentees.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Found {mentees.length} mentee
                      {mentees.length !== 1 ? "s" : ""}
                    </h2>
                  </div>
                )}

                {mentees.length === 0 && !searchingMentees && (
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                    <CardContent className="text-center py-12">
                      <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No mentees found
                      </h3>
                      <p className="text-slate-500">
                        Try adjusting your search criteria to find mentees.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Mentee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentees.map((mentee) => (
                    <Card
                      key={mentee.id}
                      className="hover:shadow-lg transition-shadow bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            {mentee.profile?.avatar ? (
                              <img
                                src={mentee.profile.avatar}
                                alt="Avatar"
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {mentee.firstName} {mentee.lastName}
                            </CardTitle>
                            <p className="text-sm text-slate-500">
                              {mentee.email}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {mentee.profile?.location && (
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {mentee.profile.location}
                            </span>
                          </div>
                        )}

                        {mentee.profile?.education && (
                          <div className="flex items-center gap-2 mb-3">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {mentee.profile.education}
                            </span>
                          </div>
                        )}

                        {mentee.profile?.bio && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {mentee.profile.bio}
                          </p>
                        )}

                        {mentee.profile?.interests &&
                          mentee.profile.interests.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">
                                  Interests:
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {mentee.profile.interests.map(
                                  (interest, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {interest}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {mentee.profile?.purposeOfRegistration && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-slate-700">
                              Purpose:
                            </span>
                            <p className="text-sm text-slate-600 mt-1">
                              {mentee.profile.purposeOfRegistration}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-400">
                          Joined:{" "}
                          {new Date(mentee.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Discussions Section */}
            {activeSection === "discussions" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Discussions
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Engage with the community through discussions and forums.
                  </p>
                </div>

                {/* Discussions Overview */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Community Discussions
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Join conversations with mentees and other mentors to
                        share knowledge and insights.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                          disabled
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Discussions
                        </Button>
                        <Button
                          variant="outline"
                          className="border-purple-200 hover:bg-purple-50 text-purple-700"
                          disabled
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Start Discussion
                        </Button>
                        <Button
                          onClick={() => setActiveSection("main")}
                          variant="outline"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Dashboard
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Opportunity Modal */}
      {showViewModal && selectedOpportunity && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {selectedOpportunity.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {selectedOpportunity.opportunityType?.name || "Type"}
                </Badge>
                {getStatusBadge(selectedOpportunity.status)}
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedOpportunity.location && (
                  <div>
                    <span className="font-medium text-slate-700">Location</span>
                    <p className="text-slate-900">
                      {selectedOpportunity.location}
                    </p>
                  </div>
                )}
                {selectedOpportunity.experienceLevel && (
                  <div>
                    <span className="font-medium text-slate-700">
                      Experience Level
                    </span>
                    <p className="text-slate-900">
                      {selectedOpportunity.experienceLevel}
                    </p>
                  </div>
                )}
                {selectedOpportunity.duration && (
                  <div>
                    <span className="font-medium text-slate-700">Duration</span>
                    <p className="text-slate-900">
                      {selectedOpportunity.duration}
                    </p>
                  </div>
                )}
                {selectedOpportunity.compensation && (
                  <div>
                    <span className="font-medium text-slate-700">
                      Compensation
                    </span>
                    <p className="text-slate-900">
                      {selectedOpportunity.compensation}
                    </p>
                  </div>
                )}
                {selectedOpportunity.applicationDeadline && (
                  <div>
                    <span className="font-medium text-slate-700">
                      Application Deadline
                    </span>
                    <p className="text-slate-900">
                      {new Date(
                        selectedOpportunity.applicationDeadline
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-slate-700">Posted</span>
                  <p className="text-slate-900">
                    {new Date(
                      selectedOpportunity.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedOpportunity.description}
                </p>
              </div>

              {/* Requirements */}
              {selectedOpportunity.requirements && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Requirements
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedOpportunity.requirements}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {selectedOpportunity.benefits && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Benefits
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedOpportunity.benefits}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will remove the opportunity
              from your list and mentees will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingOpportunity}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOpportunity}
              disabled={deletingOpportunity}
            >
              {deletingOpportunity ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </span>
              ) : (
                <span>Delete</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Opportunity Modal */}
      {showEditModal && selectedOpportunity && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Opportunity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingOpportunity.title || ""}
                    onChange={(e) =>
                      setEditingOpportunity((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter opportunity title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingOpportunity.location || ""}
                    onChange={(e) =>
                      setEditingOpportunity((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingOpportunity.description || ""}
                  onChange={(e) =>
                    setEditingOpportunity((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter detailed description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-experienceLevel">Experience Level</Label>
                  <Select
                    value={editingOpportunity.experienceLevel || ""}
                    onValueChange={(value) =>
                      setEditingOpportunity((prev) => ({
                        ...prev,
                        experienceLevel: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="MID">Mid Level</SelectItem>
                      <SelectItem value="SENIOR">Senior Level</SelectItem>
                      <SelectItem value="EXPERT">Expert Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Select
                    value={editingOpportunity.duration || ""}
                    onValueChange={(value) =>
                      setEditingOpportunity((prev) => ({
                        ...prev,
                        duration: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3 months">1-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                      <SelectItem value="2 years">2 years</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-compensation">Compensation</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <Input
                    id="edit-compensation"
                    value={editingOpportunity.compensation || ""}
                    onChange={(e) =>
                      setEditingOpportunity((prev) => ({
                        ...prev,
                        compensation: e.target.value,
                      }))
                    }
                    className="pl-8"
                    placeholder="50,000/year, Stipend provided, Free"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-requirements">Requirements</Label>
                <Textarea
                  id="edit-requirements"
                  value={editingOpportunity.requirements || ""}
                  onChange={(e) =>
                    setEditingOpportunity((prev) => ({
                      ...prev,
                      requirements: e.target.value,
                    }))
                  }
                  placeholder="Enter requirements and qualifications"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-benefits">Benefits</Label>
                <Textarea
                  id="edit-benefits"
                  value={editingOpportunity.benefits || ""}
                  onChange={(e) =>
                    setEditingOpportunity((prev) => ({
                      ...prev,
                      benefits: e.target.value,
                    }))
                  }
                  placeholder="Enter benefits and perks"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-applicationDeadline">
                  Application Deadline
                </Label>
                <Input
                  id="edit-applicationDeadline"
                  type="date"
                  value={editingOpportunity.applicationDeadline || ""}
                  onChange={(e) =>
                    setEditingOpportunity((prev) => ({
                      ...prev,
                      applicationDeadline: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingOpportunity}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveOpportunity}
                  disabled={savingOpportunity}
                >
                  {savingOpportunity ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Application Modal */}
      {showReviewModal && selectedApplication && (
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review Application
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Applicant Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Name:
                    </span>
                    <p className="text-sm text-slate-900">
                      {selectedApplication.menteeName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Email:
                    </span>
                    <p className="text-sm text-slate-900">
                      {selectedApplication.menteeEmail}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Applied on:
                    </span>
                    <p className="text-sm text-slate-900">
                      {new Date(
                        selectedApplication.appliedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Current Status:
                    </span>
                    <div className="mt-1">
                      {getApplicationStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Cover Letter
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {selectedApplication.resumeUrl && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Resume</h3>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              )}

              {selectedApplication.status === "PENDING" && (
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateApplicationStatus("REJECTED")}
                    disabled={reviewing}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {reviewing ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => handleUpdateApplicationStatus("ACCEPTED")}
                    disabled={reviewing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {reviewing ? "Processing..." : "Accept"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Profile Editing Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 sm:py-4">
            <ProfileForm
              profile={profile ? { ...profile, user } : { user }}
              onSubmit={async (profileData: any) => {
                try {
                  setIsSavingProfile(true);
                  const method = profile ? "PUT" : "POST";
                  const response = await fetch("/api/profile", {
                    method,
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profileData),
                  });
                  if (!response.ok) {
                    const err = await response.json();
                    alert(err.error || "Failed to save profile");
                    return;
                  }
                  const saved = await response.json();
                  setProfile(saved.profile);
                  setShowProfileModal(false);
                } catch (err) {
                  console.error("Failed to save profile", err);
                  alert("Failed to save profile. Please try again.");
                } finally {
                  setIsSavingProfile(false);
                }
              }}
              isSubmitting={isSavingProfile}
              onCancel={() => setShowProfileModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
