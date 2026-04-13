import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MobileSession } from "./types";

const SESSION_KEY = "@chatting/mobile-session";

export async function loadStoredSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MobileSession;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveStoredSession(session: MobileSession) {
  return AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  return AsyncStorage.removeItem(SESSION_KEY);
}
