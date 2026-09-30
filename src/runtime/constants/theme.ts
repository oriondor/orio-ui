export const THEME_DEFAULTS = {
  theme: "navy",
  mode: "dark",
} as const;

export const COOKIE_NAMES = {
  theme: "orio-theme",
  mode: "orio-mode",
} as const;

export const THEMES = [
  "navy",
  "teal",
  "forest",
  "wine",
  "royal",
  "violet",
] as const;

export const MODES = ["light", "dark"] as const;
