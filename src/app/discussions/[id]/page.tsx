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
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50">
      <SharedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-20 space-y-4 sm:space-y-5">
              {/* Discussion Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900 tracking-tight">
                      Discussion Info
                    </CardTitle>
                    {canManageStatus && (
                      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={openStatusDialog}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Manage Status"
                          >
                            <Settings className="h-3.5 w-3.5" />
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
                <CardContent className="space-y-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="bg-slate-50/80 border-slate-200 text-slate-700 font-medium text-xs">
                      {categoryLabels[thread.category] || thread.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        thread.status === "ACTIVE"
                          ? "bg-emerald-50/80 text-emerald-700 border-emerald-200 font-medium text-xs"
                          : thread.status === "CLOSED"
                          ? "bg-amber-50/80 text-amber-700 border-amber-200 font-medium text-xs"
                          : thread.status === "ARCHIVED"
                          ? "bg-slate-50/80 text-slate-700 border-slate-200 font-medium text-xs"
                          : "bg-slate-50/80 border-slate-200 text-slate-700 font-medium text-xs"
                      }
                    >
                      {thread.status === "ACTIVE" && "🟢 Active"}
                      {thread.status === "CLOSED" && "🔒 Closed"}
                      {thread.status === "ARCHIVED" && "📁 Archived"}
                      {!thread.status && "🟢 Active"}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-medium">
                        {thread.author.firstName} {thread.author.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
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
                    <div className="flex items-center gap-2.5">
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>{thread.viewCount ?? 0} views</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="h-3.5 w-3.5 text-slate-500" />
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
            <div className="space-y-4 sm:space-y-5">
              {/* Thread Content */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                    {thread.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                      {thread.content}
                    </p>
                  </div>

                  {thread.tags && thread.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-200/60">
                      {thread.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-blue-50/80 border-blue-200/60 text-blue-700 font-medium"
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
            <div className="sticky top-20 space-y-4 sm:space-y-5">
              {/* Author Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900 tracking-tight">
                    Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {thread.author.firstName?.[0] || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {thread.author.firstName} {thread.author.lastName}
                      </p>
                      <Badge variant="outline" className="text-xs bg-slate-50/80 border-slate-200 text-slate-700 font-medium mt-1">
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
