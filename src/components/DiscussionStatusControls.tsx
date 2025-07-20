"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Lock,
  Archive,
  Eye,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";

interface DiscussionStatusControlsProps {
  discussionId: string;
  currentStatus: "ACTIVE" | "CLOSED" | "ARCHIVED";
  isAuthor: boolean;
  isAdmin: boolean;
  onStatusChange: (newStatus: string) => Promise<void>;
}

export default function DiscussionStatusControls({
  discussionId,
  currentStatus,
  isAuthor,
  isAdmin,
  onStatusChange,
}: DiscussionStatusControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: string;
    status: string;
    description: string;
  } | null>(null);

  const handleStatusChange = async (
    newStatus: string,
    action: string,
    description: string
  ) => {
    setPendingAction({ action, status: newStatus, description });
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingAction) return;

    try {
      setIsLoading(true);
      await onStatusChange(pendingAction.status);
    } catch (error) {
      console.error("Error updating discussion status:", error);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        color: "bg-green-100 text-green-800",
        icon: "🟢",
        text: "Active",
      },
      CLOSED: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "🔒",
        text: "Closed",
      },
      ARCHIVED: {
        color: "bg-gray-100 text-gray-800",
        icon: "📁",
        text: "Archived",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return (
      <Badge className={config.color}>
        {config.icon} {config.text}
      </Badge>
    );
  };

  // Only show controls if user is author or admin
  if (!isAuthor && !isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        {getStatusBadge(currentStatus)}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(currentStatus)}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Manage Status</span>
              <span className="sm:hidden">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {currentStatus === "ACTIVE" && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusChange(
                      "CLOSED",
                      "close",
                      "close this discussion"
                    )
                  }
                  disabled={isLoading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Close Discussion
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusChange(
                      "ARCHIVED",
                      "archive",
                      "archive this discussion"
                    )
                  }
                  disabled={isLoading}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Discussion
                </DropdownMenuItem>
              </>
            )}

            {currentStatus === "CLOSED" && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusChange(
                      "ACTIVE",
                      "reopen",
                      "reopen this discussion"
                    )
                  }
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Reopen Discussion
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusChange(
                      "ARCHIVED",
                      "archive",
                      "archive this discussion"
                    )
                  }
                  disabled={isLoading}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Discussion
                </DropdownMenuItem>
              </>
            )}

            {currentStatus === "ARCHIVED" && (
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(
                    "ACTIVE",
                    "restore",
                    "restore this discussion"
                  )
                }
                disabled={isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Restore Discussion
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isLoading}
              className={
                pendingAction?.status === "CLOSED"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : pendingAction?.status === "ARCHIVED"
                  ? "bg-gray-600 hover:bg-gray-700"
                  : ""
              }
            >
              {isLoading ? "Updating..." : `Yes, ${pendingAction?.action}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
