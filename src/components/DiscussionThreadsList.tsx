"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

interface DiscussionThreadsListProps {
  threads: DiscussionThread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onRefresh: (category?: string, status?: string, page?: number, forceRefresh?: boolean, myDiscussions?: boolean) => void;
  onNewDiscussion?: () => void;
  currentCategory?: string;
  currentStatus?: string;
  onLoadMore: () => void;
  loading: boolean;
  currentUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  } | null;
  onViewDiscussion?: (thread: DiscussionThread) => void;
  currentMyDiscussions?: boolean;
}

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

export default function DiscussionThreadsList({
  threads,
  pagination,
  onRefresh,
  onNewDiscussion,
  currentCategory,
  currentStatus,
  onLoadMore,
  loading,
  currentUser,
  onViewDiscussion,
  currentMyDiscussions,
}: DiscussionThreadsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showMyDiscussions, setShowMyDiscussions] = useState<boolean>(false);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const categoryParam = category === "ALL" ? "all" : category;
    const statusParam = selectedStatus === "ALL" ? "all" : selectedStatus;
    onRefresh(categoryParam, statusParam, 1, true, showMyDiscussions);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const categoryParam = selectedCategory === "ALL" ? "all" : selectedCategory;
    const statusParam = status === "ALL" ? "all" : status;
    onRefresh(categoryParam, statusParam, 1, true, showMyDiscussions);
  };

  const handleMyDiscussionsChange = (myDiscussions: boolean) => {
    console.log("🔄 My Discussions button clicked. New state:", myDiscussions);
    console.log("👤 Current user:", currentUser?.id);
    
    if (myDiscussions && !currentUser?.id) {
      console.error("❌ Cannot filter by 'My Discussions' - no current user ID");
      return;
    }
    
    setShowMyDiscussions(myDiscussions);
    const categoryParam = selectedCategory === "ALL" ? "all" : selectedCategory;
    const statusParam = selectedStatus === "ALL" ? "all" : selectedStatus;
    console.log("📤 Calling onRefresh with:", { categoryParam, statusParam, myDiscussions, currentUserId: currentUser?.id });
    onRefresh(categoryParam, statusParam, 1, true, myDiscussions);
  };

  // Sync internal state with props
  useEffect(() => {
    if (currentCategory) {
      setSelectedCategory(currentCategory === "all" ? "ALL" : currentCategory);
    }
    if (currentStatus) {
      setSelectedStatus(currentStatus === "all" ? "ALL" : currentStatus);
    }
    if (currentMyDiscussions !== undefined) {
      setShowMyDiscussions(currentMyDiscussions);
    }
  }, [currentCategory, currentStatus, currentMyDiscussions]);

  // Only reset filters on initial mount, not when threads change
  useEffect(() => {
    // This effect only runs once on mount to set initial state
    // We don't reset filters when threads.length === 0 because we want to maintain
    // the user's selected filters even when no results are found
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Discussion Filters
          </CardTitle>
          <CardDescription>
            Filter discussions by category and status to find relevant
            conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40 bg-white/80">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">🟢 Active</SelectItem>
                  <SelectItem value="CLOSED">🔒 Closed</SelectItem>
                  <SelectItem value="ARCHIVED">📁 Archived</SelectItem>
                </SelectContent>
              </Select>

              {/* My Discussions Toggle */}
              <Button
                variant={showMyDiscussions ? "default" : "outline"}
                size="sm"
                onClick={() => handleMyDiscussionsChange(!showMyDiscussions)}
                className={showMyDiscussions 
                  ? "bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600"
                  : "bg-white/80 hover:bg-white border-slate-300 text-slate-600 hover:text-slate-900"
                }
              >
                {showMyDiscussions ? "✓ My Discussions" : "My Discussions"}
              </Button>

              {/* Clear Filters Button */}
              {(selectedCategory !== "ALL" || selectedStatus !== "ALL" || showMyDiscussions) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("🧹 Clear Filters clicked");
                    setSelectedCategory("ALL");
                    setSelectedStatus("ALL");
                    setShowMyDiscussions(false);
                    console.log("📤 Clearing all filters - calling onRefresh with defaults");
                    onRefresh("all", "all", 1, true, false);
                  }}
                  className="bg-white/80 hover:bg-white border-slate-300 text-slate-600 hover:text-slate-900"
                >
                  🧹 Clear Filters
                </Button>
              )}
            </div>

            <Button
              onClick={() =>
                onNewDiscussion
                  ? onNewDiscussion()
                  : router.push("/discussions/new")
              }
              className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600"
            >
              Start New Discussion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threads List */}
      <div className="space-y-4">
        {threads.length > 0 && (
          <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded">
            📄 Showing {threads.length} discussions
            {currentUser && (
              <span> | Current user: {currentUser.firstName} (ID: {currentUser.id})</span>
            )}
            {showMyDiscussions && (
              <span className="text-purple-600 font-semibold"> | 🔍 Filter: MY DISCUSSIONS ONLY</span>
            )}
            {selectedCategory !== "ALL" && (
              <span> | Category: {selectedCategory}</span>
            )}
            {selectedStatus !== "ALL" && (
              <span> | Status: {selectedStatus}</span>
            )}
          </div>
        )}
        {threads.map((thread) => (
          <Card
            key={thread.id}
            className="bg-white/70 backdrop-blur-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header with badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge - Now Prominent */}
                    <Badge
                      className={`text-xs font-medium ${
                        thread.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : thread.status === "CLOSED"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : thread.status === "ARCHIVED"
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {thread.status === "ACTIVE" && "🟢 Active"}
                      {thread.status === "CLOSED" && "🔒 Closed"}
                      {thread.status === "ARCHIVED" && "📁 Archived"}
                      {!thread.status && "🟢 Active"}
                    </Badge>
                    
                    {thread.isPinned && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-yellow-100 text-yellow-800"
                      >
                        📌 Pinned
                      </Badge>
                    )}
                    
                    <Badge
                      className={`text-xs ${categoryColors[
                        thread.category as keyof typeof categoryColors
                      ] || categoryColors.GENERAL
                        }`}
                    >
                      {categoryLabels[
                        thread.category as keyof typeof categoryLabels
                      ] || thread.category}
                    </Badge>
                    
                    {thread.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {thread.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-white/50"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {thread.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-white/50"
                          >
                            +{thread.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Ownership Indicator */}
                  {currentUser && thread.author.id === currentUser.id && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                    >
                      👤 My Post
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {thread.title}
                </h3>

                {/* Content Preview */}
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {truncateContent(thread.content)}
                </p>

                {/* Metadata and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
                  {/* Author and Date */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
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
                      <span className="font-medium">
                        {thread.author.firstName} {thread.author.lastName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-white/50"
                      >
                        {thread.author.role}
                      </Badge>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(thread.createdAt)}
                    </span>
                  </div>

                  {/* Stats and Action */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {thread.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {thread._count.comments}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Discussion Controls - Only show for owned posts */}
                      {currentUser && thread.author.id === currentUser.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("✏️ Edit button clicked for thread:", thread.id);
                              // Add edit functionality here
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit Discussion"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("🗑️ Delete button clicked for thread:", thread.id);
                              // Add delete functionality here
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete Discussion"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewDiscussion) {
                            onViewDiscussion(thread);
                          } else {
                            window.open(
                              `/discussions/${thread.id}`,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                        className="bg-white/80 hover:bg-white shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {threads.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="text-lg font-medium mb-2">
                {showMyDiscussions 
                  ? "No discussions found from you" 
                  : "No discussions found"
                }
              </h3>
              <p className="text-sm">
                {showMyDiscussions 
                  ? "You haven't created any discussions yet. Start your first discussion to share ideas with the community!"
                  : selectedCategory && selectedCategory !== "ALL"
                  ? `No discussions in the "${categoryLabels[
                  selectedCategory as keyof typeof categoryLabels
                  ]
                  }" category yet.`
                  : "Be the first to start a discussion!"
                }
              </p>
            </div>
            <Button
              onClick={() =>
                onNewDiscussion
                  ? onNewDiscussion()
                  : router.push("/discussions/new")
              }
              className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600"
            >
              {showMyDiscussions ? "Start Your First Discussion" : "Start First Discussion"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Infinite Scroll Load More */}
      {onLoadMore && pagination.page < pagination.pages && (
        <div className="text-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="bg-white/80 border-slate-200 hover:bg-white px-6 py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span>Loading more...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Load More Discussions</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}
          </Button>

          {/* Progress Indicator */}
          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-500">
              Showing {threads.length} of {pagination.total} discussions
            </p>
            <div className="w-full max-w-xs mx-auto">
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((threads.length / pagination.total) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {Math.round((threads.length / pagination.total) * 100)}% loaded
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}