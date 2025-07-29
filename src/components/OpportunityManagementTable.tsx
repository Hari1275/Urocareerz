"use client";

import { useState, useEffect, useCallback } from "react";
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
import OpportunityForm from "./OpportunityForm";
import ConfirmationDialog from "./ConfirmationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useOpportunityFilters } from "@/hooks/use-opportunity-filters";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "./TablePagination";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Clock,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  opportunityType: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  duration: string;
  stipend: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OpportunityManagementTable() {
  const { toast } = useToast();
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
  const { statuses, getStatusBadge } = useOpportunityFilters();
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
  const [editingOpportunity, setEditingOpportunity] =
    useState<Opportunity | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] =
    useState<Opportunity | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Remove the display delay - it was causing input lag
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDisplaySearchQuery(searchQuery);
  //   }, 50); // 50ms delay for smooth typing feel

  //   return () => clearTimeout(timer);
  // }, [searchQuery]);

  useEffect(() => {
    fetchOpportunities();
  }, [statusFilter, typeFilter, debouncedSearchQuery]);

  // Filtering logic (move to top, before rendering)
  const filteredOpportunities = opportunities.filter((opportunity) => {
    if (statusFilter !== "all" && opportunity.status !== statusFilter) return false;
    if (typeFilter !== "all" && opportunity.opportunityType.name !== typeFilter) return false;
    if (debouncedSearchQuery && !opportunity.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false;
    return true;
  });
  // Update pagination when filtered data changes
  useEffect(() => {
    pagination.actions.setTotalItems(filteredOpportunities.length);
  }, [filteredOpportunities, pagination.actions]);
  const paginatedOpportunities = pagination.paginateData(filteredOpportunities);

  const fetchOpportunities = async () => {
    try {
      // Show search loading only if it's a search request
      if (debouncedSearchQuery) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);

      const response = await fetch(
        `/api/admin/opportunities?${params.toString()}`
      );

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

      // Refresh data to ensure consistency
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
      // Revert optimistic update on error
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

      // Refresh data to ensure consistency
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
      // Revert optimistic update on error
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

      // Refresh data to ensure consistency
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
      // Revert optimistic update on error
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchOpportunities} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Paginate the opportunities data
  // const paginatedOpportunities = pagination.paginateData(opportunities);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Opportunity Management
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Manage and moderate opportunities posted by mentors
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
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
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
          <div className="hidden lg:block rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOpportunities.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                          </div>
                        </TableCell>
                        <TableCell className="max-w-48">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {opportunity.creator.firstName}{" "}
                                {opportunity.creator.lastName}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {opportunity.creator.email}
                              </div>
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
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {opportunity.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const statusInfo = getStatusBadge(
                              opportunity.status
                            );
                            return (
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(opportunity.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
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
                                    window.open(
                                      `/opportunities/${opportunity.id}`,
                                      "_blank"
                                    )
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
                      <h3 className="font-medium text-lg">
                        {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {opportunity.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">
                          {opportunity.creator.firstName}{" "}
                          {opportunity.creator.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opportunity.creator.email}
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

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {opportunity.location}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(opportunity.createdAt)}
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
                              window.open(
                                `/opportunities/${opportunity.id}`,
                                "_blank"
                              )
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
    </>
  );
}
