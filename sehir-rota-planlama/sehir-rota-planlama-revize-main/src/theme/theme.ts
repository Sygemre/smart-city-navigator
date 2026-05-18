export const theme = {
  colors: {
    bg: "#0C0F14",
    bg2: "#141820",
    bg3: "#1C2130",
    bg4: "#242B3A",
    accent: "#FF5C35",
    accent2: "#FF8B6B",
    teal: "#1ECFB0",
    gold: "#F5C842",
    text: "#F0EDE6",
    text2: "#9DA5B4",
    text3: "#5A6275",
    cardBorder: "rgba(255,255,255,0.07)"
  },
  radius: {
    md: "16px",
    sm: "10px",
    pill: "24px"
  }
} as const;

export type AppTheme = typeof theme;
