import { colors } from "./colors";
import { typography } from "./typography";
import { spacing, borderRadius } from "./spacing";
import { shadows } from "./shadows";

/* ---------- Status Colors ---------- */
const statusColors = {
  approved: {
    main: colors.success[500],
    bg: colors.success[50],
    border: colors.success[100],
  },
  rejected: {
    main: colors.error[500],
    bg: colors.error[50],
    border: colors.error[100],
  },
  pending: {
    main: colors.warning[500],
    bg: colors.warning[50],
    border: colors.warning[100],
  },
};

/* ---------- Base Theme ---------- */
const baseTheme = {
  colors: {
    ...colors,
    status: statusColors,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  layout: {
    gutter: spacing[4],
    cardPadding: spacing[4],
    screenPadding: spacing[4],
  },
};

/* ---------- Light Theme ---------- */
export const LightTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    background: {
      main: "#FFFFFF",
      surface: "#FFFFFF",
      subtle: colors.neutral[50],
      inverse: "#1A1A1A",
    },

    text: {
      primary: "#1A1A1A",
      secondary: "#666666",
      tertiary: "#999999",
      inverse: "#FFFFFF",
      error: colors.error[500],
      success: colors.success[500],
      link: colors.primary[500],
    },

    border: {
      light: colors.neutral[200],
      medium: colors.neutral[300],
      dark: colors.neutral[400],
    },
  },
};

/* ---------- Dark Theme ---------- */
export const DarkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    background: {
      main: "#020617",
      surface: "#020617",
      subtle: "#020617",
      inverse: "#FFFFFF",
    },

    text: {
      primary: "#F9FAFB",
      secondary: "#CBD5E1",
      tertiary: "#94A3B8",
      inverse: "#020617",
      error: colors.error[400],
      success: colors.success[400],
      link: colors.primary[400],
    },

    border: {
      light: "#1E293B",
      medium: "#334155",
      dark: "#475569",
    },
  },
};

export type AppTheme = typeof LightTheme;
