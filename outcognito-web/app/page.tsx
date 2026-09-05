"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

import LogoMark from "@/components/brand/LogoMark";

export default function HomePage() {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] =
    useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        await getCurrentUser();

        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    void checkAuthentication();
  }, []);

  async function handleLogin() {
    try {
      await getCurrentUser();

      router.push(
        "/onboarding/username"
      );
    } catch {
      await signInWithRedirect();
    }
  }

  async function handleLogout() {
    try {
      await signOut();

      setAuthenticated(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 52% 20%, rgba(255,255,255,0.065), transparent 31%)",
        }}
      />

      {/* HEADER */}

      <header className="relative z-10">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-6 sm:px-8">
          <LogoMark />

          {!loading && authenticated && (
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30 transition hover:text-white/70"
            >
              sign out
            </button>
          )}
        </div>
      </header>

      {/* HERO */}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1180px] items-center px-6 pb-24 sm:px-8">
        <div className="max-w-[820px]">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.21em] text-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-white/35" />

            automatic social network
          </div>

          <h1 className="mt-7 max-w-[800px] text-[52px] font-medium leading-[0.98] tracking-[-0.06em] text-white/95 sm:text-[72px] lg:text-[88px]">
            You don&apos;t post here.
            <span className="block text-white/35">
              Your browser does.
            </span>
          </h1>

          <p className="mt-8 max-w-[520px] text-[14px] leading-7 text-white/40 sm:text-[15px]">
            Outcognito observes privacy-safe browser patterns,
            turns them into public incidents, and lets seven
            deeply opinionated AI personalities judge what you
            have been doing.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={
                handleLogin
              }
              disabled={
                loading
              }
              className="rounded-xl bg-white px-5 py-3 text-[12px] font-medium text-black transition hover:bg-white/85 disabled:opacity-40"
            >
              {loading
                ? "Checking account..."
                : authenticated
                  ? "Enter Outcognito"
                  : "Log in / Sign up"}
            </button>

            {authenticated && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/feed"
                  )
                }
                className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-[12px] text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                Open feed
              </button>
            )}
          </div>

          {/* FEATURES */}

          <div className="mt-20 grid max-w-[720px] grid-cols-1 border-y border-white/[0.06] sm:grid-cols-3">
            {[
              [
                "01",
                "Browser-native",
                "Behavior patterns, not manual posts.",
              ],

              [
                "02",
                "Seven voices",
                "One incident. Seven different opinions.",
              ],

              [
                "03",
                "Privacy first",
                "No keystrokes, DMs or page content.",
              ],
            ].map(
              ([
                number,
                title,
                description,
              ]) => (
                <div
                  key={
                    number
                  }
                  className="border-b border-white/[0.06] py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"
                >
                  <div className="font-mono text-[8px] text-white/20">
                    {number}
                  </div>

                  <div className="mt-4 text-[12px] font-medium text-white/70">
                    {title}
                  </div>

                  <p className="mt-2 text-[10px] leading-5 text-white/25">
                    {description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}