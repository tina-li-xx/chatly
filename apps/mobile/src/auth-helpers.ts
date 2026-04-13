import { friendlyErrorMessage } from "./formatting";

export type MobileAuthMode = "signin" | "forgot" | "email-sent" | "reset" | "success";

type PasswordStrength = {
  bars: number;
  color: string;
  label: string;
};

export function maskEmail(email: string) {
  const [local, domain = ""] = email.trim().split("@");
  if (!local || !domain) {
    return email;
  }

  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

export function passwordStrength(password: string): PasswordStrength {
  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  const varietyScore = Number(/[A-Z]/.test(password)) + Number(/\d/.test(password)) + Number(/[^A-Za-z0-9]/.test(password));
  const score = Math.min(4, lengthScore + varietyScore);

  if (score <= 1) {
    return { bars: 1, color: "#EF4444", label: "Weak — add more characters" };
  }

  if (score === 2) {
    return { bars: 2, color: "#F59E0B", label: "Fair — add numbers or symbols" };
  }

  if (score === 3) {
    return { bars: 3, color: "#10B981", label: "Good password" };
  }

  return { bars: 4, color: "#10B981", label: "Strong password" };
}

export function readResetTokenFromUrl(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get("token")?.trim();
    const route = `${parsed.host}${parsed.pathname}`.replace(/^\/+/, "");
    const mode = parsed.searchParams.get("mode");

    if (!token) {
      return null;
    }

    if (mode === "reset" || route === "reset-password") {
      return token;
    }
  } catch {
    return null;
  }

  return null;
}

export function authErrorViewModel(error: unknown) {
  const raw = error instanceof Error ? error.message : "request-failed";

  if (raw === "Network request failed") {
    return {
      tone: "warning" as const,
      message: "No internet connection. Check your network and try again."
    };
  }

  return {
    tone: "error" as const,
    message: friendlyErrorMessage(raw)
  };
}

export function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}
