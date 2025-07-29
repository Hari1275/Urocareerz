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
  RefreshCw,
  TrendingUp,
  Briefcase,
  Calendar,
} from "lucide-react";
import UserManagementTable from "@/components/UserManagementTable";
import ContentModerationTable from "@/components/ContentModerationTable";
import OpportunityTypeManagement from "@/components/OpportunityTypeManagement";
import DiscussionManagementTable from "@/components/DiscussionManagementTable";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import AuditLogsTable from "@/components/AuditLogsTable";
// Removed: import EnhancedAnalytics from "@/components/EnhancedAnalytics";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

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

// Add analytics state and fetch logic
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "content" | "types" | "discussions" | "audit-logs"
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

  // Add analytics state and fetch logic
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      const response = await fetch(`/api/admin/analytics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setAnalyticsError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [dateRange.startDate, dateRange.endDate]);

  const getActionColor = (action: string) => {
    if (action.includes("APPROVED")) return "bg-green-100 text-green-800";
    if (action.includes("REJECTED") || action.includes("DELETED")) return "bg-red-100 text-red-800";
    if (action.includes("CHANGED")) return "bg-blue-100 text-blue-800";
    if (action.includes("REGISTERED") || action.includes("LOGIN")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800";
      case "MENTOR": return "bg-blue-100 text-blue-800";
      case "MENTEE": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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

        // Verify user is an admin
        if (userData.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

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

  // Add color palettes for pie charts
  const ROLE_COLORS = ['#2563eb', '#059669', '#f59e42', '#e11d48', '#6366f1'];
  const TYPE_COLORS = ['#059669', '#2563eb', '#f59e42', '#e11d48', '#6366f1'];

  // Add a helper function for pie chart labels:
  const getPieLabel = (entry: any) => `${entry["role"] || entry["typeName"]}: ${entry["percent"] ? Math.round(entry["percent"] * 100) : 0}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
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
          className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:h-screen ${
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
          <nav className="mt-4 lg:mt-8 lg:overflow-y-auto lg:h-[calc(100vh-8rem)]">
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-gray-600">All platform metrics, trends, and recent activity</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-36">
                    <DatePicker
                      date={dateRange.startDate ? new Date(dateRange.startDate) : undefined}
                      onChange={date => setDateRange(prev => ({ ...prev, startDate: date ? date.toISOString().split('T')[0] : "" }))}
                      placeholder="Start Date"
                    />
                  </div>
                  <div className="w-36">
                    <DatePicker
                      date={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
                      onChange={date => setDateRange(prev => ({ ...prev, endDate: date ? date.toISOString().split('T')[0] : "" }))}
                      placeholder="End Date"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={fetchAnalytics}
                    disabled={analyticsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              {analyticsLoading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading analytics...</span>
                </div>
              )}
              {analyticsError && (
                <Card><CardContent><div className="text-center py-8"><p className="text-red-500 mb-4">{analyticsError}</p><Button onClick={fetchAnalytics}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></div></CardContent></Card>
              )}
              {analyticsData && (
                <>
                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.overview.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData.overview.pendingUsers} pending approval</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.overview.totalOpportunities}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData.overview.pendingOpportunities} pending approval</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mentee Submissions</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.overview.totalMenteeOpportunities}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData.overview.pendingMenteeOpportunities} pending approval</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.overview.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">Across all opportunities</p>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Premium Analytics Graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white rounded-xl shadow-lg p-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold"><TrendingUp className="h-5 w-5" />User Registrations (Last 30 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                          <AreaChart data={analyticsData.trends.userRegistrationsByDate} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" fontSize={13} tick={{ fill: '#64748b' }} />
                            <YAxis allowDecimals={false} fontSize={13} tick={{ fill: '#64748b' }} />
                            <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', border: 'none' }} labelStyle={{ color: '#2563eb', fontWeight: 600 }} />
                            <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorReg)" strokeWidth={3} dot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} name="Registrations" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="bg-white rounded-xl shadow-lg p-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold"><Calendar className="h-5 w-5" />Opportunity Submissions (Last 30 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                          <AreaChart data={analyticsData.trends.opportunitySubmissionsByDate} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#059669" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="#059669" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" fontSize={13} tick={{ fill: '#64748b' }} />
                            <YAxis allowDecimals={false} fontSize={13} tick={{ fill: '#64748b' }} />
                            <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', border: 'none' }} labelStyle={{ color: '#059669', fontWeight: 600 }} />
                            <Area type="monotone" dataKey="count" stroke="#059669" fillOpacity={1} fill="url(#colorSub)" strokeWidth={3} dot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} name="Submissions" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Distribution Charts as Pie Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Role Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.distributions.userRoles.length > 0 ? (
                          <div className="w-full h-[280px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={analyticsData.distributions.userRoles}
                                  dataKey="count"
                                  nameKey="role"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius="70%"
                                  innerRadius="20%"
                                  paddingAngle={2}
                                >
                                  {analyticsData.distributions.userRoles.map((entry, idx) => (
                                    <Cell key={`cell-role-${idx}`} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    padding: '8px 12px'
                                  }}
                                  formatter={(value, name) => [`${value} users`, name]}
                                />
                                <Legend 
                                  verticalAlign="bottom" 
                                  height={36}
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No user role data</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Opportunity Type Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.distributions.opportunityTypes.length > 0 ? (
                          <div className="w-full h-[280px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={analyticsData.distributions.opportunityTypes}
                                  dataKey="count"
                                  nameKey="typeName"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius="70%"
                                  innerRadius="20%"
                                  paddingAngle={2}
                                >
                                  {analyticsData.distributions.opportunityTypes.map((entry, idx) => (
                                    <Cell key={`cell-type-${idx}`} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    padding: '8px 12px'
                                  }}
                                  formatter={(value, name) => [`${value} opportunities`, name]}
                                />
                                <Legend 
                                  verticalAlign="bottom" 
                                  height={36}
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No opportunity type data</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  {/* Trends - show only last 7 days in table */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />User Registration Trends (Last 7 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.trends.userRegistrationsByDate.length > 0 ? (
                          <div className="space-y-2">
                            {analyticsData.trends.userRegistrationsByDate.slice(-7).map((item) => (
                              <div key={item.date} className="flex items-center justify-between">
                                <span className="text-sm">{item.date}</span>
                                <span className="font-semibold">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No registration data available</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Opportunity Submission Trends (Last 7 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.trends.opportunitySubmissionsByDate.length > 0 ? (
                          <div className="space-y-2">
                            {analyticsData.trends.opportunitySubmissionsByDate.slice(-7).map((item) => (
                              <div key={item.date} className="flex items-center justify-between">
                                <span className="text-sm">{item.date}</span>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Recent Activity</CardTitle>
                          <p className="text-sm text-muted-foreground">Platform actions and events from the last 7 days</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("audit-logs")}
                          className="text-xs"
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.recentActivity.length > 0 ? (
                          <>
                            {analyticsData.recentActivity.slice(0, 10).map((activity) => (
                              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Badge className={getActionColor(activity.action)}>{activity.action.replace(/_/g, " ")}</Badge>
                                  <div>
                                    <p className="text-sm font-medium">{activity.user.firstName && activity.user.lastName ? `${activity.user.firstName} ${activity.user.lastName}` : activity.user.email}</p>
                                    <p className="text-xs text-gray-500">{activity.entityType} • {activity.user.role}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                              </div>
                            ))}
                            {analyticsData.recentActivity.length > 10 && (
                              <div className="text-center pt-2">
                                <p className="text-xs text-gray-500">
                                  Showing 10 of {analyticsData.recentActivity.length} recent activities
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No recent activity</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

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

          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Content Moderation
                </h2>
                <p className="text-gray-600">
                  Review, moderate, and manage all opportunities with comprehensive engagement metrics and detailed information
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
