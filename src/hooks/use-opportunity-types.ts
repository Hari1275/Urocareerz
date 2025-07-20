import { useState, useEffect } from "react";

export interface OpportunityType {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useOpportunityTypes() {
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunityTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/opportunity-types");

      if (!response.ok) {
        throw new Error("Failed to fetch opportunity types");
      }

      const data = await response.json();
      setOpportunityTypes(data.opportunityTypes);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching opportunity types:", err);
    } finally {
      setLoading(false);
    }
  };

  const createOpportunityType = async (typeData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    try {
      const response = await fetch("/api/admin/opportunity-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(typeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create opportunity type");
      }

      const data = await response.json();
      setOpportunityTypes((prev) => [...prev, data.opportunityType]);
      return data.opportunityType;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    }
  };

  const getTypeBadge = (typeName: string) => {
    const type = opportunityTypes.find((t) => t.name === typeName);
    if (!type) return null;

    const colorClasses = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      yellow: "bg-yellow-100 text-yellow-800",
      teal: "bg-teal-100 text-teal-800",
      orange: "bg-orange-100 text-orange-800",
      gray: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      colorClasses[type.color as keyof typeof colorClasses] ||
      "bg-gray-100 text-gray-800";

    return {
      name: type.name,
      description: type.description,
      colorClass,
      color: type.color,
    };
  };

  useEffect(() => {
    fetchOpportunityTypes();
  }, []);

  return {
    opportunityTypes,
    loading,
    error,
    fetchOpportunityTypes,
    createOpportunityType,
    getTypeBadge,
  };
}
