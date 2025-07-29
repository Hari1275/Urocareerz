"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit } from "lucide-react";
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";

interface Opportunity {
  id?: string;
  title: string;
  description: string;
  location?: string;
  experienceLevel?: string;
  opportunityTypeId?: string;
  opportunityType?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  requirements?: string;
  benefits?: string;
  duration?: string;
  compensation?: string;
  applicationDeadline?: string;
  mentorId?: string;
}

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
}

interface OpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity | null;
  onSuccess: () => void;
}

export default function OpportunityForm({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: OpportunityFormProps) {
  const { opportunityTypes, getTypeBadge } = useOpportunityTypes();
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
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!opportunity?.id;

  useEffect(() => {
    if (open) {
      fetchMentors();
    }
  }, [open]);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title,
        description: opportunity.description,
        location: opportunity.location || "",
        experienceLevel: opportunity.experienceLevel || "",
        opportunityTypeId: opportunity.opportunityType?.id || "",
        status: opportunity.status,
        requirements: opportunity.requirements || "",
        benefits: opportunity.benefits || "",
        duration: opportunity.duration || "",
        compensation: opportunity.compensation || "",
        applicationDeadline: opportunity.applicationDeadline
          ? new Date(opportunity.applicationDeadline)
              .toISOString()
              .split("T")[0]
          : "",
        mentorId: opportunity.mentorId,
      });
    } else {
      setFormData({
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
    }
    setError(null);
  }, [opportunity, open]);

  const fetchMentors = async () => {
    try {
      const response = await fetch("/api/admin/users?role=MENTOR");
      if (response.ok) {
        const data = await response.json();
        setMentors(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/opportunities/${opportunity!.id}`
        : "/api/admin/opportunities";

      const method = isEditing ? "PUT" : "POST";

      // Debug: Log the data being sent
      console.log("Sending opportunity data:", formData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to save opportunity");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Opportunity, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" />
                Edit Opportunity
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Add New Opportunity
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update opportunity details and status."
              : "Create a new opportunity for mentees."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter detailed description"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
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
              onChange={(e) => handleInputChange("benefits", e.target.value)}
              placeholder="Enter benefits and perks"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED"
                ) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <Badge className="bg-orange-100 text-orange-800">
                      Pending
                    </Badge>
                  </SelectItem>
                  <SelectItem value="APPROVED">
                    <Badge className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                  </SelectItem>
                  <SelectItem value="CLOSED">
                    <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="mentorId">Assign to Mentor</Label>
              <Select
                value={formData.mentorId || ""}
                onValueChange={(value) => handleInputChange("mentorId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.firstName && mentor.lastName
                        ? `${mentor.firstName} ${mentor.lastName}`
                        : mentor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Opportunity" : "Create Opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
