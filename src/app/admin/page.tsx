"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  UserCheck,
  Menu,
  X,
  MessageSquare,
  Activity,
  ClipboardList,
} from "lucide-react";
import UserManagementTable from "@/components/UserManagementTable";
import OpportunityManagementTable from "@/components/OpportunityManagementTable";
import ContentModerationTable from "@/components/ContentModerationTable";
import OpportunityTypeManagement from "@/components/OpportunityTypeManagement";
import DiscussionManagementTable from "@/components/DiscussionManagementTable";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import AuditLogsTable from "@/components/AuditLogsTable";
import EnhancedAnalytics from "@/components/EnhancedAnalytics";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: string;
  opportunityType: string;
  mentor: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  createdAt: string;
  _count: {
    applications: number;
    savedOpportunities: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "opportunities" | "content" | "types" | "discussions" | "analytics" | "audit-logs"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setUsers] = useState<User[]>([]);
  const [, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalOpportunities: 0,
    pendingOpportunities: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        // Ensure user is an admin
        if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        setUser(data.user);
        await fetchStats();
      } catch (err: unknown) {
        console.error("Admin: Error in fetchUserData:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchStats = async () => {
    try {
      const [usersResponse, opportunitiesResponse] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/opportunities"),
      ]);

      if (usersResponse.ok && opportunitiesResponse.ok) {
        const usersData = await usersResponse.json();
        const opportunitiesData = await opportunitiesResponse.json();

        const pendingUsers = usersData.users.filter(
          (u: User) => u.status === "pending"
        ).length;
        const pendingOpportunities = opportunitiesData.opportunities.filter(
          (o: Opportunity) => o.status === "PENDING"
        ).length;

        const newStats = {
          totalUsers: usersData.users.length,
          pendingUsers,
          totalOpportunities: opportunitiesData.opportunities.length,
          pendingOpportunities,
        };

        setStats(newStats);
        setUsers(usersData.users);
        setOpportunities(opportunitiesData.opportunities);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary-200 mb-4"></div>
          <div className="h-4 w-32 bg-primary-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600">
                Welcome, {user.firstName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-4 lg:mt-8">
            <div className="px-4 space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("overview");
                  setSidebarOpen(false);
                }}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Overview
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("users");
                  setSidebarOpen(false);
                }}
              >
                <Users className="h-4 w-4 mr-3" />
                User Management
              </Button>
              <Button
                variant={activeTab === "opportunities" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("opportunities");
                  setSidebarOpen(false);
                }}
              >
                <FileText className="h-4 w-4 mr-3" />
                Opportunity Management
              </Button>
              <Button
                variant={activeTab === "content" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("content");
                  setSidebarOpen(false);
                }}
              >
                <FileText className="h-4 w-4 mr-3" />
                Content Moderation
              </Button>
              <Button
                variant={activeTab === "types" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("types");
                  setSidebarOpen(false);
                }}
              >
                <Settings className="h-4 w-4 mr-3" />
                Opportunity Types
              </Button>
              <Button
                variant={activeTab === "discussions" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("discussions");
                  setSidebarOpen(false);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                Discussions
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("analytics");
                  setSidebarOpen(false);
                }}
              >
                <Activity className="h-4 w-4 mr-3" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "audit-logs" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("audit-logs");
                  setSidebarOpen(false);
                }}
              >
                <ClipboardList className="h-4 w-4 mr-3" />
                Audit Logs
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Dashboard Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.pendingUsers} pending approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Opportunities
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalOpportunities}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.pendingOpportunities} pending approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Users
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.pendingUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Require admin approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Content
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.pendingOpportunities}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Require moderation
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Common administrative tasks
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("users")}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Review Pending Users ({stats.pendingUsers})
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveTab("content")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Moderate Content ({stats.pendingOpportunities})
                    </Button>
                    <div className="pt-2">
                      <AnnouncementForm />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Platform health and performance
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Service</span>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">File Storage</span>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Connected
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  User Management
                </h2>
                <p className="text-gray-600">
                  Manage user accounts, roles, and approvals
                </p>
              </div>

              <UserManagementTable />
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Opportunity Management
                </h2>
                <p className="text-gray-600">
                  Review and moderate submitted opportunities
                </p>
              </div>

              <OpportunityManagementTable />
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Content Moderation
                </h2>
                <p className="text-gray-600">
                  Review and moderate submitted opportunities
                </p>
              </div>

              <ContentModerationTable />
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Opportunity Types
                </h2>
                <p className="text-gray-600">
                  Manage different types of opportunities available in the
                  system
                </p>
              </div>

              <OpportunityTypeManagement />
            </div>
          )}

          {activeTab === "discussions" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Discussion Management
                </h2>
                <p className="text-gray-600">
                  Manage discussion threads, moderate content, and control
                  discussion status
                </p>
              </div>

              <DiscussionManagementTable />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <EnhancedAnalytics />
            </div>
          )}

          {activeTab === "audit-logs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Audit Logs
                </h2>
                <p className="text-gray-600">
                  Track all platform activities and administrative actions
                </p>
              </div>

              <AuditLogsTable />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
