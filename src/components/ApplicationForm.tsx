"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { useNavigation } from "@/hooks/use-navigation";
import FileUpload from "./FileUpload";
import Breadcrumb from "./Breadcrumb";
import { ArrowLeft } from "lucide-react";

const applicationSchema = z.object({
  coverLetter: z.string().min(1, "Cover letter is required"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

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
  creator: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface ApplicationFormProps {
  opportunity: Opportunity;
}

export default function ApplicationForm({ opportunity }: ApplicationFormProps) {
  const { navigateToApplications } = useNavigation();
  const { getTypeBadge } = useOpportunityTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvFileUrl, setCvFileUrl] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [useExistingResume, setUseExistingResume] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
          // If user has a resume, default to using existing one
          if (data.profile?.resume) {
            setUseExistingResume(true);
            setCvFileUrl(data.profile.resume);
            setCvFileName(data.profile.resumeFileName);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Auto-upload when a CV file is selected
  useEffect(() => {
    if (selectedCvFile && !useExistingResume) {
      handleCvUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCvFile]);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center border-slate-200/60">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
              <p className="text-slate-600 mb-6">
                Your application has been successfully submitted. You will receive updates on your application status.
              </p>
              <div className="space-y-3">
                <Button onClick={navigateToApplications} className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                  View My Applications
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full h-10 border-slate-300 text-slate-700 hover:bg-slate-50">
                  Apply to Another Opportunity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCvUpload = async () => {
    if (!selectedCvFile) return;

    try {
      setIsUploadingCv(true);
      setError(null);

      console.log("Starting CV upload for file:", selectedCvFile.name);

      const formData = new FormData();
      formData.append("file", selectedCvFile);
      formData.append("fileType", "resume");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        throw new Error("Failed to upload CV");
      }

      const result = await response.json();
      console.log("Upload result:", result);
      
      setCvFileUrl(result.url);
      setCvFileName(selectedCvFile.name);
      
      console.log("CV upload successful, URL set to:", result.url);

      // Save the uploaded file information to the user's profile
      console.log("Saving uploaded file info to profile...");
      const profileUpdateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: result.url,
          resumeFileName: selectedCvFile.name,
        }),
        credentials: "include",
      });

      if (profileUpdateResponse.ok) {
        console.log("Profile updated successfully with new resume");
        // Refresh user profile state
        const fetchUserProfile = async () => {
          try {
            const response = await fetch("/api/profile", {
              credentials: "include",
            });

            if (response.ok) {
              const data = await response.json();
              setUserProfile(data.profile);
            }
          } catch (error) {
            console.error("Failed to refresh user profile:", error);
          }
        };
        await fetchUserProfile();
      } else {
        console.warn("Failed to update profile with resume info, but file upload was successful");
      }
    } catch (err: any) {
      console.error("CV upload error:", err);
      setError(err.message || "Failed to upload CV");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleCvDelete = async () => {
    setSelectedCvFile(null);
    setCvFileUrl(null);
    setCvFileName(null);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const applicationData = {
        opportunityId: opportunity.id,
        coverLetter: data.coverLetter,
        cvFile: cvFileUrl,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Breadcrumb
              items={[
                { label: "Opportunities", href: "/opportunities" },
                { label: opportunity.title, href: `/opportunities/${opportunity.id}` },
                { label: "Apply" }
              ]}
            />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Apply for Opportunity</h1>
          <p className="text-slate-600">Submit your application for this exciting opportunity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunity Details */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200/60">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-2">
                  {(() => {
                    const badge = getTypeBadge(opportunity.opportunityType.name);
                    return badge ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.colorClass} w-fit`}>
                        {badge.name}
                      </span>
                    ) : null;
                  })()}
                  <CardTitle className="text-lg font-semibold text-slate-900 leading-tight">
                    {opportunity.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Description</Label>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{opportunity.description}</p>
                </div>
                
                {opportunity.location && (
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Location</Label>
                    <p className="text-sm text-slate-600 mt-1">{opportunity.location}</p>
                  </div>
                )}
                
                {opportunity.experienceLevel && (
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Experience Level</Label>
                    <p className="text-sm text-slate-600 mt-1">{opportunity.experienceLevel}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">Mentor</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Dr. {opportunity.creator.firstName} {opportunity.creator.lastName}
                    {opportunity.creator.role && ` - ${opportunity.creator.role}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Cover Letter */}
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter" className="text-sm font-medium text-slate-700">
                      Cover Letter *
                    </Label>
                    <Textarea
                      id="coverLetter"
                      {...register("coverLetter")}
                      placeholder="Tell us why you're interested in this opportunity and what makes you a great candidate..."
                      className="min-h-[120px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      rows={5}
                    />
                    {errors.coverLetter && (
                      <p className="text-red-600 text-sm mt-1">{errors.coverLetter.message}</p>
                    )}
                  </div>

                  {/* CV/Resume Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      CV/Resume *
                    </Label>
                    <div className="space-y-3">
                      {/* Use existing resume option */}
                      {userProfile?.resume && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="useExistingResume"
                              checked={useExistingResume}
                              onChange={(e) => setUseExistingResume(e.target.checked)}
                              className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label htmlFor="useExistingResume" className="text-sm text-emerald-800 font-medium">
                              Use my existing resume ({userProfile.resumeFileName})
                            </Label>
                          </div>
                        </div>
                      )}

                      {/* Upload new CV */}
                      {(!useExistingResume || !userProfile?.resume) && (
                        <FileUpload
                          onFileSelect={setSelectedCvFile}
                          onFileUpload={() => Promise.resolve()} // Auto-upload handles this
                          onFileDelete={handleCvDelete}
                          isUploading={isUploadingCv}
                          selectedFile={selectedCvFile}
                          uploadedFileUrl={cvFileUrl || undefined}
                          uploadedFileName={cvFileName || undefined}
                          accept=".pdf,.doc,.docx"
                          maxSize={5}
                          type="resume"
                          autoUpload={true}
                        />
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Ready to Submit Message */}
                  {cvFileUrl && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-800">
                            Ready to Submit!
                          </p>
                          <p className="text-xs text-emerald-600">
                            Your resume is ready. You can now submit your application.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isUploadingCv || (!cvFileUrl && !useExistingResume)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 disabled:opacity-50"
                      onClick={() => {
                        console.log("Submit button clicked. Current state:", {
                          isSubmitting,
                          isUploadingCv,
                          cvFileUrl,
                          useExistingResume,
                          selectedCvFile: selectedCvFile?.name,
                          userProfile: userProfile?.resume
                        });
                      }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.location.reload()}
                      disabled={isSubmitting}
                      className="h-10 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
