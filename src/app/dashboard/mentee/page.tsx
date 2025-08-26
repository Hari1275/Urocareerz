"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import MenteeOpportunityForm from "@/components/MenteeOpportunityForm";
import { LoadingSpinner, LoadingPage, LoadingCard } from "@/components/ui/loading-spinner";
import ProfileStrength from "@/components/ProfileStrength";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  savedAt: string;
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
  savedOpportunities: number;
  submittedOpportunities: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'save' | 'submission';
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

type ActiveSection = 'dashboard' | 'opportunities' | 'applications' | 'submissions' | 'saved' | 'submit-opportunity' | 'discussions' | 'new-discussion';

const menuItems = [
  {
    id: 'dashboard' as ActiveSection,
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'opportunities' as ActiveSection,
    label: 'Find Opportunities',
    icon: Search,
  },
  {
    id: 'applications' as ActiveSection,
    label: 'My Applications',
    icon: FileText,
  },
  {
    id: 'submissions' as ActiveSection,
    label: 'My Posted Opportunities',
    icon: Send,
  },
  {
    id: 'saved' as ActiveSection,
    label: 'Saved List',
    icon: Bookmark,
  },
];

export default function MenteeDashboardPage() {
  const router = useRouter();
  const { getTypeBadge } = useOpportunityTypes();
  const { navigateToOpportunity, navigateToApply } = useNavigation();
  
  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Dashboard data
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    savedOpportunities: 0,
    submittedOpportunities: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([]);
  
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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [savedFilter, setSavedFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  
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
  const [selectedOpportunityForApply, setSelectedOpportunityForApply] = useState<Opportunity | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [saveLoading, setSaveLoading] = useState<{[key: string]: boolean}>({});
  
  // Opportunity details modal state
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [opportunityModalLoading, setOpportunityModalLoading] = useState(false);
  const [opportunityIsSaved, setOpportunityIsSaved] = useState(false);

  // Profile editing modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
        setSavedOpportunityIds(savedOpportunitiesArray.map((opp: any) => opp.opportunityId));
        
        // Update stats
        setStats(prev => ({
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
        const pendingApps = applications.filter((app: any) => app.status === 'PENDING');
        
        setApplications(applications);
        setUserApplications(applications.map((app: any) => app.opportunityId));
        setStats(prev => ({
          ...prev,
          totalApplications: applications.length,
          pendingApplications: pendingApps.length,
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
        setOpportunities(opportunitiesData.opportunities || []);
      }

      // Fetch recent opportunities by mentors (latest 5)
      const recentOpportunitiesResponse = await fetch("/api/opportunities?limit=5&sort=newest");
      if (recentOpportunitiesResponse.ok) {
        const recentOpportunitiesData = await recentOpportunitiesResponse.json();
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
        setSubmissions(submissionsData.opportunities || []);
        setStats(prev => ({
          ...prev,
          submittedOpportunities: submissionsData.opportunities?.length || 0,
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

  const fetchDiscussions = async (category?: string, status?: string) => {
    if (activeSection !== 'discussions') return;
    
    setDiscussionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      
      const response = await fetch(`/api/discussions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.threads || []);
        setDiscussionPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setDiscussionsLoading(false);
    }
  };
  
  const fetchOpportunities = async (page = 1, reset = false) => {
    if (activeSection !== 'opportunities') return;
    
    setOpportunityPagination(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: opportunityPagination.limit.toString(),
        search: searchTerm,
        experience: experienceFilter !== 'all' ? experienceFilter : '',
        type: typeFilter !== 'all' ? typeFilter : '',
        saved: savedFilter !== 'all' ? savedFilter : ''
      });
      
      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newOpportunities = data.opportunities || [];
        
        setOpportunities(prev => reset ? newOpportunities : [...prev, ...newOpportunities]);
        setOpportunityPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || opportunityPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunityPagination(prev => ({ ...prev, loading: false }));
    }
  };
  
  const fetchSavedOpportunities = async (page = 1, reset = false) => {
    if (activeSection !== 'saved') return;
    
    setSavedPagination(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: savedPagination.limit.toString()
      });
      
      const response = await fetch(`/api/saved-opportunities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newSavedOpportunities = data.savedOpportunities || [];
        
        setSavedOpportunities(prev => reset ? newSavedOpportunities : [...prev, ...newSavedOpportunities]);
        setSavedPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || savedPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
      setSavedPagination(prev => ({ ...prev, loading: false }));
    }
  };
  
  const fetchApplications = async (page = 1, reset = false) => {
    if (activeSection !== 'applications') return;
    
    setApplicationsPagination(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: applicationsPagination.limit.toString()
      });
      
      const response = await fetch(`/api/applications?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newApplications = data.applications || [];
        
        setApplications(prev => reset ? newApplications : [...prev, ...newApplications]);
        setApplicationsPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || applicationsPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationsPagination(prev => ({ ...prev, loading: false }));
    }
  };
  
  const fetchSubmissions = async (page = 1, reset = false) => {
    if (activeSection !== 'submissions') return;
    
    setSubmissionsPagination(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: submissionsPagination.limit.toString(),
        status: selectedStatus !== 'all' ? selectedStatus : ''
      });
      
      const response = await fetch(`/api/mentee-opportunities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newSubmissions = data.opportunities || [];
        
        setSubmissions(prev => reset ? newSubmissions : [...prev, ...newSubmissions]);
        setSubmissionsPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || submissionsPagination.limit,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissionsPagination(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      await checkUserRole();
      await fetchDashboardData();
    };
    
    initDashboard();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (activeSection === 'discussions') {
      fetchDiscussions();
    } else if (activeSection === 'opportunities') {
      fetchOpportunities(1, true);
    } else if (activeSection === 'saved') {
      fetchSavedOpportunities(1, true);
    } else if (activeSection === 'applications') {
      fetchApplications(1, true);
    } else if (activeSection === 'submissions') {
      fetchSubmissions(1, true);
    }
  }, [activeSection]);
  
  // Handle filter changes for opportunities
  useEffect(() => {
    if (activeSection === 'opportunities') {
      fetchOpportunities(1, true);
    }
  }, [searchTerm, experienceFilter, typeFilter, savedFilter]);
  
  // Handle status filter for submissions
  useEffect(() => {
    if (activeSection === 'submissions') {
      fetchSubmissions(1, true);
    }
  }, [selectedStatus]);

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
    if (opportunityPagination.page < opportunityPagination.pages && !opportunityPagination.loading) {
      fetchOpportunities(opportunityPagination.page + 1, false);
    }
  };
  
  const loadMoreSaved = () => {
    if (savedPagination.page < savedPagination.pages && !savedPagination.loading) {
      fetchSavedOpportunities(savedPagination.page + 1, false);
    }
  };
  
  const loadMoreApplications = () => {
    if (applicationsPagination.page < applicationsPagination.pages && !applicationsPagination.loading) {
      fetchApplications(applicationsPagination.page + 1, false);
    }
  };
  
  const loadMoreSubmissions = () => {
    if (submissionsPagination.page < submissionsPagination.pages && !submissionsPagination.loading) {
      fetchSubmissions(submissionsPagination.page + 1, false);
    }
  };

  const handleSaveOpportunity = async (opportunityId: string) => {
    setSaveLoading(prev => ({ ...prev, [opportunityId]: true }));
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
        throw new Error('Failed to save opportunity');
      }
    } catch (err) {
      console.error("Failed to save opportunity:", err);
      alert(err instanceof Error ? err.message : "Failed to save opportunity. Please try again.");
    } finally {
      setSaveLoading(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: "POST",
      });

      if (response.ok) {
        // Update the application status locally
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: "WITHDRAWN" } : app
          )
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to withdraw application");
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      alert("Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
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
    if (!selectedOpportunityForApply || !coverLetter.trim()) {
      alert('Please fill in the cover letter');
      return;
    }
    
    setApplyLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('opportunityId', selectedOpportunityForApply.id);
      submitData.append('coverLetter', coverLetter);
      if (cvFile) {
        submitData.append('cvFile', cvFile);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        // Refresh data and close modal
        await fetchDashboardData();
        setShowApplyModal(false);
        setSelectedOpportunityForApply(null);
        setCoverLetter("");
        setCvFile(null);
        alert('Application submitted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
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
        console.error('Failed to fetch opportunity details');
      }
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
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
        throw new Error('Failed to save opportunity');
      }
    } catch (err) {
      console.error("Failed to save opportunity:", err);
      alert(err instanceof Error ? err.message : "Failed to save opportunity. Please try again.");
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
      alert(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsEditingProfile(false);
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
      (savedFilter === "saved" && savedOpportunityIds.includes(opportunity.id)) ||
      (savedFilter === "not_saved" && !savedOpportunityIds.includes(opportunity.id)) ||
      (savedFilter === "applied" && userApplications.includes(opportunity.id)) ||
      (savedFilter === "not_applied" && !userApplications.includes(opportunity.id));

    return matchesSearch && matchesExperience && matchesType && matchesSaved;
  });

  const filteredSubmissions = submissions.filter((submission) => {
    if (selectedStatus === "all") return true;
    return submission.status === selectedStatus;
  });

  if (loading) {
    return (
      <LoadingPage 
        title="Loading your dashboard..." 
        description="Fetching your profile, applications, and opportunities"
        size="lg"
      />
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">U</span>
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-3 hidden lg:block">
                <div className="space-y-4">
                  <div className="h-20 bg-slate-200 rounded-xl"></div>
                  <div className="h-64 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
              <div className="lg:col-span-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 bg-slate-200 rounded-xl"></div>
                    <div className="h-24 bg-slate-200 rounded-xl"></div>
                    <div className="h-24 bg-slate-200 rounded-xl"></div>
                    <div className="h-24 bg-slate-200 rounded-xl"></div>
                  </div>
                  <div className="h-48 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
              <div className="lg:col-span-3 hidden lg:block">
                <div className="space-y-4">
                  <div className="h-32 bg-slate-200 rounded-xl"></div>
                  <div className="h-32 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
            </div>
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
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-slate-600 rounded"></div>
                  <div className="w-full h-0.5 bg-slate-600 rounded"></div>
                  <div className="w-full h-0.5 bg-slate-600 rounded"></div>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">U</span>
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-xs sm:text-sm">
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-xs sm:text-sm text-slate-900 font-medium truncate max-w-[120px] md:max-w-[160px]">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                    </p>
                    <p className="text-xs text-slate-500">Mentee</p>
                  </div>
                </div>
              )}
              <Button 
                onClick={handleEditProfile}
                variant="outline" 
                size="sm" 
                className="hidden md:flex text-xs bg-white/80 border-slate-200 hover:bg-white"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm text-slate-600 hover:text-red-600 px-2 sm:px-3">
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Sidebar - Navigation */}
          <div className={cn(
            "lg:col-span-3",
            "lg:block",
            isClient && isMobileSidebarOpen ? "block" : "hidden lg:block"
          )}>
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              {/* Profile Card */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-sm sm:text-base">
                        {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">Mentee</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Menu */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsMobileSidebarOpen(false); // Close mobile menu after selection
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive ? "text-white" : "text-slate-500")} />
                          <span className="truncate">{item.label}</span>
                          {item.id === 'applications' && stats.pendingApplications > 0 && (
                            <Badge variant="secondary" className="ml-auto h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] text-xs">
                              {stats.pendingApplications}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                  
                  <Separator className="my-4" />
                  
                  <button
                    onClick={() => {
                      setActiveSection('submit-opportunity');
                      setIsMobileSidebarOpen(false); // Close mobile menu
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                      activeSection === 'submit-opportunity'
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <Plus className={cn("h-4 w-4 sm:h-5 sm:w-5", activeSection === 'submit-opportunity' ? "text-white" : "text-slate-500")} />
                    <span className="truncate">Submit Opportunity</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveSection('discussions');
                      setIsMobileSidebarOpen(false); // Close mobile menu
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                      activeSection === 'discussions'
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <MessageSquare className={cn("h-4 w-4 sm:h-5 sm:w-5", activeSection === 'discussions' ? "text-white" : "text-slate-500")} />
                    <span className="truncate">Discussions</span>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-6">
            {activeSection === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Welcome back, {user?.firstName || 'there'}!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">Here's what's happening with your career journey today.</p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg">
                          <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Applications</p>
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
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">{stats.pendingApplications}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Pending</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 shadow-lg">
                          <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">{stats.savedOpportunities}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Saved</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg">
                          <Send className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-2xl font-bold text-slate-900">{stats.submittedOpportunities}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Submitted</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                          onClick={() => setActiveSection('opportunities')}
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
                            onClick={() => handleShowOpportunityDetails(opportunity.id)}
                          >
                            <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900 text-sm line-clamp-1">{opportunity.title}</p>
                                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{opportunity.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs" style={{
                                      backgroundColor: opportunity.opportunityType?.color ? `${opportunity.opportunityType.color}20` : '#f1f5f9',
                                      color: opportunity.opportunityType?.color || '#64748b',
                                      borderColor: opportunity.opportunityType?.color || '#e2e8f0'
                                    }}>
                                      {opportunity.opportunityType?.name || 'No Type'}
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
                                      savedOpportunityIds.includes(opportunity.id)
                                        ? "bg-pink-50 text-pink-600 border-pink-200"
                                        : "hover:bg-slate-50"
                                    )}
                                  >
                                    {saveLoading[opportunity.id] ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-pink-600"></div>
                                    ) : (
                                      <Heart className={cn(
                                        "h-3 w-3",
                                        savedOpportunityIds.includes(opportunity.id) ? "fill-current" : ""
                                      )} />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                Posted by Dr. {opportunity.creator.firstName} {opportunity.creator.lastName} • {formatDate(opportunity.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No recent opportunities yet</p>
                        <p className="text-sm text-slate-500">Check back later for new opportunities from mentors</p>
                      </div>
                    )}
                  </CardContent>
                </Card>


              </div>
            )}

            {activeSection === 'opportunities' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Find <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opportunities</span>
                  </h1>
                  <p className="text-slate-600 mb-6">Discover career opportunities that match your interests and goals.</p>
                </div>
                
                {/* Search and Filters */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Search opportunities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/80"
                      />
                      <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                        <SelectTrigger className="bg-white/80">
                          <SelectValue placeholder="Experience Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="ENTRY">Entry Level</SelectItem>
                          <SelectItem value="MID">Mid-Career</SelectItem>
                          <SelectItem value="SENIOR">Senior Level</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="bg-white/80">
                          <SelectValue placeholder="Opportunity Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {opportunityTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={savedFilter} onValueChange={setSavedFilter}>
                        <SelectTrigger className="bg-white/80">
                          <SelectValue placeholder="Saved Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Opportunities</SelectItem>
                          <SelectItem value="saved">Saved Only</SelectItem>
                          <SelectItem value="not_saved">Not Saved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities Grid */}
                <div className="grid gap-6">
                  {opportunityPagination.loading && opportunities.length === 0 ? (
                    <div className="space-y-6">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-4 bg-slate-200 rounded w-full"></div>
                              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                              <div className="flex gap-2">
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : opportunities.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                        <Search className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Try adjusting your search criteria or check back later for new opportunities.
                      </p>
                    </div>
                  ) : (
                    <>
                      {opportunities.map((opportunity) => (
                        <Card key={opportunity.id} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => handleShowOpportunityDetails(opportunity.id)}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">{opportunity.title}</h3>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-3">{opportunity.description}</p>
                                <div className="flex items-center gap-3 mb-2">
                                  {opportunity.opportunityType && (
                                    <Badge variant="secondary" className="rounded-lg">
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
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                                  ) : (
                                    <Heart className={cn(
                                      "h-4 w-4",
                                      savedOpportunityIds.includes(opportunity.id) ? "fill-current" : ""
                                    )} />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyClick(opportunity);
                                  }}
                                  disabled={userApplications.includes(opportunity.id)}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                                >
                                  {userApplications.includes(opportunity.id) ? "Applied" : "Apply Now"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Load More Button */}
                      {opportunityPagination.page < opportunityPagination.pages && (
                        <div className="text-center mt-8">
                          <Button
                            onClick={loadMoreOpportunities}
                            disabled={opportunityPagination.loading}
                            variant="outline"
                            className="bg-white/80 border-slate-200 hover:bg-white px-8 py-3"
                          >
                            {opportunityPagination.loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                                Loading more...
                              </>
                            ) : (
                              <>
                                Load More Opportunities
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-slate-500 mt-2">
                            Showing {opportunities.length} of {opportunityPagination.total} opportunities
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'applications' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">My Applications</h1>
                  <p className="text-slate-600">Track the status of your opportunity applications.</p>
                </div>
                
                <div className="space-y-6">
                  {applicationsPagination.loading && applications.length === 0 ? (
                    <div className="space-y-6">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-4 bg-slate-200 rounded w-full"></div>
                              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                              <div className="flex gap-2">
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Start applying for opportunities to see your applications here.
                      </p>
                      <Button onClick={() => setActiveSection('opportunities')} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        Browse Opportunities
                      </Button>
                    </div>
                  ) : (
                    <>
                      {applications.map((application) => (
                        <Card key={application.id} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{application.opportunity.title}</h3>
                                <p className="text-slate-600 text-sm mb-3">{application.opportunity.description}</p>
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusBadge(application.status)}
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>Applied {formatDate(application.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleShowOpportunityDetails(application.opportunity.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                {application.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleWithdrawApplication(application.id)}
                                    disabled={withdrawingId === application.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    {withdrawingId === application.id ? "Withdrawing..." : "Withdraw"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Load More Button */}
                      {applicationsPagination.page < applicationsPagination.pages && (
                        <div className="text-center mt-8">
                          <Button
                            onClick={loadMoreApplications}
                            disabled={applicationsPagination.loading}
                            variant="outline"
                            className="bg-white/80 border-slate-200 hover:bg-white px-8 py-3"
                          >
                            {applicationsPagination.loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                                Loading more...
                              </>
                            ) : (
                              <>
                                Load More Applications
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-slate-500 mt-2">
                            Showing {applications.length} of {applicationsPagination.total} applications
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'submissions' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    My <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Submissions</span>
                  </h1>
                  <p className="text-slate-600">Track opportunities you've submitted for admin review.</p>
                </div>
                
                {/* Status Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const counts = {
                      total: submissions.length,
                      pending: submissions.filter(sub => sub.status === 'PENDING').length,
                      approved: submissions.filter(sub => sub.status === 'APPROVED').length,
                      rejected: submissions.filter(sub => sub.status === 'REJECTED').length,
                    };
                    return [
                      { title: "Total", count: counts.total, color: "text-blue-600", icon: "📄", status: "all" },
                      { title: "Pending", count: counts.pending, color: "text-amber-600", icon: "⏳", status: "PENDING" },
                      { title: "Approved", count: counts.approved, color: "text-emerald-600", icon: "✅", status: "APPROVED" },
                      { title: "Rejected", count: counts.rejected, color: "text-red-600", icon: "❌", status: "REJECTED" },
                    ].map((item, index) => (
                      <Card 
                        key={index} 
                        className={cn(
                          "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl",
                          selectedStatus === item.status ? 'ring-2 ring-blue-500' : ''
                        )}
                        onClick={() => setSelectedStatus(item.status)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.count}</div>
                          <div className="text-sm text-slate-600 font-medium">{item.title}</div>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                  {submissionsPagination.loading && submissions.length === 0 ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-4 bg-slate-200 rounded w-full"></div>
                              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                              <div className="flex gap-2">
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-200 flex items-center justify-center">
                        <Send className="h-12 w-12 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No submissions yet</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Start contributing to the community by submitting opportunities you've found.
                      </p>
                      <Button onClick={() => setActiveSection('submit-opportunity')} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        Submit Opportunity
                      </Button>
                    </div>
                  ) : (
                    <>
                      {submissions.map((submission) => (
                        <Card key={submission.id} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{submission.title}</h3>
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{submission.description}</p>
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(submission.status)}
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>Submitted {formatDate(submission.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Load More Button */}
                      {submissionsPagination.page < submissionsPagination.pages && (
                        <div className="text-center mt-8">
                          <Button
                            onClick={loadMoreSubmissions}
                            disabled={submissionsPagination.loading}
                            variant="outline"
                            className="bg-white/80 border-slate-200 hover:bg-white px-8 py-3"
                          >
                            {submissionsPagination.loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                                Loading more...
                              </>
                            ) : (
                              <>
                                Load More Submissions
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-slate-500 mt-2">
                            Showing {submissions.length} of {submissionsPagination.total} submissions
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'saved' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Saved <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Opportunities</span>
                  </h1>
                  <p className="text-slate-600">Your bookmarked opportunities for future reference.</p>
                </div>
                
                <div className="space-y-4">
                  {savedPagination.loading && savedOpportunities.length === 0 ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-4 bg-slate-200 rounded w-full"></div>
                              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                              <div className="flex gap-2">
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : savedOpportunities.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-pink-100 to-rose-200 flex items-center justify-center">
                        <Heart className="h-12 w-12 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No saved opportunities</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Start saving opportunities you're interested in for quick access later.
                      </p>
                      <Button onClick={() => setActiveSection('opportunities')} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        Browse Opportunities
                      </Button>
                    </div>
                  ) : (
                    <>
                      {savedOpportunities.map((saved) => (
                        <Card key={saved.id} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{saved.opportunity.title}</h3>
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{saved.opportunity.description}</p>
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    variant="secondary" 
                                    className="border"
                                    style={{
                                      backgroundColor: saved.opportunity.opportunityType?.color ? `${saved.opportunity.opportunityType.color}20` : '#f1f5f9',
                                      color: saved.opportunity.opportunityType?.color || '#64748b',
                                      borderColor: saved.opportunity.opportunityType?.color || '#e2e8f0'
                                    }}
                                  >
                                    {saved.opportunity.opportunityType?.name || 'No Type'}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Heart className="h-4 w-4" />
                                    <span>Saved {formatDate(saved.savedAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowOpportunityDetails(saved.opportunity.id);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSaveOpportunity(saved.opportunity.id)}
                                  className="text-pink-600 hover:text-pink-700"
                                >
                                  <Heart className="h-4 w-4 fill-current" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Load More Button */}
                      {savedPagination.page < savedPagination.pages && (
                        <div className="text-center mt-8">
                          <Button
                            onClick={loadMoreSaved}
                            disabled={savedPagination.loading}
                            variant="outline"
                            className="bg-white/80 border-slate-200 hover:bg-white px-8 py-3"
                          >
                            {savedPagination.loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                                Loading more...
                              </>
                            ) : (
                              <>
                                Load More Saved Opportunities
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-slate-500 mt-2">
                            Showing {savedOpportunities.length} of {savedPagination.total} saved opportunities
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'submit-opportunity' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Submit <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opportunity</span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Share opportunities you've discovered with the UroCareerz community.
                  </p>
                </div>
                
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                  <CardContent className="p-8">
                    <MenteeOpportunityForm />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'discussions' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Community <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Discussions</span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Connect with mentors and other mentees in our growing community.
                  </p>
                </div>
                
                {/* New Discussion Button */}
                <div className="flex justify-center">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    onClick={() => setActiveSection('new-discussion')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start New Discussion
                  </Button>
                </div>

                {/* Discussions List */}
                {discussionsLoading ? (
                  <LoadingCard 
                    title="Loading discussions..." 
                    className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5"
                    size="md"
                  />
                ) : (
                  <DiscussionThreadsList
                    threads={discussions}
                    pagination={discussionPagination}
                    onRefresh={fetchDiscussions}
                    onNewDiscussion={() => setActiveSection('new-discussion')}
                  />
                )}
              </div>
            )}

            {activeSection === 'new-discussion' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                    Start a <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Discussion</span>
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Share your thoughts, questions, or case details with the community.
                  </p>
                </div>
                
                {/* Back Button */}
                <div className="flex justify-start">
                  <Button 
                    variant="outline"
                    className="bg-white/80 border-slate-200 hover:bg-white"
                    onClick={() => setActiveSection('discussions')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Discussions
                  </Button>
                </div>

                {/* Discussion Form */}
                <DiscussionThreadForm />
              </div>
            )}
          </div>

          {/* Right Sidebar - Widgets */}
          <div className="lg:col-span-3">
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              {/* Profile Strength */}
              <ProfileStrength user={user} profile={profile} onEdit={handleEditProfile} />

              {/* Quick Actions */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button 
                    onClick={() => setActiveSection('submit-opportunity')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Submit Opportunity
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('opportunities')}
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
                        <div key={saved.id} className="p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
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
                                backgroundColor: saved.opportunity.opportunityType?.color ? `${saved.opportunity.opportunityType.color}20` : '#f1f5f9',
                                color: saved.opportunity.opportunityType?.color || '#64748b',
                                borderColor: saved.opportunity.opportunityType?.color || '#e2e8f0'
                              }}
                            >
                              {saved.opportunity.opportunityType?.name || 'No Type'}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-500 hover:text-blue-600"
                              onClick={() => handleShowOpportunityDetails(saved.opportunity.id)}
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
                        onClick={() => setActiveSection('saved')}
                      >
                        View All Saved
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <Bookmark className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-slate-600">No saved opportunities yet</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                        onClick={() => setActiveSection('opportunities')}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Apply for Position
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {selectedOpportunityForApply?.title}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleApplySubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-sm font-medium text-slate-700">
                Cover Letter *
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Write your cover letter here..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvFile" className="text-sm font-medium text-slate-700">
                CV/Resume (Optional)
              </Label>
              <Input
                id="cvFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-slate-500">
                Accepted formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
                disabled={applyLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                disabled={applyLoading || !coverLetter.trim()}
              >
                {applyLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Opportunity Details Modal */}
      <Dialog open={showOpportunityModal} onOpenChange={handleCloseOpportunityModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {opportunityModalLoading ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                  Loading Opportunity
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600">Loading opportunity details...</span>
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
                          backgroundColor: selectedOpportunity.opportunityType.color ? `${selectedOpportunity.opportunityType.color}20` : undefined,
                          color: selectedOpportunity.opportunityType.color || undefined,
                          borderColor: selectedOpportunity.opportunityType.color || undefined
                        }}
                      >
                        {selectedOpportunity.opportunityType.name}
                      </Badge>
                    )}
                    {selectedOpportunity.status === "PENDING" && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
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
                      <span>Posted {formatDate(selectedOpportunity.createdAt)}</span>
                    </div>
                    {selectedOpportunity.experienceLevel && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{getExperienceLevelLabel(selectedOpportunity.experienceLevel)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedOpportunity.description}
                  </p>
                </div>

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedOpportunity.requirements}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                {selectedOpportunity.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Benefits</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedOpportunity.benefits}
                    </p>
                  </div>
                )}

                {/* Quick Info Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOpportunity.experienceLevel && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Experience Level</p>
                          <p className="text-sm text-slate-600">
                            {getExperienceLevelLabel(selectedOpportunity.experienceLevel)}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOpportunity.duration && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Duration</p>
                          <p className="text-sm text-slate-600">
                            {selectedOpportunity.duration}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOpportunity.compensation && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="h-5 w-5 text-blue-600 font-bold text-lg">₹</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Compensation</p>
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
                            {formatDate(selectedOpportunity.applicationDeadline)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mentor Info */}
                {selectedOpportunity.creator && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Posted by</h3>
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
                    opportunityIsSaved ? "text-pink-600 border-pink-200" : "text-slate-600"
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
                <p className="text-slate-600">Failed to load opportunity details</p>
              </div>
            </>
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
              Update your profile information to help others find and connect with you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 sm:py-4">
            <ProfileForm
              key={showProfileModal ? 'editing' : 'closed'}
              profile={profile ? { ...profile, user } : { user }}
              onSubmit={handleSubmitProfile}
              isSubmitting={isEditingProfile}
              onCancel={handleCloseProfileModal}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 