const THEME_COLORS = {
  // Brand
  brandPurple: "#7C3AED",
  brandPurpleHover: "#6D28D9",
  brandPurpleLight: "#F3E8FF",
  brandLime: "#A3E635",
  brandLimeHover: "#84CC16",
  brandLimeLight: "#ECFCCB",
  // Neutrals (Light)
  lightBg: "#FAFAF8",
  lightCardBg: "#FFFFFF",
  lightBorder: "#E8E5EE",
  lightTextPrimary: "#15131D",
  lightTextSecondary: "#686476",
  lightTextMuted: "#8E8A9C",
  // Neutrals (Dark)
  darkBg: "#07080d",
  darkCardBg: "#0b0d15",
  darkBorder: "#1e293b",
  darkTextPrimary: "#FFFFFF",
  darkTextSecondary: "#94A3B8",
  darkTextMuted: "#64748B",
  // Recharts Chart Colors (Replacing legacy flat greens with FitSync Purple & Lime palette)
  chartPalette: ["#7C3AED", "#A3E635", "#6366F1", "#F59E0B", "#06B6D4"]
};
const TIER_BADGE_STYLES = {
  basic: {
    bg: "bg-slate-100 dark:bg-slate-800/80",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700"
  },
  standard: {
    bg: "bg-purple-100/90 dark:bg-purple-950/70",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/70"
  },
  pro: {
    bg: "bg-purple-100/90 dark:bg-purple-950/70",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/70"
  },
  premium: {
    bg: "bg-lime-100/90 dark:bg-lime-950/70",
    text: "text-lime-800 dark:text-lime-300",
    border: "border-lime-300 dark:border-lime-800/70"
  },
  elite: {
    bg: "bg-lime-100/90 dark:bg-lime-950/70",
    text: "text-lime-800 dark:text-lime-300",
    border: "border-lime-300 dark:border-lime-800/70"
  },
  vip: {
    bg: "bg-gradient-to-r from-purple-100 to-lime-100 dark:from-purple-950/80 dark:to-lime-950/80",
    text: "text-purple-900 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-700"
  }
};
export {
  THEME_COLORS,
  TIER_BADGE_STYLES
};
