"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface Opportunity {
  title: string;
  description: string;
  location?: string;
  experienceLevel?: string;
  opportunityTypeId?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
}

export default function PostOpportunityPage() {
  const router = useRouter();
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Opportunity>({
    title: "",
    description: "",
    location: "",
    experienceLevel: "",
    opportunityTypeId: "",
    status: "PENDING",
    requirements: "",
    benefits: "",
    duration: "",
    compensation: "",
    applicationDeadline: "",
  });

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

        // Verify user is a mentor
        if (userData.user.role !== "MENTOR") {
          router.push("/dashboard");
          return;
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create opportunity");
      }

      // Redirect with query to mentor dashboard to show success and land on opportunities tab
      router.push(
        "/dashboard/mentor?success=opportunity-posted&tab=opportunities"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Opportunity, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    router.push("/dashboard/mentor");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Unified Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 flex-shrink-0"
              >
                <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  Loading...
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading post opportunity form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Unified Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 flex-shrink-0"
              >
                <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                  UroCareerz
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Error</span>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium mb-2">Error Loading Page</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-600"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Unified Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                UroCareerz
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">
                Welcome,{" "}
                <span className="text-gray-900 font-semibold">
                  {user.firstName || user.email || "User"}
                </span>
              </span>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </Link>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/mentor")}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Back to Dashboard
              </Button>
            </div>
            <div className="md:hidden flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/mentor")}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Post{" "}
              <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create a new opportunity for mentees to apply to and help grow the
              community.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Plus className="h-5 w-5" />
                Opportunity Details
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new opportunity for
                mentees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter opportunity title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opportunityType">Type *</Label>
                    <Select
                      value={formData.opportunityTypeId || ""}
                      onValueChange={(value) =>
                        handleInputChange("opportunityTypeId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {opportunityTypes.map((type) => {
                          const typeInfo = getTypeBadge(type.name);
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              {typeInfo ? (
                                <Badge className={typeInfo.colorClass}>
                                  {typeInfo.name}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">{type.name}</Badge>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter detailed description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Input
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={(e) =>
                        handleInputChange("experienceLevel", e.target.value)
                      }
                      placeholder="e.g., Entry, Mid, Senior"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", e.target.value)
                      }
                      placeholder="e.g., 6 months, 1 year"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compensation">Compensation</Label>
                    <Input
                      id="compensation"
                      value={formData.compensation}
                      onChange={(e) =>
                        handleInputChange("compensation", e.target.value)
                      }
                      placeholder="e.g., $50,000/year, Stipend"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleInputChange("requirements", e.target.value)
                    }
                    placeholder="Enter requirements and qualifications"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) =>
                      handleInputChange("benefits", e.target.value)
                    }
                    placeholder="Enter benefits and perks"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">
                    Application Deadline
                  </Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      handleInputChange("applicationDeadline", e.target.value)
                    }
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </span>
                    ) : (
                      <span>Create Opportunity</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
