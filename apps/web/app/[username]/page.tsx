"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import PostCard from "../components/PostCard";
import CategoryPill from "../components/CategoryPill";
import LoadingSpinner from "../components/LoadingSpinner";
import type { Post, UserProfile, EventCategory } from "../types/api";

// Mock posts for profile page display (reuses same mock structure)
const MOCK_PROFILE_POSTS: Post[] = [
  {
    postId: "post_p_001",
    userId: "user_current",
    username: "you",
    eventId: "evt_p_001",
    category: "ai",
    eventType: "ai_dependency",
    postText:
      "User returned to ChatGPT 9 times in a single work session, each time swearing it was the last.",
    comments: [
      {
        id: "pc1",
        character: "certified_hater",
        text: "9 times. NINE. That's not using AI, that's codependency with extra steps.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "pc2",
        character: "detective",
        text: "Evidence: 9 visits. Average interval: 6.2 minutes. Pattern: undeniable.",
        replyTo: null,
        memeQuery: null,
      },
    ],
    roastability: 0.94,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    postId: "post_p_002",
    userId: "user_current",
    username: "you",
    eventId: "evt_p_002",
    category: "entertainment",
    eventType: "give_up",
    postText:
      "User spent 18 minutes on VS Code then fled to YouTube. The code remains unwritten.",
    comments: [
      {
        id: "pc3",
        character: "certified_hater",
        text: "18 minutes. Bro didn't even hit the first compile error.",
        replyTo: null,
        memeQuery: null,
      },
    ],
    roastability: 0.78,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_CATEGORY_STATS: { category: EventCategory; seconds: number }[] = [
  { category: "ai", seconds: 5400 },
  { category: "development", seconds: 3600 },
  { category: "entertainment", seconds: 2700 },
  { category: "social", seconds: 1800 },
  { category: "productivity", seconds: 900 },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileUsername = params?.username as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [posts] = useState<Post[]>(MOCK_PROFILE_POSTS);

  const maxCategorySeconds = MOCK_CATEGORY_STATS[0]?.seconds ?? 1;

  useEffect(() => {
    async function loadProfile() {
      try {
        let currentUsername: string | null = null;

        try {
          await getCurrentUser();
          const session = await fetchAuthSession();
          const token = session.tokens?.accessToken?.toString();

          if (token) {
            const meRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/me`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (meRes.ok) {
              const meData = await meRes.json();
              currentUsername = meData.profile?.username ?? null;
              setProfile(meData.profile);
            }
          }
        } catch {
          // Not authenticated — can still view profile
        }

        setIsOwnProfile(
          !!currentUsername &&
            currentUsername.toLowerCase() === profileUsername?.toLowerCase()
        );
      } catch (err) {
        console.error("Profile load error:", err);
        router.push("/feed");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [profileUsername, router]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading profile..." />;
  }

  // Render posts with the correct username
  const profilePosts = posts.map((p) => ({
    ...p,
    username: profileUsername || p.username,
  }));

  return (
    <main
      style={{
        paddingTop: "var(--nav-height)",
        minHeight: "100vh",
      }}
    >
      {/* Profile header */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "2rem",
        }}
      >
        <div className="container" style={{ paddingTop: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "var(--brand-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 800,
                color: "#fff",
                border: "3px solid var(--bg-base)",
                flexShrink: 0,
                boxShadow: "var(--shadow-brand)",
              }}
            >
              {profileUsername?.charAt(0)?.toUpperCase() ?? "?"}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  marginBottom: "0.25rem",
                  letterSpacing: "-0.02em",
                }}
              >
                @{profileUsername}
              </h1>

              {profile?.createdAt && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Member since {formatDate(profile.createdAt)}
                </div>
              )}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--success)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--success)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                Active member
              </div>
            </div>

            {/* Own profile actions */}
            {isOwnProfile && (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a
                  href="/onboarding/connect-extension"
                  className="btn btn--secondary btn--sm"
                >
                  🔌 Extension settings
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "4rem",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* Posts */}
        <section>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
              color: "var(--text-primary)",
            }}
          >
            Recent Posts
          </h2>

          {profilePosts.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🌑</div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                No posts yet
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  marginBottom: isOwnProfile ? "1.5rem" : 0,
                }}
              >
                {isOwnProfile
                  ? "Connect your extension and start browsing to generate your first post."
                  : "This user hasn't posted any browsing events yet."}
              </p>
              {isOwnProfile && (
                <a href="/onboarding/connect-extension" className="btn btn--primary btn--sm">
                  Connect extension →
                </a>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {profilePosts.map((post, i) => (
                <PostCard key={post.postId} post={post} animationDelay={i * 80} />
              ))}
            </div>
          )}
        </section>

        {/* Right sidebar — stats */}
        <aside
          style={{
            position: "sticky",
            top: "calc(var(--nav-height) + 1.5rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Stats card */}
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Stats
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.875rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                { label: "Posts", value: "2", icon: "📝" },
                { label: "Events", value: "47", icon: "📡" },
                { label: "Top Pattern", value: "AI Dep.", icon: "🤖" },
                { label: "Avg Roast", value: "82%", icon: "🔥" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.025)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: "0.875rem",
              }}
            >
              Browse Categories
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {MOCK_CATEGORY_STATS.map(({ category, seconds }) => {
                const pct = Math.round((seconds / maxCategorySeconds) * 100);
                return (
                  <div key={category}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <CategoryPill category={category} size="sm" />
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          fontWeight: 500,
                        }}
                      >
                        {formatDuration(seconds)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: "9999px",
                        background: "var(--bg-muted)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: "9999px",
                          background: "var(--brand-gradient)",
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extension status */}
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: "0.875rem",
              }}
            >
              Extension
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.625rem 0.875rem",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "var(--radius-md)",
                marginBottom: "0.75rem",
              }}
            >
              <span>⚡</span>
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--warning)",
                  }}
                >
                  Not connected
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Pair to start monitoring
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <a
                href="/onboarding/connect-extension"
                className="btn btn--primary btn--sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Connect now →
              </a>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }

        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr !important;
          }
          aside[style] {
            position: static !important;
          }
        }
      `}</style>
    </main>
  );
}