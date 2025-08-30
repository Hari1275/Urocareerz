"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

interface DiscussionCommentsProps {
  threadId: string;
  comments: FlatComment[];
  onAdded?: (newComment: FlatComment) => void;
  canReply?: boolean;
}

export default function DiscussionComments({
  threadId,
  comments,
  onAdded,
  canReply = true,
}: DiscussionCommentsProps) {
  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  return (
    <div className="space-y-3">
      {tree.length === 0 ? (
        <Card className="bg-white/70 border-slate-200/60">
          <CardContent className="p-6 text-center text-slate-600">
            No comments yet. Be the first to comment!
          </CardContent>
        </Card>
      ) : (
        tree.map((c) => (
          <CommentNode
            key={c.id}
            node={c}
            threadId={threadId}
            depth={0}
            onAdded={onAdded}
            canReply={canReply}
          />
        ))
      )}
    </div>
  );
}

function CommentNode({
  node,
  threadId,
  depth,
  onAdded,
  canReply = true,
}: {
  node: TreeComment;
  threadId: string;
  depth: number;
  onAdded?: (c: FlatComment) => void;
  canReply?: boolean;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="space-y-2" style={{ marginLeft: depth === 0 ? 0 : 16 }}>
      <Card className="bg-white/80 border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">
                  {getInitials(node.author.firstName, node.author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {node.author.firstName} {node.author.lastName}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-white/60">
                    {node.author.role}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  {formatDate(node.createdAt)}
                </div>
              </div>
            </div>
            {canReply && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying((v) => !v)}
                  className="text-xs"
                >
                  Reply
                </Button>
              </div>
            )}
          </div>
          <div className="mt-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {node.content}
          </div>

          {isReplying && canReply && (
            <div className="mt-3">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[72px] bg-white/80 border-slate-200"
              />
              <div className="mt-2 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReply("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!reply.trim() || isSubmitting}
                  onClick={handleReply}
                >
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {node.replies.length > 0 && (
        <div className="space-y-2">
          {node.replies.map((r) => (
            <CommentNode
              key={r.id}
              node={r}
              threadId={threadId}
              depth={depth + 1}
              onAdded={onAdded}
              canReply={canReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
