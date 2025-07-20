"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

export default function DiscussionsPage() {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

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

  useEffect(() => {
    fetchThreads();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading discussions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discussion Forums
        </h1>
        <p className="text-gray-600">
          Connect with the UroCareerz community through discussions, case
          studies, and knowledge sharing.
        </p>
      </div>

      <DiscussionThreadsList
        threads={threads}
        pagination={pagination}
        onRefresh={fetchThreads}
      />
    </div>
  );
}
