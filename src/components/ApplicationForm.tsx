"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import FileUpload from "./FileUpload";

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
  mentor: {
    firstName: string;
    lastName: string;
    specialty?: string;
  };
}

interface ApplicationFormProps {
  opportunity: Opportunity;
}

export default function ApplicationForm({ opportunity }: ApplicationFormProps) {
  const router = useRouter();
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">Your application has been successfully submitted. The mentor will review it and get back to you soon.</p>
              <div className="space-y-3">
                <Button onClick={() => router.push("/applications")} className="w-full">
                  View My Applications
                </Button>
                <Button onClick={() => router.push("/opportunities")} variant="outline" className="w-full">
                  Browse More Opportunities
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

      const formData = new FormData();
      formData.append("file", selectedCvFile);
      formData.append("fileType", "resume");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CV");
      }

      const result = await response.json();
      setCvFileUrl(result.url);
      setCvFileName(selectedCvFile.name);
    } catch (err: any) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Opportunity</h1>
          <p className="text-gray-600">Submit your application for this exciting opportunity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunity Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const badge = getTypeBadge(opportunity.opportunityType.name);
                    return badge ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.colorClass}`}>
                        {badge.name}
                      </span>
                    ) : null;
                  })()}
                  {opportunity.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                </div>
                
                {opportunity.location && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Location</Label>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.location}</p>
                  </div>
                )}
                
                {opportunity.experienceLevel && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Experience Level</Label>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.experienceLevel}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mentor</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Dr. {opportunity.mentor.firstName} {opportunity.mentor.lastName}
                    {opportunity.mentor.specialty && ` - ${opportunity.mentor.specialty}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">
                      Cover Letter *
                    </Label>
                    <Textarea
                      id="coverLetter"
                      {...register("coverLetter")}
                      placeholder="Tell us why you're interested in this opportunity and what makes you a great candidate..."
                      className="mt-1"
                      rows={6}
                    />
                    {errors.coverLetter && (
                      <p className="text-red-600 text-sm mt-1">{errors.coverLetter.message}</p>
                    )}
                  </div>

                  {/* CV/Resume Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      CV/Resume *
                    </Label>
                    <div className="mt-2 space-y-4">
                      {/* Use existing resume option */}
                      {userProfile?.resume && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="useExistingResume"
                            checked={useExistingResume}
                            onChange={(e) => setUseExistingResume(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="useExistingResume" className="text-sm text-gray-600">
                            Use my existing resume ({userProfile.resumeFileName})
                          </Label>
                        </div>
                      )}

                      {/* Upload new CV */}
                      {(!useExistingResume || !userProfile?.resume) && (
                        <div>
                          <FileUpload
                            onFileSelect={setSelectedCvFile}
                            onFileUpload={handleCvUpload}
                            onFileDelete={handleCvDelete}
                            isUploading={isUploadingCv}
                            selectedFile={selectedCvFile}
                            uploadedFileUrl={cvFileUrl || undefined}
                            uploadedFileName={cvFileName || undefined}
                            accept=".pdf,.doc,.docx"
                            maxSize={5}
                            type="resume"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || (!cvFileUrl && !useExistingResume)}
                      className="flex-1"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
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
