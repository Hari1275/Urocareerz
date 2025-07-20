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

interface DiscussionThreadFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const categoryOptions = [
  { value: "GENERAL", label: "General" },
  { value: "CASE_DISCUSSION", label: "Case Discussion" },
  { value: "CAREER_ADVICE", label: "Career Advice" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "NETWORKING", label: "Networking" },
  { value: "RESOURCES", label: "Resources" },
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

    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
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

      // Redirect to the new discussion thread
      router.push(`/discussions/${data.thread.id}`);
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Start a New Discussion</CardTitle>
        <CardDescription>
          Share your thoughts, ask questions, or start a case discussion with
          the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter a clear and descriptive title..."
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
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
            <Label htmlFor="content">Discussion Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Share your thoughts, questions, or case details..."
              rows={8}
              required
            />
            <p className="text-sm text-gray-500">
              {formData.content.length}/5000 characters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags to help others find your discussion..."
                disabled={formData.tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500">
              {formData.tags.length}/5 tags maximum
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">
              Discussion Guidelines
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Be respectful and professional in your communication</li>
              <li>• Provide clear and relevant information</li>
              <li>
                • Use appropriate categories to help others find your discussion
              </li>
              <li>• Avoid sharing personal or sensitive information</li>
              <li>• Keep discussions focused and on-topic</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Discussion"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
