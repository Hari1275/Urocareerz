"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui";
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
import { usePagination } from "@/hooks/use-pagination";
import { LegalDisclaimerModal } from "@/components/LegalDisclaimerModal";

interface Profile {
  id?: string;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
  resume?: string | null; // S3 key for resume file
  resumeFileName?: string | null; // Original filename
  // Mentee fields
  education?: string | null;
  interests?: string[];
  purposeOfRegistration?: string | null;
  // Mentor fields
  specialty?: string | null;
  subSpecialty?: string | null;
  workplace?: string | null;
  availabilityStatus?: string;
  yearsOfExperience?: number | null;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  termsAccepted?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
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

        // Check if user has accepted terms
        if (!userData.user.termsAccepted) {
          setShowLegalModal(true);
        }

        // Fetch profile data
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.profile);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const response = await fetch("/api/user/accept-terms", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to accept terms");
      }

      const data = await response.json();

      // Update user state with the response data
      setUser(data.user);
      setShowLegalModal(false);

      // No need to refresh the page - state update is sufficient
    } catch (error) {
      console.error("Error accepting terms:", error);
      alert("Failed to accept terms. Please try again.");
    }
  };

  const handleDeclineTerms = () => {
    // Just close the modal and let user continue browsing
    // They can accept terms later when they're ready
    setShowLegalModal(false);
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
          <CardFooter>
            <Button onClick={() => router.push("/login")}>Back to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Render different dashboard based on user role
  if (user.role === "ADMIN") {
    // Redirect admins to the dedicated admin dashboard
    router.push("/admin");
    return null;
  } else if (user.role === "MENTOR") {
    // Redirect mentors to the dedicated mentor dashboard
    router.push("/dashboard/mentor");
    return null;
  } else {
    return (
      <>
        <MenteeDashboard
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onShowLegalModal={() => setShowLegalModal(true)}
        />
        <LegalDisclaimerModal
          open={showLegalModal}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
      </>
    );
  }
}

function DashboardHeader({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Profile | null;
  onLogout: () => void;
}) {
  const getAvatarUrl = () => {
    if (profile?.avatar) {
      if (
        profile.avatar === "https://example.com" ||
        profile.avatar === "example.com"
      ) {
        return null;
      }
      // If it's a full URL, use it directly
      if (profile.avatar.startsWith("http")) {
        return profile.avatar;
      }
      // Otherwise, use the download API
      return `/api/download?key=${encodeURIComponent(profile.avatar)}`;
    }
    return null;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Responsive sizing */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
            </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center space-x-3">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()!}
                  alt="Profile Picture"
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <span className="text-sm text-gray-500 font-medium">Welcome, {user.firstName || user.email}</span>
            </div>
            <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
            <Button variant="outline" onClick={onLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-end">
            {/* Mobile Menu Button - Clean logout only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Simple mobile menu - you can expand this with a proper mobile menu component
                const shouldLogout = confirm("Would you like to logout?");
                if (shouldLogout) onLogout();
              }}
              className="p-2 text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileCompletionBanner({
  user,
  profile,
}: {
  user: User;
  profile: Profile | null;
}) {
  if (profile) return null; // Profile is complete

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-amber-800">
                Complete Your Profile
              </h3>
              <p className="text-sm text-amber-700">
                {user.role === "MENTEE"
                  ? "Add your education, interests, and goals to help mentors find you"
                  : "Add your specialty, experience, and availability to help mentees find you"}
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Complete Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MenteeDashboard({
  user,
  profile,
  onLogout,
  onShowLegalModal,
}: {
  user: User;
  profile: Profile | null;
  onLogout: () => void;
  onShowLegalModal: () => void;
}) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination hook
  const opportunitiesPagination = usePagination({ initialPageSize: 10 });

  const fetchMenteeOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mentee-opportunities");

      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }

      const data = await response.json();
      const opportunitiesData = data.opportunities || [];
      setOpportunities(opportunitiesData);
      opportunitiesPagination.actions.setTotalItems(opportunitiesData.length);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenteeOpportunities();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "APPROVED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "CONVERTED":
        return <Badge variant="outline">Converted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] font-sans">
      <DashboardHeader user={user} profile={profile} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32 lg:pb-40">
          <ProfileCompletionBanner user={user} profile={profile} />

        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back, {user.firstName}!</h1>
          <p className="text-base sm:text-lg text-gray-600">Discover opportunities and connect with mentors in urology</p>
            {!user.termsAccepted && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  <span className="text-sm text-blue-800">Please review and accept our Terms of Service to unlock all features</span>
                  </div>
                <Button size="sm" onClick={onShowLegalModal} className="bg-blue-600 hover:bg-blue-700 text-white">Review Terms</Button>
                </div>
              </div>
            )}
          </div>

        {/* Modern Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
            {/* Submit Opportunity Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/dashboard/mentee/submit-opportunity")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Submit Opportunity</h3>
            <p className="text-sm text-gray-500 text-center">Share opportunities you've found with the community</p>
          </div>

            {/* Discussions Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/discussions")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Discussions</h3>
            <p className="text-sm text-gray-500 text-center">Join discussions and share knowledge with the community</p>
          </div>

            {/* Browse Opportunities Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/opportunities")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Browse Opportunities</h3>
            <p className="text-sm text-gray-500 text-center">Explore and apply for opportunities posted by mentors</p>
          </div>

            {/* My Applications Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/applications")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-orange-400 to-red-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">My Applications</h3>
            <p className="text-sm text-gray-500 text-center">View and track your applications</p>
          </div>
        </div>

        {/* Submitted Opportunities Section with Pagination */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Submitted Opportunities</h2>
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
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
                </div>
                </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-gray-500">Loading...</span>
                </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No opportunities submitted yet</h3>
                <p className="text-gray-600 mb-4">Start contributing to the community by submitting opportunities you've found.</p>
                <Button className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" onClick={() => router.push("/dashboard/mentee/submit-opportunity")}>Submit Your First Opportunity</Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {opportunitiesPagination.state.startIndex + 1} to {opportunitiesPagination.state.endIndex} of {opportunitiesPagination.state.totalItems} opportunities
                </div>
                {/* Table Layout */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200/50">
                      {opportunitiesPagination.paginateData(opportunities).map((opportunity) => (
                        <tr key={opportunity.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{opportunity.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">{opportunity.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" style={{ borderColor: opportunity.opportunityType.color || undefined, color: opportunity.opportunityType.color || undefined }}>
                              {opportunity.opportunityType.name}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(opportunity.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(opportunity.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {opportunity.adminFeedback ? (
                              <div className="text-sm text-blue-600 font-medium">Available</div>
                            ) : (
                              <div className="text-sm text-gray-400">None</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
          </div>

        {/* Quick Actions - integrated into main flow */}
        <div className="mt-8 px-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-lg font-semibold text-gray-800 text-center sm:text-left whitespace-nowrap">Ready to take action?</span>
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end">
                    <Button
                  onClick={() => router.push("/opportunities")}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Browse Opportunities
                    </Button>
                    <Button
                  onClick={() => router.push("/dashboard/mentee/submit-opportunity")}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Submit Opportunity
                    </Button>
                  </div>
                </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MentorDashboard({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Profile | null;
  onLogout: () => void;
}) {
  const router = useRouter();
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Busy":
        return "bg-yellow-100 text-yellow-800";
      case "Away":
        return "bg-orange-100 text-orange-800";
      case "Unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <DashboardHeader user={user} profile={profile} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ProfileCompletionBanner user={user} profile={profile} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, Dr. {user.lastName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Guide the next generation of urologists
            </p>
            {profile && (
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  className={getAvailabilityColor(
                    profile.availabilityStatus || "Available"
                  )}
                >
                  {profile.availabilityStatus || "Available"}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manage Mentees Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>My Mentees</CardTitle>
                <div className="text-sm text-gray-600">
                  View and manage your mentees
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-primary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-primary" disabled={!profile}>
                  View Mentees
                </Button>
              </CardFooter>
            </Card>

            {/* Schedule Sessions Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>My Schedule</CardTitle>
                <div className="text-sm text-gray-600">
                  Manage availability and bookings
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-secondary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-secondary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-secondary" disabled={!profile}>
                  Manage Schedule
                </Button>
              </CardFooter>
            </Card>

            {/* Resources Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Share Resources</CardTitle>
                <div className="text-sm text-gray-600">
                  Upload educational materials
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-accent-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-accent-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!profile}
                >
                  Upload Resources
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Ready to help mentees grow?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="btn-primary" disabled={!profile}>
                      View Mentees
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/profile")}
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminDashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <DashboardHeader user={user} profile={null} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage users and platform activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Management Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="text-sm text-gray-600">
                  Manage users, roles, and permissions
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-primary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-primary">Manage Users</Button>
              </CardFooter>
            </Card>

            {/* Analytics Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <div className="text-sm text-gray-600">
                  View usage statistics and metrics
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-secondary-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-secondary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full btn-secondary">View Analytics</Button>
              </CardFooter>
            </Card>

            {/* Settings Card */}
            <Card className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <div className="text-sm text-gray-600">
                  Configure system settings and preferences
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-accent-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-accent-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Manage Settings
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Platform Activity
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No recent activity to display.
                  </p>
                  <Button className="mt-4 btn-primary">
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
