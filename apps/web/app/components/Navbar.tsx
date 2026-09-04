"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, signOut } from "aws-amplify/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        await getCurrentUser();
        setAuthenticated(true);

        // Try to get username from the API
        const { fetchAuthSession } = await import("aws-amplify/auth");
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const data = await res.json();
            setUsername(data.profile?.username ?? null);
          }
        }
      } catch {
        setAuthenticated(false);
      }
    }
    checkAuth();
  }, [pathname]);

  async function handleSignOut() {
    try {
      await signOut();
      setAuthenticated(false);
      setUsername(null);
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  // Hide navbar on pure auth callback page
  if (pathname === "/callback") return null;

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner container">
          {/* Logo */}
          <Link href="/" className="navbar__logo">
            <span className="navbar__logo-icon">⬡</span>
            <span className="navbar__logo-text">Outcognito</span>
          </Link>

          {/* Desktop nav links */}
          {authenticated && (
            <div className="navbar__links">
              <Link
                href="/feed"
                className={`navbar__link ${pathname === "/feed" ? "navbar__link--active" : ""}`}
              >
                Feed
              </Link>
              {username && (
                <Link
                  href={`/${username}`}
                  className={`navbar__link ${pathname === `/${username}` ? "navbar__link--active" : ""}`}
                >
                  Profile
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="navbar__actions">
            {authenticated ? (
              <>
                {username && (
                  <Link
                    href={`/${username}`}
                    className="navbar__avatar"
                    title={`@${username}`}
                  >
                    {username.charAt(0).toUpperCase()}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="btn btn--ghost btn--sm"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/" className="btn btn--primary btn--sm">
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
              <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
              <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && authenticated && (
          <div className="navbar__mobile-menu">
            <Link href="/feed" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
              Feed
            </Link>
            {username && (
              <Link href={`/${username}`} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                @{username}
              </Link>
            )}
            <button
              onClick={() => { handleSignOut(); setMenuOpen(false); }}
              className="navbar__mobile-link"
              style={{ textAlign: "left", background: "none", color: "var(--error)" }}
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: var(--nav-height);
          background: rgba(9, 9, 11, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
        }

        .navbar__inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar__logo-icon {
          font-size: 1.4rem;
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .navbar__logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .navbar__links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .navbar__link {
          padding: 0.4rem 0.875rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .navbar__link:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        .navbar__link--active {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .navbar__avatar {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--brand-gradient);
          color: #fff;
          font-weight: 700;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .navbar__avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.5);
        }

        .navbar__hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 6px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--text-secondary);
          border-radius: 2px;
          transition: all var(--transition-base);
        }

        .navbar__mobile-menu {
          display: none;
          flex-direction: column;
          padding: 0.75rem 1.5rem;
          border-top: 1px solid var(--border-subtle);
          background: rgba(9, 9, 11, 0.97);
          gap: 0.25rem;
        }

        .navbar__mobile-link {
          padding: 0.625rem 0.5rem;
          font-size: 0.925rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          display: block;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast);
        }

        .navbar__mobile-link:hover {
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .navbar__links {
            display: none;
          }
          .navbar__hamburger {
            display: flex;
          }
          .navbar__mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
