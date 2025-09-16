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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  profile?: {
    avatar?: string | null;
    bio?: string | null;
    specialty?: string | null;
  } | null;
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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName) {
      return user.firstName[0].toUpperCase() + (user.lastName?.[0]?.toUpperCase() || "");
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.email || "User";
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
                  {user.firstName || "Doctor"}
                </span>
              </span>
              
              {/* Enhanced User Menu with Profile Image */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-1 h-auto hover:bg-slate-100 rounded-lg"
                  >
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      {user.profile?.avatar ? (
                        <AvatarImage 
                          src={user.profile.avatar} 
                          alt={getUserDisplayName()}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                        {user.firstName || "Doctor"}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {user.role.toLowerCase()}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      {user.profile?.avatar ? (
                        <AvatarImage 
                          src={user.profile.avatar} 
                          alt={getUserDisplayName()}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {user.role.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/mentor")}>
                    <span className="mr-2">←</span>
                    <span>Back to Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Form Progress Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      Form Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">1</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">Basic Info</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-500">2</span>
                      </div>
                      <span className="text-sm text-slate-500">Requirements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-500">3</span>
                      </div>
                      <span className="text-sm text-slate-500">Additional Details</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-3 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Basic Information */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">Basic Information</CardTitle>
                        <CardDescription className="text-slate-600">Essential details about your opportunity</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                          Opportunity Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="e.g., Research Fellowship in Oncological Urology"
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                        <p className="text-xs text-slate-500">Give your opportunity a clear, descriptive title</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="opportunityType" className="text-sm font-semibold text-slate-700">
                          Opportunity Type *
                        </Label>
                        <Select
                          value={formData.opportunityTypeId || ""}
                          onValueChange={(value) => handleInputChange("opportunityTypeId", value)}
                        >
                          <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500">
                            <SelectValue placeholder="Choose the type of opportunity" />
                          </SelectTrigger>
                          <SelectContent>
                            {opportunityTypes.map((type) => {
                              const typeInfo = getTypeBadge(type.name);
                              return (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center gap-2">
                                    {typeInfo ? (
                                      <Badge className={typeInfo.colorClass}>
                                        {typeInfo.name}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">{type.name}</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">Select the category that best fits this opportunity</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Provide a detailed description of the opportunity, including what the mentee will learn, the scope of work, and expected outcomes..."
                        rows={5}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                        required
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">Describe what makes this opportunity valuable</p>
                        <span className="text-xs text-slate-400">{formData.description.length}/1000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Location & Requirements */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">Requirements & Details</CardTitle>
                        <CardDescription className="text-slate-600">Specify the requirements and logistics</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold text-slate-700">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="e.g., New York, NY or Remote"
                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                        <p className="text-xs text-slate-500">Where will this opportunity take place?</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel" className="text-sm font-semibold text-slate-700">
                          Experience Level
                        </Label>
                        <Select
                          value={formData.experienceLevel || ""}
                          onValueChange={(value) => handleInputChange("experienceLevel", value)}
                        >
                          <SelectTrigger className="h-11 border-slate-300 focus:border-purple-500">
                            <SelectValue placeholder="Select required experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry">Entry Level - Students, Recent Graduates</SelectItem>
                            <SelectItem value="Mid">Mid Level - 2-5 years experience</SelectItem>
                            <SelectItem value="Senior">Senior Level - 5+ years experience</SelectItem>
                            <SelectItem value="Any">Any Level - Open to all</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">What level of experience is required?</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements" className="text-sm font-semibold text-slate-700">
                        Requirements & Qualifications
                      </Label>
                      <Textarea
                        id="requirements"
                        value={formData.requirements}
                        onChange={(e) => handleInputChange("requirements", e.target.value)}
                        placeholder="List the specific requirements, qualifications, skills, or prerequisites needed for this opportunity..."
                        rows={4}
                        className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">Be specific about what you're looking for</p>
                        <span className="text-xs text-slate-400">{(formData.requirements || '').length}/500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Additional Details */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">Additional Details</CardTitle>
                        <CardDescription className="text-slate-600">Duration, compensation, and benefits</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-semibold text-slate-700">
                          Duration
                        </Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => handleInputChange("duration", e.target.value)}
                          placeholder="e.g., 6 months, 1 year, Flexible"
                          className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                        <p className="text-xs text-slate-500">How long will this opportunity last?</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="compensation" className="text-sm font-semibold text-slate-700">
                          Compensation
                        </Label>
                        <Input
                          id="compensation"
                          value={formData.compensation}
                          onChange={(e) => handleInputChange("compensation", e.target.value)}
                          placeholder="e.g., $50,000/year, Monthly stipend, Unpaid"
                          className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                        <p className="text-xs text-slate-500">What compensation is offered, if any?</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits" className="text-sm font-semibold text-slate-700">
                        Benefits & Perks
                      </Label>
                      <Textarea
                        id="benefits"
                        value={formData.benefits}
                        onChange={(e) => handleInputChange("benefits", e.target.value)}
                        placeholder="Describe the benefits, learning opportunities, networking possibilities, and any other perks..."
                        rows={4}
                        className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">What makes this opportunity valuable?</p>
                        <span className="text-xs text-slate-400">{(formData.benefits || '').length}/500</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicationDeadline" className="text-sm font-semibold text-slate-700">
                        Application Deadline
                      </Label>
                      <Input
                        id="applicationDeadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                        className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-slate-500">When should applications be submitted by?</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-red-600">⚠️</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Error Creating Opportunity</h4>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-slate-900">Ready to publish?</h3>
                        <p className="text-sm text-slate-600">Your opportunity will be reviewed by our team before going live.</p>
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={submitting}
                          className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={submitting || !formData.title || !formData.description || !formData.opportunityTypeId}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {submitting ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Creating Opportunity...</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              <span>Create Opportunity</span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
