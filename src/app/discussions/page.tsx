"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DiscussionThreadsList from "@/components/DiscussionThreadsList";

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

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

function DiscussionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/login");
    }
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const category = searchParams.get("category");
      const status = searchParams.get("status");
      const page = searchParams.get("page") || "1";

      if (category) params.set("category", category);
      if (status) params.set("status", status);
      params.set("page", page);

      const response = await fetch(`/api/discussions?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch discussions");
      }

      setThreads(data.threads);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch discussions"
      );
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [searchParams, user]);

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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading discussions...</p>
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
              <h3 className="text-lg font-medium mb-2">
                Error Loading Discussions
              </h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <button
              onClick={fetchThreads}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
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
              <span className="text-sm text-gray-500 font-medium">Welcome, {user?.firstName || user?.email}</span>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
              <Button variant="outline" onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</Button>
            </div>
            <div className="md:hidden flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shouldLogout = confirm("Would you like to logout?");
                  if (shouldLogout) handleLogout();
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Community Discussions</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Community <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Discussions</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with the UroCareerz community through discussions, case studies, and knowledge sharing.
            </p>
          </div>
        </div>

        <DiscussionThreadsList
          threads={threads}
          pagination={pagination}
          onRefresh={fetchThreads}
        />
      </main>
    </div>
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading discussions...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <DiscussionsContent />
    </Suspense>
  );
}
