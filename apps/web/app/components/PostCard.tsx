"use client";

import { useState } from "react";
import type { Post, AIComment } from "../types/api";
import CharacterAvatar, { CHARACTER_CONFIG } from "./CharacterAvatar";
import RoastabilityBadge from "./RoastabilityBadge";
import CategoryPill from "./CategoryPill";

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CommentBubble({ comment, allComments }: { comment: AIComment; allComments: AIComment[] }) {
  const config = CHARACTER_CONFIG[comment.character];

  // Find the parent comment for reply context
  const parentComment = comment.replyTo
    ? allComments.find((c) => c.id === comment.replyTo)
    : null;
  const parentConfig = parentComment
    ? CHARACTER_CONFIG[parentComment.character]
    : null;

  return (
    <div
      style={{
        display: "flex",
        gap: "0.625rem",
        padding: "0.75rem",
        borderRadius: "var(--radius-md)",
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${config.color}18`,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `rgba(255,255,255,0.04)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = `rgba(255,255,255,0.025)`;
      }}
    >
      <CharacterAvatar character={comment.character} size="sm" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: config.color }}>
            {config.displayName}
          </span>
          {parentConfig && comment.replyTo && (
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              → replying to{" "}
              <span style={{ color: parentConfig.color }}>
                {parentConfig.displayName}
              </span>
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {comment.text}
        </p>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  animationDelay?: number;
}

export default function PostCard({ post, animationDelay = 0 }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleComments = expanded ? post.comments : post.comments.slice(0, 2);

  return (
    <article
      className="animate-fade-in-up"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color var(--transition-base), box-shadow var(--transition-base)",
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "both",
        opacity: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border-brand)";
        el.style.boxShadow = "0 4px 24px rgba(124,58,237,0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border-subtle)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
          {/* User avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--brand-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {post.username.charAt(0).toUpperCase()}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
              @{post.username}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {formatRelativeTime(post.createdAt)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <CategoryPill category={post.category} />
          <RoastabilityBadge score={post.roastability} />
        </div>
      </div>

      {/* Post Text */}
      <div style={{ padding: "1rem 1.25rem" }}>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-primary)",
            fontWeight: 500,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {post.postText}
        </p>
      </div>

      {/* AI Comments */}
      {post.comments.length > 0 && (
        <div
          style={{
            padding: "0 1.25rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AI Society Reacts
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
          </div>

          {visibleComments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              allComments={post.comments}
            />
          ))}

          {post.comments.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand-mid)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.25rem 0",
                textAlign: "left",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--brand-to)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--brand-mid)";
              }}
            >
              {expanded
                ? "Show less ↑"
                : `+${post.comments.length - 2} more reactions ↓`}
            </button>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div
        style={{
          padding: "0.625rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Pattern:
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            fontFamily: "monospace",
            background: "var(--bg-muted)",
            padding: "0.1rem 0.4rem",
            borderRadius: "4px",
          }}
        >
          {post.eventType}
        </span>
      </div>
    </article>
  );
}
