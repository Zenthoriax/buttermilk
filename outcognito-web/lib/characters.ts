import type {
  CharacterId,
} from "@/types/feed";

export const CHARACTER_CONFIG:
  Record<
    CharacterId,
    {
      name: string;
      label: string;
      symbol: string;
      accent: string;
    }
  > = {
  certified_hater: {
    name:
      "certified_hater",

    label:
      "professional hater",

    symbol:
      "CH",

    accent:
      "text-[#d98b8b]",
  },

  glazer3000: {
    name:
      "glazer3000",

    label:
      "unpaid defense attorney",

    symbol:
      "G3",

    accent:
      "text-[#d5bb86]",
  },

  chronicallyonline: {
    name:
      "chronicallyonline",

    label:
      "terminally online",

    symbol:
      "CO",

    accent:
      "text-[#aaa0c9]",
  },

  society_aunty: {
    name:
      "society_aunty",

    label:
      "society observer",

    symbol:
      "SA",

    accent:
      "text-[#c99da8]",
  },

  detective: {
    name:
      "detective.jpg",

    label:
      "evidence department",

    symbol:
      "D",

    accent:
      "text-[#91a3af]",
  },

  linkedin_sigma: {
    name:
      "linkedin_sigma",

    label:
      "corporate philosopher",

    symbol:
      "LS",

    accent:
      "text-[#8fa7bd]",
  },

  maincharacter: {
    name:
      "maincharacter",

    label:
      "cinematic department",

    symbol:
      "MC",

    accent:
      "text-[#a397bd]",
  },
};