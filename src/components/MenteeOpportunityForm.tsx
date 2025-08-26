"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { Badge } from "@/components/ui/badge";

interface MenteeOpportunityFormData {
  title: string;
  description: string;
  location: string;
  experienceLevel: string;
  opportunityTypeId: string;
  requirements: string;
  benefits: string;
  duration: string;
  compensation: string;
  applicationDeadline: string;
  sourceUrl: string;
  sourceName: string;
}

interface MenteeOpportunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MenteeOpportunityForm({ onSuccess, onCancel }: MenteeOpportunityFormProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { opportunityTypes, loading: typesLoading, getTypeBadge } = useOpportunityTypes();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MenteeOpportunityFormData>({
    title: "",
    description: "",
    location: "",
    experienceLevel: "",
    opportunityTypeId: "",
    requirements: "",
    benefits: "",
    duration: "",
    compensation: "",
    applicationDeadline: "",
    sourceUrl: "",
    sourceName: "",
  });

  const handleInputChange = (
    field: keyof MenteeOpportunityFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.opportunityTypeId
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mentee-opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit opportunity");
      }

      toast({
        title: "Success!",
        description: "Your opportunity has been submitted for admin review.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        experienceLevel: "",
        opportunityTypeId: "",
        requirements: "",
        benefits: "",
        duration: "",
        compensation: "",
        applicationDeadline: "",
        sourceUrl: "",
        sourceName: "",
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback to redirect if no callback provided
        router.push("/dashboard/mentee");
      }
    } catch (error) {
      console.error("Error submitting opportunity:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit opportunity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Opportunity for Review</CardTitle>
        <CardDescription>
          Share an opportunity you&apos;ve found with the community. It will be
          reviewed by our admin team before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Research Assistant Position"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunityType">Opportunity Type *</Label>
              <Select
                value={formData.opportunityTypeId}
                onValueChange={(value) =>
                  handleInputChange("opportunityTypeId", value)
                }
                disabled={typesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity type">
                    {formData.opportunityTypeId && (() => {
                      const selectedType = opportunityTypes.find(type => type.id === formData.opportunityTypeId);
                      if (selectedType) {
                        const typeInfo = getTypeBadge(selectedType.name);
                        return typeInfo ? (
                          <Badge className={typeInfo.colorClass}>
                            {typeInfo.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{selectedType.name}</Badge>
                        );
                      }
                      return null;
                    })()}
                  </SelectValue>
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide a detailed description of the opportunity..."
              rows={4}
              required
            />
          </div>

          {/* Location and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., New York, NY or Remote"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) =>
                  handleInputChange("experienceLevel", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY">Entry Level</SelectItem>
                  <SelectItem value="MID">Mid Level</SelectItem>
                  <SelectItem value="SENIOR">Senior Level</SelectItem>
                  <SelectItem value="EXPERT">Expert Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requirements and Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                placeholder="List the requirements for this opportunity..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => handleInputChange("benefits", e.target.value)}
                placeholder="List the benefits of this opportunity..."
                rows={3}
              />
            </div>
          </div>

          {/* Duration and Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  handleInputChange("duration", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 months">1-3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                  <SelectItem value="2 years">2 years</SelectItem>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compensation">Compensation</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <Input
                  id="compensation"
                  value={formData.compensation}
                  onChange={(e) =>
                    handleInputChange("compensation", e.target.value)
                  }
                  className="pl-8"
                  placeholder="50,000/year, Stipend provided, Free"
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter amount without ₹ symbol. Use "Free", "Unpaid", or "Volunteer" for non-paid opportunities.
              </p>
            </div>
          </div>

          {/* Application Deadline */}
          <div className="space-y-2">
            <Label htmlFor="applicationDeadline">Application Deadline</Label>
            <Input
              id="applicationDeadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) =>
                handleInputChange("applicationDeadline", e.target.value)
              }
            />
          </div>

          {/* Source Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceName">Source Name</Label>
              <Input
                id="sourceName"
                value={formData.sourceName}
                onChange={(e) =>
                  handleInputChange("sourceName", e.target.value)
                }
                placeholder="e.g., LinkedIn, Company Website, Job Board"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
                placeholder="https://example.com/opportunity"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
