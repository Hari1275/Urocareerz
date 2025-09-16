"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MoreHorizontal,
  Eye,
  Lock,
  Archive,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react"; // Added missing import for React

interface Discussion {
  id: string;
  title: string;
  content: string;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED";
  category: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
  createdAt: string;
  _count: {
    comments: number;
  };
}

export default function DiscussionManagementTable() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    statusCounts: {} as Record<string, number>,
  });

  // Confirmation modal state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    discussionId: string;
    action: string;
    status: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    fetchDiscussions();
  }, [statusFilter, categoryFilter, pagination.page, pagination.limit]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await fetch(`/api/admin/discussions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch discussions");
      }
      const data = await response.json();
      setDiscussions(data.discussions);
      setStats(data.stats);
      
      // Update pagination info from API response
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    discussionId: string,
    newStatus: string,
    action: string,
    description: string
  ) => {
    setPendingAction({ discussionId, action, status: newStatus, description });
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingAction) return;

    try {
      setActionLoading(pendingAction.discussionId);
      const response = await fetch(
        `/api/discussions/${pendingAction.discussionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: pendingAction.status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update discussion status");
      }

      // Refresh the discussions list
      await fetchDiscussions();
    } catch (err: any) {
      console.error("Error updating discussion status:", err);
      alert("Failed to update discussion status: " + err.message);
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: "🟢" },
      CLOSED: { color: "bg-yellow-100 text-yellow-800", icon: "🔒" },
      ARCHIVED: { color: "bg-gray-100 text-gray-800", icon: "📁" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return (
      <Badge className={config.color}>
        {config.icon} {status}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      GENERAL: { color: "bg-blue-100 text-blue-800", label: "General Discussion" },
      CASE_DISCUSSION: { color: "bg-purple-100 text-purple-800", label: "Case Discussion" },
      CAREER_ADVICE: { color: "bg-green-100 text-green-800", label: "Career Advice" },
      TECHNICAL: { color: "bg-orange-100 text-orange-800", label: "Technical Questions" },
      NETWORKING: { color: "bg-pink-100 text-pink-800", label: "Networking" },
      RESOURCES: { color: "bg-indigo-100 text-indigo-800", label: "Resources & Tools" },
    };

    const config =
      categoryConfig[category as keyof typeof categoryConfig] ||
      categoryConfig.GENERAL;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discussion Management</CardTitle>
          <div className="text-sm text-muted-foreground">
            Loading discussions...
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={fetchDiscussions} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-full">
      <CardHeader>
        <h2 className="text-xl text-gray-900">Discussion Management</h2>
        {/* <CardTitle>Discussion Management</CardTitle> */}
        <div className="text-sm text-muted-foreground  pb-3">
          Manage discussion threads and their status
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 pb-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-xs md:text-sm text-blue-600">
              Total Discussions
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {stats.statusCounts.ACTIVE || 0}
            </div>
            <div className="text-xs md:text-sm text-green-600">Active</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-yellow-600">
              {stats.statusCounts.CLOSED || 0}
            </div>
            <div className="text-xs md:text-sm text-yellow-600">Closed</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-gray-600">
              {stats.statusCounts.ARCHIVED || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Archived</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4">
          <div className="flex-1 min-w-0">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-0">
            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="CASE_DISCUSSION">Case Discussion</SelectItem>
                <SelectItem value="CAREER_ADVICE">Career Advice</SelectItem>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="NETWORKING">Networking</SelectItem>
                <SelectItem value="RESOURCES">Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Title</TableHead>
                <TableHead className="min-w-[100px]">Author</TableHead>
                <TableHead className="min-w-[90px]">Category</TableHead>
                <TableHead className="min-w-[70px]">Status</TableHead>
                <TableHead className="min-w-[70px]">Comments</TableHead>
                <TableHead className="min-w-[90px]">Created</TableHead>
                <TableHead className="min-w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discussions.map((discussion) => (
                <TableRow key={discussion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium break-words text-sm">
                        {discussion.title}
                      </div>
                      {/* <div className="text-xs text-muted-foreground break-words">
                        {truncateText(discussion.content, 60)}
                      </div> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <User className="h-3 w-3 flex-shrink-0" /> */}
                      <div className="min-w-0">
                        <div className="font-medium truncate text-sm">
                          {discussion.author.firstName}{" "}
                          {discussion.author.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {discussion.author.role}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex-shrink-0">
                      {getCategoryBadge(discussion.category)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex-shrink-0">
                      {getStatusBadge(discussion.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 flex-shrink-0" />
                      <span className="text-sm">
                        {discussion._count.comments}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">
                        {formatDate(discussion.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(
                              `/discussions/${discussion.id}`,
                              "_blank"
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Discussion
                        </DropdownMenuItem>
                        {discussion.status === "ACTIVE" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  discussion.id,
                                  "CLOSED",
                                  "Close",
                                  "Close the discussion."
                                )
                              }
                              disabled={actionLoading === discussion.id}
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Close Discussion
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  discussion.id,
                                  "ARCHIVED",
                                  "Archive",
                                  "Archive the discussion."
                                )
                              }
                              disabled={actionLoading === discussion.id}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Discussion
                            </DropdownMenuItem>
                          </>
                        )}
                        {discussion.status === "CLOSED" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  discussion.id,
                                  "ACTIVE",
                                  "Reopen",
                                  "Reopen the discussion."
                                )
                              }
                              disabled={actionLoading === discussion.id}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Reopen Discussion
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  discussion.id,
                                  "ARCHIVED",
                                  "Archive",
                                  "Archive the discussion."
                                )
                              }
                              disabled={actionLoading === discussion.id}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Discussion
                            </DropdownMenuItem>
                          </>
                        )}
                        {discussion.status === "ARCHIVED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(
                                discussion.id,
                                "ACTIVE",
                                "Restore",
                                "Restore the discussion."
                              )
                            }
                            disabled={actionLoading === discussion.id}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Restore Discussion
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {discussions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No discussions found with the current filters.
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {discussions.length} of {pagination.total} discussions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingAction?.description}?
              {pendingAction?.status === "CLOSED" && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Closing a discussion will prevent new
                    comments from being added, but existing comments will remain
                    visible.
                  </p>
                </div>
              )}
              {pendingAction?.status === "ARCHIVED" && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-800">
                    <strong>Note:</strong> Archiving a discussion will hide it
                    from the main discussion list and prevent any new activity.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={actionLoading === pendingAction?.discussionId}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={actionLoading === pendingAction?.discussionId}
              className={
                pendingAction?.status === "CLOSED"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : pendingAction?.status === "ARCHIVED"
                    ? "bg-gray-600 hover:bg-gray-700"
                    : ""
              }
            >
              {actionLoading === pendingAction?.discussionId
                ? "Updating..."
                : `Yes, ${pendingAction?.action}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}