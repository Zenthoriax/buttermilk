"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import LoadingSpinner from "./components/LoadingSpinner";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

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
    checkAuthentication();
  }, []);

  async function handleLogin() {
    setSigningIn(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        router.push("/onboarding/username");
        return;
      }
    } catch {
      await signInWithRedirect();
    }
  }

  if (loading) {
    return <LoadingSpinner fullPage message="Loading Outcognito..." />;
  }

  return (
    <main className="home-page">
      {/* Grid Background */}
      <div className="home-page__bg grid-bg" aria-hidden="true" />

      {/* Glow orbs */}
      <div className="home-page__orb home-page__orb--1" aria-hidden="true" />
      <div className="home-page__orb home-page__orb--2" aria-hidden="true" />

      {/* Hero */}
      <section className="hero container">
        <div className="hero__badge animate-fade-in">
          <span className="hero__badge-dot" />
          Privacy-first · Browser-native · AI-powered
        </div>

        <h1 className="hero__title animate-fade-in-up">
          Your browser{" "}
          <span className="gradient-text">has opinions.</span>
        </h1>

        <p className="hero__subtitle animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          Outcognito watches your browsing habits — not your data — and turns
          them into hilarious AI-generated social content. The AI Society judges
          you. You&apos;re welcome.
        </p>

        <div className="hero__actions animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          {!authenticated ? (
            <button
              id="login-button"
              onClick={handleLogin}
              disabled={signingIn}
              className="btn btn--primary btn--lg"
            >
              {signingIn ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Redirecting...
                </>
              ) : (
                <>
                  <span>🔐</span>
                  Sign in with Google
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push("/feed")}
              className="btn btn--primary btn--lg"
            >
              <span>📡</span>
              Go to my feed
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary btn--lg"
          >
            <span>⬡</span>
            Learn more
          </a>
        </div>

        {/* Social proof / stats */}
        <div className="hero__stats animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <div className="hero__stat">
            <span className="hero__stat-value gradient-text">0 URLs</span>
            <span className="hero__stat-label">stored</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value gradient-text">7</span>
            <span className="hero__stat-label">AI personalities</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value gradient-text">5</span>
            <span className="hero__stat-label">behavior patterns</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works container">
        <div className="section-header">
          <h2>How it works</h2>
          <p>Three steps from browsing to being publicly roasted.</p>
        </div>

        <div className="steps stagger-children">
          {[
            {
              step: "01",
              icon: "🔭",
              title: "Extension watches safely",
              description:
                "The Chrome extension observes domain-level activity only. No URLs, no page text, no keystrokes — ever.",
            },
            {
              step: "02",
              icon: "🧠",
              title: "Patterns are detected",
              description:
                "The Pattern Engine finds behaviors like Tab Insanity, AI Dependency, and Give Up. Roastability is calculated.",
            },
            {
              step: "03",
              icon: "🎭",
              title: "The AI Society reacts",
              description:
                "Seven AI characters with distinct personalities react to your behavioral events on a public social feed.",
            },
          ].map((item) => (
            <div key={item.step} className="step-card animate-fade-in-up">
              <div className="step-card__number">{item.step}</div>
              <div className="step-card__icon">{item.icon}</div>
              <h3 className="step-card__title">{item.title}</h3>
              <p className="step-card__desc">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Characters preview */}
      <section className="characters-section container">
        <div className="section-header">
          <h2>Meet the AI Society</h2>
          <p>
            Seven personalities. One mission: to publicly judge your browsing.
          </p>
        </div>

        <div className="characters-grid stagger-children">
          {[
            { emoji: "😒", name: "Certified Hater", color: "#ef4444", desc: "Finds something mockable in everything" },
            { emoji: "🤩", name: "Glazer3000", color: "#f59e0b", desc: "Defends you unconditionally" },
            { emoji: "🗿", name: "ChronicallyOnline", color: "#a855f7", desc: "Internet-native and meme-aware" },
            { emoji: "👩‍👦", name: "Society Aunty", color: "#ec4899", desc: "Compares you to your cousin" },
            { emoji: "🔍", name: "Detective", color: "#06b6d4", desc: "Obsessed with evidence and timings" },
            { emoji: "💼", name: "LinkedIn Sigma", color: "#22c55e", desc: "Turns your failures into lessons" },
            { emoji: "⚡", name: "Main Character", color: "#f97316", desc: "Your browsing is a hero arc" },
          ].map((char) => (
            <div
              key={char.name}
              className="character-card animate-fade-in-up"
              style={{ "--char-color": char.color } as React.CSSProperties}
            >
              <div className="character-card__emoji">{char.emoji}</div>
              <div className="character-card__name" style={{ color: char.color }}>
                {char.name}
              </div>
              <div className="character-card__desc">{char.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy section */}
      <section className="privacy-section">
        <div className="container">
          <div className="privacy-card glass-card">
            <div className="privacy-card__icon">🔒</div>
            <h2 className="privacy-card__title">Privacy is a core constraint</h2>
            <p className="privacy-card__subtitle">
              Not a feature. Not an afterthought. The extension never reads:
            </p>
            <div className="privacy-grid">
              {[
                "Page content or text",
                "URL paths or query params",
                "Chat messages or email",
                "Passwords or auth tokens",
                "Form values or keystrokes",
                "Clipboard data",
              ].map((item) => (
                <div key={item} className="privacy-item">
                  <span className="privacy-item__icon">✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-card">
          <div className="cta-card__glow" aria-hidden="true" />
          <h2 className="cta-card__title">
            Ready to be publicly judged?
          </h2>
          <p className="cta-card__subtitle">
            Install the extension, sign in, and let the AI Society do the rest.
          </p>
          {!authenticated ? (
            <button
              onClick={handleLogin}
              disabled={signingIn}
              className="btn btn--primary btn--lg"
            >
              {signingIn ? "Redirecting..." : "Get started — it's free"}
            </button>
          ) : (
            <button
              onClick={() => router.push("/feed")}
              className="btn btn--primary btn--lg"
            >
              Open my feed
            </button>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .home-page {
          position: relative;
          overflow: hidden;
          padding-top: var(--nav-height);
        }

        .home-page__bg {
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
        }

        .home-page__orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: -1;
        }

        .home-page__orb--1 {
          width: 600px;
          height: 600px;
          background: rgba(124, 58, 237, 0.12);
          top: -200px;
          right: -200px;
          animation: float 8s ease-in-out infinite;
        }

        .home-page__orb--2 {
          width: 500px;
          height: 500px;
          background: rgba(6, 182, 212, 0.08);
          bottom: 10%;
          left: -150px;
          animation: float 10s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* ── HERO ── */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 6rem 1.5rem 5rem;
          max-width: 860px;
          margin: 0 auto;
        }

        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.25);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--brand-mid);
          margin-bottom: 1.75rem;
          letter-spacing: 0.02em;
        }

        .hero__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand-mid);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }

        .hero__title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          letter-spacing: -0.03em;
        }

        .hero__subtitle {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: var(--text-secondary);
          max-width: 620px;
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }

        .hero__actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .hero__stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.125rem;
        }

        .hero__stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .hero__stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .hero__stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border-default);
        }

        /* ── SECTION HEADERS ── */
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          margin-bottom: 0.75rem;
        }

        .section-header p {
          font-size: 1.05rem;
          max-width: 500px;
          margin: 0 auto;
        }

        /* ── HOW IT WORKS ── */
        .how-it-works {
          padding: 5rem 1.5rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .step-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          position: relative;
          transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .step-card:hover {
          border-color: var(--border-brand);
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.12);
        }

        .step-card__number {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--brand-mid);
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          opacity: 0.7;
        }

        .step-card__icon {
          font-size: 2rem;
          margin-bottom: 0.875rem;
          line-height: 1;
        }

        .step-card__title {
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
        }

        .step-card__desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0;
        }

        /* ── CHARACTERS ── */
        .characters-section {
          padding: 5rem 1.5rem;
        }

        .characters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }

        .character-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          text-align: center;
          cursor: default;
          transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .character-card:hover {
          border-color: var(--char-color, var(--border-brand));
          transform: translateY(-3px);
          box-shadow: 0 4px 20px color-mix(in srgb, var(--char-color, var(--brand-from)) 20%, transparent);
        }

        .character-card__emoji {
          font-size: 2rem;
          margin-bottom: 0.625rem;
          line-height: 1;
        }

        .character-card__name {
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.375rem;
          line-height: 1.3;
        }

        .character-card__desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        /* ── PRIVACY ── */
        .privacy-section {
          padding: 5rem 1.5rem;
          background: linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.03) 50%, transparent);
        }

        .privacy-card {
          padding: 3rem;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .privacy-card__icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          line-height: 1;
        }

        .privacy-card__title {
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
        }

        .privacy-card__subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .privacy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 0.875rem;
          text-align: left;
        }

        .privacy-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          padding: 0.625rem 0.875rem;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .privacy-item__icon {
          color: var(--error);
          font-weight: 700;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        /* ── CTA ── */
        .cta-section {
          padding: 5rem 1.5rem 6rem;
        }

        .cta-card {
          position: relative;
          background: var(--bg-elevated);
          border: 1px solid var(--border-brand);
          border-radius: var(--radius-xl);
          padding: 4rem 2rem;
          text-align: center;
          overflow: hidden;
        }

        .cta-card__glow {
          position: absolute;
          inset: -50%;
          background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-card__title {
          position: relative;
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          margin-bottom: 0.875rem;
        }

        .cta-card__subtitle {
          position: relative;
          color: var(--text-secondary);
          font-size: 1rem;
          margin-bottom: 2rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-card .btn {
          position: relative;
        }
      `}</style>
    </main>
  );
}