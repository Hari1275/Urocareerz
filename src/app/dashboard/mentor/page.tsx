"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

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
  status: string;
  location?: string;
  createdAt: string;
}

interface Application {
  id: string;
  opportunityId: string;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  status: string;
  appliedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { getTypeBadge } = useOpportunityTypes();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);

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

        // Ensure user is a mentor
        if (data.user.role !== "MENTOR") {
          router.push("/dashboard");
          return;
        }

        setUser(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Check for success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    if (success === "opportunity-posted") {
      setSuccessMessage(
        "Opportunity posted successfully! It is now pending approval."
      );
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh opportunities list
      fetchOpportunities();
    }
  }, []);

  // Fetch opportunities when user is loaded
  useEffect(() => {
    if (user) {
      fetchOpportunities();
      fetchApplications();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const response = await fetch("/api/opportunities");
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await fetch("/api/applications/mentor");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleReviewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleUpdateApplicationStatus = async (
    status: "ACCEPTED" | "REJECTED"
  ) => {
    if (!selectedApplication) return;

    setReviewing(true);
    try {
      const response = await fetch(
        `/api/applications/${selectedApplication.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        // Update the application in the local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id ? { ...app, status } : app
          )
        );
        setShowReviewModal(false);
        setSelectedApplication(null);
        setSuccessMessage(`Application ${status.toLowerCase()} successfully!`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update application status");
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
      alert("Failed to update application status");
    } finally {
      setReviewing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending Approval</Badge>;
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "CLOSED":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "ACCEPTED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "WITHDRAWN":
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
          <CardFooter>
            <Button onClick={() => router.push("/login")}>Back to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Welcome, {user.firstName || user.email}</span>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
              <Button variant="outline" onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back, Dr. {user.lastName}!</h1>
          <p className="text-lg text-gray-600">Guide the next generation of urologists</p>
        </div>

        {successMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {successMessage}
          </div>
        )}

        {/* Modern Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {/* Post Opportunity Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Post Opportunity</h3>
            <p className="text-sm text-gray-500 text-center">Share fellowships, jobs, or observerships</p>
            <Button className="w-full mt-2 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" onClick={() => router.push("/dashboard/mentor/post-opportunity")}>Post Opportunity</Button>
          </div>
          {/* Applications Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Applications</h3>
            <p className="text-sm text-gray-500 text-center">View applications from mentees</p>
            <Button className="w-full mt-2 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600" onClick={() => {document.getElementById("applications-section")?.scrollIntoView({behavior: "smooth"});}}>View Applications</Button>
          </div>
          {/* Search Mentees Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Find Mentees</h3>
            <p className="text-sm text-gray-500 text-center">Search mentees by interests and location</p>
            <Button className="w-full mt-2 bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600" onClick={() => router.push("/dashboard/mentor/search")}>Search Mentees</Button>
          </div>
          {/* My Schedule Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 to-red-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">My Schedule</h3>
            <p className="text-sm text-gray-500 text-center">Manage availability and bookings</p>
            <Button className="w-full mt-2 bg-gradient-to-tr from-pink-600 to-red-500 text-white font-semibold shadow-md hover:from-pink-700 hover:to-red-600">Manage Schedule</Button>
          </div>
          {/* Mentoring Resources Card */}
          <div className="relative group bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.03] hover:shadow-2xl border border-gray-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-400 text-white text-3xl shadow-lg mb-2 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Mentoring Resources</h3>
            <p className="text-sm text-gray-500 text-center">Access tools and materials</p>
            <Button className="w-full mt-2 bg-gradient-to-tr from-yellow-500 to-orange-400 text-white font-semibold shadow-md hover:from-yellow-600 hover:to-orange-500" variant="outline">Browse Resources</Button>
          </div>
        </div>

        {/* My Opportunities Section (unchanged, but update card style) */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Opportunities</h2>
            <Button onClick={fetchOpportunities} variant="outline" disabled={loadingOpportunities}>{loadingOpportunities ? "Refreshing..." : "Refresh"}</Button>
          </div>
          {loadingOpportunities ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">You haven't posted any opportunities yet.</p>
              <Button className="mt-4 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600" onClick={() => router.push("/dashboard/mentor/post-opportunity")}>Post Your First Opportunity</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                        {getStatusBadge(opportunity.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {(() => {
                          if (!opportunity.opportunityType) {
                            return "Unknown Type";
                          }
                          const typeInfo = getTypeBadge(opportunity.opportunityType.name);
                          return typeInfo ? typeInfo.name : opportunity.opportunityType.name;
                        })()}
                        {opportunity.location && ` • ${opportunity.location}`}
                      </p>
                      <p className="text-gray-700 text-sm line-clamp-2">{opportunity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Posted on {new Date(opportunity.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications Section (unchanged, but update card style) */}
        <div id="applications-section" className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Applications from Mentees</h2>
            <Button onClick={fetchApplications} variant="outline" disabled={loadingApplications}>{loadingApplications ? "Refreshing..." : "Refresh"}</Button>
          </div>
          {loadingApplications ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">No applications received yet.</p>
              <p className="text-sm text-gray-400 mt-2">Applications will appear here when mentees apply to your opportunities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const opportunity = opportunities.find((opp) => opp.id === application.opportunityId);
                return (
                  <div key={application.id} className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{application.menteeName}</h3>
                          {getApplicationStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Applied to: {opportunity?.title || "Unknown Opportunity"}</p>
                        <p className="text-sm text-gray-600 mb-2">Email: {application.menteeEmail}</p>
                        {application.coverLetter && (
                          <p className="text-gray-700 text-sm line-clamp-2 mb-2">Cover Letter: {application.coverLetter}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          {application.resumeUrl && (
                            <Button variant="outline" size="sm" onClick={() => window.open(application.resumeUrl, "_blank")}>View Resume</Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleReviewApplication(application)}>Review Application</Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions - visually prominent floating card */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
            <span className="text-lg font-semibold text-gray-800 text-center sm:text-left whitespace-nowrap">Ready to help mentees grow?</span>
            <div className="flex flex-row flex-wrap gap-2 justify-center items-center w-full sm:w-auto">
              <Button className="rounded-full px-6 py-2 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600 whitespace-nowrap" onClick={() => router.push("/dashboard/mentor/post-opportunity")}>Post Opportunity</Button>
              <Button className="rounded-full px-6 py-2 whitespace-nowrap" variant="outline" onClick={() => {document.getElementById("applications-section")?.scrollIntoView({behavior: "smooth"});}}>View Applications</Button>
              <Button className="rounded-full px-6 py-2 whitespace-nowrap" variant="outline" onClick={() => router.push("/profile")}>Update Profile</Button>
            </div>
          </div>
        </div>

        {/* Application Review Modal (unchanged) */}
        {showReviewModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
                <Button variant="ghost" size="sm" onClick={() => {setShowReviewModal(false);setSelectedApplication(null);}}>✕</Button>
              </div>
              <div className="space-y-4">
                {/* Application Details */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedApplication.menteeName}</h3>
                  <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {selectedApplication.menteeEmail}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {selectedApplication.status}</p>
                  {selectedApplication.coverLetter && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedApplication.coverLetter}</p>
                    </div>
                  )}
                </div>
                {/* Resume Section */}
                {selectedApplication.resumeUrl && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedApplication.resumeUrl, "_blank")}>View Resume</Button>
                  </div>
                )}
                {/* Review Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => {setShowReviewModal(false);setSelectedApplication(null);}} disabled={reviewing}>Cancel</Button>
                  <Button variant="destructive" onClick={() => handleUpdateApplicationStatus("REJECTED")} disabled={reviewing}>{reviewing ? "Rejecting..." : "Reject Application"}</Button>
                  <Button className="btn-primary" onClick={() => handleUpdateApplicationStatus("ACCEPTED")} disabled={reviewing}>{reviewing ? "Accepting..." : "Accept Application"}</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
