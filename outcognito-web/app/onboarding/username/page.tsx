"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";

import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default function UsernamePage() {
  const router =
    useRouter();

  const [
    username,
    setUsername,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    checking,
    setChecking,
  ] =
    useState(true);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    authenticated,
    setAuthenticated,
  ] =
    useState(false);

  const API_BASE =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.replace(
        /\/$/,
        ""
      ) ?? "";

  useEffect(() => {
    async function checkUser() {
      try {
        await getCurrentUser();

        const session =
          await fetchAuthSession();

        const accessToken =
          session.tokens
            ?.accessToken
            ?.toString();

        if (
          !accessToken
        ) {
          throw new Error(
            "Access token unavailable."
          );
        }

        setAuthenticated(
          true
        );

        const response =
          await fetch(
            `${API_BASE}/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ||
              "Unable to check profile."
          );
        }

        if (
          data.profileExists
        ) {
          router.replace(
            "/onboarding/connect-extension"
          );

          return;
        }
      } catch (
        error
      ) {
        console.error(
          error
        );

        setMessage(
          "Unable to verify your account."
        );
      } finally {
        setChecking(
          false
        );
      }
    }

    void checkUser();
  }, [
    router,
    API_BASE,
  ]);

  async function handleSubmit(
    event:
      FormEvent
  ) {
    event.preventDefault();

    setMessage("");

    const normalized =
      username
        .trim()
        .toLowerCase();

    if (
      normalized.length <
      3
    ) {
      setMessage(
        "Username must contain at least 3 characters."
      );

      return;
    }

    if (
      normalized.length >
      20
    ) {
      setMessage(
        "Username cannot exceed 20 characters."
      );

      return;
    }

    if (
      !/^[a-z0-9_]+$/.test(
        normalized
      )
    ) {
      setMessage(
        "Use only letters, numbers and underscores."
      );

      return;
    }

    try {
      setLoading(true);

      const session =
        await fetchAuthSession();

      const accessToken =
        session.tokens
          ?.accessToken
          ?.toString();

      if (
        !accessToken
      ) {
        throw new Error(
          "Authentication token unavailable."
        );
      }

      const response =
        await fetch(
          `${API_BASE}/me`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify({
                username:
                  normalized,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        setMessage(
          data.error ||
            "Unable to create profile."
        );

        return;
      }

      router.push(
        "/onboarding/connect-extension"
      );
    } catch (
      error
    ) {
      console.error(
        "Username creation failed:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  if (
    checking
  ) {
    return (
      <OnboardingShell
        step="01 / 02"
        eyebrow="Identity"
        title="Finding your profile."
        description="Outcognito is checking whether you already have a public identity."
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/40" />

          <span className="text-[12px] text-white/40">
            Checking account...
          </span>
        </div>
      </OnboardingShell>
    );
  }

  if (
    !authenticated
  ) {
    return (
      <OnboardingShell
        step="01 / 02"
        eyebrow="Identity"
        title="Sign in required."
        description="Your Outcognito identity must be connected to a Cognito account."
      >
        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          className="w-full rounded-xl bg-white px-5 py-3 text-[12px] font-medium text-black"
        >
          Return home
        </button>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step="01 / 02"
      eyebrow="Identity"
      title="Choose your handle."
      description="This becomes your public identity whenever your browser creates an incident."
    >
      <form
        onSubmit={
          handleSubmit
        }
      >
        <div className="rounded-xl border border-white/[0.09] bg-white/[0.025] transition focus-within:border-white/20 focus-within:bg-white/[0.04]">
          <div className="flex items-center px-4">
            <span className="font-mono text-[13px] text-white/25">
              @
            </span>

            <input
              type="text"
              value={
                username
              }
              onChange={(
                event
              ) =>
                setUsername(
                  event
                    .target
                    .value
                )
              }
              placeholder="zenthoriax"
              maxLength={
                20
              }
              autoComplete="off"
              disabled={
                loading
              }
              className="min-w-0 flex-1 bg-transparent px-2 py-4 text-[14px] text-white/85 outline-none placeholder:text-white/15"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.12em] text-white/20">
          <span>
            letters · numbers · _
          </span>

          <span>
            {username.length}
            /20
          </span>
        </div>

        {message && (
          <div className="mt-5 rounded-lg border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-[11px] text-red-300/70">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            username
              .trim()
              .length <
              3
          }
          className="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-[12px] font-medium text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading
            ? "Creating identity..."
            : "Continue"}
        </button>
      </form>
    </OnboardingShell>
  );
}