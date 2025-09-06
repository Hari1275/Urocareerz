"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SharedHeader from "@/components/shared-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DiscussionThreadForm from "@/components/DiscussionThreadForm";
import DiscussionThreadsList from "@/components/DiscussionThreadsList";
import ProfileForm from "@/components/ProfileForm";
import ProfileDisplay from "@/components/ProfileDisplay";
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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useNavigation } from "@/hooks/use-navigation";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import MenteeOpportunityForm from "@/components/MenteeOpportunityForm";
import {
  LoadingSpinner,
  LoadingPage,
  LoadingCard,
  LoadingButton,
  LoadingText,
} from "@/components/ui/loading-spinner";
import ProfileStrength from "@/components/ProfileStrength";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";

// Category constants for discussions
const categoryLabels = {
  GENERAL: "General Discussion",
  CASE_DISCUSSION: "Case Discussion",
  CAREER_ADVICE: "Career Advice",
  TECHNICAL: "Technical Questions",
  NETWORKING: "Networking",
  RESOURCES: "Resources & Tools",
};

const categoryColors = {
  GENERAL: "bg-gray-100 text-gray-800",
  CASE_DISCUSSION: "bg-blue-100 text-blue-800",
  CAREER_ADVICE: "bg-green-100 text-green-800",
  TECHNICAL: "bg-purple-100 text-purple-800",
  NETWORKING: "bg-orange-100 text-orange-800",
  RESOURCES: "bg-pink-100 text-pink-800",
};

// Interfaces
interface SavedOpportunity {
  id: string;
  opportunity: {
    id: string;
    title: string;
    description: string;
    opportunityType: {
      name: string;
      color: string | null;
    };
    creator: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  savedOpportunities: number;
  submittedOpportunities: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  totalOpportunities: number;
  applicationSuccessRate: number;
}

interface RecentActivity {
  id: string;
  type: "application" | "save" | "submission";
  title: string;
  description: string;
  timestamp: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location?: string;
  opportunityType: {
    id: string;
    name: string;
    color?: string;
  };
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

interface Application {
  id: string;
  status: string;
  coverLetter: string;
  cvFile?: string;
  cvFileName?: string;
  createdAt: string;
  updatedAt: string;
  opportunity: Opportunity;
}

interface MenteeOpportunity {
  id: string;
  title: string;
  description: string;
  location?: string;
  experienceLevel?: string;
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  opportunityType: {
    id: string;
    name: string;
    color?: string;
  };
  creator: {
    firstName: string;
    lastName: string;
  };
  adminFeedback?: string;
  sourceUrl?: string;
  sourceName?: string;
}

interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  tags: string[];
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  _count: {
    comments: number;
  };
}

type ActiveSection =
  | "dashboard"
  | "opportunities"
  | "applications"
  | "submissions"
  | "saved"
  | "submit-opportunity"
  | "discussions"
  | "new-discussion";

// Infinite Scroll Trigger Component
interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  loading: boolean;
  totalItems: number;
  currentItems: number;
  loadingText?: string;
  buttonText?: string;
  progressColor?: string;
}

function InfiniteScrollTrigger({
  onLoadMore,
  loading,
  totalItems,
  currentItems,
  loadingText = "Loading more...",
  buttonText = "Load More",
  progressColor = "from-emerald-500 to-teal-500",
}: InfiniteScrollTriggerProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, loading, onLoadMore]);

  return (
    <div ref={ref} className="text-center mt-6 sm:mt-8">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            <span className="text-sm font-medium">{loadingText}</span>
          </div>
        </div>
      ) : (
        <Button
          onClick={onLoadMore}
          variant="outline"
          className="bg-white/80 border-slate-200 hover:bg-white px-6 sm:px-8 py-2 sm:py-3"
        >
          <span className="text-sm sm:text-base">{buttonText}</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Progress Indicator */}
      <div className="mt-3 space-y-2">
        <p className="text-xs text-slate-500">
          Showing {currentItems} of {totalItems} items
        </p>
        <div className="w-full max-w-xs mx-auto">
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className={`bg-gradient-to-r ${progressColor} h-1.5 rounded-full transition-all duration-300`}
              style={{
                width: `${Math.min((currentItems / totalItems) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round((currentItems / totalItems) * 100)}% loaded
          </p>
        </div>
      </div>
    </div>
  );
}

const menuItems = [
  {
    id: "dashboard" as ActiveSection,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "opportunities" as ActiveSection,
    label: "Find Opportunities",
    icon: Search,
  },
  {
    id: "applications" as ActiveSection,
    label: "My Applications",
    icon: FileText,
  },
  {
    id: "submissions" as ActiveSection,
    label: "My Posted Opportunities",
    icon: Send,
  },
  {
    id: "saved" as ActiveSection,
    label: "Saved List",
    icon: Bookmark,
  },
];

export default function MenteeDashboardPage() {
  const router = useRouter();
  const { getTypeBadge } = useOpportunityTypes();
  const { navigateToOpportunity, navigateToApply } = useNavigation();
  const { toast } = useToast();

  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Dashboard data
  const [savedOpportunities, setSavedOpportunities] = useState<
    SavedOpportunity[]
  >([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    savedOpportunities: 0,
    submittedOpportunities: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    totalOpportunities: 0,
    applicationSuccessRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>(
    []
  );

  // Opportunities data
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([]);
  const [userApplications, setUserApplications] = useState<string[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<any[]>([]);

  // Applications data
  const [applications, setApplications] = useState<Application[]>([]);

  // Submissions data
  const [submissions, setSubmissions] = useState<MenteeOpportunity[]>([]);

  // Discussions data
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [discussionPagination, setDiscussionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [currentDiscussionCategory, setCurrentDiscussionCategory] = useState<string>("all");
  const [currentDiscussionStatus, setCurrentDiscussionStatus] = useState<string>("all");
  const [showMyDiscussions, setShowMyDiscussions] = useState<boolean>(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [savedFilter, setSavedFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState("");
  const [submissionTypeFilter, setSubmissionTypeFilter] = useState("all");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  
  // Withdraw confirmation dialog state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null);

  // Pagination states
  const [opportunityPagination, setOpportunityPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    loading: false,
  });

  const [savedPagination, setSavedPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    loading: false,
  });

  const [applicationsPagination, setApplicationsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    loading: false,
  });

  const [submissionsPagination, setSubmissionsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    loading: false,
  });

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpportunityForApply, setSelectedOpportunityForApply] =
    useState<Opportunity | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  // Opportunity modal state
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [opportunityModalLoading, setOpportunityModalLoading] = useState(false);
  const [opportunityIsSaved, setOpportunityIsSaved] = useState(false);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showEditSubmissionModal, setShowEditSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<MenteeOpportunity | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<
    Partial<MenteeOpportunity>
  >({});
  const [submissionModalLoading, setSubmissionModalLoading] = useState(false);
  const [savingSubmission, setSavingSubmission] = useState(false);
  const [saveLoading, setSaveLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Discussion modal state
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionThread | null>(null);
  const [discussionModalLoading, setDiscussionModalLoading] = useState(false);
  // Check user role and redirect if necessary
  const checkUserRole = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        const role = userData.user.role;
        setUser(userData.user);

        // Redirect if user is not a mentee
        if (role === "ADMIN") {
          router.push("/admin");
          return;
        } else if (role === "MENTOR") {
          router.push("/dashboard/mentor");
          return;
        }
      } else if (response.status === 401) {
        // Token is expired or invalid, redirect to login
        console.log("Token expired, redirecting to login");
        router.push("/login");
        return;
      } else {
        console.error("Error checking user role:", response.status);
        // For other errors, also redirect to login for safety
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      // Network errors or other issues, redirect to login
      router.push("/login");
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile for dynamic profile strength
      const profileResponse = await fetch("/api/profile");
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
      } else if (profileResponse.status === 401) {
        // Token expired, redirect to login
        router.push("/login");
        return;
      }

      // Fetch saved opportunities
      const savedResponse = await fetch("/api/saved-opportunities");
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        const savedOpportunitiesArray = savedData.savedOpportunities || [];
        setSavedOpportunities(savedOpportunitiesArray);
        setSavedOpportunityIds(
          savedOpportunitiesArray.map((opp: any) => opp.opportunityId)
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          savedOpportunities: savedOpportunitiesArray.length,
        }));
      } else if (savedResponse.status === 401) {
        // Token expired, redirect to login
        router.push("/login");
        return;
      }

      // Fetch applications
      const applicationsResponse = await fetch("/api/applications");
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        const applications = applicationsData.applications || [];
        const pendingApps = applications.filter(
          (app: any) => app.status === "PENDING"
        );
        const acceptedApps = applications.filter(
          (app: any) => app.status === "ACCEPTED"
        );
        const rejectedApps = applications.filter(
          (app: any) => app.status === "REJECTED"
        );

        // Calculate success rate
        const totalProcessedApps = acceptedApps.length + rejectedApps.length;
        const successRate = totalProcessedApps > 0 ? Math.round((acceptedApps.length / totalProcessedApps) * 100) : 0;

        setApplications(applications);
        setUserApplications(applications.map((app: any) => app.opportunityId));
        setStats((prev) => ({
          ...prev,
          totalApplications: applications.length,
          pendingApplications: pendingApps.length,
          acceptedApplications: acceptedApps.length,
          rejectedApplications: rejectedApps.length,
          applicationSuccessRate: successRate,
        }));
      } else if (applicationsResponse.status === 401) {
        // Token expired, redirect to login
        router.push("/login");
        return;
      }

      // Fetch opportunities
      const opportunitiesResponse = await fetch("/api/opportunities");
      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        const allOpportunities = opportunitiesData.opportunities || [];
        setOpportunities(allOpportunities);
        setStats((prev) => ({
          ...prev,
          totalOpportunities: allOpportunities.length,
        }));
      }

      // Fetch recent opportunities by mentors (latest 5)
      const recentOpportunitiesResponse = await fetch(
        "/api/opportunities?limit=5&sort=newest"
      );
      if (recentOpportunitiesResponse.ok) {
        const recentOpportunitiesData =
          await recentOpportunitiesResponse.json();
        setRecentOpportunities(recentOpportunitiesData.opportunities || []);
      }

      // Fetch opportunity types
      const typesResponse = await fetch("/api/opportunity-types");
      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setOpportunityTypes(typesData.opportunityTypes || []);
      }

      // Fetch submissions
      const submissionsResponse = await fetch("/api/mentee-opportunities");
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        const allSubmissions = submissionsData.opportunities || [];
        const approvedSubs = allSubmissions.filter(
          (sub: any) => sub.status === "APPROVED"
        );
        const pendingSubs = allSubmissions.filter(
          (sub: any) => sub.status === "PENDING"
        );
        const rejectedSubs = allSubmissions.filter(
          (sub: any) => sub.status === "REJECTED"
        );

        setSubmissions(allSubmissions);
        setStats((prev) => ({
          ...prev,
          submittedOpportunities: allSubmissions.length,
          approvedSubmissions: approvedSubs.length,
          pendingSubmissions: pendingSubs.length,
          rejectedSubmissions: rejectedSubs.length,
        }));
      } else if (submissionsResponse.status === 401) {
        // Token expired, redirect to login
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (category?: string, status?: string, page = 1, reset = false, force = false, myDiscussions?: boolean) => {
    if (!force && activeSection !== "discussions") {
      return;
    }

    console.log("🔍 fetchDiscussions called with:", { category, status, page, reset, force, myDiscussions });
    console.log("👤 Current user for filtering:", user?.id, user?.firstName);
    
    setDiscussionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (status && status !== "all") params.set("status", status);
      if (myDiscussions !== undefined) {
        params.set("myDiscussions", myDiscussions.toString());
        console.log("🔎 Setting myDiscussions parameter to:", myDiscussions);
      }
      params.set("page", page.toString());
      params.set("limit", discussionPagination.limit.toString());

      console.log("📡 API request params:", params.toString());

      // Update current filter state
      if (category) setCurrentDiscussionCategory(category);
      if (status) setCurrentDiscussionStatus(status);
      if (myDiscussions !== undefined) setShowMyDiscussions(myDiscussions);

      const response = await fetch(`/api/discussions?${params.toString()}`, {
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        const newDiscussions = data.threads || [];
        console.log(`✅ Loaded ${newDiscussions.length} discussions from API`);
        console.log("🔍 Filter status:", { 
          myDiscussions, 
          userHasDiscussions: newDiscussions.filter((d: any) => d.author.id === user?.id).length,
          totalDiscussions: newDiscussions.length 
        });

        setDiscussions(prev => reset ? newDiscussions : [...prev, ...newDiscussions]);
        setDiscussionPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          }
        );
      } else {
        console.error("Failed to fetch discussions:", response.status);
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  // Refetch discussions when returning to this page/tab (but preserve loaded state)
  useEffect(() => {
    const onFocus = () => {
      if (activeSection === "discussions" && discussions.length === 0) {
        fetchDiscussions(undefined, undefined, 1, true);
      }
    };
    const onVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        activeSection === "discussions" &&
        discussions.length === 0
      ) {
        fetchDiscussions(undefined, undefined, 1, true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [activeSection, discussions.length]);

  const fetchOpportunities = async (page = 1, reset = false) => {
    if (activeSection !== "opportunities") return;

    setOpportunityPagination((prev) => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: opportunityPagination.limit.toString(),
        search: searchTerm,
        experience: experienceFilter !== "all" ? experienceFilter : "",
        type: typeFilter !== "all" ? typeFilter : "",
        saved: savedFilter !== "all" ? savedFilter : "",
      });

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newOpportunities = data.opportunities || [];

        setOpportunities((prev) =>
          reset ? newOpportunities : [...prev, ...newOpportunities]
        );
        setOpportunityPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || opportunityPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setOpportunityPagination((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchSavedOpportunities = async (page = 1, reset = false) => {
    if (activeSection !== "saved") return;

    setSavedPagination((prev) => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: savedPagination.limit.toString(),
      });

      const response = await fetch(
        `/api/saved-opportunities?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        const newSavedOpportunities = data.savedOpportunities || [];

        setSavedOpportunities((prev) =>
          reset ? newSavedOpportunities : [...prev, ...newSavedOpportunities]
        );
        setSavedPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || savedPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching saved opportunities:", error);
      setSavedPagination((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchApplications = async (page = 1, reset = false) => {
    if (activeSection !== "applications") return;

    setApplicationsPagination((prev) => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: applicationsPagination.limit.toString(),
        status: applicationStatusFilter !== "all" ? applicationStatusFilter : "",
      });

      const response = await fetch(`/api/applications?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newApplications = data.applications || [];

        setApplications((prev) =>
          reset ? newApplications : [...prev, ...newApplications]
        );
        setApplicationsPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || applicationsPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplicationsPagination((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchSubmissions = async (page = 1, reset = false) => {
    if (activeSection !== "submissions") return;

    setSubmissionsPagination((prev) => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: submissionsPagination.limit.toString(),
        status: selectedStatus !== "all" ? selectedStatus : "",
      });

      const response = await fetch(
        `/api/mentee-opportunities?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        const newSubmissions = data.opportunities || [];

        setSubmissions((prev) =>
          reset ? newSubmissions : [...prev, ...newSubmissions]
        );
        setSubmissionsPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || submissionsPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissionsPagination((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Set client flag immediately to prevent hydration mismatches
    setIsClient(true);

    // Initialize dashboard after client is set
    const initDashboard = async () => {
      await checkUserRole();
      await fetchDashboardData();
    };

    initDashboard();
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (activeSection === "discussions") {
      // Always fetch discussions when switching to discussions section
      fetchDiscussions(undefined, undefined, 1, true, true, showMyDiscussions);
    } else if (activeSection === "opportunities") {
      fetchOpportunities(1, true);
    } else if (activeSection === "saved") {
      fetchSavedOpportunities(1, true);
    } else if (activeSection === "applications") {
      fetchApplications(1, true);
    } else if (activeSection === "submissions") {
      fetchSubmissions(1, true);
    }
  }, [activeSection, isClient]);

  // Handle filter changes for opportunities
  useEffect(() => {
    if (!isClient || activeSection !== "opportunities") return;
    fetchOpportunities(1, true);
  }, [searchTerm, experienceFilter, typeFilter, savedFilter, isClient]);

  // Handle status filter for submissions
  useEffect(() => {
    if (!isClient || activeSection !== "submissions") return;
    fetchSubmissions(1, true);
  }, [selectedStatus, isClient]);

  // Handle status filter for applications
  useEffect(() => {
    if (!isClient || activeSection !== "applications") return;
    fetchApplications(1, true);
  }, [applicationStatusFilter, isClient]);

  // Handle discussion filter changes
  useEffect(() => {
    if (!isClient || activeSection !== "discussions") return;
    console.log("🔄 Discussion filters changed - refetching", {
      currentDiscussionCategory,
      currentDiscussionStatus,
      showMyDiscussions
    });
    fetchDiscussions(
      currentDiscussionCategory === "all" ? undefined : currentDiscussionCategory,
      currentDiscussionStatus === "all" ? undefined : currentDiscussionStatus,
      1,
      true,
      true,
      showMyDiscussions
    );
  }, [currentDiscussionCategory, currentDiscussionStatus, showMyDiscussions, isClient]);

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchTerm("");
    setExperienceFilter("all");
    setTypeFilter("all");
    setSavedFilter("all");
  };

  // Clear application filters function
  const handleClearApplicationFilters = () => {
    setApplicationStatusFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || experienceFilter !== "all" || typeFilter !== "all" || savedFilter !== "all";

  // Check if any application filters are active
  const hasActiveApplicationFilters = applicationStatusFilter !== "all";

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

  // Load more functions for infinite scroll
  const loadMoreOpportunities = () => {
    if (
      opportunityPagination.page < opportunityPagination.pages &&
      !opportunityPagination.loading
    ) {
      fetchOpportunities(opportunityPagination.page + 1, false);
    }
  };

  const loadMoreSaved = () => {
    if (
      savedPagination.page < savedPagination.pages &&
      !savedPagination.loading
    ) {
      fetchSavedOpportunities(savedPagination.page + 1, false);
    }
  };

  const loadMoreApplications = () => {
    if (
      applicationsPagination.page < applicationsPagination.pages &&
      !applicationsPagination.loading
    ) {
      fetchApplications(applicationsPagination.page + 1, false);
    }
  };

  const loadMoreDiscussions = () => {
    if (
      discussionPagination.page < discussionPagination.pages &&
      !discussionsLoading
    ) {
      fetchDiscussions(
        currentDiscussionCategory === "all" ? undefined : currentDiscussionCategory,
        currentDiscussionStatus === "all" ? undefined : currentDiscussionStatus,
        discussionPagination.page + 1,
        false,
        false,
        showMyDiscussions
      );
    }
  };

  const handleSaveOpportunity = async (opportunityId: string) => {
    setSaveLoading((prev) => ({ ...prev, [opportunityId]: true }));
    try {
      const isSaved = savedOpportunityIds.includes(opportunityId);
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
          setSavedOpportunityIds((prev) =>
            prev.filter((id) => id !== opportunityId)
          );
        } else {
          setSavedOpportunityIds((prev) => [...prev, opportunityId]);
        }
        // Refresh dashboard data to update stats
        fetchDashboardData();
      } else {
        throw new Error("Failed to save opportunity");
      }
    } catch (err) {
      console.error("Failed to save opportunity:", err);
      toast({
        title: "Error",
        description: err instanceof Error
          ? err.message
          : "Failed to save opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading((prev) => ({ ...prev, [opportunityId]: false }));
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    setApplicationToWithdraw(applicationId);
    setShowWithdrawDialog(true);
  };

  const confirmWithdrawApplication = async () => {
    if (!applicationToWithdraw) return;
    
    setWithdrawingId(applicationToWithdraw);
    try {
      const response = await fetch(
        `/api/applications/${applicationToWithdraw}/withdraw`,
        {
          method: "POST",
        }
      );

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
        
        // Refresh dashboard data to update stats
        fetchDashboardData();
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

  const handleApplyClick = (opportunity: Opportunity) => {
    setSelectedOpportunityForApply(opportunity);
    setCoverLetter("");
    setCvFile(null);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOpportunityForApply) {
      toast({
        title: "Error",
        description: "No opportunity selected",
        variant: "destructive",
      });
      return;
    }
    
    if (!cvFile) {
      toast({
        title: "Missing File",
        description: "Please upload your CV/Resume",
        variant: "destructive",
      });
      return;
    }

    setApplyLoading(true);
    try {
      let resumeUrl = "";
      
      // Upload the file first if provided
      if (cvFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", cvFile);
        uploadFormData.append("fileType", "resume");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || "Failed to upload resume");
        }

        const uploadData = await uploadResponse.json();
        resumeUrl = uploadData.url;
      }

      // Submit the application with JSON
      const submitData = {
        opportunityId: selectedOpportunityForApply.id,
        coverLetter: coverLetter,
        resumeUrl: resumeUrl,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        // Refresh data and close modal
        await fetchDashboardData();
        setShowApplyModal(false);
        setSelectedOpportunityForApply(null);
        setCoverLetter("");
        setCvFile(null);
        toast({
          title: "Success!",
          description: "Application submitted successfully!",
          variant: "success",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setSelectedOpportunityForApply(null);
    setCoverLetter("");
    setCvFile(null);
  };

  const handleShowOpportunityDetails = async (opportunityId: string) => {
    try {
      setOpportunityModalLoading(true);
      setShowOpportunityModal(true);

      // Fetch detailed opportunity data
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOpportunity(data.opportunity);
        setOpportunityIsSaved(savedOpportunityIds.includes(opportunityId));
      } else {
        console.error("Failed to fetch opportunity details");
      }
    } catch (error) {
      console.error("Error fetching opportunity details:", error);
    } finally {
      setOpportunityModalLoading(false);
    }
  };

  const handleCloseOpportunityModal = () => {
    setShowOpportunityModal(false);
    setSelectedOpportunity(null);
    setOpportunityIsSaved(false);
  };

  const handleSaveOpportunityFromModal = async () => {
    if (!selectedOpportunity) return;

    try {
      const isSaved = opportunityIsSaved;
      const method = isSaved ? "DELETE" : "POST";

      const response = await fetch("/api/saved-opportunities", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId: selectedOpportunity.id }),
      });

      if (response.ok) {
        setOpportunityIsSaved(!isSaved);
        if (isSaved) {
          setSavedOpportunityIds((prev) =>
            prev.filter((id) => id !== selectedOpportunity.id)
          );
        } else {
          setSavedOpportunityIds((prev) => [...prev, selectedOpportunity.id]);
        }
        // Refresh dashboard data to update stats
        fetchDashboardData();
      } else {
        throw new Error("Failed to save opportunity");
      }
    } catch (err) {
      console.error("Failed to save opportunity:", err);
      toast({
        title: "Error",
        description: err instanceof Error
          ? err.message
          : "Failed to save opportunity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyFromModal = () => {
    if (!selectedOpportunity) return;
    setSelectedOpportunityForApply(selectedOpportunity);
    setCoverLetter("");
    setCvFile(null);
    setShowOpportunityModal(false);
    setShowApplyModal(true);
  };

  // Discussion handlers
  const handleViewDiscussion = (thread: DiscussionThread) => {
    setSelectedDiscussion(thread);
    setShowDiscussionModal(true);
  };

  const handleCloseDiscussionModal = () => {
    setShowDiscussionModal(false);
    setSelectedDiscussion(null);
  };
  const handleViewSubmission = (submission: MenteeOpportunity) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
  };

  const handleEditSubmission = (submission: MenteeOpportunity) => {
    setSelectedSubmission(submission);
    setEditingSubmission({
      title: submission.title,
      description: submission.description,
      location: submission.location,
      experienceLevel: submission.experienceLevel,
      requirements: submission.requirements,
      benefits: submission.benefits,
      duration: submission.duration,
      compensation: submission.compensation,
      applicationDeadline: submission.applicationDeadline,
      sourceUrl: submission.sourceUrl,
      sourceName: submission.sourceName,
    });
    setShowEditSubmissionModal(true);
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this submission? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/mentee-opportunities/${submissionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchSubmissions(1, true); // Refresh submissions
        setShowSubmissionModal(false);
        setSelectedSubmission(null);
        fetchDashboardData(); // Refresh dashboard stats
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete submission");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete submission",
        variant: "destructive",
      });
    }
  };

  const handleSaveSubmission = async () => {
    if (!selectedSubmission) return;

    setSavingSubmission(true);
    try {
      const requestBody = {
        ...editingSubmission,
        opportunityTypeId: selectedSubmission.opportunityType.id,
      };

      const response = await fetch(
        `/api/mentee-opportunities/${selectedSubmission.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchSubmissions(1, true); // Refresh submissions
        setShowEditSubmissionModal(false);
        setSelectedSubmission(null);
        setEditingSubmission({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update submission");
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update submission",
        variant: "destructive",
      });
    } finally {
      setSavingSubmission(false);
    }
  };

  const handleCloseSubmissionModals = () => {
    setShowSubmissionModal(false);
    setShowEditSubmissionModal(false);
    setSelectedSubmission(null);
    setEditingSubmission({});
  };

  // Profile editing handlers
  const handleEditProfile = () => {
    setIsEditingProfile(false); // Reset loading state
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setIsEditingProfile(false); // Reset loading state when closing
  };

  const handleSubmitProfile = async (profileData: any) => {
    try {
      setIsEditingProfile(true);
      const method = profile ? "PUT" : "POST";
      const response = await fetch("/api/profile", {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile(savedProfile.profile);
      setShowProfileModal(false);

      // Refresh dashboard data to update profile strength
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
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

  const formatDate = (dateString: string | null | undefined) => {
    // Handle invalid or missing dates
    if (!dateString) return "Unknown date";
    
    // Use a consistent date format to prevent hydration mismatches
    const date = new Date(dateString);
    
    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Filter functions
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExperience =
      experienceFilter === "all" ||
      opportunity.experienceLevel === experienceFilter;
    const matchesType =
      typeFilter === "all" ||
      (opportunity.opportunityType &&
        opportunity.opportunityType.name === typeFilter);
    const matchesSaved =
      savedFilter === "all" ||
      (savedFilter === "saved" &&
        savedOpportunityIds.includes(opportunity.id)) ||
      (savedFilter === "not_saved" &&
        !savedOpportunityIds.includes(opportunity.id)) ||
      (savedFilter === "applied" &&
        userApplications.includes(opportunity.id)) ||
      (savedFilter === "not_applied" &&
        !userApplications.includes(opportunity.id));

    return matchesSearch && matchesExperience && matchesType && matchesSaved;
  });

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus =
      selectedStatus === "all" || submission.status === selectedStatus;
    const matchesSearch =
      submissionSearchTerm === "" ||
      submission.title
        .toLowerCase()
        .includes(submissionSearchTerm.toLowerCase()) ||
      submission.description
        .toLowerCase()
        .includes(submissionSearchTerm.toLowerCase());
    const matchesType =
      submissionTypeFilter === "all" ||
      (submission.opportunityType &&
        submission.opportunityType.name === submissionTypeFilter);

    return matchesStatus && matchesSearch && matchesType;
  });

  // Filter applications for client-side filtering
  const filteredApplications = applications.filter((application) => {
    const matchesStatus =
      applicationStatusFilter === "all" || application.status === applicationStatusFilter;

    return matchesStatus;
  });

  // Show loading until both data is loaded and client is hydrated
  if (loading || !isClient) {
    return (
      <LoadingPage
        title="Loading your dashboard..."
        description="Preparing your personalized experience with opportunities, applications, and profile insights"
        size="lg"
        variant="default"
        color="blue"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <SharedHeader
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileMenuOpen={isMobileSidebarOpen}
      />

      <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-4 sm:gap-6 lg:gap-6 xl:gap-8">
          {/* Sidebar - Responsive widths */}
          <div className="lg:col-span-3 xl:col-span-3">
            <DashboardSidebar
              activeSection={activeSection}
              onSectionChange={(section) => {
                setActiveSection(section);
                setIsMobileSidebarOpen(false);
              }}
              stats={{
                pendingApplications: stats.pendingApplications,
              }}
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
          {/* Main Content - Flexible width */}
          <div className="lg:col-span-9 xl:col-span-6 order-2 lg:order-1">
            {activeSection === "dashboard" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Welcome back, {user?.firstName || "there"}!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Here's what's happening with your career journey today.
                  </p>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Total Applications */}
                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 h-fit"
                    onClick={() => setActiveSection("applications")}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                        <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg flex-shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg lg:text-2xl font-bold text-slate-900 leading-tight">
                            {stats.totalApplications}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-tight">
                            Applications
                          </p>
                          <p className="text-xs text-blue-600 font-medium leading-tight">
                            {stats.totalApplications === 0 ? "Start applying" : 
                             stats.applicationSuccessRate > 0 ? `${stats.applicationSuccessRate}% success` :
                             "Track your progress"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Applications */}
                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 h-fit"
                    onClick={() => setActiveSection("applications")}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                        <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg flex-shrink-0">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg lg:text-2xl font-bold text-slate-900 leading-tight">
                            {stats.pendingApplications}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-tight">
                            Pending Review
                          </p>
                          <p className="text-xs text-amber-600 font-medium leading-tight">
                            {stats.pendingApplications === 0 ? "All caught up" : "Waiting for response"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Saved Opportunities */}
                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 h-fit"
                    onClick={() => setActiveSection("saved")}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                        <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 shadow-lg flex-shrink-0">
                          <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg lg:text-2xl font-bold text-slate-900 leading-tight">
                            {stats.savedOpportunities}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-tight">
                            Saved
                          </p>
                          <p className="text-xs text-pink-600 font-medium leading-tight">
                            {stats.savedOpportunities === 0 ? "Save to apply later" : "Ready to apply"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* My Submissions */}
                  <Card 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 h-fit"
                    onClick={() => setActiveSection("submissions")}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                        <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg flex-shrink-0">
                          <Send className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg lg:text-2xl font-bold text-slate-900 leading-tight">
                            {stats.submittedOpportunities}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-tight">
                            My Posts
                          </p>
                          <p className="text-xs text-emerald-600 font-medium leading-tight">
                            {stats.submittedOpportunities === 0 ? "Share opportunities" : 
                             stats.approvedSubmissions > 0 ? `${stats.approvedSubmissions} approved` :
                             "Under review"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Insights */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Applications Progress */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">Applications</h4>
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total Applied:</span>
                            <span className="font-semibold">{stats.totalApplications}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-700">Pending:</span>
                            <span className="font-semibold">{stats.pendingApplications}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Accepted:</span>
                            <span className="font-semibold">{stats.acceptedApplications}</span>
                          </div>
                          {stats.applicationSuccessRate > 0 && (
                            <div className="pt-2 mt-2 border-t border-blue-200">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Success Rate:</span>
                                <span className="font-bold text-green-600">{stats.applicationSuccessRate}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => setActiveSection("applications")}
                        >
                          View Applications
                        </Button>
                      </div>

                      {/* Submissions Progress */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-emerald-900">Contributions</h4>
                          <Send className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-emerald-700">Total Posted:</span>
                            <span className="font-semibold">{stats.submittedOpportunities}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-700">Pending:</span>
                            <span className="font-semibold">{stats.pendingSubmissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Approved:</span>
                            <span className="font-semibold">{stats.approvedSubmissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-700">Rejected:</span>
                            <span className="font-semibold">{stats.rejectedSubmissions}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => setActiveSection("submissions")}
                        >
                          Manage Posts
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Opportunities by Mentors */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-500">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        Recent Opportunities
                      </CardTitle>
                      {recentOpportunities.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setActiveSection("opportunities")}
                          variant="outline"
                          className="bg-white/80 border-slate-200 hover:bg-white"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentOpportunities.length > 0 ? (
                      <div className="space-y-4">
                        {recentOpportunities.map((opportunity) => (
                          <div
                            key={opportunity.id}
                            className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() =>
                              handleShowOpportunityDetails(opportunity.id)
                            }
                          >
                            <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900 text-sm line-clamp-1">
                                    {opportunity.title}
                                  </p>
                                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                                    {opportunity.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                      style={{
                                        backgroundColor: opportunity
                                          .opportunityType?.color
                                          ? `${opportunity.opportunityType.color}20`
                                          : "#f1f5f9",
                                        color:
                                          opportunity.opportunityType?.color ||
                                          "#64748b",
                                        borderColor:
                                          opportunity.opportunityType?.color ||
                                          "#e2e8f0",
                                      }}
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
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveOpportunity(opportunity.id);
                                    }}
                                    disabled={saveLoading[opportunity.id]}
                                    className={cn(
                                      "h-6 w-6 p-0 border-slate-200",
                                      savedOpportunityIds.includes(
                                        opportunity.id
                                      )
                                        ? "bg-pink-50 text-pink-600 border-pink-200"
                                        : "hover:bg-slate-50"
                                    )}
                                  >
                                    {saveLoading[opportunity.id] ? (
                                      <LoadingSpinner
                                        size="sm"
                                        variant="minimal"
                                        showText={false}
                                        className="h-4 w-4"
                                      />
                                    ) : (
                                      <Heart
                                        className={cn(
                                          "h-3 w-3",
                                          savedOpportunityIds.includes(
                                            opportunity.id
                                          )
                                            ? "fill-current"
                                            : ""
                                        )}
                                      />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                Posted by Dr. {opportunity.creator.firstName}{" "}
                                {opportunity.creator.lastName} •{" "}
                                {formatDate(opportunity.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">
                          No recent opportunities yet
                        </p>
                        <p className="text-sm text-slate-500">
                          Check back later for new opportunities from mentors
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "opportunities" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Find{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Opportunities
                    </span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Discover career opportunities that match your interests and
                    goals.
                  </p>
                </div>

                {/* Search and Filters */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Filter Grid */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* First Row */}
                        <Input
                          placeholder="Search opportunities..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white/80 w-full"
                        />
                        <Select
                          value={experienceFilter}
                          onValueChange={setExperienceFilter}
                        >
                          <SelectTrigger className="bg-white/80 w-full">
                            <SelectValue placeholder="Experience Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="ENTRY">Entry Level</SelectItem>
                            <SelectItem value="MID">Mid-Career</SelectItem>
                            <SelectItem value="SENIOR">Senior Level</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Second Row */}
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="bg-white/80 w-full">
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
                        <Select
                          value={savedFilter}
                          onValueChange={setSavedFilter}
                        >
                          <SelectTrigger className="bg-white/80 w-full">
                            <SelectValue placeholder="Saved Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Opportunities</SelectItem>
                            <SelectItem value="saved">Saved Only</SelectItem>
                            <SelectItem value="not_saved">Not Saved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Clear Filters Button */}
                      {hasActiveFilters && (
                        <div className="flex justify-center pt-2 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="bg-white/80 border-slate-200 hover:bg-white text-slate-600 hover:text-slate-700 px-4 py-2"
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities Grid */}
                <div className="grid gap-6">
                  {opportunityPagination.loading &&
                    opportunities.length === 0 ? (
                    <div className="space-y-6">
                      {[...Array(6)].map((_, i) => (
                        <LoadingCard
                          key={i}
                          title="Loading opportunities..."
                          description="Finding the best matches for your career goals"
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                          size="md"
                          variant="pulse"
                          color="blue"
                        />
                      ))}
                    </div>
                  ) : opportunities.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                        <Search className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        No opportunities found
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Try adjusting your search criteria or check back later
                        for new opportunities.
                      </p>
                    </div>
                  ) : (
                    <>
                      {opportunities.map((opportunity) => (
                        <Card
                          key={opportunity.id}
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-300 cursor-pointer"
                          onClick={() =>
                            handleShowOpportunityDetails(opportunity.id)
                          }
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                                  {opportunity.title}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                  {opportunity.description}
                                </p>
                                <div className="flex items-center gap-3 mb-2">
                                  {opportunity.opportunityType && (
                                    <Badge
                                      variant="secondary"
                                      className="rounded-lg"
                                    >
                                      {opportunity.opportunityType.name}
                                    </Badge>
                                  )}
                                  {opportunity.location && (
                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                      <MapPin className="h-4 w-4" />
                                      <span>{opportunity.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveOpportunity(opportunity.id);
                                  }}
                                  disabled={saveLoading[opportunity.id]}
                                  className={cn(
                                    "border-slate-200",
                                    savedOpportunityIds.includes(opportunity.id)
                                      ? "bg-pink-50 text-pink-600 border-pink-200"
                                      : "hover:bg-slate-50"
                                  )}
                                >
                                  {saveLoading[opportunity.id] ? (
                                    <LoadingSpinner
                                      size="sm"
                                      variant="minimal"
                                      showText={false}
                                      className="h-4 w-4"
                                    />
                                  ) : (
                                    <Heart
                                      className={cn(
                                        "h-4 w-4",
                                        savedOpportunityIds.includes(
                                          opportunity.id
                                        )
                                          ? "fill-current"
                                          : ""
                                      )}
                                    />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyClick(opportunity);
                                  }}
                                  disabled={userApplications.includes(
                                    opportunity.id
                                  )}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                                >
                                  {userApplications.includes(opportunity.id)
                                    ? "Applied"
                                    : "Apply Now"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Infinite Scroll Load More */}
                      {opportunityPagination.page <
                        opportunityPagination.pages && (
                          <InfiniteScrollTrigger
                            onLoadMore={loadMoreOpportunities}
                            loading={opportunityPagination.loading}
                            totalItems={opportunityPagination.total}
                            currentItems={opportunities.length}
                            loadingText="Loading more opportunities..."
                            buttonText="Load More Opportunities"
                            progressColor="from-blue-500 to-indigo-500"
                          />
                        )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === "applications" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    My Applications
                  </h1>
                  <p className="text-slate-600">
                    Track the status of your opportunity applications.
                  </p>
                </div>

                {/* Application Filters */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Filter Row */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="w-full sm:w-48">
                          <Select
                            value={applicationStatusFilter}
                            onValueChange={setApplicationStatusFilter}
                          >
                            <SelectTrigger className="bg-white/80 w-full">
                              <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="PENDING">Pending Review</SelectItem>
                              <SelectItem value="ACCEPTED">Accepted</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                              <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Clear Filters Button */}
                      {hasActiveApplicationFilters && (
                        <div className="flex justify-center pt-2 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearApplicationFilters}
                            className="bg-white/80 border-slate-200 hover:bg-white text-slate-600 hover:text-slate-700 px-4 py-2"
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {applicationsPagination.loading &&
                    applications.length === 0 ? (
                    <div className="space-y-6">
                      {[...Array(5)].map((_, i) => (
                        <LoadingCard
                          key={i}
                          title="Loading applications..."
                          description="Retrieving your application status and details"
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                          size="md"
                          variant="dots"
                          color="indigo"
                        />
                      ))}
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {applicationStatusFilter !== "all" ? "No applications found" : "No applications yet"}
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        {applicationStatusFilter !== "all" 
                          ? `No applications with ${applicationStatusFilter.toLowerCase()} status found.`
                          : "Start applying for opportunities to see your applications here."
                        }
                      </p>
                      {applicationStatusFilter === "all" && (
                        <Button
                          onClick={() => setActiveSection("opportunities")}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        >
                          Browse Opportunities
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {filteredApplications.map((application) => (
                        <Card
                          key={application.id}
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                  {application.opportunity.title}
                                </h3>
                                <p className="text-slate-600 text-sm mb-3">
                                  {application.opportunity.description}
                                </p>
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusBadge(application.status)}
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      Applied{" "}
                                      {formatDate(application.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleShowOpportunityDetails(
                                      application.opportunity.id
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                {application.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleWithdrawApplication(application.id)
                                    }
                                    disabled={withdrawingId === application.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    {withdrawingId === application.id
                                      ? "Withdrawing..."
                                      : "Withdraw"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Infinite Scroll Load More */}
                      {applicationsPagination.page <
                        applicationsPagination.pages && (
                          <InfiniteScrollTrigger
                            onLoadMore={loadMoreApplications}
                            loading={applicationsPagination.loading}
                            totalItems={applicationsPagination.total}
                            currentItems={filteredApplications.length}
                            loadingText="Loading more applications..."
                            buttonText="Load More Applications"
                            progressColor="from-indigo-500 to-purple-500"
                          />
                        )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === "saved" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Saved{" "}
                    <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                      Opportunities
                    </span>
                  </h1>
                  <p className="text-slate-600">
                    Your bookmarked opportunities for future reference.
                  </p>
                </div>

                <div className="space-y-4">
                  {savedPagination.loading &&
                    savedOpportunities.length === 0 ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <LoadingCard
                          key={i}
                          title="Loading saved opportunities..."
                          description="Retrieving your bookmarked career opportunities"
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                          size="md"
                          variant="pulse"
                          color="purple"
                        />
                      ))}
                    </div>
                  ) : savedOpportunities.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-pink-100 to-rose-200 flex items-center justify-center">
                        <Heart className="h-12 w-12 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        No saved opportunities
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Start saving opportunities you're interested in for
                        quick access later.
                      </p>
                      <Button
                        onClick={() => setActiveSection("opportunities")}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      >
                        Browse Opportunities
                      </Button>
                    </div>
                  ) : (
                    <>
                      {savedOpportunities.map((saved) => (
                        <Card
                          key={saved.id}
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                  {saved.opportunity.title}
                                </h3>
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                  {saved.opportunity.description}
                                </p>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className="border"
                                    style={{
                                      backgroundColor: saved.opportunity
                                        .opportunityType?.color
                                        ? `${saved.opportunity.opportunityType.color}20`
                                        : "#f1f5f9",
                                      color:
                                        saved.opportunity.opportunityType
                                          ?.color || "#64748b",
                                      borderColor:
                                        saved.opportunity.opportunityType
                                          ?.color || "#e2e8f0",
                                    }}
                                  >
                                    {saved.opportunity.opportunityType?.name ||
                                      "No Type"}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Heart className="h-4 w-4" />
                                    <span>
                                      Saved {formatDate(saved.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowOpportunityDetails(
                                      saved.opportunity.id
                                    );
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleSaveOpportunity(saved.opportunity.id)
                                  }
                                  className="text-pink-600 hover:text-pink-700"
                                >
                                  <Heart className="h-4 w-4 fill-current" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Infinite Scroll Load More */}
                      {savedPagination.page < savedPagination.pages && (
                        <InfiniteScrollTrigger
                          onLoadMore={loadMoreSaved}
                          loading={savedPagination.loading}
                          totalItems={savedPagination.total}
                          currentItems={savedOpportunities.length}
                          loadingText="Loading more saved opportunities..."
                          buttonText="Load More Saved Opportunities"
                          progressColor="from-pink-500 to-rose-500"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === "submit-opportunity" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Submit{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Opportunity
                    </span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Share opportunities you've discovered with the UroCareerz
                    community.
                  </p>
                </div>

                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-8">
                    <MenteeOpportunityForm
                      onSuccess={() => {
                        // Switch to submissions tab and refresh data
                        setActiveSection("submissions");
                        fetchSubmissions(1, true);
                        fetchDashboardData(); // Refresh dashboard stats
                      }}
                      onCancel={() => setActiveSection("dashboard")}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "discussions" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Community{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Discussions
                    </span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Connect with mentors and other mentees in our growing
                    community.
                  </p>
                </div>

                {/* New Discussion Button */}
                <div className="flex justify-center">
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    onClick={() => setActiveSection("new-discussion")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start New Discussion
                  </Button>
                </div>

                {/* Discussions List */}
                {discussionsLoading ? (
                  <LoadingCard
                    title="Loading discussions..."
                    description="Connecting you with community conversations and expert insights"
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                    size="lg"
                    variant="default"
                    color="purple"
                  />
                ) : (
                  <DiscussionThreadsList
                    threads={discussions}
                    pagination={discussionPagination}
                    onRefresh={fetchDiscussions}
                    onNewDiscussion={() => setActiveSection("new-discussion")}
                    currentCategory={currentDiscussionCategory}
                    currentStatus={currentDiscussionStatus}
                    onLoadMore={loadMoreDiscussions}
                    loading={discussionsLoading}
                    currentUser={user}
                    onViewDiscussion={handleViewDiscussion}
                    currentMyDiscussions={showMyDiscussions}
                  />
                )}
              </div>
            )}

            {activeSection === "submissions" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    My{" "}
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Submissions
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-2xl mx-auto">
                    Track and manage the opportunities you've submitted for
                    review.
                  </p>
                </div>

                {/* Filters */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Search Row */}
                      <div>
                        <Input
                          placeholder="Search submissions..."
                          value={submissionSearchTerm}
                          onChange={(e) =>
                            setSubmissionSearchTerm(e.target.value)
                          }
                          className="bg-white/80 w-full"
                        />
                      </div>

                      {/* Filters Row */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1">
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger className="bg-white/80 w-full">
                              <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="PENDING">
                                Pending Review
                              </SelectItem>
                              <SelectItem value="APPROVED">
                                Approved
                              </SelectItem>
                              <SelectItem value="REJECTED">
                                Rejected
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Select
                            value={submissionTypeFilter}
                            onValueChange={setSubmissionTypeFilter}
                          >
                            <SelectTrigger className="bg-white/80 w-full">
                              <SelectValue placeholder="Filter by Type" />
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
                        </div>
                      </div>

                      {/* Clear Filters Row */}
                      {(submissionSearchTerm !== "" || selectedStatus !== "all" || submissionTypeFilter !== "all") && (
                        <div className="flex justify-start pt-2 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSubmissionSearchTerm("");
                              setSelectedStatus("all");
                              setSubmissionTypeFilter("all");
                            }}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        </div>
                      )}

                      {/* Action Button Row */}
                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <Button
                          onClick={() => setActiveSection("submit-opportunity")}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-6 py-2 w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Submit New Opportunity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submissions Grid */}
                <div className="space-y-6">
                  {submissionsPagination.loading && submissions.length === 0 ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <LoadingCard
                          key={i}
                          title="Loading submissions..."
                          description="Fetching your submitted opportunities"
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                          size="md"
                          variant="pulse"
                          color="emerald"
                        />
                      ))}
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                        <Send className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                        No submissions found
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                        {selectedStatus === "all"
                          ? "You haven't submitted any opportunities yet. Share opportunities you've discovered with the community!"
                          : `No submissions with ${selectedStatus.toLowerCase()} status found.`}
                      </p>
                      {/* <Button
                        onClick={() => setActiveSection("submit-opportunity")}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Your First Opportunity
                      </Button> */}
                    </div>
                  ) : (
                    <>
                      {filteredSubmissions.map((submission) => (
                        <Card
                          key={submission.id}
                          className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-300"
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                                    {submission.title}
                                  </h3>
                                  {getStatusBadge(submission.status)}
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                  {submission.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                  {submission.opportunityType && (
                                    <Badge
                                      variant="secondary"
                                      className="rounded-lg text-xs"
                                      style={{
                                        backgroundColor: submission
                                          .opportunityType.color
                                          ? `${submission.opportunityType.color}20`
                                          : "#f1f5f9",
                                        color:
                                          submission.opportunityType.color ||
                                          "#64748b",
                                        borderColor:
                                          submission.opportunityType.color ||
                                          "#e2e8f0",
                                      }}
                                    >
                                      {submission.opportunityType.name}
                                    </Badge>
                                  )}
                                  {submission.location && (
                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500">
                                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate max-w-32 sm:max-w-none">
                                        {submission.location}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>
                                      Submitted{" "}
                                      {formatDate(submission.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleViewSubmission(submission)
                                  }
                                  className="border-slate-200 hover:bg-slate-50 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:ml-2 sm:inline">
                                    View
                                  </span>
                                </Button>
                                {submission.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleEditSubmission(submission)
                                    }
                                    className="border-slate-200 hover:bg-slate-50 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                                  >
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:ml-2 sm:inline">
                                      Edit
                                    </span>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {submission.status === "REJECTED" &&
                              submission.adminFeedback && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm font-medium text-red-800 mb-1">
                                    Admin Feedback:
                                  </p>
                                  <p className="text-sm text-red-700">
                                    {submission.adminFeedback}
                                  </p>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      ))}

                      {/* Infinite Scroll Load More */}
                      {submissionsPagination.page <
                        submissionsPagination.pages && (
                          <InfiniteScrollTrigger
                            onLoadMore={() =>
                              fetchSubmissions(submissionsPagination.page + 1)
                            }
                            loading={submissionsPagination.loading}
                            totalItems={submissionsPagination.total}
                            currentItems={submissions.length}
                            loadingText="Loading more submissions..."
                            buttonText="Load More Submissions"
                            progressColor="from-emerald-500 to-teal-500"
                          />
                        )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === "new-discussion" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Start a{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Discussion
                    </span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Share your thoughts, questions, or case details with the
                    community.
                  </p>
                </div>

                {/* Back Button */}
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    className="bg-white/80 border-slate-200 hover:bg-white"
                    onClick={() => setActiveSection("discussions")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Discussions
                  </Button>
                </div>

                {/* Discussion Form */}
                <DiscussionThreadForm
                  onSuccess={() => {
                    console.log("DiscussionThreadForm onSuccess called");
                    // Switch back to discussions tab and refresh the discussions
                    setActiveSection("discussions");
                    // Use setTimeout to ensure state update has completed
                    setTimeout(() => {
                      console.log("Calling fetchDiscussions from onSuccess");
                      fetchDiscussions(undefined, undefined, 1, true, true);
                      // Scroll to top of the page
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 0);
                  }}
                  onCancel={() => setActiveSection("discussions")}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - Profile Strength & Widgets */}
          <div className="lg:col-span-12 xl:col-span-3 order-1 lg:order-2">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4 sm:space-y-6">
              {/* Profile Strength */}
              <ProfileStrength
                user={user}
                profile={profile}
                onEdit={handleEditProfile}
                className="w-full"
              />

              {/* Quick Actions */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button
                    onClick={() => setActiveSection("submit-opportunity")}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Submit Opportunity
                  </Button>
                  <Button
                    onClick={() => setActiveSection("opportunities")}
                    variant="outline"
                    className="w-full bg-white/80 border-slate-200 hover:bg-white text-xs sm:text-sm"
                  >
                    <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Browse Opportunities
                  </Button>
                  <Button
                    onClick={handleEditProfile}
                    variant="outline"
                    className="w-full bg-white/80 border-slate-200 hover:bg-white text-xs sm:text-sm"
                  >
                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Saved Opportunities */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                    Recent Saves
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedOpportunities.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {savedOpportunities.slice(0, 3).map((saved) => (
                        <div
                          key={saved.id}
                          className="p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <h4 className="font-medium text-slate-900 text-xs sm:text-sm mb-1 line-clamp-1">
                            {saved.opportunity.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {saved.opportunity.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs border"
                              style={{
                                backgroundColor: saved.opportunity
                                  .opportunityType?.color
                                  ? `${saved.opportunity.opportunityType.color}20`
                                  : "#f1f5f9",
                                color:
                                  saved.opportunity.opportunityType
                                    ?.color || "#64748b",
                                borderColor:
                                  saved.opportunity.opportunityType
                                    ?.color || "#e2e8f0",
                              }}
                            >
                              {saved.opportunity.opportunityType?.name ||
                                "No Type"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-500 hover:text-blue-600"
                              onClick={() =>
                                handleShowOpportunityDetails(
                                  saved.opportunity.id
                                )
                              }
                            >
                              <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                        onClick={() => setActiveSection("saved")}
                      >
                        View All Saved
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <Bookmark className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-slate-600">
                        No saved opportunities yet
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                        onClick={() => setActiveSection("opportunities")}
                      >
                        Browse Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg lg:max-w-xl">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                Apply for Position
              </DialogTitle>
              <DialogDescription className="text-slate-600 font-medium text-sm">
                {selectedOpportunityForApply?.title}
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleApplySubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="coverLetter"
                className="text-sm font-semibold text-slate-800 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Cover Letter
                <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Optional</span>
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Share your motivation, relevant experience, and why you're interested in this opportunity..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[100px] max-h-[120px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg bg-slate-50/50 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="cvFile"
                className="text-sm font-semibold text-slate-800 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                CV/Resume
                <span className="text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Required</span>
              </Label>
              <div className="relative">
                <div className="w-full h-12 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center overflow-hidden">
                  <label
                    htmlFor="cvFile"
                    className="inline-flex items-center justify-center h-full px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm rounded-none rounded-l-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 cursor-pointer border-0"
                  >
                    Choose File
                  </label>
                  <div className="flex-1 px-4 h-full flex items-center text-sm text-slate-700">
                    {cvFile ? cvFile.name : "No file chosen"}
                  </div>
                </div>
                <Input
                  id="cvFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                disabled={applyLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg font-medium"
                disabled={applyLoading || !cvFile}
              >
                {applyLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Opportunity Details Modal */}
      <Dialog
        open={showOpportunityModal}
        onOpenChange={handleCloseOpportunityModal}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {opportunityModalLoading ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  Loading Opportunity Details
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner
                  size="lg"
                  variant="default"
                  color="blue"
                  text="Loading opportunity details..."
                />
              </div>
            </>
          ) : selectedOpportunity ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  {selectedOpportunity.title}
                </DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedOpportunity.opportunityType && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                        style={{
                          backgroundColor: selectedOpportunity.opportunityType
                            .color
                            ? `${selectedOpportunity.opportunityType.color}20`
                            : undefined,
                          color:
                            selectedOpportunity.opportunityType.color ||
                            undefined,
                          borderColor:
                            selectedOpportunity.opportunityType.color ||
                            undefined,
                        }}
                      >
                        {selectedOpportunity.opportunityType.name}
                      </Badge>
                    )}
                    {selectedOpportunity.status === "PENDING" && (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-600"
                      >
                        Pending Approval
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm">
                    {selectedOpportunity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedOpportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Posted {formatDate(selectedOpportunity.createdAt)}
                      </span>
                    </div>
                    {selectedOpportunity.experienceLevel && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>
                          {getExperienceLevelLabel(
                            selectedOpportunity.experienceLevel
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Description
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedOpportunity.description}
                  </p>
                </div>

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Requirements
                    </h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedOpportunity.requirements}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                {selectedOpportunity.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Benefits
                    </h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedOpportunity.benefits}
                    </p>
                  </div>
                )}

                {/* Quick Info Grid */}
                {(selectedOpportunity.experienceLevel || selectedOpportunity.duration || selectedOpportunity.compensation || selectedOpportunity.applicationDeadline) && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Quick Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOpportunity.experienceLevel && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Experience Level
                            </p>
                            <p className="text-sm text-slate-600">
                              {getExperienceLevelLabel(
                                selectedOpportunity.experienceLevel
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOpportunity.duration && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Duration
                            </p>
                            <p className="text-sm text-slate-600">
                              {selectedOpportunity.duration}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOpportunity.compensation && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="h-5 w-5 text-blue-600 font-bold text-lg">
                            ₹
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Compensation
                            </p>
                            <p className="text-sm text-slate-600">
                              {selectedOpportunity.compensation}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOpportunity.applicationDeadline && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Application Deadline
                            </p>
                            <p className="text-sm text-slate-600">
                              {formatDate(
                                selectedOpportunity.applicationDeadline
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mentor Info */}
                {selectedOpportunity.creator && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Posted by
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Dr. {selectedOpportunity.creator.firstName}{" "}
                          {selectedOpportunity.creator.lastName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedOpportunity.creator.email}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedOpportunity.creator.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleSaveOpportunityFromModal}
                  className={cn(
                    "flex-1",
                    opportunityIsSaved
                      ? "text-pink-600 border-pink-200"
                      : "text-slate-600"
                  )}
                >
                  {opportunityIsSaved ? (
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
                <Button
                  onClick={handleApplyFromModal}
                  disabled={userApplications.includes(selectedOpportunity.id)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                >
                  {userApplications.includes(selectedOpportunity.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Applied
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Apply Now
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  Opportunity Details
                </DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <p className="text-slate-600">
                  Failed to load opportunity details
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission View Modal */}
      <Dialog
        open={showSubmissionModal}
        onOpenChange={() => setShowSubmissionModal(false)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  {selectedSubmission.title}
                </DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedSubmission.opportunityType && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                        style={{
                          backgroundColor: selectedSubmission.opportunityType
                            .color
                            ? `${selectedSubmission.opportunityType.color}20`
                            : undefined,
                          color:
                            selectedSubmission.opportunityType.color ||
                            undefined,
                          borderColor:
                            selectedSubmission.opportunityType.color ||
                            undefined,
                        }}
                      >
                        {selectedSubmission.opportunityType.name}
                      </Badge>
                    )}
                    {getStatusBadge(selectedSubmission.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm">
                    {selectedSubmission.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedSubmission.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Submitted {formatDate(selectedSubmission.createdAt)}
                      </span>
                    </div>
                    {selectedSubmission.experienceLevel && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>
                          {getExperienceLevelLabel(
                            selectedSubmission.experienceLevel
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Description
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.description}
                  </p>
                </div>

                {/* Requirements */}
                {selectedSubmission.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Requirements
                    </h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedSubmission.requirements}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                {selectedSubmission.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Benefits
                    </h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedSubmission.benefits}
                    </p>
                  </div>
                )}

                {/* Quick Info Grid */}
                {(selectedSubmission.experienceLevel || selectedSubmission.duration || selectedSubmission.compensation || selectedSubmission.applicationDeadline) && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Quick Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSubmission.experienceLevel && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Experience Level
                            </p>
                            <p className="text-sm text-slate-600">
                              {getExperienceLevelLabel(
                                selectedSubmission.experienceLevel
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedSubmission.duration && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Duration
                            </p>
                            <p className="text-sm text-slate-600">
                              {selectedSubmission.duration}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedSubmission.compensation && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="h-5 w-5 text-blue-600 font-bold text-lg">
                            ₹
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Compensation
                            </p>
                            <p className="text-sm text-slate-600">
                              {selectedSubmission.compensation}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedSubmission.applicationDeadline && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Application Deadline
                            </p>
                            <p className="text-sm text-slate-600">
                              {formatDate(selectedSubmission.applicationDeadline)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Source Information */}
                {(selectedSubmission.sourceUrl ||
                  selectedSubmission.sourceName) && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        Source Information
                      </h3>
                      <div className="space-y-2">
                        {selectedSubmission.sourceName && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Source:</span>{" "}
                            {selectedSubmission.sourceName}
                          </p>
                        )}
                        {selectedSubmission.sourceUrl && (
                          <p className="text-sm">
                            <span className="font-medium text-slate-600">
                              URL:
                            </span>{" "}
                            <a
                              href={selectedSubmission.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {selectedSubmission.sourceUrl}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Admin Feedback */}
                {selectedSubmission.status === "REJECTED" &&
                  selectedSubmission.adminFeedback && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        Admin Feedback
                      </h3>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-800">
                          {selectedSubmission.adminFeedback}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseSubmissionModals}
                  className="px-4"
                >
                  Close
                </Button>
                {selectedSubmission.status === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleDeleteSubmission(selectedSubmission.id)
                      }
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSubmissionModal(false);
                        handleEditSubmission(selectedSubmission);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Submission
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  Submission Details
                </DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <p className="text-slate-600">
                  Failed to load submission details
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Edit Modal */}
      <Dialog
        open={showEditSubmissionModal}
        onOpenChange={() => setShowEditSubmissionModal(false)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              Edit Submission
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update your submission details. Changes will be reviewed by our
              admin team.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSubmission();
              }}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Opportunity Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingSubmission.title || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Research Assistant Position"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingSubmission.location || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editingSubmission.description || ""}
                  onChange={(e) =>
                    setEditingSubmission((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Provide a detailed description of the opportunity..."
                  rows={4}
                  required
                />
              </div>

              {/* Experience Level and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-experienceLevel">Experience Level</Label>
                  <Select
                    value={editingSubmission.experienceLevel || "not-specified"}
                    onValueChange={(value) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        experienceLevel:
                          value === "not-specified" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-specified">
                        Not specified
                      </SelectItem>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="MID">Mid Level</SelectItem>
                      <SelectItem value="SENIOR">Senior Level</SelectItem>
                      <SelectItem value="EXPERT">Expert Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    value={editingSubmission.duration || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
              </div>

              {/* Requirements and Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-requirements">Requirements</Label>
                  <Textarea
                    id="edit-requirements"
                    value={editingSubmission.requirements || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        requirements: e.target.value,
                      }))
                    }
                    placeholder="List the requirements for this opportunity..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-benefits">Benefits</Label>
                  <Textarea
                    id="edit-benefits"
                    value={editingSubmission.benefits || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        benefits: e.target.value,
                      }))
                    }
                    placeholder="List the benefits of this opportunity..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Compensation and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-compensation">Compensation</Label>
                  <Input
                    id="edit-compensation"
                    value={editingSubmission.compensation || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        compensation: e.target.value,
                      }))
                    }
                    placeholder="50,000/year, Stipend provided, Free"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-applicationDeadline">
                    Application Deadline
                  </Label>
                  <Input
                    id="edit-applicationDeadline"
                    type="date"
                    value={
                      editingSubmission.applicationDeadline
                        ? new Date(editingSubmission.applicationDeadline)
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        applicationDeadline: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Source Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sourceName">Source Name</Label>
                  <Input
                    id="edit-sourceName"
                    value={editingSubmission.sourceName || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        sourceName: e.target.value,
                      }))
                    }
                    placeholder="e.g., LinkedIn, Company Website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sourceUrl">Source URL</Label>
                  <Input
                    id="edit-sourceUrl"
                    type="url"
                    value={editingSubmission.sourceUrl || ""}
                    onChange={(e) =>
                      setEditingSubmission((prev) => ({
                        ...prev,
                        sourceUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/opportunity"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseSubmissionModals}
                  disabled={savingSubmission}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    savingSubmission ||
                    !editingSubmission.title ||
                    !editingSubmission.description
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                >
                  {savingSubmission ? (
                    <LoadingSpinner
                      size="sm"
                      variant="minimal"
                      showText={false}
                      className="h-4 w-4 mr-2"
                    />
                  ) : (
                    <Edit3 className="h-4 w-4 mr-2" />
                  )}
                  {savingSubmission ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Editing Modal */}
      <Dialog open={showProfileModal} onOpenChange={handleCloseProfileModal}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-slate-600">
              Update your profile information to help others find and connect
              with you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 sm:py-4">
            <ProfileForm
              key={showProfileModal ? "editing" : "closed"}
              profile={profile ? { ...profile, user } : { user }}
              onSubmit={handleSubmitProfile}
              isSubmitting={isEditingProfile}
              onCancel={handleCloseProfileModal}
            />
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Discussion View Modal */}
      <Dialog open={showDiscussionModal} onOpenChange={handleCloseDiscussionModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDiscussion ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                        {selectedDiscussion.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`text-xs font-medium ${
                            selectedDiscussion.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : selectedDiscussion.status === "CLOSED"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {selectedDiscussion.status === "ACTIVE" && "🟢 Active"}
                          {selectedDiscussion.status === "CLOSED" && "🔒 Closed"}
                          {selectedDiscussion.status === "ARCHIVED" && "📁 Archived"}
                        </Badge>
                        
                        <Badge
                          className={`text-xs ${
                            categoryColors[
                              selectedDiscussion.category as keyof typeof categoryColors
                            ] || categoryColors.GENERAL
                          }`}
                        >
                          {categoryLabels[
                            selectedDiscussion.category as keyof typeof categoryLabels
                          ] || selectedDiscussion.category}
                        </Badge>
                        
                        {user && selectedDiscussion.author.id === user.id && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                          >
                            👤 My Post
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(`/discussions/${selectedDiscussion.id}`, "_blank");
                    }}
                    className="text-slate-600 hover:text-blue-600"
                  >
                    Open Full View
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Author and Date */}
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {selectedDiscussion.author.firstName?.[0] || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {selectedDiscussion.author.firstName} {selectedDiscussion.author.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedDiscussion.author.role} • {formatDate(selectedDiscussion.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{selectedDiscussion.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{selectedDiscussion._count.comments}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {selectedDiscussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDiscussion.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-white/50"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Content */}
                <div className="prose prose-slate max-w-none">
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedDiscussion.content}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCloseDiscussionModal}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      window.open(`/discussions/${selectedDiscussion.id}`, "_blank");
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                  >
                    Join Discussion
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  Discussion Details
                </DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <p className="text-slate-600">Failed to load discussion details</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
