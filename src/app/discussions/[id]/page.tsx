"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, Eye, Calendar, User } from "lucide-react";
import DiscussionStatusControls from "@/components/DiscussionStatusControls";

interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  comments: DiscussionComment[];
}

interface DiscussionComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

const categoryLabels: Record<string, string> = {
  GENERAL: "General Discussion",
  CASE_DISCUSSION: "Case Discussion",
  CAREER_ADVICE: "Career Advice",
  TECHNICAL: "Technical Questions",
  NETWORKING: "Networking",
  RESOURCES: "Resources",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  CLOSED: "Closed",
  PINNED: "Pinned",
};

export default function DiscussionThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const threadId = params.id as string;

  useEffect(() => {
    fetchThread();
    fetchUserData();
  }, [threadId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/login");
    }
  };

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/discussions/${threadId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Thread not found",
            description:
              "This discussion thread may have been deleted or doesn't exist.",
            variant: "destructive",
          });
          router.push("/discussions");
          return;
        }
        throw new Error("Failed to fetch discussion thread");
      }

      const data = await response.json();
      setThread(data.thread);
    } catch (error) {
      console.error("Error fetching thread:", error);
      toast({
        title: "Error",
        description: "Failed to load discussion thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/discussions/${threadId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const data = await response.json();
      setThread((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, data.comment],
        };
      });

      setComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/discussions/${threadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setThread((prev) => {
        if (!prev) return prev;
        return { ...prev, status: newStatus };
      });

      toast({
        title: "Status updated",
        description: "Discussion status has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating discussion status:", error);
      toast({
        title: "Error",
        description: "Failed to update discussion status. Please try again.",
        variant: "destructive",
      });
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading discussion thread...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Thread Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This discussion thread may have been deleted or doesn&apos;t exist.
            </p>
            <Button 
              onClick={() => router.push("/discussions")}
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
            >
              Back to Discussions
            </Button>
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
            <Link href="/discussions" className="hover:text-blue-600 transition-colors">
              Discussions
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Discussion</span>
          </nav>
        </div>

        {/* Back Button and Status Controls */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/discussions")}
            className="mb-4 bg-white/70 backdrop-blur-lg border-gray-200 hover:bg-white hover:border-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discussions
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-white/50">
                {categoryLabels[thread.category] || thread.category}
              </Badge>
              <Badge
                variant={thread.status === "PINNED" ? "default" : "outline"}
                className={thread.status === "PINNED" ? "bg-yellow-100 text-yellow-800" : "bg-white/50"}
              >
                {statusLabels[thread.status] || thread.status}
              </Badge>
            </div>

            {user && (
              <DiscussionStatusControls
                discussionId={thread.id}
                currentStatus={thread.status as "ACTIVE" | "CLOSED" | "ARCHIVED"}
                isAuthor={user.id === thread.author.id}
                isAdmin={user.role === "ADMIN"}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </div>

        {/* Thread Content */}
        <Card className="mb-6 bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl mb-2 text-gray-900">
                  {thread.title}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>
                      {thread.author.firstName} {thread.author.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{thread.viewCount} views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {thread.content}
              </p>
            </div>

            {thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {thread.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white/50">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Comments ({thread.comments.length})
            </h2>
          </div>

          {/* Add Comment */}
          <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
            <CardContent className="pt-6">
              <Textarea
                placeholder="Add your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] mb-4 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || submitting}
                  className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {thread.comments.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    No comments yet. Be the first to comment!
                  </p>
                </CardContent>
              </Card>
            ) : (
              thread.comments.map((comment) => (
                <Card key={comment.id} className="bg-white/70 backdrop-blur-lg shadow-lg border border-gray-100">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
