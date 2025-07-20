"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MenteeOpportunity {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CONVERTED";
  createdAt: string;
  opportunityType: {
    name: string;
    color: string | null;
  };
  adminFeedback: string | null;
}

export default function MenteeDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<MenteeOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenteeOpportunities();
  }, []);

  const fetchMenteeOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mentee-opportunities");

      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }

      const data = await response.json();
      setOpportunities(data.opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load your submitted opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mentee Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your mentee dashboard. Submit opportunities and participate
          in discussions.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/mentee/submit-opportunity")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Submit Opportunity
            </CardTitle>
            <CardDescription>
              Share opportunities you&apos;ve found with the community
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push("/discussions")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Discussions
            </CardTitle>
            <CardDescription>
              Join discussions and share knowledge with the community
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push("/opportunities")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Browse Opportunities
            </CardTitle>
            <CardDescription>
              Explore and apply for opportunities posted by mentors
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Submitted Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Opportunities</CardTitle>
          <CardDescription>
            Track the status of opportunities you&apos;ve submitted for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">
                No opportunities submitted yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start contributing to the community by submitting opportunities
                you&apos;ve found.
              </p>
              <Button
                onClick={() =>
                  router.push("/dashboard/mentee/submit-opportunity")
                }
              >
                Submit Your First Opportunity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {opportunity.title}
                        </h3>
                        {getStatusBadge(opportunity.status)}
                        <Badge
                          variant="outline"
                          style={{
                            borderColor:
                              opportunity.opportunityType.color || undefined,
                            color:
                              opportunity.opportunityType.color || undefined,
                          }}
                        >
                          {opportunity.opportunityType.name}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Submitted on {formatDate(opportunity.createdAt)}
                        </span>
                        {opportunity.adminFeedback && (
                          <span className="text-blue-600">
                            Admin feedback available
                          </span>
                        )}
                      </div>
                      {opportunity.adminFeedback && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Feedback:</strong>{" "}
                            {opportunity.adminFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Discussions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Community Discussions</CardTitle>
          <CardDescription>
            Stay updated with the latest discussions in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
            <p className="text-gray-600 mb-4">
              Participate in discussions, ask questions, and share your
              knowledge with the community.
            </p>
            <Button onClick={() => router.push("/discussions")}>
              View All Discussions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
