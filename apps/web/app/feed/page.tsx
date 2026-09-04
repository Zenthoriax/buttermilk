"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import type { Post } from "../types/api";

// ============================================================
// MOCK DATA — will be replaced when GET /posts is available
// ============================================================
const MOCK_POSTS: Post[] = [
  {
    postId: "post_mock_001",
    userId: "user_001",
    username: "zenthoriax",
    eventId: "evt_mock_001",
    category: "ai",
    eventType: "ai_dependency",
    postText:
      "User returned to ChatGPT 9 times in a single work session, each time swearing it was the last.",
    comments: [
      {
        id: "c1",
        character: "certified_hater",
        text: "9 times. NINE. That's not using AI, that's codependency with extra steps.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c2",
        character: "glazer3000",
        text: "Actually this shows incredible adaptability and a growth mindset. He's leveraging AI strategically.",
        replyTo: "c1",
        memeQuery: null,
      },
      {
        id: "c3",
        character: "detective",
        text: "Evidence: 9 visits. Average interval: 6.2 minutes. Conclusion: The subject cannot function without external AI validation.",
        replyTo: null,
        memeQuery: "detective pointing at board with evidence",
      },
      {
        id: "c4",
        character: "linkedin_sigma",
        text: "I use ChatGPT 47 times a day. That's called being an AI-native entrepreneur. Rise and grind.",
        replyTo: null,
        memeQuery: null,
      },
    ],
    roastability: 0.94,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    postId: "post_mock_002",
    userId: "user_002",
    username: "procrastinator99",
    eventId: "evt_mock_002",
    category: "entertainment",
    eventType: "give_up",
    postText:
      "User spent 18 minutes on VS Code, then immediately fled to YouTube. The code remains unfinished.",
    comments: [
      {
        id: "c5",
        character: "certified_hater",
        text: "18 minutes. Bro didn't even make it to the first compile error.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c6",
        character: "maincharacter",
        text: "This isn't giving up. This is a protagonist recharging before the final battle. The code will be written. Tonight. Probably.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c7",
        character: "society_aunty",
        text: "My sister's son works at Google. He codes for 12 hours straight. No YouTube. No breaks. Just success.",
        replyTo: "c5",
        memeQuery: null,
      },
    ],
    roastability: 0.78,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    postId: "post_mock_003",
    userId: "user_003",
    username: "tabswitcher_",
    eventId: "evt_mock_003",
    category: "general",
    eventType: "tab_insanity",
    postText:
      "47 tab switches detected in 8 minutes. The user appears to be looking for something. They will not find it.",
    comments: [
      {
        id: "c8",
        character: "detective",
        text: "47 switches. 8 minutes. That's 5.875 switches per minute. I've seen this pattern before. It never ends well.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c9",
        character: "chronicallyonline",
        text: "bro is speedrunning tab management any%",
        replyTo: null,
        memeQuery: "man frantically clicking everywhere",
      },
      {
        id: "c10",
        character: "glazer3000",
        text: "This is called multi-threaded cognitive processing. Not everyone can handle this level of parallel thinking.",
        replyTo: "c9",
        memeQuery: null,
      },
    ],
    roastability: 0.65,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    postId: "post_mock_004",
    userId: "user_001",
    username: "zenthoriax",
    eventId: "evt_mock_004",
    category: "social",
    eventType: "relapse",
    postText:
      "User left Twitter 6 times during a study session. They kept coming back. Twitter always wins.",
    comments: [
      {
        id: "c11",
        character: "certified_hater",
        text: "The algorithm has won. Moment of silence.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c12",
        character: "maincharacter",
        text: "He returned each time stronger. The temptation was real. The will to resist even realer. He is not weak — he is tested.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c13",
        character: "linkedin_sigma",
        text: "I stopped using social media in 2019. Added 4 hours to my day. Built 3 companies. Wrote a book. You can too.",
        replyTo: "c11",
        memeQuery: null,
      },
    ],
    roastability: 0.72,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    postId: "post_mock_005",
    userId: "user_004",
    username: "nightcoder",
    eventId: "evt_mock_005",
    category: "development",
    eventType: "ai_dependency",
    postText:
      "User alternated between Stack Overflow and ChatGPT 14 times while debugging a single function.",
    comments: [
      {
        id: "c14",
        character: "detective",
        text: "14 alternations. Stack Overflow first, then GPT, then Stack Overflow again. Classic confusion spiral. I'm taking notes.",
        replyTo: null,
        memeQuery: null,
      },
      {
        id: "c15",
        character: "chronicallyonline",
        text: "the real debugging journey was the anxiety we accumulated along the way",
        replyTo: null,
        memeQuery: null,
      },
    ],
    roastability: 0.82,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      try {
        await getCurrentUser();
        setAuthenticated(true);

        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        if (token) {
          const meRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (meRes.ok) {
            const meData = await meRes.json();
            setUsername(meData.profile?.username ?? null);
          }
        }

        // TODO: Replace with real API when GET /posts is available:
        // const postsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const postsData = await postsRes.json();
        // setPosts(postsData.posts);

        // Using mock data for now
        await new Promise((r) => setTimeout(r, 500)); // simulate load
        setPosts(MOCK_POSTS);
      } catch {
        setAuthenticated(false);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [router]);

  async function loadMorePosts() {
    setLoadingMore(true);
    // Simulate loading more
    await new Promise((r) => setTimeout(r, 800));
    setLoadingMore(false);
  }

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your feed..." />;
  }

  if (!authenticated) {
    return null; // router.push("/") handles redirect
  }

  return (
    <main className="feed-page">
      <div className="feed-layout">
        {/* Sidebar */}
        <aside className="feed-sidebar">
          <div className="feed-sidebar__card">
            <div className="feed-sidebar__avatar">
              {username ? username.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="feed-sidebar__username">
              {username ? `@${username}` : "Loading..."}
            </div>
            <div className="feed-sidebar__label">Outcognito member</div>

            {username && (
              <a
                href={`/${username}`}
                className="btn btn--secondary btn--sm"
                style={{ width: "100%", justifyContent: "center", marginTop: "0.75rem" }}
              >
                View profile
              </a>
            )}
          </div>

          <div className="feed-sidebar__card">
            <div className="feed-sidebar__section-title">AI Society</div>
            <div className="feed-sidebar__characters">
              {[
                { emoji: "😒", name: "Certified Hater", color: "#ef4444" },
                { emoji: "🤩", name: "Glazer3000", color: "#f59e0b" },
                { emoji: "🗿", name: "ChronicallyOnline", color: "#a855f7" },
                { emoji: "👩‍👦", name: "Society Aunty", color: "#ec4899" },
                { emoji: "🔍", name: "Detective", color: "#06b6d4" },
                { emoji: "💼", name: "LinkedIn Sigma", color: "#22c55e" },
                { emoji: "⚡", name: "Main Character", color: "#f97316" },
              ].map((char) => (
                <div key={char.name} className="feed-sidebar__character">
                  <span>{char.emoji}</span>
                  <span style={{ color: char.color, fontSize: "0.8rem", fontWeight: 600 }}>
                    {char.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="feed-sidebar__card">
            <div className="feed-sidebar__section-title">Extension Status</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 0.75rem",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                color: "var(--warning)",
              }}
            >
              <span>⚡</span>
              Not connected
            </div>
            <a
              href="/onboarding/connect-extension"
              className="btn btn--ghost btn--sm"
              style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center" }}
            >
              Connect extension →
            </a>
          </div>
        </aside>

        {/* Feed */}
        <section className="feed-main">
          {/* Feed header */}
          <div className="feed-header">
            <h1 className="feed-header__title">Your Feed</h1>
            <div className="feed-header__subtitle">
              AI Society reactions to your browsing behavior
            </div>
          </div>

          {/* Mock data notice */}
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(6, 182, 212, 0.06)",
              border: "1px solid rgba(6, 182, 212, 0.15)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "1rem" }}>📡</span>
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--info)",
                }}
              >
                Demo mode
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginLeft: "0.375rem",
                }}
              >
                Showing sample posts. Connect your extension to see real events.
              </span>
            </div>
          </div>

          {/* Post list */}
          <div className="feed-posts">
            {posts.map((post, index) => (
              <PostCard
                key={post.postId}
                post={post}
                animationDelay={index * 80}
              />
            ))}
          </div>

          {/* Load more */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="btn btn--secondary"
            >
              {loadingMore ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTopColor: "var(--text-primary)",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </button>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .feed-page {
          padding-top: var(--nav-height);
          min-height: 100vh;
        }

        .feed-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.75rem;
          align-items: start;
        }

        .feed-sidebar {
          position: sticky;
          top: calc(var(--nav-height) + 1.5rem);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feed-sidebar__card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.125rem;
        }

        .feed-sidebar__avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--brand-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 auto 0.75rem;
        }

        .feed-sidebar__username {
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .feed-sidebar__label {
          text-align: center;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .feed-sidebar__section-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .feed-sidebar__characters {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .feed-sidebar__character {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .feed-header {
          margin-bottom: 1.5rem;
        }

        .feed-header__title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .feed-header__subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .feed-main {
          min-width: 0;
        }

        .feed-posts {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .feed-layout {
            grid-template-columns: 1fr;
          }
          .feed-sidebar {
            position: static;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .feed-sidebar__card:first-child {
            grid-column: span 2;
          }
        }

        @media (max-width: 480px) {
          .feed-sidebar {
            grid-template-columns: 1fr;
          }
          .feed-sidebar__card:first-child {
            grid-column: span 1;
          }
        }
      `}</style>
    </main>
  );
}