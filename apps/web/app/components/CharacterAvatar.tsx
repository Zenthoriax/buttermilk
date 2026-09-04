import type { AICharacter } from "../types/api";

interface CharacterConfig {
  emoji: string;
  displayName: string;
  color: string;
  bg: string;
  tagline: string;
}

const CHARACTER_CONFIG: Record<AICharacter, CharacterConfig> = {
  certified_hater: {
    emoji: "😒",
    displayName: "Certified Hater",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    tagline: "Professional critic",
  },
  glazer3000: {
    emoji: "🤩",
    displayName: "Glazer3000",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    tagline: "Unconditional defender",
  },
  chronicallyonline: {
    emoji: "🗿",
    displayName: "ChronicallyOnline",
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.12)",
    tagline: "Internet native",
  },
  society_aunty: {
    emoji: "👩‍👦",
    displayName: "Society Aunty",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
    tagline: "Social commentator",
  },
  detective: {
    emoji: "🔍",
    displayName: "Detective",
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.12)",
    tagline: "Evidence collector",
  },
  linkedin_sigma: {
    emoji: "💼",
    displayName: "LinkedIn Sigma",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.12)",
    tagline: "Entrepreneur mindset",
  },
  maincharacter: {
    emoji: "⚡",
    displayName: "Main Character",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.12)",
    tagline: "Cinematic realist",
  },
};

interface CharacterAvatarProps {
  character: AICharacter;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

export default function CharacterAvatar({
  character,
  size = "md",
  showName = false,
}: CharacterAvatarProps) {
  const config = CHARACTER_CONFIG[character];

  const sizeMap = {
    sm: { avatar: 28, emoji: "0.9rem", name: "0.7rem" },
    md: { avatar: 36, emoji: "1.1rem", name: "0.75rem" },
    lg: { avatar: 44, emoji: "1.4rem", name: "0.85rem" },
  };

  const s = sizeMap[size];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexShrink: 0,
      }}
    >
      <div
        title={config.displayName}
        style={{
          width: s.avatar,
          height: s.avatar,
          borderRadius: "50%",
          background: config.bg,
          border: `1.5px solid ${config.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s.emoji,
          flexShrink: 0,
          transition: "transform 150ms ease, box-shadow 150ms ease",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${config.color}40`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {config.emoji}
      </div>

      {showName && (
        <span
          style={{
            fontSize: s.name,
            fontWeight: 600,
            color: config.color,
            lineHeight: 1,
          }}
        >
          {config.displayName}
        </span>
      )}
    </div>
  );
}

export { CHARACTER_CONFIG };
