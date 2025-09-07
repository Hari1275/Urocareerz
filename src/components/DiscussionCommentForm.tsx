"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscussionCommentFormProps {
  threadId: string;
  onCommentAdded?: (comment: any) => void;
  currentUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  className?: string;
  disabled?: boolean;
}

/**
 * A form for adding new comments to a discussion thread.
 * It can be in a collapsed state or an expanded state.
 * @param {DiscussionCommentFormProps} props - The props for the component.
 */
export default function DiscussionCommentForm({
  threadId,
  onCommentAdded,
  currentUser,
  className,
  disabled,
}: DiscussionCommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), parentId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to post comment");
      
      onCommentAdded?.(data.comment);
      setContent("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    const f = firstName?.[0] ?? "U";
    const l = lastName?.[0] ?? "";
    return (f + l).toUpperCase();
  };

  const getAvatarColors = (userId: string | null | undefined): { background: string; foreground: string } => {
    const defaultColors = { background: "bg-gray-500", foreground: "text-white" };
    if (!userId) {
      return defaultColors;
    }
    const colors = [
      { background: "bg-blue-600", foreground: "text-white" },
      { background: "bg-green-600", foreground: "text-white" },
      { background: "bg-purple-600", foreground: "text-white" },
      { background: "bg-pink-600", foreground: "text-white" },
      { background: "bg-indigo-600", foreground: "text-white" },
      { background: "bg-red-600", foreground: "text-white" },
      { background: "bg-teal-600", foreground: "text-white" },
      { background: "bg-blue-100", foreground: "text-blue-800" },
      { background: "bg-green-100", foreground: "text-green-800" },
      { background: "bg-purple-100", foreground: "text-purple-800" },
      { background: "bg-pink-100", foreground: "text-pink-800" },
      { background: "bg-yellow-100", foreground: "text-yellow-800" },
      { background: "bg-indigo-100", foreground: "text-indigo-800" },
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index] || defaultColors;
  };

  const avatarColors = currentUser ? getAvatarColors(currentUser.id) : null;

  if (!isExpanded) {
    return (
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 p-2 sm:p-4 transition-colors",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300 cursor-pointer",
        className
      )}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarFallback className={cn(avatarColors ? [avatarColors.background, avatarColors.foreground] : "bg-gray-400")}>
              {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : "?"}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => !disabled && setIsExpanded(true)}
            disabled={disabled}
            className={cn(
              "flex-1 text-left transition-colors text-sm sm:text-base",
              disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>{disabled ? "Comments are closed" : "Share your thoughts..."}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-2 sm:p-4 shadow-sm",
      disabled && "opacity-50",
      className
    )}>
      <div className="flex space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarFallback className={cn(avatarColors ? [avatarColors.background, avatarColors.foreground] : "bg-gray-400")}>
              {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={disabled ? "Comments are closed" : "Share your thoughts on this discussion..."}
            className="min-h-[100px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
            autoFocus={!disabled}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !disabled) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          <div className="flex flex-col-reverse gap-y-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500 self-center sm:self-auto">
              {!disabled && "Press Ctrl+Enter to post quickly"}
            </div>
            
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setContent("");
                }}
                disabled={disabled}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting || disabled}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-1.5" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
