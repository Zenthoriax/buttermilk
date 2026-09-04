"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  // ============================================================
  // CHECK EXISTING PROFILE
  // ============================================================
  useEffect(() => {
    async function checkUser() {
      try {
        await getCurrentUser();
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        if (!accessToken) {
          throw new Error("Access token unavailable.");
        }

        setAuthenticated(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/me`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to check profile.");
        }

        // User already has a profile — skip to connect extension
        if (data.profile?.username) {
          router.replace("/onboarding/connect-extension");
          return;
        }
      } catch (error) {
        console.error(error);
        setMessage({ type: "error", text: "Unable to verify your account. Please try signing in again." });
      } finally {
        setChecking(false);
      }
    }

    checkUser();
  }, [router]);

  // ============================================================
  // CREATE USERNAME
  // ============================================================
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const normalized = username.trim().toLowerCase();

    if (normalized.length < 3) {
      setMessage({ type: "error", text: "Username must contain at least 3 characters." });
      return;
    }
    if (normalized.length > 20) {
      setMessage({ type: "error", text: "Username cannot exceed 20 characters." });
      return;
    }
    if (!/^[a-z0-9_]+$/.test(normalized)) {
      setMessage({ type: "error", text: "Use only letters, numbers and underscores." });
      return;
    }

    try {
      setLoading(true);

      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error("Authentication token unavailable.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username: normalized }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Unable to create profile." });
        return;
      }

      setMessage({ type: "success", text: `@${normalized} secured! Redirecting...` });

      setTimeout(() => {
        router.push("/onboarding/connect-extension");
      }, 800);
    } catch (error) {
      console.error("Username creation failed:", error);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // RENDER — LOADING
  // ============================================================
  if (checking) {
    return (
      <div className="page-center">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid rgba(124, 58, 237, 0.2)",
              borderTopColor: "var(--brand-from)",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Checking your account...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — NOT AUTHENTICATED
  // ============================================================
  if (!authenticated) {
    return (
      <div className="page-center">
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            maxWidth: 380,
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔒</div>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Sign in required
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            You need to sign in before setting up your profile.
          </p>
          <a href="/" className="btn btn--primary">
            ← Go to sign in
          </a>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — FORM
  // ============================================================
  return (
    <div className="page-center">
      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "0 1rem",
        }}
      >
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: step === 1 ? "var(--brand-gradient)" : "var(--bg-muted)",
                  border: step === 1 ? "none" : "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: step === 1 ? "#fff" : "var(--text-muted)",
                }}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: "var(--border-subtle)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.875rem", lineHeight: 1 }}>
              🪪
            </div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Choose your username
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
              This becomes your Outcognito identity. Choose wisely — the AI
              Society will use it.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Input */}
            <div>
              <label
                htmlFor="username-input"
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.03em",
                }}
              >
                USERNAME
              </label>

              <div className="input-wrapper">
                <span className="input-prefix">@</span>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (message?.type === "error") setMessage(null);
                  }}
                  placeholder="zenthoriax"
                  maxLength={20}
                  autoComplete="off"
                  autoFocus
                  disabled={loading}
                  className={`input input--prefixed ${message?.type === "error" ? "input--error" : ""}`}
                />
              </div>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                3–20 characters · letters, numbers and underscores only
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`message message--${message.type}`}>
                <span>{message.type === "error" ? "⚠" : "✓"}</span>
                {message.text}
              </div>
            )}

            {/* Live preview */}
            {username.trim().length >= 3 && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(124, 58, 237, 0.08)",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  color: "var(--brand-mid)",
                  fontWeight: 500,
                }}
              >
                Your handle will be:{" "}
                <strong>@{username.trim().toLowerCase()}</strong>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="username-submit"
              disabled={loading || username.trim().length < 3}
              className="btn btn--primary"
              style={{ marginTop: "0.25rem" }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Creating profile...
                </>
              ) : (
                "Continue →"
              )}
            </button>
          </form>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}