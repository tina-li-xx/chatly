import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { MobileAppearanceSettings } from "./types";

const STORAGE_KEY = "chatting:mobile:appearance";

const DEFAULT_APPEARANCE: MobileAppearanceSettings = {
  themeMode: "system",
  textScale: 1
};

export function useMobileAppearance() {
  const [appearance, setAppearance] = useState<MobileAppearanceSettings>(DEFAULT_APPEARANCE);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) {
          return;
        }

        const parsed = JSON.parse(raw) as Partial<MobileAppearanceSettings>;
        setAppearance({
          themeMode:
            parsed.themeMode === "light" || parsed.themeMode === "dark" || parsed.themeMode === "system"
              ? parsed.themeMode
              : "system",
          textScale:
            typeof parsed.textScale === "number" && parsed.textScale >= 0.9 && parsed.textScale <= 1.2
              ? parsed.textScale
              : 1
        });
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const saveAppearance = useCallback(async (next: MobileAppearanceSettings) => {
    setAppearance(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return { appearance, saveAppearance };
}
