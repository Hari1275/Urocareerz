"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, Users, FileText, MessageSquare, Briefcase, Calendar, BarChart3 } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    pendingUsers: number;
    totalOpportunities: number;
    pendingOpportunities: number;
    totalMenteeOpportunities: number;
    pendingMenteeOpportunities: number;
    totalDiscussions: number;
    totalApplications: number;
  };
  trends: {
    userRegistrationsByDate: Array<{ date: string; count: number }>;
    opportunitySubmissionsByDate: Array<{ date: string; count: number }>;
  };
  distributions: {
    userRoles: Array<{ role: string; count: number }>;
    opportunityTypes: Array<{ typeId: string; typeName: string; count: number }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
    };
  }>;
}

export default function EnhancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await fetch(`/api/admin/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange.startDate, dateRange.endDate]);

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MENTOR":
        return "bg-blue-100 text-blue-800";
      case "MENTEE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with date filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              placeholder="Start Date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-40"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.pendingUsers} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.pendingOpportunities} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentee Submissions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalMenteeOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.pendingMenteeOpportunities} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Across all opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.distributions.userRoles.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(role.role)}>
                      {role.role}
                    </Badge>
                  </div>
                  <span className="font-semibold">{role.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Opportunity Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.distributions.opportunityTypes.map((type) => (
                <div key={type.typeId} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type.typeName}</span>
                  <span className="font-semibold">{type.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Registration Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.trends.userRegistrationsByDate.length > 0 ? (
              <div className="space-y-2">
                {analyticsData.trends.userRegistrationsByDate.slice(-7).map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm">{new Date(item.date).toISOString().split('T')[0]}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No registration data available</p>
            )}
          </CardContent>
        </Card>

        {/* Opportunity Submission Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Opportunity Submission Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.trends.opportunitySubmissionsByDate.length > 0 ? (
              <div className="space-y-2">
                {analyticsData.trends.opportunitySubmissionsByDate.slice(-7).map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm">{new Date(item.date).toISOString().split('T')[0]}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No submission data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest platform actions and events
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.length > 0 ? (
              analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getActionColor(activity.action)}>
                      {activity.action.replace(/_/g, " ")}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.user.firstName && activity.user.lastName
                          ? `${activity.user.firstName} ${activity.user.lastName}`
                          : activity.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.entityType} • {activity.user.role}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 