"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/use-pagination";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";

interface MenteeOpportunity {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CONVERTED";
  createdAt: string;
  opportunityType: {
    id: string;
    name: string;
    color: string | null;
  };
  adminFeedback: string | null;
  location?: string;
  experienceLevel?: string;
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

const statusConfig = {
  PENDING: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  CONVERTED: {
    label: "Converted to Opportunity",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
  },
};

export default function SubmissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { opportunityTypes, loading: opportunityTypesLoading, error: opportunityTypesError, getTypeBadge } = useOpportunityTypes();
  const [user, setUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<MenteeOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<MenteeOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const opportunitiesPagination = usePagination({ initialPageSize: 10 });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MenteeOpportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Partial<MenteeOpportunity>>({});
  const [savingOpportunity, setSavingOpportunity] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/user");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Verify user is a mentee
        if (userData.user.role !== "MENTEE") {
          router.push("/dashboard");
          return;
        }

        // Fetch submissions
        const submissionsResponse = await fetch("/api/mentee-opportunities");
        if (submissionsResponse.ok) {
          const data = await submissionsResponse.json();
          const opportunitiesArray = data.opportunities || [];
          setOpportunities(opportunitiesArray);
          setFilteredOpportunities(opportunitiesArray);
          opportunitiesPagination.actions.setTotalItems(opportunitiesArray.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, opportunitiesPagination.actions]);

  // Filter opportunities based on selected status
  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredOpportunities(opportunities);
    } else {
      const filtered = opportunities.filter(opp => opp.status === selectedStatus);
      setFilteredOpportunities(filtered);
    }
    opportunitiesPagination.actions.setCurrentPage(1); // Reset to first page when filtering
  }, [selectedStatus, opportunities]);

  // Update pagination when filtered opportunities change
  useEffect(() => {
    opportunitiesPagination.actions.setTotalItems(filteredOpportunities.length);
  }, [filteredOpportunities, opportunitiesPagination.actions]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending Review</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="border-green-500 text-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500 text-red-700">Rejected</Badge>;
      case "CONVERTED":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Converted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    // Use a consistent date format to prevent hydration mismatches
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchMenteeOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mentee-opportunities");
      if (response.ok) {
        const data = await response.json();
        const opportunitiesArray = data.opportunities || [];
        setOpportunities(opportunitiesArray);
        setFilteredOpportunities(opportunitiesArray);
        opportunitiesPagination.actions.setTotalItems(opportunitiesArray.length);
      } else {
        console.error("Failed to fetch opportunities");
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOpportunity = (opportunity: MenteeOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowViewModal(true);
  };

  const handleEditOpportunity = (opportunity: MenteeOpportunity) => {
    setSelectedOpportunity(opportunity);
    setEditingOpportunity({
      title: opportunity.title,
      description: opportunity.description,
      location: opportunity.location,
      experienceLevel: opportunity.experienceLevel,
      requirements: opportunity.requirements,
      benefits: opportunity.benefits,
      duration: opportunity.duration,
      compensation: opportunity.compensation,
      applicationDeadline: opportunity.applicationDeadline,
      opportunityType: opportunity.opportunityType,
    });
    setShowEditModal(true);
  };

  const handleSaveOpportunity = async () => {
    if (!selectedOpportunity) return;
    
    setSavingOpportunity(true);
    try {
      const requestBody = {
        ...editingOpportunity,
        opportunityTypeId: editingOpportunity.opportunityType?.id || selectedOpportunity.opportunityType.id,
      };
      
      console.log("Sending request body:", requestBody);
      
      const response = await fetch(`/api/mentee-opportunities/${selectedOpportunity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        
        // Try to get the error message from the response
        try {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          
          // Handle specific error cases
          if (errorData.status && errorData.status !== "PENDING") {
            throw new Error(`Cannot edit ${errorData.status.toLowerCase()} opportunities. Only pending opportunities can be edited.`);
          }
          
          throw new Error(errorData.error || 'Failed to update opportunity');
        } catch (parseError) {
          console.error("Response status:", response.status);
          throw new Error(`Failed to update opportunity (${response.status})`);
        }
      }

      // Refresh the opportunities list
      await fetchMenteeOpportunities();
      setShowEditModal(false);
      setSelectedOpportunity(null);
      setEditingOpportunity({});
      toast({
        title: "Success",
        description: "Opportunity updated successfully!",
      });
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to update opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingOpportunity(false);
    }
  };

  const handleStatusCardClick = (status: string) => {
    setSelectedStatus(status);
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
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your submissions...</p>
            </div>
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
              {user === null ? (
                <span className="text-sm text-gray-400 font-medium animate-pulse">Loading...</span>
              ) : (
                <span className="text-sm text-gray-600 font-medium">
                  Welcome, <span className="text-gray-900 font-semibold">{user.firstName || user.email || "User"}</span>
                </span>
              )}
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
            <span className="text-gray-900 font-medium">My Submissions</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              My <span className="bg-gradient-to-tr from-green-600 to-emerald-500 bg-clip-text text-transparent">Submissions</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Track opportunities you've submitted for admin review and community contribution.
            </p>
            <Button
              onClick={() => router.push("/dashboard/mentee/submit-opportunity")}
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
            >
              Submit New Opportunity
            </Button>
          </div>
        </div>

        {/* Status Summary Cards - Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(() => {
            const counts = {
              total: opportunities.length,
              pending: opportunities.filter(opp => opp.status === 'PENDING').length,
              approved: opportunities.filter(opp => opp.status === 'APPROVED').length,
              rejected: opportunities.filter(opp => opp.status === 'REJECTED').length,
            };
            return [
              { 
                title: "Total Submissions", 
                count: counts.total, 
                color: "text-blue-600", 
                icon: "📄",
                status: "all",
                bgColor: "hover:bg-blue-50"
              },
              { 
                title: "Pending Review", 
                count: counts.pending, 
                color: "text-yellow-600", 
                icon: "⏳",
                status: "PENDING",
                bgColor: "hover:bg-yellow-50"
              },
              { 
                title: "Approved", 
                count: counts.approved, 
                color: "text-green-600", 
                icon: "✅",
                status: "APPROVED",
                bgColor: "hover:bg-green-50"
              },
              { 
                title: "Rejected", 
                count: counts.rejected, 
                color: "text-red-600", 
                icon: "❌",
                status: "REJECTED",
                bgColor: "hover:bg-red-50"
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center cursor-pointer transition-all duration-200 ${item.bgColor} ${selectedStatus === item.status ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                onClick={() => handleStatusCardClick(item.status)}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.count}</div>
                <div className="text-sm text-gray-600">{item.title}</div>
              </div>
            ));
          })()}
        </div>

        {/* Filter Display */}
        {selectedStatus !== "all" && (
          <div className="mb-6 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Filtered by: <span className="font-medium">{getStatusConfig(selectedStatus).label}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedStatus("all")}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear Filter
            </Button>
          </div>
        )}

        {/* Submissions Table Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Your Submitted Opportunities
              {selectedStatus !== "all" && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredOpportunities.length} of {opportunities.length})
                </span>
              )}
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show:</span>
                <Select
                  value={opportunitiesPagination.state.pageSize.toString()}
                  onValueChange={(value) => opportunitiesPagination.actions.setPageSize(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>
              <Button onClick={fetchMenteeOpportunities} variant="outline" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-gray-500">Loading...</span>
              </div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">
                {selectedStatus === "all" ? "No opportunities submitted yet" : `No ${selectedStatus.toLowerCase()} opportunities`}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedStatus === "all" 
                  ? "Start contributing to the community by submitting opportunities you've found."
                  : `You don't have any ${selectedStatus.toLowerCase()} opportunities yet.`
                }
              </p>
              {selectedStatus === "all" && (
                <Button className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" onClick={() => router.push("/dashboard/mentee/submit-opportunity")}>Submit Your First Opportunity</Button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {opportunitiesPagination.state.startIndex + 1} to {opportunitiesPagination.state.endIndex} of {opportunitiesPagination.state.totalItems} opportunities
              </div>
              
              {/* Table Layout */}
              <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunitiesPagination.paginateData(filteredOpportunities).map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{opportunity.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{opportunity.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const typeBadge = getTypeBadge(opportunity.opportunityType.name);
                            return typeBadge ? (
                              <Badge variant="outline" className={typeBadge.colorClass}>
                                {typeBadge.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" style={{ borderColor: opportunity.opportunityType.color || undefined, color: opportunity.opportunityType.color || undefined }}>
                                {opportunity.opportunityType.name}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(opportunity.status)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDate(opportunity.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {opportunity.adminFeedback ? (
                            <div className="text-sm text-blue-600 font-medium">Available</div>
                          ) : (
                            <div className="text-sm text-gray-400">None</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOpportunity(opportunity)}
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                                                         <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEditOpportunity(opportunity)}
                               className="text-xs"
                               disabled={opportunity.status !== "PENDING"}
                               title={opportunity.status !== "PENDING" ? `Cannot edit ${opportunity.status.toLowerCase()} opportunities` : "Edit opportunity"}
                             >
                               <Edit className="w-3 h-3 mr-1" />
                               Edit
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              {opportunitiesPagination.state.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={opportunitiesPagination.actions.previousPage}
                          className={!opportunitiesPagination.state.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {opportunitiesPagination.getPageNumbers().map((pageNumber, index) => (
                        <PaginationItem key={index}>
                          {pageNumber === -1 ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => opportunitiesPagination.actions.setCurrentPage(pageNumber)}
                              isActive={pageNumber === opportunitiesPagination.state.currentPage}
                              className="cursor-pointer min-w-[2rem] sm:min-w-[2.5rem]"
                            >
                              {pageNumber}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={opportunitiesPagination.actions.nextPage}
                          className={!opportunitiesPagination.state.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* View Opportunity Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {selectedOpportunity?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-8">
              {/* Header Section with Key Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Type */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
                    <div>
                      {(() => {
                        const typeBadge = getTypeBadge(selectedOpportunity.opportunityType.name);
                        return typeBadge ? (
                          <Badge className={`${typeBadge.colorClass} px-3 py-1 text-sm font-medium`}>
                            {typeBadge.name}
                          </Badge>
                        ) : (
                          <Badge className="px-3 py-1 text-sm font-medium" style={{ 
                            backgroundColor: selectedOpportunity.opportunityType.color || '#6b7280',
                            color: 'white'
                          }}>
                            {selectedOpportunity.opportunityType.name}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                    <div>
                      {getStatusBadge(selectedOpportunity.status)}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedOpportunity.location || "Remote"}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectedOpportunity.duration || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Experience Level */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Experience Level</span>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedOpportunity.experienceLevel || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Compensation */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                                         <div>
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compensation</span>
                       <p className="text-sm font-medium text-gray-900">
                         {selectedOpportunity.compensation ? (
                           selectedOpportunity.compensation.toLowerCase().includes('free') || 
                           selectedOpportunity.compensation.toLowerCase().includes('unpaid') ||
                           selectedOpportunity.compensation.toLowerCase().includes('volunteer') ? 
                           selectedOpportunity.compensation : 
                           `₹${selectedOpportunity.compensation}`
                         ) : "Not specified"}
                       </p>
                     </div>
                  </div>
                </div>

                {/* Posted Date */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</span>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedOpportunity.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Deadline */}
                {selectedOpportunity.applicationDeadline && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</span>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedOpportunity.applicationDeadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Sections */}
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedOpportunity.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Requirements
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedOpportunity.requirements}</p>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {selectedOpportunity.benefits && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Benefits
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedOpportunity.benefits}</p>
                    </div>
                  </div>
                )}

                {/* Admin Feedback */}
                {selectedOpportunity.adminFeedback && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-4 border-b border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Admin Feedback
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedOpportunity.adminFeedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                            {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {selectedOpportunity.status === "PENDING" 
                      ? "This opportunity is pending admin review" 
                      : `This opportunity has been ${selectedOpportunity.status.toLowerCase()}`
                    }
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                    className="px-6"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditOpportunity(selectedOpportunity);
                    }}
                    className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600 px-6"
                    disabled={selectedOpportunity.status !== "PENDING"}
                    title={selectedOpportunity.status !== "PENDING" ? `Cannot edit ${selectedOpportunity.status.toLowerCase()} opportunities` : "Edit opportunity"}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Opportunity
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Opportunity Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Opportunity
            </DialogTitle>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</Label>
                  <Input
                    id="title"
                    value={editingOpportunity.title || ''}
                    onChange={(e) => setEditingOpportunity(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter opportunity title"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">Opportunity Type *</Label>
                  {opportunityTypesLoading ? (
                    <div className="mt-1 p-3 border border-gray-200 rounded-md bg-gray-50">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ) : opportunityTypesError ? (
                    <div className="mt-1 p-3 border border-red-200 rounded-md bg-red-50 text-red-700">
                      Error loading opportunity types: {opportunityTypesError}
                    </div>
                  ) : opportunityTypes.length === 0 ? (
                    <div className="mt-1 p-3 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-700">
                      No opportunity types available
                    </div>
                  ) : (
                                         <Select value={editingOpportunity.opportunityType?.id || selectedOpportunity.opportunityType.id} onValueChange={(value) => {
                       const selectedType = opportunityTypes.find(type => type.id === value);
                       if (selectedType) {
                         setEditingOpportunity(prev => ({ 
                           ...prev, 
                           opportunityType: {
                             id: selectedType.id,
                             name: selectedType.name,
                             color: selectedType.color || null
                           }
                         }));
                       }
                     }}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type">
                          {editingOpportunity.opportunityType && (() => {
                            const selectedType = opportunityTypes.find(type => type.id === editingOpportunity.opportunityType?.id);
                            if (selectedType) {
                              const typeInfo = getTypeBadge(selectedType.name);
                              return typeInfo ? (
                                <Badge className={typeInfo.colorClass}>
                                  {typeInfo.name}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">{selectedType.name}</Badge>
                              );
                            }
                            return null;
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {opportunityTypes.map((type) => {
                          const typeInfo = getTypeBadge(type.name);
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              {typeInfo ? (
                                <Badge className={typeInfo.colorClass}>
                                  {typeInfo.name}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">{type.name}</Badge>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={editingOpportunity.description || ''}
                  onChange={(e) => setEditingOpportunity(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 min-h-[120px]"
                  placeholder="Provide a detailed description of the opportunity..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                  <Input
                    id="location"
                    value={editingOpportunity.location || ''}
                    onChange={(e) => setEditingOpportunity(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>
                <div>
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience Level</Label>
                  <Select value={editingOpportunity.experienceLevel || ''} onValueChange={(value) => setEditingOpportunity(prev => ({ ...prev, experienceLevel: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="expert">Expert Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration</Label>
                  <Select value={editingOpportunity.duration || ''} onValueChange={(value) => setEditingOpportunity(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger className="mt-1 text-gray-900">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3 months" className="text-gray-900">1-3 months</SelectItem>
                      <SelectItem value="3-6 months" className="text-gray-900">3-6 months</SelectItem>
                      <SelectItem value="6 months" className="text-gray-900">6 months</SelectItem>
                      <SelectItem value="1 year" className="text-gray-900">1 year</SelectItem>
                      <SelectItem value="2 years" className="text-gray-900">2 years</SelectItem>
                      <SelectItem value="Permanent" className="text-gray-900">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                                 <div>
                   <Label htmlFor="compensation" className="text-sm font-medium text-gray-700">Compensation</Label>
                   <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <span className="text-gray-500 sm:text-sm">₹</span>
                     </div>
                     <Input
                       id="compensation"
                       value={editingOpportunity.compensation || ''}
                       onChange={(e) => setEditingOpportunity(prev => ({ ...prev, compensation: e.target.value }))}
                       className="pl-8"
                       placeholder="50,000/year, Stipend provided, Free"
                     />
                   </div>
                   <p className="text-xs text-gray-500 mt-1">
                     Enter amount without ₹ symbol. Use "Free", "Unpaid", or "Volunteer" for non-paid opportunities.
                   </p>
                 </div>
              </div>

              <div>
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={editingOpportunity.requirements || ''}
                  onChange={(e) => setEditingOpportunity(prev => ({ ...prev, requirements: e.target.value }))}
                  className="mt-1 min-h-[100px]"
                  placeholder="List the requirements and qualifications needed..."
                />
              </div>

              <div>
                <Label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={editingOpportunity.benefits || ''}
                  onChange={(e) => setEditingOpportunity(prev => ({ ...prev, benefits: e.target.value }))}
                  className="mt-1 min-h-[100px]"
                  placeholder="Describe the benefits and perks of this opportunity..."
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={editingOpportunity.applicationDeadline || ''}
                  onChange={(e) => setEditingOpportunity(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="px-8"
                  disabled={savingOpportunity}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-tr from-green-600 to-blue-500 text-white font-semibold shadow-md hover:from-green-700 hover:to-blue-600 px-8"
                  onClick={handleSaveOpportunity}
                  disabled={savingOpportunity}
                >
                  {savingOpportunity ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
