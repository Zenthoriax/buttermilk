"use client";

import "aws-amplify/auth/enable-oauth-listener";

import {
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

export default function CallbackPage() {
  const router =
    useRouter();

  const [
    message,
    setMessage,
  ] =
    useState(
      "Completing authentication..."
    );

  useEffect(() => {
    let cancelled =
      false;

    async function finishLogin() {
      for (
        let attempt = 0;
        attempt < 20;
        attempt++
      ) {
        try {
          const session =
            await fetchAuthSession();

          if (
            session.tokens
              ?.accessToken
          ) {
            await getCurrentUser();

            if (
              !cancelled
            ) {
              setMessage(
                "Authenticated. Preparing your account..."
              );

              router.replace(
                "/onboarding/username"
              );
            }

            return;
          }
        } catch {
          // Cognito OAuth exchange may still be finishing.
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              250
            )
        );
      }

      if (
        !cancelled
      ) {
        setMessage(
          "Authentication could not be completed. Return home and try again."
        );
      }
    }

    void finishLogin();

    return () => {
      cancelled =
        true;
    };
  }, [router]);

  return (
    <OnboardingShell
      eyebrow="Authentication"
      title="Entering society."
      description="Cognito is verifying your session before Outcognito opens your profile."
    >
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/45" />

          <p className="text-[12px] text-white/45">
            {message}
          </p>
        </div>
      </div>
    </OnboardingShell>
  );
}