"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DiscussionThreadsList from "@/components/DiscussionThreadsList";
import SharedHeader from "@/components/shared-header";

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
        setUser(userData.user); // Fix: assign the actual user object
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

      const response = await fetch(`/api/discussions?${params.toString()}`, {
        cache: "no-store",
      });
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

  // Refetch when user returns to this tab or window regains focus
  useEffect(() => {
    const onFocus = () => {
      // Avoid double requests if already loading
      if (!loading && user) {
        fetchThreads();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !loading && user) {
        fetchThreads();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, loading, searchParams]);

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
        <SharedHeader />
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
        <SharedHeader />
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
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Community{" "}
              <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Discussions
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with the UroCareerz community through discussions, case
              studies, and knowledge sharing.
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <SharedHeader />
          <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading discussions...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DiscussionsContent />
    </Suspense>
  );
}
