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
import { useToast } from "@/hooks/use-toast";
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
  Mail,
  Phone,
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
  resumeUrl?: string | null;
  coverLetter?: string | null;
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
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
  const [showMenteeProfileModal, setShowMenteeProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    template: "general",
  });
  const [sendingMessage, setSendingMessage] = useState(false);

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
  
  // Using single card view - simpler and more user-friendly
  
  const [findMenteesForm, setFindMenteesForm] = useState({
    search: "",
    location: "",
    experienceLevel: "all",
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
    console.log('Application data for review:', application);
    console.log('Resume URL:', application.resumeUrl);
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
      } catch { }
      
      // Show success toast
      toast({
        title: "✅ Deleted Successfully",
        description: "The opportunity has been permanently removed.",
        duration: 3000,
      });
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
        
        // Show success toast
        toast({
          title: `✅ Application ${status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`,
          description: `The mentee's application has been ${status.toLowerCase()} successfully.`,
          duration: 4000,
        });
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
    
    // Get the opportunity type for optimistic update
    const selectedOpportunityType = opportunityTypes.find(
      (type) => type.id === postOpportunityForm.opportunityTypeId
    );
    
    // Create optimistic opportunity object
    const optimisticOpportunity: Opportunity = {
      id: `temp-${Date.now()}`, // Temporary ID
      title: postOpportunityForm.title,
      description: postOpportunityForm.description,
      location: postOpportunityForm.location,
      experienceLevel: postOpportunityForm.experienceLevel,
      opportunityType: selectedOpportunityType || {
        id: postOpportunityForm.opportunityTypeId,
        name: "Unknown",
      },
      status: "APPROVED",
      mentorId: user?.id || "",
      requirements: postOpportunityForm.requirements,
      benefits: postOpportunityForm.benefits,
      duration: postOpportunityForm.duration,
      compensation: postOpportunityForm.compensation,
      applicationDeadline: postOpportunityForm.applicationDeadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Optimistically add to opportunities list
    setOpportunities((prev) => [optimisticOpportunity, ...prev]);
    
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
        const responseData = await response.json();
        const newOpportunity = responseData.opportunity;
        
        // Replace optimistic opportunity with real one
        setOpportunities((prev) => 
          prev.map((opp) => 
            opp.id === optimisticOpportunity.id ? newOpportunity : opp
          )
        );
        
        // Show success toast
        toast({
          title: "✅ Success!",
          description: "Opportunity posted successfully and is now live!",
          duration: 4000,
        });
        
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
        
        // Auto-switch to opportunities tab to show the new opportunity
        setTimeout(() => {
          setActiveSection("opportunities");
          toast({
            title: "📋 Redirected to My Opportunities",
            description: "Your new opportunity is now visible and ready to receive applications!",
            duration: 5000,
          });
        }, 1500);
      } else {
        // Remove optimistic opportunity on failure
        setOpportunities((prev) => 
          prev.filter((opp) => opp.id !== optimisticOpportunity.id)
        );
        
        const errorData = await response.json();
        setFormError(errorData.error || "Failed to post opportunity");
      }
    } catch (error) {
      console.error("Error posting opportunity:", error);
      
      // Remove optimistic opportunity on error
      setOpportunities((prev) => 
        prev.filter((opp) => opp.id !== optimisticOpportunity.id)
      );
      
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

      // Show search completion toast
      toast({
        title: "🔍 Search Completed",
        description: `Found ${mentees.length} mentee${mentees.length !== 1 ? 's' : ''} matching your criteria.`,
        duration: 3000,
      });
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
    setShowMenteeProfileModal(true);
  };

  const handleContactMentee = (mentee: any) => {
    setSelectedMentee(mentee);
    setContactForm({
      subject: `Mentorship Opportunity - ${user?.firstName || 'Dr.'} ${user?.lastName || ''}`,
      message: `Hi ${mentee.firstName},\n\nI hope this message finds you well. I came across your profile on UroCareerz and I'm impressed by your background and interests.\n\nAs a mentor in the field, I'd love to discuss potential mentorship opportunities with you. I believe my experience could be valuable for your career development.\n\nWould you be interested in having a conversation about this?\n\nBest regards,\n${user?.firstName || 'Dr.'} ${user?.lastName || ''}`,
      template: "general",
    });
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedMentee || !contactForm.subject.trim() || !contactForm.message.trim()) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in both subject and message before sending.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setSendingMessage(true);
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menteeEmail: selectedMentee.email,
          menteeName: `${selectedMentee.firstName} ${selectedMentee.lastName}`,
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "✅ Message Sent Successfully!",
          description: `Your message has been sent to ${selectedMentee.firstName}. They'll receive it in their email inbox.`,
          duration: 5000,
        });
        
        // Reset form and close modal
        setContactForm({
          subject: "",
          message: "",
          template: "general",
        });
        setShowContactModal(false);
      } else {
        // Handle API errors
        const errorMessage = result.error || "Failed to send message. Please try again.";
        toast({
          title: "❌ Failed to Send Message",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "❌ Network Error",
        description: "Unable to send message. Please check your connection and try again.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Using single card view for simplified UX

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
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 font-semibold text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Pending Review
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold text-sm">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-semibold text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Withdrawn
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {status}
          </Badge>
        );
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

                {/* Essential Stats - Streamlined */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-blue-300/60 transition-all duration-200 cursor-pointer group"
                    onClick={() => setActiveSection("opportunities")}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg group-hover:shadow-xl transition-shadow">
                          <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {stats.totalOpportunities}
                          </p>
                          <p className="text-sm text-slate-600 font-medium group-hover:text-blue-700 transition-colors">
                            My Opportunities
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-emerald-300/60 transition-all duration-200 cursor-pointer group"
                    onClick={() => setActiveSection("applications")}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg group-hover:shadow-xl transition-shadow">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {stats.totalApplications}
                          </p>
                          <p className="text-sm text-slate-600 font-medium group-hover:text-emerald-700 transition-colors">
                            Applications Received
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-5 w-5 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-amber-300/60 transition-all duration-200 cursor-pointer group"
                    onClick={() => setActiveSection("applications")}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg group-hover:shadow-xl transition-shadow">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {stats.pendingApplications}
                          </p>
                          <p className="text-sm text-slate-600 font-medium group-hover:text-amber-700 transition-colors">
                            Awaiting Review
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-5 w-5 text-amber-600" />
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
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg w-full sm:w-auto transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Opportunity
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
                        <SelectTrigger className="w-full sm:w-[220px] bg-white/80">
                          <SelectValue placeholder="Type" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {opportunityTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name} className="truncate">
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

                {/* Enhanced Card View - Single, Clean, Responsive Design */}
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
                    {/* Results Summary */}
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
                    
                    {/* Enhanced Card Layout */}
                    <div className="space-y-4">
                    {paginatedOpportunities.map((opportunity) => {
                      // Check if opportunity is newly created (within last 30 minutes)
                      const isNewlyCreated = opportunity.id.startsWith('temp-') || 
                        (new Date().getTime() - new Date(opportunity.createdAt).getTime()) < 30 * 60 * 1000;
                      
                      return (
                        <Card
                          key={opportunity.id}
                          className={cn(
                            "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-blue-300/60 transition-all duration-300 cursor-pointer group",
                            isNewlyCreated && "ring-2 ring-green-500/30 border-green-200 bg-green-50/50"
                          )}
                          onClick={() => handleViewOpportunity(opportunity)}
                        >
                          <CardContent className="p-4 sm:p-6">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                                  isNewlyCreated 
                                    ? "bg-gradient-to-tr from-green-500 to-emerald-500" 
                                    : "bg-gradient-to-tr from-blue-500 to-indigo-500"
                                )}>
                                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200 mb-1">
                                        {opportunity.title}
                                      </h3>
                                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                        {opportunity.description?.replace(/\s+/g, ' ').trim() || ''}
                                      </p>
                                    </div>
                                    {isNewlyCreated && (
                                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs animate-pulse flex-shrink-0">
                                        ✨ New
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Information Grid - Redesigned with better alignment */}
                            <div className="space-y-3 sm:space-y-4 mb-4">
                              {/* Primary Info Row */}
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-medium",
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
                                
                                <Badge variant="secondary" className="text-xs font-medium">
                                  {opportunity.opportunityType?.name || "No Type"}
                                </Badge>
                                
                                {opportunity.location && (
                                  <div className="flex items-center gap-1 text-xs text-slate-600">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="font-medium">{opportunity.location}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Secondary Info Row */}
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Posted {new Date(opportunity.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: new Date(opportunity.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                  })}</span>
                                </div>
                                
                                {opportunity.applicationDeadline && (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">
                                      Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                              <div 
                                className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewOpportunity(opportunity);
                                  }}
                                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-3"
                                >
                                  <Eye className="h-4 w-4 sm:mr-1" />
                                  <span className="text-xs hidden sm:inline">View</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOpportunity(opportunity);
                                  }}
                                  className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2 sm:px-3"
                                >
                                  <Edit3 className="h-4 w-4 sm:mr-1" />
                                  <span className="text-xs hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    requestDeleteOpportunity(opportunity);
                                  }}
                                  className="text-slate-600 hover:text-red-600 hover:bg-red-50 px-2 sm:px-3"
                                >
                                  <XCircle className="h-4 w-4 sm:mr-1" />
                                  <span className="text-xs hidden sm:inline">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    </div>
                    
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
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Applications
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Review and manage applications from mentees.
                  </p>
                </div>

                {/* Quick Stats - Streamlined like main dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                            {
                              applications.filter(
                                (app) => app.status === "PENDING"
                              ).length
                            }
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            Awaiting Review
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                            {
                              applications.filter(
                                (app) => app.status === "ACCEPTED"
                              ).length
                            }
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            Accepted
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                            {applications.length}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            Total Applications
                          </p>
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
                        <SelectTrigger className="w-full sm:w-[160px] bg-white/80">
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
                        <SelectTrigger className="w-full sm:w-[220px] md:w-[280px] bg-white/80">
                          <SelectValue placeholder="Opportunity" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[280px] sm:max-w-[350px]">
                          <SelectItem value="all">All Opportunities</SelectItem>
                          {opportunities.map((opp) => (
                            <SelectItem key={opp.id} value={opp.id} className="truncate">
                              <span className="truncate" title={opp.title}>
                                {opp.title}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications Display */}
                <div className="space-y-4">
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
                          const isPending = application.status === "PENDING";
                          
                          return (
                            <Card
                              key={application.id}
                              className={cn(
                                "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-purple-300/60 transition-all duration-300 cursor-pointer group",
                                isPending && "ring-1 ring-amber-200 border-amber-200 bg-amber-50/30"
                              )}
                              onClick={() => handleReviewApplication(application)}
                            >
                              <CardContent className="p-4 sm:p-6">
                                {/* Header Section */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                      {application.menteeName?.[0]?.toUpperCase() || "M"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg sm:text-xl text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors duration-200">
                                          {application.menteeName}
                                        </h3>
                                        {isPending && (
                                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs animate-pulse flex-shrink-0">
                                            ⏳ New
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-base font-medium text-slate-600 line-clamp-1 mb-2">
                                        {application.menteeEmail}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Click hint - visible on desktop hover */}
                                  <div className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center text-xs text-purple-600">
                                    <Eye className="h-3 w-3 mr-1" />
                                    <span>Click to review</span>
                                  </div>
                                </div>
                                
                                {/* Information Section */}
                                <div className="space-y-3 sm:space-y-4 mb-4">
                                  {/* Primary Info Row */}
                                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-sm font-semibold",
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
                                    
                                    {opportunity && (
                                      <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                                        <span className="font-semibold truncate">{opportunity.title}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Secondary Info Row */}
                                  <div className="flex items-center justify-between text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span className="font-medium">Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: new Date(application.appliedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                      })}</span>
                                    </div>
                                    
                                    {application.resumeUrl && (
                                      <div className="flex items-center gap-1 text-blue-600">
                                        <FileText className="h-4 w-4" />
                                        <span className="font-semibold">Resume attached</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Action Footer */}
                                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                                  <div 
                                    className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200" 
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReviewApplication(application);
                                      }}
                                      className={cn(
                                        "text-slate-600 hover:text-purple-600 hover:bg-purple-50 px-3",
                                        isPending && "text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                                      )}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      <span className="text-sm font-semibold">{isPending ? "Review Now" : "View Details"}</span>
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
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
                </div>
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
                        <Button 
                          type="submit" 
                          disabled={postingOpportunity}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg min-w-[160px] transition-all duration-200"
                        >
                          {postingOpportunity ? (
                            <span className="inline-flex items-center gap-2">
                              <LoadingSpinner
                                size="sm"
                                variant="minimal"
                                showText={false}
                                color="white"
                              />
                              <span>Posting...</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              <span>Post Opportunity</span>
                            </span>
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
                {/* Enhanced Page Header with Stats */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        Find Mentees
                      </h1>
                      <p className="text-sm sm:text-base text-slate-600">
                        Discover and connect with talented mentees looking for guidance.
                      </p>
                    </div>
                    {mentees.length > 0 && (
                      <div className="flex-shrink-0">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2">
                          <span className="text-xs sm:text-sm font-semibold text-blue-700">
                            {mentees.length} mentee{mentees.length !== 1 ? 's' : ''} found
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Search Interface */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/60 px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Smart Mentee Search</h3>
                        <p className="text-sm text-slate-600">Use advanced filters to find your ideal mentees</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    {/* Main Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          placeholder="Search by name, email, or keywords..."
                          className="pl-10 h-12 text-base bg-white/80 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
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
                    </div>

                    {/* Advanced Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Input
                          placeholder="City, State, or Country"
                          className="bg-white/80 border-slate-200 focus:border-blue-300"
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
                        <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Experience Level
                        </Label>
                        <Select
                          value={findMenteesForm.experienceLevel}
                          onValueChange={(value) => {
                            setFindMenteesForm((prev) => ({
                              ...prev,
                              experienceLevel: value,
                            }));
                            // Trigger search immediately when experience level changes
                            updateFilters({
                              query: findMenteesForm.search,
                              location: findMenteesForm.location,
                              experienceLevel: value,
                              interests: findMenteesForm.interests,
                            });
                          }}
                        >
                          <SelectTrigger className="bg-white/80 border-slate-200 focus:border-blue-300">
                            <SelectValue placeholder="Any level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Experience Level</SelectItem>
                            <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                            <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="resident">Resident</SelectItem>
                            <SelectItem value="fellow">Fellow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Speciality Interests
                        </Label>
                        <Input
                          placeholder="urology, surgery, research..."
                          className="bg-white/80 border-slate-200 focus:border-blue-300"
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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={handleFindMentees}
                        disabled={searchingMentees}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg px-6"
                      >
                        {searchingMentees ? (
                          <>
                            <LoadingSpinner size="sm" variant="minimal" showText={false} color="white" className="mr-2" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Search Mentees
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFindMenteesForm({
                            search: "",
                            location: "",
                            experienceLevel: "all",
                            interests: "",
                          });
                          clearSearch();
                        }}
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Empty State */}
                {mentees.length === 0 && !searchingMentees && (
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                    <CardContent className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Search className="h-12 w-12 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        Start Your Mentee Discovery
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                        Use the search filters above to find mentees who match your expertise and interests. Try searching by location, experience level, or specific specialties.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {['urology', 'surgery', 'research', 'clinical', 'oncology'].map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                            onClick={() => {
                              setFindMenteesForm(prev => ({ ...prev, interests: tag }));
                              handleFindMentees();
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => {
                          setFindMenteesForm(prev => ({ ...prev, search: '' }));
                          handleFindMentees();
                        }}
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Browse All Mentees
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Mentee Profile Cards */}
                {mentees.length > 0 && (
                  <div className="space-y-4">
                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {mentees.length} mentee{mentees.length !== 1 ? 's' : ''} found
                      </h2>
                    </div>

                    {/* Enhanced Mentee Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {mentees.map((mentee, index) => (
                        <Card
                          key={mentee.id}
                          className="group bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-blue-300/60 transition-all duration-300 cursor-pointer overflow-hidden"
                          onClick={() => handleViewMenteeProfile(mentee)}
                        >
                          <CardContent className="p-0">
                            {/* Profile Header with Background Gradient */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-slate-200/60">
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="relative">
                                  <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                    {mentee.profile?.avatar ? (
                                      <img
                                        src={mentee.profile.avatar}
                                        alt={`${mentee.firstName} ${mentee.lastName}`}
                                        className="h-16 w-16 rounded-xl object-cover"
                                      />
                                    ) : (
                                      <span className="text-white font-bold text-xl">
                                        {mentee.firstName?.[0]?.toUpperCase()}{mentee.lastName?.[0]?.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="h-2 w-2 bg-white rounded-full"></div>
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {mentee.firstName} {mentee.lastName}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{mentee.email}</p>
                                  
                                  {/* Quick Info Pills */}
                                  <div className="flex flex-wrap gap-2">
                                    {mentee.profile?.location && (
                                      <div className="inline-flex items-center gap-1 bg-white/80 px-2 py-1 rounded-md text-xs text-slate-600">
                                        <MapPin className="h-3 w-3" />
                                        {mentee.profile.location}
                                      </div>
                                    )}
                                    <div className="inline-flex items-center gap-1 bg-white/80 px-2 py-1 rounded-md text-xs text-slate-600">
                                      <Calendar className="h-3 w-3" />
                                      Joined {new Date(mentee.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action Hint */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span className="hidden sm:inline">View Profile</span>
                                </div>
                              </div>
                            </div>

                            {/* Profile Details */}
                            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                              {/* Bio/Description */}
                              {mentee.profile?.bio && (
                                <div>
                                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
                                    {mentee.profile.bio}
                                  </p>
                                </div>
                              )}
                              
                              {/* Education */}
                              {mentee.profile?.education && (
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-purple-100 rounded">
                                    <Award className="h-3 w-3 text-purple-600" />
                                  </div>
                                  <span className="text-sm text-slate-700 font-medium">
                                    {mentee.profile.education}
                                  </span>
                                </div>
                              )}
                              
                              {/* Interests/Skills */}
                              {mentee.profile?.interests && mentee.profile.interests.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">Interests</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {mentee.profile.interests.slice(0, 4).map((interest, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200"
                                      >
                                        {interest}
                                      </Badge>
                                    ))}
                                    {mentee.profile.interests.length > 4 && (
                                      <Badge variant="outline" className="text-xs text-slate-500">
                                        +{mentee.profile.interests.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Purpose */}
                              {mentee.profile?.purposeOfRegistration && (
                                <div className="bg-slate-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium text-slate-700">Goal</span>
                                  </div>
                                  <p className="text-sm text-slate-600 line-clamp-2">
                                    {mentee.profile.purposeOfRegistration}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Bar */}
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/80 border-t border-slate-200/60 flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewMenteeProfile(mentee);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Profile
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-200 hover:bg-slate-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContactMentee(mentee);
                                  }}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                              </div>
                              
                              <div className="text-xs text-slate-400">
                                #{String(index + 1).padStart(2, '0')}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination for large results */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(pagination.page - 1)}
                            disabled={!pagination.hasPrev}
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                              let pageNum = pagination.page - 2 + i;
                              if (pageNum < 1) pageNum = i + 1;
                              if (pageNum > pagination.pages) pageNum = pagination.pages - 4 + i;
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pagination.page === pageNum ? "default" : "outline"}
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => changePage(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(pagination.page + 1)}
                            disabled={!pagination.hasNext}
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

      {/* Enhanced View Opportunity Modal */}
      {showViewModal && selectedOpportunity && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-[90vw] w-full max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-white" style={{maxWidth: 'min(90vw, 1400px)'}}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                    <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight break-words">
                        {selectedOpportunity.title}
                      </DialogTitle>
                      <p className="text-sm text-slate-600 mt-1 break-words">
                        Posted on {new Date(selectedOpportunity.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(selectedOpportunity.opportunityType?.name || '') && (
                      <Badge className={cn(
                        "text-xs font-medium",
                        getTypeBadge(selectedOpportunity.opportunityType?.name || '')?.colorClass
                      )}>
                        <Target className="h-3 w-3 mr-1" />
                        {selectedOpportunity.opportunityType?.name || "Type"}
                      </Badge>
                    )}
                    <Badge className={cn(
                      "text-xs font-medium",
                      selectedOpportunity.status === "APPROVED" && "bg-green-100 text-green-800 border-green-200",
                      selectedOpportunity.status === "PENDING" && "bg-amber-100 text-amber-800 border-amber-200",
                      selectedOpportunity.status === "REJECTED" && "bg-red-100 text-red-800 border-red-200"
                    )}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {selectedOpportunity.status}
                    </Badge>
                    {selectedOpportunity.id.startsWith('temp-') || 
                      (new Date().getTime() - new Date(selectedOpportunity.createdAt).getTime()) < 30 * 60 * 1000 && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs animate-pulse">
                          ✨ New
                        </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditOpportunity(selectedOpportunity);
                    }}
                    className="bg-white/80 hover:bg-white border-slate-300 shadow-sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowViewModal(false)}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedOpportunity.location && (
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
                        <p className="text-sm font-semibold text-slate-900 break-words">{selectedOpportunity.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedOpportunity.experienceLevel && (
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Experience</p>
                        <p className="text-sm font-semibold text-slate-900 break-words">{selectedOpportunity.experienceLevel}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedOpportunity.duration && (
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Clock className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</p>
                        <p className="text-sm font-semibold text-slate-900 break-words">{selectedOpportunity.duration}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedOpportunity.compensation && (
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Compensation</p>
                        <p className="text-sm font-semibold text-slate-900 break-words">{selectedOpportunity.compensation}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedOpportunity.applicationDeadline && (
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-red-100">
                        <Calendar className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deadline</p>
                        <p className="text-sm font-semibold text-slate-900 break-words">
                          {new Date(selectedOpportunity.applicationDeadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      <div className="prose max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words word-break-all overflow-wrap-anywhere">
                          {selectedOpportunity.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  {selectedOpportunity.requirements && (
                    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-amber-600" />
                          Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="min-w-0">
                        <div className="prose max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words word-break-all overflow-wrap-anywhere">
                            {selectedOpportunity.requirements}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Benefits */}
                  {selectedOpportunity.benefits && (
                    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Star className="h-5 w-5 text-emerald-600" />
                          Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="min-w-0">
                        <div className="prose max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words word-break-all overflow-wrap-anywhere">
                            {selectedOpportunity.benefits}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditOpportunity(selectedOpportunity);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Opportunity
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowViewModal(false);
                          requestDeleteOpportunity(selectedOpportunity);
                        }}
                        className="w-full bg-white/80 hover:bg-white border-red-200 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete Opportunity
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`/opportunities/${selectedOpportunity.id}`, '_blank')}
                        className="w-full bg-white/80 hover:bg-white border-slate-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Public Page
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
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

      {/* Enhanced Edit Opportunity Modal */}
      {showEditModal && selectedOpportunity && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-[85vw] w-full max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-white" style={{maxWidth: 'min(85vw, 1200px)'}}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight break-words">
                      Edit Opportunity
                    </DialogTitle>
                    <p className="text-sm text-slate-600 mt-1 break-words">
                      Update your opportunity details and settings
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                    disabled={savingOpportunity}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveOpportunity(); }} className="space-y-8">
                {/* Basic Information Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Basic Information
                    </CardTitle>
                    <p className="text-sm text-slate-600">Essential details about your opportunity</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title" className="text-sm font-medium text-slate-700">
                          Title <span className="text-red-500">*</span>
                        </Label>
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
                          className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-location" className="text-sm font-medium text-slate-700">
                          Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="edit-location"
                            value={editingOpportunity.location || ""}
                            onChange={(e) =>
                              setEditingOpportunity((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            placeholder="e.g., New York, NY"
                            className="pl-10 bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={editingOpportunity.description || ""}
                        onChange={(e) =>
                          setEditingOpportunity((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Provide a detailed description of the opportunity, responsibilities, and what mentees will learn..."
                        rows={4}
                        className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400 resize-none break-words"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {editingOpportunity.description?.length || 0} characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Position Details Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-600" />
                      Position Details
                    </CardTitle>
                    <p className="text-sm text-slate-600">Specify the role requirements and duration</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-experienceLevel" className="text-sm font-medium text-slate-700">
                          Experience Level
                        </Label>
                        <Select
                          value={editingOpportunity.experienceLevel || ""}
                          onValueChange={(value) =>
                            setEditingOpportunity((prev) => ({
                              ...prev,
                              experienceLevel: value,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-400">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ENTRY">🎯 Entry Level</SelectItem>
                            <SelectItem value="MID">📈 Mid Level</SelectItem>
                            <SelectItem value="SENIOR">🚀 Senior Level</SelectItem>
                            <SelectItem value="EXPERT">⭐ Expert Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-duration" className="text-sm font-medium text-slate-700">
                          Duration
                        </Label>
                        <Select
                          value={editingOpportunity.duration || ""}
                          onValueChange={(value) =>
                            setEditingOpportunity((prev) => ({
                              ...prev,
                              duration: value,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white/80 border-slate-200 focus:border-purple-400">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-3 months">⏱️ 1-3 months</SelectItem>
                            <SelectItem value="3-6 months">📅 3-6 months</SelectItem>
                            <SelectItem value="6 months">📆 6 months</SelectItem>
                            <SelectItem value="1 year">🗓️ 1 year</SelectItem>
                            <SelectItem value="2 years">📊 2 years</SelectItem>
                            <SelectItem value="Permanent">🏢 Permanent</SelectItem>
                            <SelectItem value="Part-time">⏰ Part-time</SelectItem>
                            <SelectItem value="Full-time">🕘 Full-time</SelectItem>
                            <SelectItem value="Flexible">🔄 Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-compensation" className="text-sm font-medium text-slate-700">
                        Compensation
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Award className="h-4 w-4 text-amber-500" />
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
                          className="pl-10 bg-white/80 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                          placeholder="e.g., ₹50,000/year, Stipend provided, Unpaid"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-applicationDeadline" className="text-sm font-medium text-slate-700">
                        Application Deadline
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                          className="pl-10 bg-white/80 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Information Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      Additional Details
                    </CardTitle>
                    <p className="text-sm text-slate-600">Requirements, benefits, and other important information</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-requirements" className="text-sm font-medium text-slate-700">
                        Requirements & Qualifications
                      </Label>
                      <Textarea
                        id="edit-requirements"
                        value={editingOpportunity.requirements || ""}
                        onChange={(e) =>
                          setEditingOpportunity((prev) => ({
                            ...prev,
                            requirements: e.target.value,
                          }))
                        }
                        placeholder="List the requirements, qualifications, skills, or experience needed for this opportunity..."
                        rows={3}
                        className="bg-white/80 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 resize-none break-words overflow-wrap-anywhere"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-benefits" className="text-sm font-medium text-slate-700">
                        Benefits & Perks
                      </Label>
                      <Textarea
                        id="edit-benefits"
                        value={editingOpportunity.benefits || ""}
                        onChange={(e) =>
                          setEditingOpportunity((prev) => ({
                            ...prev,
                            benefits: e.target.value,
                          }))
                        }
                        placeholder="Describe the benefits, learning opportunities, networking, or other perks..."
                        rows={3}
                        className="bg-white/80 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 resize-none break-words overflow-wrap-anywhere"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end items-center pt-6">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      disabled={savingOpportunity}
                      className="min-w-[100px] bg-white hover:bg-slate-50 border-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingOpportunity || !editingOpportunity.title || !editingOpportunity.description}
                      className="min-w-[140px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
                    >
                      {savingOpportunity ? (
                        <span className="inline-flex items-center gap-2">
                          <LoadingSpinner
                            size="sm"
                            variant="minimal"
                            color="white"
                            showText={false}
                          />
                          <span>Saving...</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Save Changes</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Review Application Modal */}
      {showReviewModal && selectedApplication && (
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Review Application
                </DialogTitle>
                <p className="text-base text-slate-600 mt-2">
                  Review and decide on this mentee's application
                </p>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-6">
              {/* Enhanced Applicant Information Card */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 p-6 rounded-xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                    {selectedApplication.menteeName?.[0]?.toUpperCase() || "M"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {selectedApplication.menteeName}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-700">
                            Email:
                          </span>
                          <p className="text-base text-slate-900 font-medium break-all">
                            {selectedApplication.menteeEmail}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-700">
                            Applied:
                          </span>
                          <p className="text-base text-slate-900 font-medium">
                            {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            Status:
                          </span>
                          <div className="flex items-start">
                            {getApplicationStatusBadge(selectedApplication.status)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            Resume:
                          </span>
                          <div className="flex items-start">
                            {selectedApplication.resumeUrl ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <FileText className="h-3 w-3 mr-1" />
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Provided
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Cover Letter Section */}
              {selectedApplication.coverLetter && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-green-100">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      Cover Letter
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="prose max-w-none">
                        <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap m-0">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Resume Section */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    Resume Attachment
                  </h3>
                </div>
                <div className="p-6">
                  {selectedApplication.resumeUrl ? (
                    <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-500 shadow-md">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-slate-900">
                            {selectedApplication.menteeName}'s Resume
                          </p>
                          <p className="text-sm text-slate-600">
                            PDF Document • Click to view or download
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => window.open(selectedApplication.resumeUrl!, '_blank')}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md font-semibold"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedApplication.resumeUrl!;
                            link.download = `${selectedApplication.menteeName.replace(/\s+/g, '_')}_Resume.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="bg-white border-slate-300 hover:bg-slate-50 font-semibold"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-8">
                      <div className="text-center">
                        <div className="p-3 rounded-lg bg-gray-200 inline-flex mb-3">
                          <XCircle className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-base font-semibold text-gray-700 mb-1">
                          No Resume Attached
                        </p>
                        <p className="text-sm text-gray-600">
                          This mentee has not uploaded a resume yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Decision Section */}
              {selectedApplication.status === "PENDING" && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-amber-100">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    Make Your Decision
                  </h3>
                  <p className="text-base text-amber-800 mb-6">
                    Review all the information above and decide whether to accept or reject this application.
                  </p>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateApplicationStatus("REJECTED")}
                      disabled={reviewing}
                      className="min-w-[120px] bg-white border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-semibold"
                    >
                      {reviewing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleUpdateApplicationStatus("ACCEPTED")}
                      disabled={reviewing}
                      className="min-w-[120px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg font-semibold"
                    >
                      {reviewing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Profile Editing Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-[90vw] max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 to-white">
          {/* Modal Header - Sticky */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-900">
                    Edit Profile
                  </DialogTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Update your professional information and preferences
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-2"
                disabled={isSavingProfile}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Modal Body - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] px-6 py-6">
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
                    toast({
                      title: "Error",
                      description: err.error || "Failed to save profile",
                      variant: "destructive",
                    });
                    return;
                  }
                  const saved = await response.json();
                  setProfile(saved.profile);
                  setShowProfileModal(false);
                  toast({
                    title: "Success!",
                    description: "Profile updated successfully",
                  });
                } catch (err) {
                  console.error("Failed to save profile", err);
                  toast({
                    title: "Error",
                    description: "Failed to save profile. Please try again.",
                    variant: "destructive",
                  });
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

      {/* Comprehensive Mentee Profile Modal */}
      {showMenteeProfileModal && selectedMentee && (
        <Dialog open={showMenteeProfileModal} onOpenChange={setShowMenteeProfileModal}>
          <DialogContent className="max-w-[90vw] w-full max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-white" style={{maxWidth: 'min(90vw, 1200px)'}}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      {selectedMentee.profile?.avatar ? (
                        <img
                          src={selectedMentee.profile.avatar}
                          alt={`${selectedMentee.firstName} ${selectedMentee.lastName}`}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {selectedMentee.firstName?.[0]?.toUpperCase()}{selectedMentee.lastName?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
                      {selectedMentee.firstName} {selectedMentee.lastName}
                    </DialogTitle>
                    <p className="text-slate-600 text-sm mt-1">{selectedMentee.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                        Available for Mentorship
                      </Badge>
                      {selectedMentee.profile?.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="h-3 w-3" />
                          {selectedMentee.profile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenteeProfileModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Main Profile Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section */}
                  {selectedMentee.profile?.bio && (
                    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          About
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">
                          {selectedMentee.profile.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Education & Experience */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        Education & Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedMentee.profile?.education && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded">
                              <Award className="h-3 w-3 text-purple-600" />
                            </div>
                            Education
                          </h4>
                          <p className="text-slate-700 ml-6">{selectedMentee.profile.education}</p>
                        </div>
                      )}
                      
                      {selectedMentee.profile?.experience && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <div className="p-1 bg-emerald-100 rounded">
                              <Briefcase className="h-3 w-3 text-emerald-600" />
                            </div>
                            Experience
                          </h4>
                          <p className="text-slate-700 ml-6">{selectedMentee.profile.experience}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Joined {new Date(selectedMentee.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interests & Specialties */}
                  {selectedMentee.profile?.interests && selectedMentee.profile.interests.length > 0 && (
                    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Target className="h-5 w-5 text-teal-600" />
                          Interests & Specialties
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedMentee.profile.interests.map((interest: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-teal-200"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Goals & Aspirations */}
                  {selectedMentee.profile?.purposeOfRegistration && (
                    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-600" />
                          Goals & Aspirations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">
                          {selectedMentee.profile.purposeOfRegistration}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar - Quick Info & Actions */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => {
                          setShowMenteeProfileModal(false);
                          handleContactMentee(selectedMentee);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Profile Stats */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-slate-600" />
                        Profile Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Member since</span>
                        <span className="font-medium text-slate-900">
                          {new Date(selectedMentee.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Profile completion</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                              style={{ 
                                width: `${Math.min(100, 
                                  (selectedMentee.profile?.bio ? 25 : 0) +
                                  (selectedMentee.profile?.education ? 25 : 0) +
                                  (selectedMentee.profile?.interests?.length > 0 ? 25 : 0) +
                                  (selectedMentee.profile?.purposeOfRegistration ? 25 : 0)
                                )}%` 
                              }}
                            ></div>
                          </div>
                          <span className="font-medium text-slate-900">
                            {Math.min(100, 
                              (selectedMentee.profile?.bio ? 25 : 0) +
                              (selectedMentee.profile?.education ? 25 : 0) +
                              (selectedMentee.profile?.interests?.length > 0 ? 25 : 0) +
                              (selectedMentee.profile?.purposeOfRegistration ? 25 : 0)
                            )}%
                          </span>
                        </div>
                      </div>
                      
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-slate-600" />
                        Contact Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{selectedMentee.email}</span>
                      </div>
                      
                      {selectedMentee.profile?.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700">{selectedMentee.profile.phone}</span>
                        </div>
                      )}
                      
                      {selectedMentee.profile?.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700">{selectedMentee.profile.location}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedMentee && (
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
          <DialogContent className="max-w-[90vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Contact {selectedMentee.firstName}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Mentee Info Header */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedMentee.firstName?.[0]?.toUpperCase()}{selectedMentee.lastName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedMentee.firstName} {selectedMentee.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{selectedMentee.email}</p>
                </div>
              </div>

              {/* Message Template Selector */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2">Message Template</Label>
                <Select
                  value={contactForm.template}
                  disabled={sendingMessage}
                  onValueChange={(value) => {
                    setContactForm(prev => ({ ...prev, template: value }));
                    // Update message based on template
                    if (value === "general") {
                      setContactForm(prev => ({
                        ...prev,
                        subject: `Mentorship Opportunity - ${user?.firstName || 'Dr.'} ${user?.lastName || ''}`,
                        message: `Hi ${selectedMentee.firstName},\n\nI hope this message finds you well. I came across your profile on UroCareerz and I'm impressed by your background and interests.\n\nAs a mentor in the field, I'd love to discuss potential mentorship opportunities with you. I believe my experience could be valuable for your career development.\n\nWould you be interested in having a conversation about this?\n\nBest regards,\n${user?.firstName || 'Dr.'} ${user?.lastName || ''}`
                      }));
                    } else if (value === "research") {
                      setContactForm(prev => ({
                        ...prev,
                        subject: `Research Collaboration Opportunity - ${user?.firstName || 'Dr.'} ${user?.lastName || ''}`,
                        message: `Dear ${selectedMentee.firstName},\n\nI noticed your interest in research from your profile. I'm currently working on several research projects and I think you might be interested in collaborating.\n\nI'd be happy to discuss potential research opportunities that align with your interests and career goals.\n\nWould you be available for a brief call to discuss this further?\n\nBest regards,\n${user?.firstName || 'Dr.'} ${user?.lastName || ''}`
                      }));
                    } else if (value === "clinical") {
                      setContactForm(prev => ({
                        ...prev,
                        subject: `Clinical Learning Opportunity - ${user?.firstName || 'Dr.'} ${user?.lastName || ''}`,
                        message: `Hi ${selectedMentee.firstName},\n\nI see that you're interested in clinical experience. I have opportunities for clinical observation and hands-on learning that might interest you.\n\nThese opportunities would provide valuable exposure to real-world medical practice and could significantly benefit your career development.\n\nWould you like to learn more about these opportunities?\n\nBest regards,\n${user?.firstName || 'Dr.'} ${user?.lastName || ''}`
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Mentorship</SelectItem>
                    <SelectItem value="research">Research Collaboration</SelectItem>
                    <SelectItem value="clinical">Clinical Opportunities</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-slate-700">Subject</Label>
                  <span className={`text-xs ${
                    contactForm.subject.length > 200 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {contactForm.subject.length}/200
                  </span>
                </div>
                <Input
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject"
                  className={`w-full ${
                    contactForm.subject.length > 200 ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  maxLength={250}
                  disabled={sendingMessage}
                />
                {contactForm.subject.length > 200 && (
                  <p className="text-xs text-red-500 mt-1">
                    Subject is too long. Maximum 200 characters allowed.
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-slate-700">Message</Label>
                  <span className={`text-xs ${
                    contactForm.message.length > 5000 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {contactForm.message.length}/5000
                  </span>
                </div>
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your message here..."
                  className={`w-full min-h-[200px] resize-none ${
                    contactForm.message.length > 5000 ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  maxLength={5100}
                  disabled={sendingMessage}
                />
                {contactForm.message.length > 5000 && (
                  <p className="text-xs text-red-500 mt-1">
                    Message is too long. Maximum 5000 characters allowed.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowContactModal(false);
                    // Reset form when canceling
                    setContactForm({
                      subject: "",
                      message: "",
                      template: "general",
                    });
                  }}
                  disabled={sendingMessage}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !contactForm.subject.trim() || !contactForm.message.trim() || contactForm.subject.length > 200 || contactForm.message.length > 5000}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
