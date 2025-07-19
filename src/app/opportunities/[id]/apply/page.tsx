"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ApplicationForm from "@/components/ApplicationForm";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunityType: string;
  location?: string;
  experienceLevel?: string;
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
  mentor: {
    firstName: string;
    lastName: string;
    specialty?: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function ApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError("Only mentees can apply for opportunities");
          setLoading(false);
          return;
        }

        // Fetch opportunity details
        const opportunityResponse = await fetch(
          `/api/opportunities/${params.id}`
        );
        if (!opportunityResponse.ok) {
          if (opportunityResponse.status === 404) {
            setError("Opportunity not found");
          } else {
            throw new Error("Failed to fetch opportunity details");
          }
          setLoading(false);
          return;
        }

        const opportunityData = await opportunityResponse.json();

        // Check if opportunity is approved
        if (opportunityData.opportunity.status !== "APPROVED") {
          setError("This opportunity is not available for applications");
          setLoading(false);
          return;
        }

        setOpportunity(opportunityData.opportunity);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-gray-600">Loading opportunity details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/opportunities")}>
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600">Opportunity not found</p>
              <Button
                onClick={() => router.push("/opportunities")}
                className="mt-4"
              >
                Back to Opportunities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ApplicationForm opportunity={opportunity} />;
}
