"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import LogoMark from "@/components/brand/LogoMark";

import PostCard from "@/components/feed/PostCard";

import type {
  FeedPost,
  FeedResponse,
} from "@/types/feed";

export default function ProfilePage() {
  const params =
    useParams<{
      username:
        string;
    }>();

  const username =
    decodeURIComponent(
      params.username ||
        ""
    );

  const [
    posts,
    setPosts,
  ] =
    useState<
      FeedPost[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const API_BASE =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.replace(
        /\/$/,
        ""
      ) ?? "";

  const loadProfile =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `${API_BASE}/feed`,
              {
                cache:
                  "no-store",
              }
            );

          const data:
            FeedResponse =
            await response.json();

          setPosts(
            Array.isArray(
              data.posts
            )
              ? data.posts
              : []
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        API_BASE,
      ]
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadProfile();
        },
        0
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    loadProfile,
  ]);

  const userPosts =
    useMemo(
      () =>
        posts.filter(
          (
            post
          ) =>
            post.username
              ?.toLowerCase() ===
            username
              .toLowerCase()
        ),
      [
        posts,
        username,
      ]
    );

  const mostCommonCategory =
    useMemo(() => {
      const counts:
        Record<
          string,
          number
        > = {};

      for (
        const post
        of userPosts
      ) {
        counts[
          post.category
        ] =
          (
            counts[
              post.category
            ] ||
            0
          ) +
          1;
      }

      return (
        Object.entries(
          counts
        ).sort(
          (
            a,
            b
          ) =>
            b[1] -
            a[1]
        )[0]?.[0] ||
        "unknown"
      );
    }, [
      userPosts,
    ]);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-[920px] items-center justify-between px-5 sm:px-7">
          <LogoMark
            href="/feed"
          />

          <Link
            href="/feed"
            className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25 transition hover:text-white/60"
          >
            ← feed
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[780px] border-x border-white/[0.055]">
        <section className="border-b border-white/[0.065] px-5 py-10 sm:px-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-mono text-[11px] uppercase text-white/55">
              {username
                .slice(
                  0,
                  2
                )}
            </div>

            <div>
              <h1 className="text-[20px] font-medium tracking-[-0.025em] text-white/90">
                @{username}
              </h1>

              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/20">
                public browser persona
              </div>
            </div>
          </div>

          {!loading && (
            <div className="mt-8 grid grid-cols-2 border-y border-white/[0.06] sm:grid-cols-3">
              <div className="py-4 sm:border-r sm:border-white/[0.06]">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/20">
                  incidents
                </div>

                <div className="mt-2 text-[16px] text-white/70">
                  {
                    userPosts.length
                  }
                </div>
              </div>

              <div className="py-4 sm:border-r sm:border-white/[0.06] sm:px-5">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/20">
                  primary niche
                </div>

                <div className="mt-2 text-[13px] capitalize text-white/60">
                  {
                    mostCommonCategory
                  }
                </div>
              </div>

              <div className="hidden py-4 sm:block sm:px-5">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/20">
                  posting method
                </div>

                <div className="mt-2 text-[13px] text-white/60">
                  automatic
                </div>
              </div>
            </div>
          )}
        </section>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center font-mono text-[9px] uppercase tracking-[0.14em] text-white/20">
            loading incidents...
          </div>
        ) : userPosts.length >
          0 ? (
          userPosts.map(
            (
              post
            ) => (
              <PostCard
                key={
                  post.postId
                }
                post={
                  post
                }
              />
            )
          )
        ) : (
          <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/20">
                no public incidents
              </div>

              <p className="mt-3 text-[12px] text-white/35">
                Society has nothing on @{username} yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}