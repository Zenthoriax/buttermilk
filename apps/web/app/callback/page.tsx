"use client";

import "aws-amplify/auth/enable-oauth-listener";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing authentication...");

  useEffect(() => {
    let cancelled = false;

    async function finishLogin() {
      for (let attempt = 0; attempt < 20; attempt++) {
        try {
          const session = await fetchAuthSession();

          if (session.tokens?.accessToken) {
            const user = await getCurrentUser();
            console.log("Authenticated user:", user.userId);

            if (!cancelled) {
              setStatus("success");
              setMessage("Authenticated successfully. Redirecting...");
              setTimeout(() => {
                router.replace("/onboarding/username");
              }, 600);
            }

            return;
          }
        } catch {
          // OAuth exchange still completing, keep waiting.
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!cancelled) {
        setStatus("error");
        setMessage(
          "Authentication could not be completed. Please return home and try again."
        );
      }
    }

    finishLogin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 400,
          animation: "fadeIn 0.4s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "2.5rem",
            marginBottom: "1.5rem",
            lineHeight: 1,
          }}
        >
          ⬡
        </div>

        {/* Spinner or success/error icon */}
        {status === "loading" && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(124, 58, 237, 0.2)",
              borderTopColor: "var(--brand-from)",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1.5rem",
            }}
          />
        )}

        {status === "success" && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--success-bg)",
              border: "1.5px solid rgba(34, 197, 94, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 1.5rem",
            }}
          >
            ✓
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--error-bg)",
              border: "1.5px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 1.5rem",
            }}
          >
            ✕
          </div>
        )}

        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          {status === "loading"
            ? "Signing you in..."
            : status === "success"
            ? "Welcome to Outcognito"
            : "Authentication failed"}
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        {status === "error" && (
          <a
            href="/"
            className="btn btn--secondary"
            style={{ marginTop: "1.5rem", display: "inline-flex" }}
          >
            ← Return home
          </a>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}