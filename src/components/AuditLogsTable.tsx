"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "./TablePagination";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AuditLogsTable() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    action: "all",
    entityType: "all",
    userId: "",
    startDate: "",
    endDate: "",
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const fetchAuditLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.action && filters.action !== "all" && { action: filters.action }),
        ...(filters.entityType && filters.entityType !== "all" && { entityType: filters.entityType }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      setAuditLogs(data.auditLogs);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(currentPage);
  }, [currentPage, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      action: "all",
      entityType: "all",
      userId: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const getActionColor = (action: string) => {
    if (action.includes("APPROVED")) return "bg-green-100 text-green-800";
    if (action.includes("REJECTED") || action.includes("DELETED")) return "bg-red-100 text-red-800";
    if (action.includes("CHANGED")) return "bg-blue-100 text-blue-800";
    if (action.includes("REGISTERED") || action.includes("LOGIN")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    // Use consistent date formatting to avoid hydration mismatches
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case "User":
        return "👤";
      case "Opportunity":
        return "📋";
      case "MenteeOpportunity":
        return "🎓";
      case "Discussion":
        return "💬";
      default:
        return "📄";
    }
  };

  if (loading && auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading audit logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchAuditLogs(currentPage)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit Logs</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAuditLogs(currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select
              value={filters.action}
              onValueChange={(value) => handleFilterChange("action", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Action" defaultValue="all" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh] overflow-auto mt-2">
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="USER_APPROVED">User Approved</SelectItem>
                <SelectItem value="USER_REJECTED">User Rejected</SelectItem>
                <SelectItem value="USER_ROLE_CHANGED">Role Changed</SelectItem>
                <SelectItem value="OPPORTUNITY_APPROVED">Opportunity Approved</SelectItem>
                <SelectItem value="OPPORTUNITY_REJECTED">Opportunity Rejected</SelectItem>
                <SelectItem value="OPPORTUNITY_DELETED">Opportunity Deleted</SelectItem>
                <SelectItem value="MENTEE_OPPORTUNITY_APPROVED">Mentee Opportunity Approved</SelectItem>
                <SelectItem value="MENTEE_OPPORTUNITY_REJECTED">Mentee Opportunity Rejected</SelectItem>
                <SelectItem value="DISCUSSION_APPROVED">Discussion Approved</SelectItem>
                <SelectItem value="DISCUSSION_REJECTED">Discussion Rejected</SelectItem>
                <SelectItem value="USER_REGISTERED">User Registered</SelectItem>
                <SelectItem value="USER_LOGIN">User Login</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.entityType}
              onValueChange={(value) => handleFilterChange("entityType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Entity Type" defaultValue="all" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh] overflow-auto mt-2">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Opportunity">Opportunity</SelectItem>
                <SelectItem value="MenteeOpportunity">Mentee Opportunity</SelectItem>
                <SelectItem value="Discussion">Discussion</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getEntityTypeIcon(log.entityType)}</span>
                        <span className="font-medium">{log.entityType}</span>
                        <span className="text-xs text-gray-500">#{log.entityId.slice(-8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {log.user.firstName && log.user.lastName
                            ? `${log.user.firstName} ${log.user.lastName}`
                            : log.user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.user.role} • {log.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details ? (
                        <div className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.ipAddress ? (
                        <span className="font-mono text-sm">{log.ipAddress}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(log.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
              {pagination.totalCount} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 