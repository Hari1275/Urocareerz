"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SharedHeader, { clearUserCache } from "@/components/shared-header";

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
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleChecking, setRoleChecking] = useState(true);

  // Check user role and redirect if necessary
  const checkUserRole = async () => {
    try {
      setRoleChecking(true);
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        const role = userData.user.role;
        setUserRole(role);
        
        // Redirect if user is not a mentee
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "MENTOR") {
          router.push("/dashboard/mentor");
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    } finally {
      setRoleChecking(false);
    }
  };

  const fetchSavedOpportunities = async () => {
    try {
      setLoadingData(true);
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
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // Clear cache and check user role
    clearUserCache();
    checkUserRole();
    fetchSavedOpportunities();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Use Shared Header */}
      <SharedHeader />

      {/* Show loading while checking user role */}
      {roleChecking ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
        </div>
      </main>
      )}
    </div>
  );
} 