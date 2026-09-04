interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = 32,
  color = "var(--brand-from)",
  message,
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid rgba(124, 58, 237, 0.15)`,
          borderTopColor: color,
          animation: "spin 0.8s linear infinite",
        }}
      />
      {message && (
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - var(--nav-height))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "var(--nav-height)",
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
