"use client";

import { useState } from "react";
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
  onRefresh: (category?: string, status?: string) => void;
  onNewDiscussion?: () => void;
}

const categoryLabels = {
  GENERAL: "General",
  CASE_DISCUSSION: "Case Discussion",
  CAREER_ADVICE: "Career Advice",
  TECHNICAL: "Technical",
  NETWORKING: "Networking",
  RESOURCES: "Resources",
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
}: DiscussionThreadsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const categoryParam = category === "ALL" ? undefined : category;
    const statusParam = selectedStatus === "ACTIVE" ? undefined : selectedStatus;
    onRefresh(categoryParam, statusParam);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const categoryParam = selectedCategory === "ALL" ? undefined : selectedCategory;
    const statusParam = status === "ACTIVE" ? undefined : status;
    onRefresh(categoryParam, statusParam);
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Discussion Filters</CardTitle>
          <CardDescription>
            Filter discussions by category and status to find relevant conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
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
                  <SelectItem value="ACTIVE">🟢 Active</SelectItem>
                  <SelectItem value="CLOSED">🔒 Closed</SelectItem>
                  <SelectItem value="ARCHIVED">📁 Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => onNewDiscussion ? onNewDiscussion() : router.push("/discussions/new")}
              className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600"
            >
              Start New Discussion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threads List */}
      <div className="space-y-4">
        {threads.map((thread) => (
          <Card key={thread.id} className="bg-white/70 backdrop-blur-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    {thread.isPinned && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        📌 Pinned
                      </Badge>
                    )}
                    <Badge
                      className={`text-xs ${
                        categoryColors[
                          thread.category as keyof typeof categoryColors
                        ] || categoryColors.GENERAL
                      }`}
                    >
                      {categoryLabels[
                        thread.category as keyof typeof categoryLabels
                      ] || thread.category}
                    </Badge>
                    {thread.tags.length > 0 && (
                      <div className="flex space-x-1">
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
                          <Badge variant="outline" className="text-xs bg-white/50">
                            +{thread.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <h3
                    className="text-lg font-semibold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => router.push(`/discussions/${thread.id}`)}
                  >
                    {thread.title}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {truncateContent(thread.content)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {thread.author.firstName} {thread.author.lastName}
                        <Badge variant="outline" className="ml-2 text-xs bg-white/50">
                          {thread.author.role}
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(thread.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {thread.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {thread._count.comments} comments
                      </span>
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
              <h3 className="text-lg font-medium mb-2">No discussions found</h3>
              <p className="text-sm">
                {selectedCategory
                  ? `No discussions in the "${
                      categoryLabels[
                        selectedCategory as keyof typeof categoryLabels
                      ]
                    }" category yet.`
                  : "Be the first to start a discussion!"}
              </p>
            </div>
            <Button 
              onClick={() => onNewDiscussion ? onNewDiscussion() : router.push("/discussions/new")}
              className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600"
            >
              Start First Discussion
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 border border-gray-100">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} discussions
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => {
                // For now, pagination is handled by the parent component
                // Future enhancement: implement pagination callback
              }}
              className="bg-white/80 hover:bg-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => {
                // For now, pagination is handled by the parent component
                // Future enhancement: implement pagination callback
              }}
              className="bg-white/80 hover:bg-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
