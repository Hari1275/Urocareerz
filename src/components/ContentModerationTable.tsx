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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
  Eye,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: string;
  opportunityType: string;
  location?: string;
  mentor: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  createdAt: string;
  _count: {
    applications: number;
    savedOpportunities: number;
  };
}

export default function ContentModerationTable() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      const data = await response.json();
      setOpportunities(data.opportunities);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOpportunity = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);
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

      // Refresh the opportunities list
      await fetchOpportunities();
    } catch (err: any) {
      console.error("Error approving opportunity:", err);
      alert("Failed to approve opportunity: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOpportunity = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);
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

      // Refresh the opportunities list
      await fetchOpportunities();
    } catch (err: any) {
      console.error("Error rejecting opportunity:", err);
      alert("Failed to reject opportunity: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this opportunity? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(opportunityId);
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

      // Refresh the opportunities list
      await fetchOpportunities();
    } catch (err: any) {
      console.error("Error deleting opportunity:", err);
      alert("Failed to delete opportunity: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "CLOSED":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "FELLOWSHIP":
        return <Badge className="bg-blue-100 text-blue-800">Fellowship</Badge>;
      case "JOB":
        return <Badge className="bg-green-100 text-green-800">Job</Badge>;
      case "OBSERVERSHIP":
        return (
          <Badge className="bg-purple-100 text-purple-800">Observership</Badge>
        );
      case "RESEARCH":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Research</Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    if (statusFilter !== "all" && opportunity.status !== statusFilter)
      return false;
    if (typeFilter !== "all" && opportunity.opportunityType !== typeFilter)
      return false;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>Loading opportunities...</CardDescription>
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
          <CardDescription>Error loading opportunities</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
        <CardDescription>
          Review and moderate submitted opportunities. Total opportunities:{" "}
          {opportunities.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Type:</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                <SelectItem value="JOB">Job</SelectItem>
                <SelectItem value="OBSERVERSHIP">Observership</SelectItem>
                <SelectItem value="RESEARCH">Research</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No opportunities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {opportunity.description}
                        </div>
                        {opportunity.location && (
                          <div className="text-xs text-gray-400">
                            📍 {opportunity.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(opportunity.opportunityType)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {opportunity.mentor.firstName &&
                          opportunity.mentor.lastName
                            ? `${opportunity.mentor.firstName} ${opportunity.mentor.lastName}`
                            : "No name provided"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {opportunity.mentor.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">
                          {opportunity._count.applications}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opportunity._count.savedOpportunities} saved
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(opportunity.createdAt).toLocaleDateString()}
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
                              className="h-8 px-2"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRejectOpportunity(opportunity.id)
                              }
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
                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                                handleDeleteOpportunity(opportunity.id)
                              }
                              disabled={actionLoading === opportunity.id}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
      </CardContent>
    </Card>
  );
}
