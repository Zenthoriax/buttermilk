"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  fetchAuthSession,
} from "aws-amplify/auth";

import OnboardingShell from "@/components/onboarding/OnboardingShell";

type PairState =
  | "idle"
  | "checking"
  | "pairing"
  | "success"
  | "error";

type ExtensionResponse = {
  ok?: boolean;
  type?: string;
  paired?: boolean;
  error?: string;
};

export default function ConnectExtensionPage() {
  const router =
    useRouter();

  const [
    state,
    setState,
  ] =
    useState<PairState>(
      "idle"
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      "Waiting for your Outcognito extension."
    );

  const extensionId =
    process.env
      .NEXT_PUBLIC_EXTENSION_ID;

  const API_BASE =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.replace(
        /\/$/,
        ""
      );

  function sendExtensionMessage(
    message:
      unknown
  ): Promise<ExtensionResponse> {
    return new Promise(
      (
        resolve,
        reject
      ) => {
        if (
          typeof chrome ===
            "undefined" ||
          !chrome.runtime
        ) {
          reject(
            new Error(
              "Chrome extension messaging is unavailable."
            )
          );

          return;
        }

        if (
          !extensionId
        ) {
          reject(
            new Error(
              "NEXT_PUBLIC_EXTENSION_ID is missing."
            )
          );

          return;
        }

        chrome.runtime
          .sendMessage(
            extensionId,
            message,
            (
              response:
                ExtensionResponse
            ) => {
              if (
                chrome.runtime
                  .lastError
              ) {
                reject(
                  new Error(
                    chrome.runtime
                      .lastError
                      .message
                  )
                );

                return;
              }

              resolve(
                response ||
                  {}
              );
            }
          );
      }
    );
  }

  async function connectExtension() {
    try {
      setState(
        "checking"
      );

      setMessage(
        "Looking for Outcognito..."
      );

      const pingResponse =
        await sendExtensionMessage({
          type:
            "OUTCOGNITO_PING",
        });

      if (
        !pingResponse.ok
      ) {
        throw new Error(
          pingResponse.error ||
            "Extension did not respond."
        );
      }

      setState(
        "pairing"
      );

      setMessage(
        "Pairing this browser with your account..."
      );

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
          "No Cognito access token found."
        );
      }

      if (
        !API_BASE
      ) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is missing."
        );
      }

      const pairResponse =
        await sendExtensionMessage({
          type:
            "OUTCOGNITO_PAIR",

          payload: {
            accessToken,

            apiBaseUrl:
              API_BASE,

            pairedAt:
              new Date()
                .toISOString(),
          },
        });

      if (
        !pairResponse.ok ||
        !pairResponse.paired
      ) {
        throw new Error(
          pairResponse.error ||
            "Extension rejected pairing."
        );
      }

      setState(
        "success"
      );

      setMessage(
        "Connected. Your browser is now part of society."
      );
    } catch (
      error
    ) {
      console.error(
        "Extension pairing failed:",
        error
      );

      setState(
        "error"
      );

      setMessage(
        error instanceof
          Error
          ? error.message
          : "Unable to connect extension."
      );
    }
  }

  return (
    <OnboardingShell
      step="02 / 02"
      eyebrow="Browser connection"
      title="Connect your browser."
      description="The extension observes privacy-safe behavior patterns and sends only structured incidents to Outcognito."
    >
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] font-mono text-[9px] text-white/60">
            EXT
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "h-2 w-2 rounded-full",

                  state ===
                  "success"
                    ? "bg-emerald-400"
                    : state ===
                        "error"
                      ? "bg-red-400"
                      : state ===
                            "checking" ||
                          state ===
                            "pairing"
                        ? "animate-pulse bg-white/60"
                        : "bg-white/20",
                ].join(" ")}
              />

              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                {state ===
                "success"
                  ? "connected"
                  : state ===
                      "error"
                    ? "connection error"
                    : state ===
                          "checking" ||
                        state ===
                          "pairing"
                      ? "connecting"
                      : "not connected"}
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-white/40">
              {message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-white/[0.06]">
          {[
            "No keystrokes",
            "No messages",
            "No page text",
          ].map(
            (item) => (
              <div
                key={
                  item
                }
                className="border-r border-white/[0.06] px-2 py-3 text-center font-mono text-[7px] uppercase tracking-[0.1em] text-white/20 last:border-r-0"
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>

      {state !==
        "success" && (
        <button
          type="button"
          onClick={
            connectExtension
          }
          disabled={
            state ===
              "checking" ||
            state ===
              "pairing"
          }
          className="mt-5 w-full rounded-xl bg-white px-5 py-3.5 text-[12px] font-medium text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {state ===
          "checking"
            ? "Finding extension..."
            : state ===
                "pairing"
              ? "Pairing account..."
              : "Connect extension"}
        </button>
      )}

      {state ===
        "success" && (
        <button
          type="button"
          onClick={() =>
            router.push(
              "/feed"
            )
          }
          className="mt-5 w-full rounded-xl bg-white px-5 py-3.5 text-[12px] font-medium text-black transition hover:bg-white/85"
        >
          Enter society
        </button>
      )}

      {state ===
        "error" && (
        <button
          type="button"
          onClick={() =>
            router.push(
              "/feed"
            )
          }
          className="mt-3 w-full py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/25 transition hover:text-white/60"
        >
          Continue without reconnecting
        </button>
      )}
    </OnboardingShell>
  );
}