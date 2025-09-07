"use client";

import { useMemo, useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, MoreVertical, Clock, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Author = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
};

export type FlatComment = {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  author: Author;
};

type TreeComment = FlatComment & { replies: TreeComment[] };

function buildCommentTree(comments: FlatComment[]): TreeComment[] {
  const idToNode = new Map<string, TreeComment>();
  const roots: TreeComment[] = [];

  for (const c of comments) {
    idToNode.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = idToNode.get(c.id)!;
    if (c.parentId && idToNode.has(c.parentId)) {
      idToNode.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const f = firstName?.[0] ?? "U";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase();
}

function getAvatarColors(userId: string | null | undefined): { background: string; foreground: string } {
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
}

interface DiscussionCommentsProps {
  threadId: string;
  comments: FlatComment[];
  onAdded?: (newComment: FlatComment) => void;
  canReply?: boolean;
  currentUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

/**
 * Renders a list of comments for a discussion thread, arranged in a tree structure.
 * @param {DiscussionCommentsProps} props - The props for the component.
 */
export default function DiscussionComments({
  threadId,
  comments,
  onAdded,
  canReply = true,
  currentUser,
}: DiscussionCommentsProps) {
  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  return (
    <div className="space-y-4">
      {tree.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No comments yet</h3>
              <p className="text-gray-600 mt-1">Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tree.map((c) => (
            <CommentNode
              key={c.id}
              node={c}
              threadId={threadId}
              depth={0}
              onAdded={onAdded}
              canReply={canReply}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders a single comment node in the comment tree, including its replies.
 * This component is recursive and memoized for performance.
 * @param {object} props - The props for the component.
 */
const CommentNode = memo(function CommentNode({
  node,
  threadId,
  depth,
  onAdded,
  canReply = true,
  currentUser,
}: {
  node: TreeComment;
  threadId: string;
  depth: number;
  onAdded?: (c: FlatComment) => void;
  canReply?: boolean;
  currentUser?: { id: string; firstName: string | null; lastName: string | null };
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleReply = async () => {
    if (!canReply) return;
    if (!reply.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply, parentId: node.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to reply");
      onAdded?.(data.comment as FlatComment);
      setReply("");
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarColors = getAvatarColors(node.author.id);
  const currentUserAvatarColors = currentUser ? getAvatarColors(currentUser.id) : null;

  return (
    <div className={cn(
      "relative",
      depth > 0 && "ml-2 pl-3 border-l-2 border-gray-100 sm:ml-4 sm:pl-4 md:ml-6 md:pl-6"
    )}>
      <div className={cn(
        "group relative transition-all duration-300 rounded-lg",
        depth === 0 
          ? "bg-white shadow-sm hover:shadow-md p-2 sm:p-3"
          : "hover:bg-gray-50/50 p-1"
      )}>
        <div className="flex space-x-2 sm:space-x-3">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className={cn(
                "h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md",
                depth > 0 && "h-6 w-6 sm:h-8 sm:w-8"
              )}>
                <AvatarFallback className={cn(
                  "font-medium text-xs sm:text-sm",
                  avatarColors.background,
                  avatarColors.foreground
                )}>
                  {getInitials(node.author.firstName, node.author.lastName)}
                </AvatarFallback>
              </Avatar>
              {depth === 0 && node.replies.length > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {node.replies.length}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex flex-wrap items-center space-x-2">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  {node.author.firstName} {node.author.lastName}
                </span>
                <Badge 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {node.author.role}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5 sm:mt-0">
                  <Clock className="h-3 w-3" />
                  <span title={new Date(node.createdAt).toLocaleString()}>
                    {formatRelativeTime(node.createdAt)}
                  </span>
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full font-semibold"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Reply</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="More options"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
              {node.content}
            </div>

            {/* Reply Form */}
            {isReplying && canReply && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-500">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn(currentUserAvatarColors ? [currentUserAvatarColors.background, currentUserAvatarColors.foreground] : "bg-gray-400")}>
                        {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={`Reply to ${node.author.firstName}...`}
                      className="min-h-[80px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsReplying(false);
                          setReply("");
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleReply}
                        disabled={!reply.trim() || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {isSubmitting ? "Posting..." : "Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
            {node.replies.length > 0 && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <div className={cn(
                    "w-2 h-2 border-r border-b border-current transform transition-transform",
                    isExpanded ? "rotate-45" : "-rotate-45"
                  )} />
                  <span>
                    {isExpanded ? "Hide" : "Show"} {node.replies.length} {node.replies.length === 1 ? "reply" : "replies"}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    {node.replies.map((r) => (
                      <CommentNode
                        key={r.id}
                        node={r}
                        threadId={threadId}
                        depth={depth + 1}
                        onAdded={onAdded}
                        canReply={canReply}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
