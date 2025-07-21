"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { Upload, FileText, Send, ArrowLeft } from "lucide-react";

const applicationSchema = z.object({
  coverLetter: z
    .string()
    .min(1, "Cover letter is required")
    .max(2000, "Cover letter must be less than 2000 characters"),
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
  console.log("ApplicationForm received opportunity:", opportunity);
  
  // Safety check to prevent "Cannot read properties of undefined"
  if (!opportunity || !opportunity.id) {
    console.error("ApplicationForm: Invalid opportunity data", opportunity);
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Invalid opportunity data. Please try again later.</p>
              <Button 
                onClick={() => window.location.href = "/opportunities"}
                className="mt-4"
              >
                Back to Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
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
        cvFileName: cvFileName,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setSuccess(true);
      reset();
      setSelectedCvFile(null);
      setCvFileUrl(null);
      setCvFileName(null);

      // Redirect to applications page after a short delay
      setTimeout(() => {
        router.push("/applications");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Application Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your application has been submitted and is under review. You
                will be notified of any updates.
              </p>
              <Button onClick={() => router.push("/applications")}>
                View My Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Apply for Opportunity
          </h1>
          <p className="text-gray-600">
            Submit your application for this opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunity Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const typeInfo = getTypeBadge(
                      opportunity.opportunityType.name
                    );
                    return typeInfo
                      ? typeInfo.name
                      : opportunity.opportunityType.name;
                  })()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {opportunity.description}
                  </p>
                </div>

                {opportunity.location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Location</h4>
                    <p className="text-gray-600 text-sm">
                      {opportunity.location}
                    </p>
                  </div>
                )}

                {opportunity.experienceLevel && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Experience Level
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {opportunity.experienceLevel}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Mentor</h4>
                  <p className="text-gray-600 text-sm">
                    {opportunity.mentor.firstName} {opportunity.mentor.lastName}
                    {opportunity.mentor.specialty &&
                      ` • ${opportunity.mentor.specialty}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Form
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Please fill out the form below to apply for this opportunity
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* CV Upload Section */}
                  <div className="space-y-4">
                    <Label htmlFor="cv">CV/Resume *</Label>

                    {/* Show existing resume option if available */}
                    {userProfile?.resume && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="useExisting"
                            name="resumeOption"
                            checked={useExistingResume}
                            onChange={() => {
                              setUseExistingResume(true);
                              setSelectedCvFile(null);
                              setCvFileUrl(userProfile.resume);
                              setCvFileName(userProfile.resumeFileName);
                            }}
                            className="text-primary"
                          />
                          <Label
                            htmlFor="useExisting"
                            className="text-sm font-medium"
                          >
                            Use my existing resume: {userProfile.resumeFileName}
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="uploadNew"
                            name="resumeOption"
                            checked={!useExistingResume}
                            onChange={() => {
                              setUseExistingResume(false);
                              setCvFileUrl(null);
                              setCvFileName(null);
                            }}
                            className="text-primary"
                          />
                          <Label
                            htmlFor="uploadNew"
                            className="text-sm font-medium"
                          >
                            Upload a new resume
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Show upload option if no existing resume or user chooses to upload new */}
                    {(!userProfile?.resume || !useExistingResume) && (
                      <div className="space-y-2">
                        <FileUpload
                          type="resume"
                          onFileSelect={setSelectedCvFile}
                          onFileUpload={handleCvUpload}
                          onFileDelete={handleCvDelete}
                          selectedFile={selectedCvFile}
                          uploadedFileUrl={cvFileUrl || undefined}
                          uploadedFileName={cvFileName || undefined}
                          isUploading={isUploadingCv}
                          isDeleting={false}
                          maxSize={10}
                          className="max-w-md"
                        />
                        <p className="text-sm text-gray-500">
                          Upload your CV/Resume (PDF, DOC, DOCX up to 10MB)
                        </p>
                      </div>
                    )}

                    {/* Show current resume info if using existing */}
                    {useExistingResume && userProfile?.resume && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Using existing resume:{" "}
                              {userProfile.resumeFileName}
                            </p>
                            <p className="text-xs text-green-600">
                              This is the resume from your profile
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter Section */}
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter *</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Write a compelling cover letter explaining why you're interested in this opportunity and how you're qualified..."
                      className="min-h-[200px]"
                      {...register("coverLetter")}
                    />
                    {errors.coverLetter && (
                      <p className="text-sm text-red-500">
                        {errors.coverLetter.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Explain your interest, qualifications, and why you're a
                      good fit for this opportunity
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isUploadingCv ||
                        (!useExistingResume && !selectedCvFile) ||
                        (!useExistingResume && !cvFileUrl)
                      }
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Application
                        </>
                      )}
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
