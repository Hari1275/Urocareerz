"use client";

import { useMemo, useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, MoreVertical, Clock, Send, X, ChevronDown, ChevronRight, Reply } from "lucide-react";
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

  // Calculate total comment count (including all nested replies)
  const getTotalCommentCount = (comments: TreeComment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + getTotalCommentCount(comment.replies);
    }, 0);
  };

  const totalComments = getTotalCommentCount(tree);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Comments Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Comments</h2>
        <Badge className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
          {totalComments}
        </Badge>
      </div>

      {tree.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-slate-50/50 to-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageCircle className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">No comments yet</h3>
              <p className="text-sm text-slate-600 mt-1">Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-full">
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
    <div className="relative">
      {/* Thread Line for nested comments */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" 
             style={{ left: `${depth * 20}px` }} />
      )}
      
      <div className={cn(
        "relative",
        depth > 0 && "ml-8"
      )}>
        {/* Main Comment */}
        <div className="flex gap-3 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={cn(
                "font-semibold text-sm",
                avatarColors.background,
                avatarColors.foreground
              )}>
                {getInitials(node.author.firstName, node.author.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-900 text-sm">
                {node.author.firstName} {node.author.lastName}
              </span>
              <span className="text-xs text-slate-500">
                {formatRelativeTime(node.createdAt)}
              </span>
            </div>

            {/* Comment Text */}
            <div className="text-slate-700 text-sm leading-relaxed mb-3 break-words">
              {node.content}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Reply</span>
              </button>

              <button className="text-slate-500 hover:text-slate-700 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && canReply && (
          <div className="ml-13 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn(
                      "text-xs font-medium",
                      currentUserAvatarColors ? [currentUserAvatarColors.background, currentUserAvatarColors.foreground] : "bg-slate-400 text-white"
                    )}>
                      {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Reply to ${node.author.firstName}...`}
                    className="min-h-[80px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm bg-white"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false);
                        setReply("");
                      }}
                      className="h-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-sm"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!reply.trim() || isSubmitting}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      {isSubmitting ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {node.replies.length > 0 && (
          <div className="ml-13">
            {isExpanded && (
              <div className="space-y-4">
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
  );
});
