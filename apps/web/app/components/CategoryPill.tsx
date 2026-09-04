import type { EventCategory } from "../types/api";

const CATEGORY_STYLES: Record<
  EventCategory,
  { color: string; bg: string; emoji: string; label: string }
> = {
  ai: {
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.12)",
    emoji: "🤖",
    label: "AI",
  },
  development: {
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.12)",
    emoji: "💻",
    label: "Development",
  },
  social: {
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
    emoji: "📱",
    label: "Social",
  },
  entertainment: {
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.12)",
    emoji: "🎬",
    label: "Entertainment",
  },
  productivity: {
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.12)",
    emoji: "⚡",
    label: "Productivity",
  },
  shopping: {
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.12)",
    emoji: "🛒",
    label: "Shopping",
  },
  general: {
    color: "#6b7280",
    bg: "rgba(107, 114, 128, 0.12)",
    emoji: "🌐",
    label: "General",
  },
};

interface CategoryPillProps {
  category: EventCategory;
  size?: "sm" | "md";
}

export default function CategoryPill({
  category,
  size = "sm",
}: CategoryPillProps) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.general;
  const isLarge = size === "md";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: isLarge ? "0.375rem 0.75rem" : "0.2rem 0.5rem",
        borderRadius: "9999px",
        background: style.bg,
        border: `1px solid ${style.color}30`,
        fontSize: isLarge ? "0.8rem" : "0.72rem",
        fontWeight: 600,
        color: style.color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: isLarge ? "0.85rem" : "0.72rem" }}>
        {style.emoji}
      </span>
      {style.label}
    </span>
  );
}
