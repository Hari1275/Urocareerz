"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        throw new Error("Failed to fetch thread");
      }

      const data = await response.json();
      setThread(data.thread);
    } catch (error) {
      console.error("Error fetching thread:", error);
      toast({
        title: "Error",
        description: "Failed to load the discussion thread.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/discussions/${threadId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const data = await response.json();
      setComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });

      // Refresh the thread to show the new comment
      fetchThread();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
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
        throw new Error("Failed to update discussion status");
      }

      toast({
        title: "Status updated",
        description: `Discussion has been ${newStatus.toLowerCase()}.`,
      });

      // Refresh the thread to show updated status
      fetchThread();
    } catch (error) {
      console.error("Error updating discussion status:", error);
      toast({
        title: "Error",
        description: "Failed to update discussion status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading discussion thread...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thread Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This discussion thread may have been deleted or doesn't exist.
          </p>
          <Button onClick={() => router.push("/discussions")}>
            Back to Discussions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/discussions")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {categoryLabels[thread.category] || thread.category}
            </Badge>
            <Badge
              variant={thread.status === "PINNED" ? "default" : "secondary"}
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
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl mb-2">
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
                <Badge key={index} variant="outline" className="text-xs">
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
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            Comments ({thread.comments.length})
          </h2>
        </div>

        {/* Add Comment */}
        <Card>
          <CardContent className="pt-6">
            <Textarea
              placeholder="Add your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] mb-4"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!comment.trim() || submitting}
              >
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {thread.comments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </CardContent>
            </Card>
          ) : (
            thread.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
