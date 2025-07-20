import { useState } from "react";

export interface OpportunityStatus {
  value: string;
  label: string;
  color: string;
  description?: string;
}

export function useOpportunityFilters() {
  const [statuses, setStatuses] = useState<OpportunityStatus[]>([
    {
      value: "PENDING",
      label: "Pending",
      color: "bg-orange-100 text-orange-800",
      description: "Awaiting admin approval",
    },
    {
      value: "APPROVED",
      label: "Approved",
      color: "bg-green-100 text-green-800",
      description: "Approved and active",
    },
    {
      value: "REJECTED",
      label: "Rejected",
      color: "bg-red-100 text-red-800",
      description: "Rejected by admin",
    },
    {
      value: "CLOSED",
      label: "Closed",
      color: "bg-gray-100 text-gray-800",
      description: "No longer accepting applications",
    },
  ]);

  const getStatusBadge = (status: string) => {
    const foundStatus = statuses.find((s) => s.value === status);
    return (
      foundStatus || {
        value: status,
        label: status,
        color: "bg-gray-100 text-gray-800",
        description: "Unknown status",
      }
    );
  };

  const addStatus = (status: OpportunityStatus) => {
    setStatuses((prev) => [...prev, status]);
  };

  const updateStatus = (value: string, updates: Partial<OpportunityStatus>) => {
    setStatuses((prev) =>
      prev.map((s) => (s.value === value ? { ...s, ...updates } : s))
    );
  };

  return {
    statuses,
    getStatusBadge,
    addStatus,
    updateStatus,
  };
}
