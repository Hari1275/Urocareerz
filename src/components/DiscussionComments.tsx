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
    <div className="space-y-3">
      {tree.length === 0 ? (
        <div className="text-center py-8 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 shadow-sm">
          <div className="flex flex-col items-center space-y-2.5">
            <div className="p-2.5 bg-blue-50 rounded-full">
              <MessageCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">No comments yet</h3>
              <p className="text-sm text-slate-600 mt-0.5">Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
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
      depth > 0 && "ml-2 pl-3 border-l-2 border-slate-200 sm:ml-3 sm:pl-3 md:ml-4 md:pl-4"
    )}>
      <div className={cn(
        "group relative transition-all duration-200 rounded-xl",
        depth === 0 
          ? "bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/70 p-3 sm:p-4"
          : "hover:bg-slate-50/40 p-2 rounded-lg"
      )}>
        <div className="flex space-x-3 sm:space-x-3.5">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className={cn(
                "ring-2 ring-white shadow-sm transition-all duration-200 group-hover:ring-slate-200",
                depth === 0 ? "h-9 w-9 sm:h-10 sm:w-10" : "h-7 w-7 sm:h-8 sm:w-8"
              )}>
                <AvatarFallback className={cn(
                  "font-semibold transition-colors duration-200",
                  depth === 0 ? "text-sm" : "text-xs sm:text-sm",
                  avatarColors.background,
                  avatarColors.foreground
                )}>
                  {getInitials(node.author.firstName, node.author.lastName)}
                </AvatarFallback>
              </Avatar>
              {depth === 0 && node.replies.length > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border-2 border-white font-medium">
                  {node.replies.length > 99 ? '99+' : node.replies.length}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold text-slate-900 tracking-tight",
                    depth === 0 ? "text-sm sm:text-base" : "text-sm"
                  )}>
                    {node.author.firstName} {node.author.lastName}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-blue-50/80 text-blue-700 border-blue-200/60 font-medium"
                  >
                    {node.author.role}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span title={new Date(node.createdAt).toLocaleString()}>
                    {formatRelativeTime(node.createdAt)}
                  </span>
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200",
                    isReplying && "text-blue-600 bg-blue-50"
                  )}
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Reply</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label="More options"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className={cn(
              "text-slate-700 leading-relaxed prose prose-sm max-w-none",
              depth === 0 ? "text-sm sm:text-base" : "text-sm"
            )}>
              {node.content}
            </div>

            {/* Reply Form */}
            {isReplying && canReply && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-slate-50/40 rounded-lg p-3 border border-slate-200/50">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-1 ring-slate-200">
                        <AvatarFallback className={cn(
                          "text-xs font-medium",
                          currentUserAvatarColors ? [currentUserAvatarColors.background, currentUserAvatarColors.foreground] : "bg-slate-400 text-white"
                        )}>
                          {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      <Textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={`Reply to ${node.author.firstName}...`}
                        className="min-h-[70px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm bg-white/80 backdrop-blur-sm"
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
                          className="h-8 text-slate-600 hover:text-slate-800 hover:bg-white/60"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleReply}
                          disabled={!reply.trim() || isSubmitting}
                          className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
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
              <div className="mt-3 space-y-2.5">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:bg-blue-50 px-2 py-1 rounded-md -ml-2"
                >
                  <div className={cn(
                    "w-2 h-2 border-r-2 border-b-2 border-current transform transition-transform duration-200",
                    isExpanded ? "rotate-45" : "-rotate-45"
                  )} />
                  <span>
                    {isExpanded ? "Hide" : "Show"} {node.replies.length} {node.replies.length === 1 ? "reply" : "replies"}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
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
