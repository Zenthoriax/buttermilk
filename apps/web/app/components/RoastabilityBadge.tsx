interface RoastabilityBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

function getRoastLevel(score: number): {
  label: string;
  color: string;
  bg: string;
  emoji: string;
} {
  if (score >= 0.8) {
    return {
      label: "Extremely Roastable",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      emoji: "🔥",
    };
  }
  if (score >= 0.6) {
    return {
      label: "Good Roast",
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.15)",
      emoji: "🌶️",
    };
  }
  if (score >= 0.3) {
    return {
      label: "Mildly Spicy",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      emoji: "😅",
    };
  }
  return {
    label: "Ordinary",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.15)",
    emoji: "😌",
  };
}

export default function RoastabilityBadge({
  score,
  showLabel = false,
  size = "sm",
}: RoastabilityBadgeProps) {
  const level = getRoastLevel(score);
  const percent = Math.round(score * 100);
  const isLarge = size === "md";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: isLarge ? "0.375rem 0.75rem" : "0.25rem 0.5rem",
        borderRadius: "9999px",
        background: level.bg,
        border: `1px solid ${level.color}30`,
        fontSize: isLarge ? "0.8rem" : "0.72rem",
        fontWeight: 600,
        color: level.color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: isLarge ? "0.85rem" : "0.75rem" }}>
        {level.emoji}
      </span>
      <span>{percent}%</span>
      {showLabel && (
        <span style={{ opacity: 0.8 }}>{level.label}</span>
      )}
    </div>
  );
}
