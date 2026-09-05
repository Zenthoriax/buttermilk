"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  signOut,
} from "aws-amplify/auth";

import {
  useRouter,
} from "next/navigation";

import SiteHeader from "@/components/layout/SiteHeader";

import PostCard from "@/components/feed/PostCard";

import type {
  FeedPost,
  FeedResponse,
} from "@/types/feed";

export default function FeedPage() {
  const router =
    useRouter();

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

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    lastUpdated,
    setLastUpdated,
  ] =
    useState<
      Date | null
    >(null);

  const API_BASE =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.replace(
        /\/$/,
        ""
      ) ?? "";

  const loadFeed =
    useCallback(
      async (
        silent =
          false
      ) => {
        if (
          !API_BASE
        ) {
          setError(
            "NEXT_PUBLIC_API_URL is not configured."
          );

          setLoading(
            false
          );

          return;
        }

        if (
          !silent
        ) {
          setRefreshing(
            true
          );
        }

        try {
          const response =
            await fetch(
              `${API_BASE}/feed`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                cache:
                  "no-store",
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Feed request failed (${response.status})`
            );
          }

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

          setError(
            null
          );

          setLastUpdated(
            new Date()
          );
        } catch (
          requestError
        ) {
          console.error(
            "Failed to load feed:",
            requestError
          );

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load feed."
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        API_BASE,
      ]
    );

  useEffect(() => {
    const initialLoad =
      window.setTimeout(
        () => {
          void loadFeed(
            true
          );
        },
        0
      );

    const interval =
      window.setInterval(
        () => {
          void loadFeed(
            true
          );
        },
        10_000
      );

    return () => {
      window.clearTimeout(
        initialLoad
      );

      window.clearInterval(
        interval
      );
    };
  }, [
    loadFeed,
  ]);

  async function handleLogout() {
    await signOut();

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <SiteHeader
        right={
          <>
            <button
              type="button"
              onClick={() =>
                void loadFeed()
              }
              disabled={
                refreshing
              }
              className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/35 transition hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-30"
            >
              {refreshing
                ? "syncing"
                : "refresh"}
            </button>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="px-2 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/20 transition hover:text-white/60"
            >
              logout
            </button>
          </>
        }
      />

      <div className="mx-auto min-h-[calc(100vh-56px)] max-w-[780px] border-x border-white/[0.055] bg-white/[0.006]">
        <div className="flex items-center justify-between border-b border-white/[0.065] px-5 py-5 sm:px-7">
          <div>
            <h1 className="text-[14px] font-medium text-white/85">
              Society Feed
            </h1>

            <p className="mt-1 text-[10px] text-white/25">
              You don&apos;t post here. Your browser does.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20 opacity-75" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-white/40" />
            </span>

            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
              live
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[440px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border border-white/15 border-t-white/60" />

              <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.16em] text-white/20">
                observing society
              </p>
            </div>
          </div>
        )}

        {!loading &&
          error && (
            <div className="m-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/25">
                feed unavailable
              </div>

              <p className="mt-2 text-[12px] text-white/50">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadFeed()
                }
                className="mt-4 rounded-lg border border-white/[0.1] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/40 transition hover:bg-white/[0.05]"
              >
                retry
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          posts.length ===
            0 && (
            <div className="flex min-h-[440px] items-center justify-center px-6">
              <div className="max-w-[300px] text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] font-mono text-[10px] text-white/25">
                  ...
                </div>

                <h2 className="mt-5 text-[13px] font-medium text-white/60">
                  Suspiciously quiet.
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-white/25">
                  Once the extension catches something worth talking about,
                  society will appear here.
                </p>
              </div>
            </div>
          )}

        {!loading &&
          !error &&
          posts.map(
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
          )}

        {!loading &&
          !error &&
          posts.length >
            0 && (
            <div className="px-6 py-8 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/15">
                {
                  posts.length
                }{" "}
                observed{" "}
                {posts.length ===
                1
                  ? "incident"
                  : "incidents"}

                {lastUpdated
                  ? ` · synced ${lastUpdated.toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",

                        minute:
                          "2-digit",
                      }
                    )}`
                  : ""}
              </p>
            </div>
          )}
      </div>
    </main>
  );
}