"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SharedHeader from "@/components/shared-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Eye, Calendar, User, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DiscussionComments, {
  FlatComment,
} from "@/components/DiscussionComments";
import DiscussionCommentForm from "@/components/DiscussionCommentForm";

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

interface DiscussionComment extends FlatComment { }

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
  RESOURCES: "Resources & Tools",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export default function DiscussionThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

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

  // Check if user can manage status (author or admin)
  const canManageStatus = 
    !!user &&
    !!thread &&
    (user.id === thread.author.id || user.role === "ADMIN");

  const handleStatusUpdate = async () => {
    if (!newStatus || !thread) return;
    
    setStatusUpdating(true);
    try {
      await handleStatusChange(newStatus);
      setStatusDialogOpen(false);
      setNewStatus("");
    } catch (error) {
      // Error is already handled in handleStatusChange
    } finally {
      setStatusUpdating(false);
    }
  };

  const openStatusDialog = () => {
    setNewStatus(thread?.status || "");
    setStatusDialogOpen(true);
  };

  const handleCommentAdded = (newComment: DiscussionComment) => {
    setThread((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...prev.comments, newComment],
      };
    });
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
        <SharedHeader />
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
        <SharedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Thread Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This discussion thread may have been deleted or doesn&apos;t
              exist.
            </p>
            <Button
              onClick={() => router.back()}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <SharedHeader />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Removed back navigation for consistency */}

              {/* Discussion Info */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Discussion Info
                    </CardTitle>
                    {canManageStatus && (
                      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={openStatusDialog}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Manage Status"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Manage Discussion Status</DialogTitle>
                            <DialogDescription>
                              Change the status of this discussion to control its visibility and interaction.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600">🟢</span>
                                      <div>
                                        <div className="font-medium">Active</div>
                                        {/* <div className="text-xs text-gray-500">Allow new comments and visible to all</div> */}
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="CLOSED">
                                    <div className="flex items-center gap-2">
                                      <span className="text-yellow-600">🔒</span>
                                      <div>
                                        <div className="font-medium">Closed</div>
                                        {/* <div className="text-xs text-gray-500">Prevent new comments but keep visible</div> */}
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="ARCHIVED">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600">📁</span>
                                      <div>
                                        <div className="font-medium">Archived</div>
                                        {/* <div className="text-xs text-gray-500">Hide from main discussion list</div> */}
                                      </div>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setStatusDialogOpen(false)}
                                disabled={statusUpdating}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleStatusUpdate}
                                disabled={statusUpdating || newStatus === thread.status}
                              >
                                {statusUpdating ? "Updating..." : "Update Status"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white/50">
                      {categoryLabels[thread.category] || thread.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        thread.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : thread.status === "CLOSED"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : thread.status === "ARCHIVED"
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : "bg-white/50"
                      }
                    >
                      {thread.status === "ACTIVE" && "🟢 Active"}
                      {thread.status === "CLOSED" && "🔒 Closed"}
                      {thread.status === "ARCHIVED" && "📁 Archived"}
                      {!thread.status && "🟢 Active"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {thread.author.firstName} {thread.author.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span suppressHydrationWarning>
                        {new Date(thread.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{thread.viewCount ?? 0} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>
                        {thread.comments ? thread.comments.length : 0} comments
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Thread Content */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                    {thread.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {thread.content}
                    </p>
                  </div>

                  {thread.tags && thread.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200">
                      {thread.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Comment */}
              <DiscussionCommentForm
                threadId={thread.id}
                onCommentAdded={handleCommentAdded}
                disabled={thread.status !== "ACTIVE"}
              />

              
              {/* Comments List (Nested) */}
              <DiscussionComments
                threadId={thread.id}
                comments={thread.comments || []}
                onAdded={(c) =>
                  setThread((prev) =>
                    prev
                      ? { ...prev, comments: [...(prev.comments || []), c] }
                      : prev
                  )
                }
                canReply={thread.status === "ACTIVE"}
              />
            </div>
          </div>

          {/* Right Sidebar - Additional Info */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Removed quick actions for consistency */}

              {/* Author Info */}
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5">
                <CardHeader className="pb-0 pt-3">
                  <CardTitle className="text-base font-semibold text-slate-900 pb-0">
                    Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {thread.author.firstName?.[0] || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {thread.author.firstName} {thread.author.lastName}
                      </p>
                      <Badge variant="outline" className="text-xs bg-white/50">
                        {thread.author.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
