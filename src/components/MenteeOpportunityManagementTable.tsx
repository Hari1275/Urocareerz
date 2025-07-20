"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";

interface MenteeOpportunity {
  id: string;
  title: string;
  description: string;
  location: string | null;
  experienceLevel: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CONVERTED";
  requirements: string | null;
  benefits: string | null;
  duration: string | null;
  compensation: string | null;
  applicationDeadline: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  adminFeedback: string | null;
  createdAt: string;
  opportunityType: {
    id: string;
    name: string;
    color: string | null;
  };
  mentee: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface MenteeOpportunityManagementTableProps {
  opportunities: MenteeOpportunity[];
  opportunityTypes: Array<{ id: string; name: string; color: string | null }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onRefresh: () => void;
}

export default function MenteeOpportunityManagementTable({
  opportunities,
  opportunityTypes,
  pagination,
  onRefresh,
}: MenteeOpportunityManagementTableProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<MenteeOpportunity | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [convertToRegular, setConvertToRegular] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, text: "Pending Review" },
      APPROVED: { variant: "default" as const, text: "Approved" },
      REJECTED: { variant: "destructive" as const, text: "Rejected" },
      CONVERTED: { variant: "default" as const, text: "Converted" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handleAction = async () => {
    if (!selectedOpportunity || !actionType) return;

    setLoading(true);

    try {
      const endpoint = actionType === "approve" ? "approve" : "reject";
      const response = await fetch(
        `/api/admin/mentee-opportunities/${selectedOpportunity.id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminNotes,
            convertToRegular:
              actionType === "approve" ? convertToRegular : false,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${actionType} opportunity`);
      }

      toast({
        title: "Success!",
        description: data.message,
      });

      setIsDialogOpen(false);
      setSelectedOpportunity(null);
      setAdminNotes("");
      setConvertToRegular(false);
      setActionType(null);
      onRefresh();
    } catch (error) {
      console.error(`Error ${actionType}ing opportunity:`, error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${actionType} opportunity`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (
    opportunity: MenteeOpportunity,
    action: "approve" | "reject"
  ) => {
    setSelectedOpportunity(opportunity);
    setActionType(action);
    setAdminNotes("");
    setConvertToRegular(false);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentee Opportunity Submissions</CardTitle>
        <CardDescription>
          Review and manage opportunities submitted by mentees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{opportunity.title}</div>
                      {opportunity.location && (
                        <div className="text-sm text-gray-500">
                          {opportunity.location}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor:
                          opportunity.opportunityType.color || undefined,
                        color: opportunity.opportunityType.color || undefined,
                      }}
                    >
                      {opportunity.opportunityType.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {opportunity.mentee.firstName}{" "}
                        {opportunity.mentee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {opportunity.mentee.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
                  <TableCell>{formatDate(opportunity.createdAt)}</TableCell>
                  <TableCell>
                    {opportunity.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            openActionDialog(opportunity, "approve")
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            openActionDialog(opportunity, "reject")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {opportunity.status !== "PENDING" && (
                      <div className="text-sm text-gray-500">
                        {opportunity.adminFeedback && (
                          <div
                            className="max-w-xs truncate"
                            title={opportunity.adminFeedback}
                          >
                            {opportunity.adminFeedback}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Opportunity
            </DialogTitle>
            <DialogDescription>{selectedOpportunity?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "approve" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="convertToRegular"
                  checked={convertToRegular}
                  onChange={(e) => setConvertToRegular(e.target.checked)}
                />
                <label htmlFor="convertToRegular" className="text-sm">
                  Convert to regular opportunity
                </label>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {actionType === "approve"
                  ? "Admin Notes (Optional)"
                  : "Reason for Rejection *"}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Add any notes for the mentee..."
                    : "Please provide a reason for rejection..."
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                loading || (actionType === "reject" && !adminNotes.trim())
              }
            >
              {loading
                ? "Processing..."
                : actionType === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
