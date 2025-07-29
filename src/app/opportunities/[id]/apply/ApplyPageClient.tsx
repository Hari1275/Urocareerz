"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigation } from "@/hooks/use-navigation";
import ApplicationForm from "@/components/ApplicationForm";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunityType: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  location?: string;
  experienceLevel?: string;
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function ApplyPageClient({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const { goBack } = useNavigation();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Opportunity not found");
          } else {
            throw new Error("Failed to fetch opportunity");
          }
          setLoading(false);
          return;
        }

        const opportunityData = await response.json();
        
        if (!opportunityData.opportunity) {
          console.error("API returned success but opportunity data is missing");
          setError("Invalid opportunity data received from server");
          setLoading(false);
          return;
        }

        // Check if opportunity is approved
        if (opportunityData.opportunity.status !== "APPROVED") {
          setError("This opportunity is not available for applications");
          setLoading(false);
          return;
        }

        // Transform the opportunity data to match the expected interface
        try {
          const transformedOpportunity = {
            ...opportunityData.opportunity,
            opportunityType: {
              id: opportunityData.opportunity.opportunityType?.id || "unknown",
              name: opportunityData.opportunity.opportunityType?.name || "Unknown",
              description: opportunityData.opportunity.opportunityType?.description,
              color: opportunityData.opportunity.opportunityType?.color,
            },
            creator: {
              firstName: opportunityData.opportunity.creator?.firstName || "",
              lastName: opportunityData.opportunity.creator?.lastName || "",
              email: opportunityData.opportunity.creator?.email || "",
              role: opportunityData.opportunity.creator?.role || "",
            },
          };
          console.log("Transformed opportunity:", transformedOpportunity);
          setOpportunity(transformedOpportunity);
        } catch (transformError) {
          console.error("Error transforming opportunity data:", transformError);
          setError("Error processing opportunity data");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [opportunityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading opportunity...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={goBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Opportunity not found</p>
            <Button onClick={goBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ApplicationForm opportunity={opportunity} />;
} 