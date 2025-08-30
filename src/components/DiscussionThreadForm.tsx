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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X } from "lucide-react";

interface DiscussionThreadFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const categoryOptions = [
  { value: "GENERAL", label: "General Discussion" },
  { value: "CASE_DISCUSSION", label: "Case Discussion" },
  { value: "CAREER_ADVICE", label: "Career Advice" },
  { value: "TECHNICAL", label: "Technical Questions" },
  { value: "NETWORKING", label: "Networking" },
  { value: "RESOURCES", label: "Resources & Tools" },
];

export default function DiscussionThreadForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DiscussionThreadFormData>({
    title: "",
    content: "",
    category: "GENERAL",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const MIN_TITLE = 5;
  const MAX_TITLE = 200;
  const MIN_CONTENT = 10;
  const MAX_CONTENT = 5000;

  const handleInputChange = (
    field: keyof DiscussionThreadFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleLen = formData.title.trim().length;
    const contentLen = formData.content.trim().length;
    if (
      titleLen < MIN_TITLE ||
      titleLen > MAX_TITLE ||
      contentLen < MIN_CONTENT ||
      contentLen > MAX_CONTENT
    ) {
      toast({
        title: "Validation Error",
        description: `Title (${MIN_TITLE}-${MAX_TITLE}) and content (${MIN_CONTENT}-${MAX_CONTENT}) length required`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create discussion");
      }

      toast({
        title: "Success!",
        description: "Your discussion thread has been created successfully.",
      });

      // Return to previous screen (dashboard/mentee → discussions tab)
      router.back();
    } catch (error) {
      console.error("Error creating discussion:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create discussion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Discussion Details
          </CardTitle>
          <CardDescription>
            Fill in the details below to start your discussion with the
            community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Discussion Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter a clear and descriptive title..."
                className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Min {MIN_TITLE} • Max {MAX_TITLE}
                </span>
                <span>
                  {formData.title.length}/{MAX_TITLE}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-gray-700"
              >
                Discussion Content *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Share your thoughts, questions, or case details..."
                rows={8}
                className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                required
              />
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Min {MIN_CONTENT} • Max {MAX_CONTENT}
                </span>
                <span>
                  {formData.content.length}/{MAX_CONTENT} characters
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="text-sm font-medium text-gray-700"
              >
                Tags (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tags to help others find your discussion..."
                  className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={formData.tags.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                  className="bg-white/80 border-gray-200 hover:bg-white hover:border-blue-500"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500">
                {formData.tags.length}/5 tags maximum • Tags help others
                discover your discussion
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines Card */}
      <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Discussion Guidelines
          </CardTitle>
          <CardDescription>
            Please follow these guidelines to ensure a positive community
            experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Be respectful and professional in your communication
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Provide clear and relevant information
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Use appropriate categories to help others find your discussion
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Avoid sharing personal or sensitive information
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Keep discussions focused and on-topic
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="bg-white/70 backdrop-blur-lg border-gray-200 hover:bg-white hover:border-blue-500 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discussions
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              loading ||
              formData.title.trim().length < MIN_TITLE ||
              formData.title.length > MAX_TITLE ||
              formData.content.trim().length < MIN_CONTENT ||
              formData.content.length > MAX_CONTENT
            }
            className="bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-600 w-full sm:w-auto"
          >
            {loading ? "Creating..." : "Create Discussion"}
          </Button>
        </div>
      </div>
    </div>
  );
}