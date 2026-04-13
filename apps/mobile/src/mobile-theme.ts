import { Platform } from "react-native";

const iosFont = "SF Pro Text";
const androidFont = "Roboto";
const appFont = Platform.select({ ios: iosFont, android: androidFont, default: "System" });

export const mobileTheme = {
  colors: {
    blue: "#2563EB",
    blueDark: "#1D4ED8",
    blueLight: "#DBEAFE",
    blue50: "#EFF6FF",
    slate900: "#0F172A",
    slate700: "#334155",
    slate600: "#475569",
    slate500: "#64748B",
    slate400: "#94A3B8",
    slate200: "#E2E8F0",
    slate100: "#F1F5F9",
    slate50: "#F8FAFC",
    white: "#FFFFFF",
    green: "#10B981",
    amber: "#F59E0B",
    red: "#EF4444",
    gray: "#6B7280",
    visitorBubble: "#F1F5F9",
    teamBubble: "#2563EB",
    systemBubble: "#FEF3C7",
    errorSurface: "#FEF2F2"
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },
  typography: {
    display: {
      fontFamily: appFont,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "600" as const,
      letterSpacing: -0.64
    },
    title: {
      fontFamily: appFont,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "600" as const,
      letterSpacing: -0.24
    },
    heading: {
      fontFamily: appFont,
      fontSize: 18,
      lineHeight: 28,
      fontWeight: "600" as const,
      letterSpacing: -0.18
    },
    body: {
      fontFamily: appFont,
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "400" as const
    },
    small: {
      fontFamily: appFont,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "400" as const,
      letterSpacing: 0.13
    },
    tiny: {
      fontFamily: appFont,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "400" as const,
      letterSpacing: 0.22
    }
  },
  shadow: {
    card: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    sheet: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 12
    }
  }
};

export function presenceColor(status: "online" | "offline" | "away") {
  if (status === "online") {
    return mobileTheme.colors.green;
  }

  if (status === "away") {
    return mobileTheme.colors.amber;
  }

  return mobileTheme.colors.gray;
}
