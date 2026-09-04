"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// The extension ID from the built MV3 extension.
// Replace this with the actual Extension ID once loaded in Chrome.
const EXTENSION_ID = "YOUR_EXTENSION_ID_HERE";

type PairStatus = "idle" | "pairing" | "success" | "error" | "not_installed";

export default function ConnectExtensionPage() {
  const router = useRouter();
  const [pairStatus, setPairStatus] = useState<PairStatus>("idle");
  const [pairMessage, setPairMessage] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [extensionId, setExtensionId] = useState<string>("");

  useEffect(() => {
    const savedId = typeof window !== "undefined" ? localStorage.getItem("outcognito_extension_id") || "" : "";
    setExtensionId(savedId);

    async function loadUser() {
      try {
        await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.profile?.username ?? null);
        }
      } catch {
        // Not authenticated — will be caught elsewhere
      }
    }

    loadUser();
  }, []);

  async function handlePair() {
    setPairStatus("pairing");
    setPairMessage("");

    const targetId = extensionId.trim();
    if (!targetId) {
      setPairStatus("error");
      setPairMessage("Please enter your Extension ID from chrome://extensions");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("outcognito_extension_id", targetId);
    }

    try {
      // Get fresh auth token (or fallback mock token if offline mode)
      let accessToken = "dev-offline-test-token-123";
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (token) accessToken = token;
      } catch {
        console.log("Using local offline pairing token for development testing.");
      }

      // Check if chrome.runtime is available (extension installed)
      if (
        typeof chrome === "undefined" ||
        !chrome.runtime ||
        !chrome.runtime.sendMessage
      ) {
        setPairStatus("not_installed");
        setPairMessage(
          "The Outcognito extension is not installed or not detected in this browser."
        );
        return;
      }

      // Send PAIR message to the extension via Chrome external messaging
      chrome.runtime.sendMessage(
        targetId,
        {
          type: "PAIR",
          token: accessToken,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            setPairStatus("error");
            setPairMessage(
              chrome.runtime.lastError.message ||
                "Could not reach the extension. Make sure the Extension ID is correct and enabled."
            );
            return;
          }

          if (response?.success) {
            setPairStatus("success");
            setPairMessage("Extension paired successfully!");

            setTimeout(() => {
              router.push(username ? `/${username}` : "/feed");
            }, 1200);
          } else {
            setPairStatus("error");
            setPairMessage(
              response?.error ||
                "Pairing was rejected by the extension. Check the extension ID."
            );
          }
        }
      );
    } catch (err) {
      setPairStatus("error");
      setPairMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  }

  const steps = [
    {
      icon: "⬡",
      title: "Open Chrome Web Store",
      description:
        "Search for \"Outcognito\" or ask your teammate for the unpacked extension folder.",
      action: null,
    },
    {
      icon: "🔧",
      title: "Install the extension",
      description:
        "Click \"Add to Chrome\". For the unpacked version: go to chrome://extensions → Developer Mode → Load unpacked.",
      action: null,
    },
    {
      icon: "🔗",
      title: "Pair with this account",
      description:
        "Click the button below to send your auth token to the installed extension.",
      action: (
        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
              Chrome Extension ID (from <code>chrome://extensions</code>):
            </label>
            <input
              type="text"
              placeholder="e.g. gabcdefghijklmnopqrstuvwxyz"
              value={extensionId}
              onChange={(e) => setExtensionId(e.target.value)}
              className="input"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                fontSize: "0.85rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "#fff",
                fontFamily: "monospace",
              }}
            />
          </div>
          <button
            id="pair-button"
            onClick={handlePair}
            disabled={pairStatus === "pairing" || pairStatus === "success"}
            className="btn btn--primary"
            style={{ alignSelf: "flex-start" }}
          >
            {pairStatus === "pairing" ? (
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
                Pairing...
              </>
            ) : pairStatus === "success" ? (
              <>✓ Paired!</>
            ) : (
              <>🔗 Pair extension</>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-center">
      <div
        className="animate-fade-in-up"
        style={{ width: "100%", maxWidth: 520, padding: "0 1rem" }}
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
            <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background:
                    step === 1
                      ? "var(--bg-muted)"
                      : step === 2
                      ? "var(--bg-muted)"
                      : "var(--brand-gradient)",
                  border: step === 3 ? "none" : "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: step === 3 ? "0.85rem" : "0.72rem",
                  fontWeight: 700,
                  color: step === 3 ? "#fff" : "var(--text-muted)",
                }}
              >
                {step < 3 ? "✓" : step}
              </div>
              {step < 3 && (
                <div style={{ width: 32, height: 1, background: "var(--success)", opacity: 0.4 }} />
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
              🔌
            </div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Connect your extension
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
              Pair the Outcognito Chrome extension with{" "}
              {username ? (
                <strong style={{ color: "var(--brand-mid)" }}>@{username}</strong>
              ) : (
                "your account"
              )}{" "}
              to start sending behavioral events.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(124, 58, 237, 0.12)",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </p>
                  {step.action}
                </div>
              </div>
            ))}
          </div>

          {/* Status message */}
          {pairMessage && (
            <div
              className={`message message--${
                pairStatus === "success"
                  ? "success"
                  : pairStatus === "not_installed"
                  ? "info"
                  : "error"
              }`}
              style={{ marginBottom: "1rem" }}
            >
              <span>
                {pairStatus === "success"
                  ? "✓"
                  : pairStatus === "not_installed"
                  ? "ℹ"
                  : "⚠"}
              </span>
              {pairMessage}
            </div>
          )}

          {/* Skip / continue */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => router.push(username ? `/${username}` : "/feed")}
              className="btn btn--ghost btn--sm"
            >
              Skip for now — go to feed →
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}