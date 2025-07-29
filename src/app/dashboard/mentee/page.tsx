"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import SharedHeader from "@/components/shared-header";

interface MenteeOpportunity {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CONVERTED";
  createdAt: string;
  opportunityType: {
    name: string;
    color: string | null;
  };
  adminFeedback: string | null;
}

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

export default function MenteeDashboardPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<MenteeOpportunity[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const opportunitiesPagination = usePagination({ initialPageSize: 10 });

  const fetchMenteeOpportunities = async () => {
    try {
      setLoadingData(true);
      const response = await fetch("/api/opportunities");
      if (response.ok) {
        const data = await response.json();
        const opportunitiesArray = data.opportunities || [];
        setOpportunities(opportunitiesArray);
        opportunitiesPagination.actions.setTotalItems(opportunitiesArray.length);
      } else {
        console.error("Failed to fetch opportunities");
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSavedOpportunities = async () => {
    try {
      const response = await fetch("/api/saved-opportunities");
      if (response.ok) {
        const data = await response.json();
        const savedOpportunitiesArray = data.savedOpportunities || [];
        setSavedOpportunities(savedOpportunitiesArray);
      } else {
        console.error("Failed to fetch saved opportunities");
      }
    } catch (error) {
      console.error("Error fetching saved opportunities:", error);
    }
  };

  useEffect(() => {
    // Load data immediately without blocking UI
    fetchMenteeOpportunities();
    fetchSavedOpportunities();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending Review</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="border-green-500 text-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500 text-red-700">Rejected</Badge>;
      case "CONVERTED":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Converted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Use Shared Header */}
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Mentee</span>!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to explore opportunities and contribute to the community? Let&apos;s get started!
            </p>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {/* Submit Opportunity Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/dashboard/mentee/submit-opportunity")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Submit Opportunity</h3>
            <p className="text-sm text-gray-500 text-center">Share opportunities you&apos;ve found with the community</p>
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

          {/* Saved Opportunities Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/opportunities?filter=saved")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Saved Opportunities</h3>
            <p className="text-sm text-gray-500 text-center">
              {loadingData ? (
                <span className="animate-pulse">Loading...</span>
              ) : savedOpportunities.length > 0 ? (
                `${savedOpportunities.length} saved opportunity${savedOpportunities.length !== 1 ? 'ies' : ''}`
              ) : (
                'No saved opportunities yet'
              )}
            </p>
            {savedOpportunities.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 rounded-full text-sm font-bold mx-auto">
                  {savedOpportunities.length}
                </div>
              </div>
            )}
          </div>

          {/* Applied Opportunities Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/opportunities?filter=applied")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-emerald-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Applied Opportunities</h3>
            <p className="text-sm text-gray-500 text-center">Track opportunities you've applied to</p>
          </div>

          {/* My Submissions Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/submissions")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">My Submissions</h3>
            <p className="text-sm text-gray-500 text-center">Manage your submitted opportunities</p>
          </div>

          {/* Profile Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100 cursor-pointer" onClick={() => router.push("/profile")}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">My Profile</h3>
            <p className="text-sm text-gray-500 text-center">Update your profile and preferences</p>
          </div>
        </div>

        {/* Community Engagement Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Discussions */}
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
                <p className="text-gray-600 mb-4">Participate in discussions, ask questions, and share your knowledge with the community.</p>
                <Button className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600" onClick={() => router.push("/discussions")}>View All Discussions</Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
                <p className="text-gray-600 mb-4">Ready to take action? Explore opportunities or submit your own.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => router.push("/opportunities")}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    Browse Opportunities
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/mentee/submit-opportunity")}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    Submit Opportunity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 