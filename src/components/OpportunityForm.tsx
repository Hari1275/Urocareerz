"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const opportunitySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  opportunityType: z.enum([
    "FELLOWSHIP",
    "JOB",
    "OBSERVERSHIP",
    "RESEARCH",
    "OTHER",
  ]),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  duration: z.string().optional(),
  compensation: z.string().optional(),
  applicationDeadline: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OpportunityForm({
  onSuccess,
  onCancel,
}: OpportunityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      opportunityType: "FELLOWSHIP",
    },
  });

  const opportunityType = watch("opportunityType");

  const onSubmit = async (data: OpportunityFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post opportunity");
      }

      const result = await response.json();
      console.log("Opportunity posted successfully:", result);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/mentor");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Post New Opportunity
          </CardTitle>
          <div className="text-sm text-gray-600">
            Share fellowships, jobs, observerships, or other opportunities with
            the community
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Urology Fellowship Program"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opportunityType">Opportunity Type *</Label>
                  <Select
                    value={opportunityType}
                    onValueChange={(value) =>
                      setValue("opportunityType", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select opportunity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                      <SelectItem value="JOB">Job</SelectItem>
                      <SelectItem value="OBSERVERSHIP">Observership</SelectItem>
                      <SelectItem value="RESEARCH">Research</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.opportunityType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.opportunityType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Provide a detailed description of the opportunity..."
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="e.g., New York, NY"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Input
                      id="experienceLevel"
                      {...register("experienceLevel")}
                      placeholder="e.g., Entry Level, Mid-Career"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    {...register("requirements")}
                    placeholder="List any specific requirements or qualifications..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    {...register("benefits")}
                    placeholder="Describe the benefits of this opportunity..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      {...register("duration")}
                      placeholder="e.g., 1 year, 6 months"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation">Compensation</Label>
                    <Input
                      id="compensation"
                      {...register("compensation")}
                      placeholder="e.g., $50,000/year, Stipend provided"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">
                    Application Deadline
                  </Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    {...register("applicationDeadline")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? "Posting..." : "Post Opportunity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
