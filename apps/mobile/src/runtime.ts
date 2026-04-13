import Constants from "expo-constants";
import { Platform } from "react-native";
import { sanitizeBaseUrl } from "./formatting";

const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_CHATTING_API_PORT?.trim() || "3983";
const FALLBACK_BASE_URL = Platform.select({
  android: `http://10.0.2.2:${DEFAULT_API_PORT}`,
  default: `http://127.0.0.1:${DEFAULT_API_PORT}`
}) ?? `http://127.0.0.1:${DEFAULT_API_PORT}`;

export function getDefaultBaseUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_CHATTING_API_URL?.trim();
  if (configuredBaseUrl) {
    return sanitizeBaseUrl(configuredBaseUrl);
  }

  const host = Constants.expoConfig?.hostUri?.split(":")[0]?.trim();
  if (host && host !== "127.0.0.1" && host !== "localhost") {
    return `http://${host}:${DEFAULT_API_PORT}`;
  }

  return FALLBACK_BASE_URL;
}
