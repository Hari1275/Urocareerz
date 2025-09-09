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
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OpportunityForm from "./OpportunityForm";
import ConfirmationDialog from "./ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useOpportunityFilters } from "@/hooks/use-opportunity-filters";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "./TablePagination";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
  Eye,
  Users,
  Bookmark,
  Plus,
  Edit,
  Search,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import React from "react";

interface Mentee {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  opportunityType: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  location?: string;
  duration?: string;
  stipend?: string;
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
  creatorRole: "MENTOR" | "MENTEE";
  sourceUrl?: string;
  sourceName?: string;
  createdAt: string;
  updatedAt?: string;
  _count: {
    applications: number;
    savedOpportunities: number;
  };
}

export default function ContentModerationTable() {
  const { toast } = useToast();
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
  const { getStatusBadge } = useOpportunityFilters();
  const pagination = usePagination({ initialPageSize: 10 });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const [isClient, setIsClient] = useState(false);

  // New state for mentee details
  const [applications, setApplications] = useState<Record<string, Mentee[]>>({});
  const [savedMentees, setSavedMentees] = useState<Record<string, Mentee[]>>({});
  const [loadingMentees, setLoadingMentees] = useState<Record<string, boolean>>({});
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showApplications, setShowApplications] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showOpportunityDetails, setShowOpportunityDetails] = useState(false);
  const [opportunityDetails, setOpportunityDetails] = useState<Opportunity | null>(null);

  // Handle client-side rendering to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchOpportunities();
  }, [statusFilter, typeFilter, debouncedSearchQuery]);

  // Filtering logic
  const filteredOpportunities = opportunities.filter((opportunity) => {
    if (statusFilter !== "all" && opportunity.status !== statusFilter) return false;
    if (typeFilter !== "all" && opportunity.opportunityType.name !== typeFilter) return false;
    if (debouncedSearchQuery && !opportunity.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    pagination.actions.setTotalItems(filteredOpportunities.length);
  }, [filteredOpportunities, pagination.actions]);

  const paginatedOpportunities = pagination.paginateData(filteredOpportunities);

  const fetchOpportunities = async () => {
    try {
      if (debouncedSearchQuery) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);

      const response = await fetch(`/api/admin/opportunities?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      const data = await response.json();
      setOpportunities(data.opportunities);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchApplications = async (opportunityId: string) => {
    if (applications[opportunityId]) return;

    try {
      setLoadingMentees(prev => ({ ...prev, [`${opportunityId}-applications`]: true }));
      const response = await fetch(`/api/admin/opportunities/${opportunityId}/applications`);
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(prev => ({ ...prev, [opportunityId]: data.applications }));
    } catch (err: any) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingMentees(prev => ({ ...prev, [`${opportunityId}-applications`]: false }));
    }
  };

  const fetchSavedMentees = async (opportunityId: string) => {
    if (savedMentees[opportunityId]) return;

    try {
      setLoadingMentees(prev => ({ ...prev, [`${opportunityId}-saved`]: true }));
      const response = await fetch(`/api/admin/opportunities/${opportunityId}/saved`);
      if (!response.ok) {
        throw new Error("Failed to fetch saved mentees");
      }
      const data = await response.json();
      setSavedMentees(prev => ({ ...prev, [opportunityId]: data.savedMentees }));
    } catch (err: any) {
      console.error("Error fetching saved mentees:", err);
    } finally {
      setLoadingMentees(prev => ({ ...prev, [`${opportunityId}-saved`]: false }));
    }
  };

  const handleShowApplications = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplications(true);
    setShowSaved(false);
    setShowOpportunityDetails(false); // Close opportunity details modal
    fetchApplications(opportunity.id);
  };

  const handleShowSaved = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowSaved(true);
    setShowApplications(false);
    setShowOpportunityDetails(false); // Close opportunity details modal
    fetchSavedMentees(opportunity.id);
  };

  const handleApproveOpportunity = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);

      // Optimistic update
      setOpportunities((prevOpportunities) =>
        prevOpportunities.map((opportunity) =>
          opportunity.id === opportunityId
            ? { ...opportunity, status: "APPROVED" }
            : opportunity
        )
      );

      const response = await fetch(
        `/api/admin/opportunities/${opportunityId}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve opportunity");
      }

      await fetchOpportunities();
      toast({
        title: "Success",
        description: "Opportunity approved successfully",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error approving opportunity:", err);
      toast({
        title: "Error",
        description: "Failed to approve opportunity: " + err.message,
        variant: "destructive",
      });
      await fetchOpportunities();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOpportunity = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);

      // Optimistic update - remove opportunity from list
      setOpportunities((prevOpportunities) =>
        prevOpportunities.filter(
          (opportunity) => opportunity.id !== opportunityId
        )
      );

      const response = await fetch(
        `/api/admin/opportunities/${opportunityId}/reject`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject opportunity");
      }

      await fetchOpportunities();
      toast({
        title: "Success",
        description: "Opportunity rejected and deleted successfully",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error rejecting opportunity:", err);
      toast({
        title: "Error",
        description: "Failed to reject opportunity: " + err.message,
        variant: "destructive",
      });
      await fetchOpportunities();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);

      // Optimistic update - remove opportunity from list
      setOpportunities((prevOpportunities) =>
        prevOpportunities.filter(
          (opportunity) => opportunity.id !== opportunityId
        )
      );

      const response = await fetch(
        `/api/admin/opportunities/${opportunityId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete opportunity");
      }

      await fetchOpportunities();
      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error deleting opportunity:", err);
      toast({
        title: "Error",
        description: "Failed to delete opportunity: " + err.message,
        variant: "destructive",
      });
      await fetchOpportunities();
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setShowDeleteDialog(true);
  };

  const openRejectDialog = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setShowRejectDialog(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setShowOpportunityForm(true);
  };

  const handleAddOpportunity = () => {
    setEditingOpportunity(null);
    setShowOpportunityForm(true);
  };

  const handleViewOpportunityDetails = (opportunity: Opportunity) => {
    setOpportunityDetails(opportunity);
    setShowOpportunityDetails(true);
  };

  const formatDate = (dateString: string) => {
    if (!isClient) return ''; // Return empty string during SSR to prevent hydration mismatch
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <div className="text-sm text-muted-foreground">
            Loading opportunities...
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
          <CardTitle>Content Moderation</CardTitle>
          <div className="text-sm text-muted-foreground">
            Error loading opportunities
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchOpportunities} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Don't render the table until client-side to prevent hydration issues
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <div className="text-sm text-muted-foreground">
            Loading...
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Moderation</CardTitle>
              <div className="text-sm text-muted-foreground">
                Review, moderate, and manage all opportunities with comprehensive engagement metrics.

                Total opportunities: {opportunities.length}
              </div>
            </div>
            <Button
              onClick={handleAddOpportunity}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Opportunity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all duration-150 ease-in-out"
                  disabled={searchLoading}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {opportunityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Description</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Engagement</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No opportunities found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOpportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="max-w-xs">
                        <div>
                          <div className="font-medium truncate">
                            {opportunity.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {opportunity.description}
                          </div>
                          {(opportunity.duration || opportunity.stipend) && (
                            <div className="flex gap-2 mt-1">
                              {opportunity.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {opportunity.duration}
                                </div>
                              )}
                              {opportunity.stipend && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <DollarSign className="h-3 w-3" />
                                  {opportunity.stipend}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {opportunity.creator.firstName && opportunity.creator.lastName
                                ? `${opportunity.creator.firstName} ${opportunity.creator.lastName}`
                                : "No name provided"}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {opportunity.creator.email}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={opportunity.creatorRole === 'MENTOR' ? 'default' : 'secondary'}
                              className={opportunity.creatorRole === 'MENTOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                            >
                              {opportunity.creatorRole}
                            </Badge>
                            {opportunity.sourceName && (
                              <Badge variant="outline" className="text-xs">
                                via {opportunity.sourceName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const typeInfo = getTypeBadge(
                            opportunity.opportunityType.name
                          );
                          return typeInfo ? (
                            <Badge className={typeInfo.colorClass}>
                              {typeInfo.name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {opportunity.opportunityType.name}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="max-w-32">
                        {opportunity.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {opportunity.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const statusInfo = getStatusBadge(opportunity.status);
                          return (
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowApplications(opportunity)}
                            className="h-auto p-2 hover:bg-blue-50"
                            disabled={opportunity._count.applications === 0}
                          >
                            <div className="flex flex-col items-center">
                              <div className="font-semibold text-lg text-blue-600 flex items-center gap-1">
                                {opportunity._count.applications}
                                <Users className="h-4 w-4" />
                              </div>
                              <div className="text-xs text-gray-500">
                                applied
                              </div>
                            </div>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowSaved(opportunity)}
                            className="h-auto p-2 hover:bg-green-50"
                            disabled={opportunity._count.savedOpportunities === 0}
                          >
                            <div className="flex flex-col items-center">
                              <div className="font-semibold text-lg text-green-600 flex items-center gap-1">
                                {opportunity._count.savedOpportunities}
                                <Bookmark className="h-4 w-4" />
                              </div>
                              <div className="text-xs text-gray-500">
                                saved
                              </div>
                            </div>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(opportunity.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {opportunity.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleApproveOpportunity(opportunity.id)
                                }
                                disabled={actionLoading === opportunity.id}
                                className="h-8 px-2 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectDialog(opportunity)}
                                disabled={actionLoading === opportunity.id}
                                className="h-8 px-2 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={actionLoading === opportunity.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewOpportunityDetails(opportunity)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditOpportunity(opportunity)
                                }
                                disabled={actionLoading === opportunity.id}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Opportunity
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(opportunity)}
                                disabled={actionLoading === opportunity.id}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Opportunity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {paginatedOpportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No opportunities found
              </div>
            ) : (
              paginatedOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="p-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {opportunity.description}
                      </p>
                      {(opportunity.duration || opportunity.stipend) && (
                        <div className="flex gap-2">
                          {opportunity.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {opportunity.duration}
                            </div>
                          )}
                          {opportunity.stipend && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <DollarSign className="h-3 w-3" />
                              {opportunity.stipend}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">
                          {opportunity.creator.firstName && opportunity.creator.lastName
                            ? `${opportunity.creator.firstName} ${opportunity.creator.lastName}`
                            : "No name provided"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opportunity.creator.email}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            variant={opportunity.creatorRole === 'MENTOR' ? 'default' : 'secondary'}
                            className={opportunity.creatorRole === 'MENTOR' ? 'bg-blue-100 text-blue-800 text-xs' : 'bg-green-100 text-green-800 text-xs'}
                          >
                            {opportunity.creatorRole}
                          </Badge>
                          {opportunity.sourceName && (
                            <Badge variant="outline" className="text-xs">
                              via {opportunity.sourceName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const typeInfo = getTypeBadge(
                          opportunity.opportunityType.name
                        );
                        return typeInfo ? (
                          <Badge className={typeInfo.colorClass}>
                            {typeInfo.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {opportunity.opportunityType.name}
                          </Badge>
                        );
                      })()}
                      {(() => {
                        const statusInfo = getStatusBadge(opportunity.status);
                        return (
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        );
                      })()}
                    </div>

                    {opportunity.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowApplications(opportunity)}
                          className="h-auto p-2 hover:bg-blue-50"
                          disabled={opportunity._count.applications === 0}
                        >
                          <div className="text-center">
                            <div className="font-semibold text-lg text-blue-600 flex items-center gap-1">
                              {opportunity._count.applications}
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="text-xs text-gray-500">
                              applied
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowSaved(opportunity)}
                          className="h-auto p-2 hover:bg-green-50"
                          disabled={opportunity._count.savedOpportunities === 0}
                        >
                          <div className="text-center">
                            <div className="font-semibold text-lg text-green-600 flex items-center gap-1">
                              {opportunity._count.savedOpportunities}
                              <Bookmark className="h-4 w-4" />
                            </div>
                            <div className="text-xs text-gray-500">
                              saved
                            </div>
                          </div>
                        </Button>
                      </div>
                      <div className="text-gray-600">
                        {formatDate(opportunity.createdAt)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {opportunity.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleApproveOpportunity(opportunity.id)
                            }
                            disabled={actionLoading === opportunity.id}
                            className="flex-1 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDialog(opportunity)}
                            disabled={actionLoading === opportunity.id}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <MoreHorizontal className="h-4 w-4 mr-1" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() =>
                              handleViewOpportunityDetails(opportunity)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOpportunity(opportunity)}
                            disabled={actionLoading === opportunity.id}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Opportunity
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(opportunity)}
                            disabled={actionLoading === opportunity.id}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Opportunity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-6 py-4">
            <TablePagination
              pagination={pagination}
              showPageSizeSelector={true}
              showPageInfo={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Form Dialog */}
      <OpportunityForm
        open={showOpportunityForm}
        onOpenChange={setShowOpportunityForm}
        opportunity={editingOpportunity}
        onSuccess={fetchOpportunities}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Opportunity"
        description={`Are you sure you want to delete "${opportunityToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Opportunity"
        variant="destructive"
        onConfirm={() => {
          if (opportunityToDelete) {
            handleDeleteOpportunity(opportunityToDelete.id);
            setShowDeleteDialog(false);
          }
        }}
        loading={actionLoading === opportunityToDelete?.id}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmationDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title="Reject Opportunity"
        description={`Are you sure you want to reject and delete "${opportunityToDelete?.title}"? This action cannot be undone.`}
        confirmText="Reject Opportunity"
        variant="destructive"
        onConfirm={() => {
          if (opportunityToDelete) {
            handleRejectOpportunity(opportunityToDelete.id);
            setShowRejectDialog(false);
          }
        }}
        loading={actionLoading === opportunityToDelete?.id}
      />

      {/* Mentee Details Dialog */}
      <Dialog open={showApplications || showSaved} onOpenChange={(open) => {
        if (!open) {
          setShowApplications(false);
          setShowSaved(false);
          setSelectedOpportunity(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showApplications && <Users className="h-5 w-5 text-blue-600" />}
              {showSaved && <Bookmark className="h-5 w-5 text-green-600" />}
              {showApplications && `Applications for "${selectedOpportunity?.title}"`}
              {showSaved && `Saved by "${selectedOpportunity?.title}"`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {showApplications && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Applicants ({applications[selectedOpportunity?.id || '']?.length || 0})
                </h4>
                {loadingMentees[`${selectedOpportunity?.id}-applications`] ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading applicants...</p>
                  </div>
                ) : applications[selectedOpportunity?.id || '']?.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No applicants yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications[selectedOpportunity?.id || ''].map((mentee) => {
                      const displayName = mentee.firstName && mentee.lastName
                        ? `${mentee.firstName} ${mentee.lastName}`
                        : mentee.firstName || mentee.lastName || 'No name provided';

                      const formattedDate = (() => {
                        if (!isClient) return 'Loading...';
                        try {
                          return new Date(mentee.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        } catch {
                          return 'Invalid date';
                        }
                      })();

                      return (
                        <div key={mentee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{displayName}</div>
                              <div className="text-xs text-gray-500">{mentee.email}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Applied {formattedDate}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {showSaved && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Saved by ({savedMentees[selectedOpportunity?.id || '']?.length || 0})
                </h4>
                {loadingMentees[`${selectedOpportunity?.id}-saved`] ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading saved mentees...</p>
                  </div>
                ) : savedMentees[selectedOpportunity?.id || '']?.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No saves yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedMentees[selectedOpportunity?.id || ''].map((mentee) => {
                      const displayName = mentee.firstName && mentee.lastName
                        ? `${mentee.firstName} ${mentee.lastName}`
                        : mentee.firstName || mentee.lastName || 'No name provided';

                      const formattedDate = (() => {
                        if (!isClient) return 'Loading...';
                        try {
                          return new Date(mentee.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        } catch {
                          return 'Invalid date';
                        }
                      })();

                      return (
                        <div key={mentee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Bookmark className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{displayName}</div>
                              <div className="text-xs text-gray-500">{mentee.email}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Saved {formattedDate}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Opportunity Details Dialog */}
      <Dialog open={showOpportunityDetails} onOpenChange={setShowOpportunityDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Opportunity Details
            </DialogTitle>
          </DialogHeader>

          {opportunityDetails && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{opportunityDetails.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {(() => {
                      const typeInfo = getTypeBadge(opportunityDetails.opportunityType.name);
                      return typeInfo ? (
                        <Badge className={typeInfo.colorClass}>
                          {typeInfo.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {opportunityDetails.opportunityType.name}
                        </Badge>
                      );
                    })()}
                    {(() => {
                      const statusInfo = getStatusBadge(opportunityDetails.status);
                      return (
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Creator:</span>
                      <span>
                        {opportunityDetails.creator.firstName && opportunityDetails.creator.lastName
                          ? `${opportunityDetails.creator.firstName} ${opportunityDetails.creator.lastName}`
                          : "No name provided"}
                      </span>
                      <Badge
                        variant={opportunityDetails.creatorRole === 'MENTOR' ? 'default' : 'secondary'}
                        className={opportunityDetails.creatorRole === 'MENTOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      >
                        {opportunityDetails.creatorRole}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      {opportunityDetails.creator.email}
                    </div>
                    {opportunityDetails.sourceName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                        <span className="font-medium">Source:</span>
                        <span>{opportunityDetails.sourceName}</span>
                        {opportunityDetails.sourceUrl && (
                          <a
                            href={opportunityDetails.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Original
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Posted:</span>
                      <span>{formatDate(opportunityDetails.createdAt)}</span>
                    </div>
                    {opportunityDetails.updatedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Edit className="h-4 w-4" />
                        <span className="font-medium">Updated:</span>
                        <span>{formatDate(opportunityDetails.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{opportunityDetails.description}</p>
                </div>
              </div>

              {/* Additional Information */}
              {(opportunityDetails.location || opportunityDetails.duration || opportunityDetails.stipend) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {opportunityDetails.location && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Location</div>
                          <div className="text-sm text-gray-600">{opportunityDetails.location}</div>
                        </div>
                      </div>
                    )}
                    {opportunityDetails.duration && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div className="text-sm text-gray-600">{opportunityDetails.duration}</div>
                        </div>
                      </div>
                    )}
                    {opportunityDetails.stipend && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Stipend</div>
                          <div className="text-sm text-gray-600">{opportunityDetails.stipend}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Engagement Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{opportunityDetails._count.applications}</div>
                      <div className="text-sm text-blue-700">Applications</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Bookmark className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{opportunityDetails._count.savedOpportunities}</div>
                      <div className="text-sm text-green-700">Saved</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleShowApplications(opportunityDetails)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  View Applications ({opportunityDetails._count.applications})
                </Button>
                <Button
                  onClick={() => handleShowSaved(opportunityDetails)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  View Saved ({opportunityDetails._count.savedOpportunities})
                </Button>
                <Button
                  onClick={() => {
                    setShowOpportunityDetails(false);
                    handleEditOpportunity(opportunityDetails);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Opportunity
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
