import { useEffect, useState } from "react";
import { Linking, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { unregisterMobileDevice } from "./src/api";
import { loadMobileSession, revokeMobileSession } from "./src/auth-api";
import { AuthenticatedMobileShell } from "./src/authenticated-mobile-shell";
import { AuthScreenSkeleton } from "./src/loading-skeletons";
import { MobileAuthFlow } from "./src/mobile-auth-flow";
import { mobileTheme } from "./src/mobile-theme";
import { MobileScreenshotMode } from "./src/screenshot-mode/mode";
import { getDefaultBaseUrl } from "./src/runtime";
import { clearStoredSession, loadStoredSession, saveStoredSession } from "./src/storage";
import type { MobileSession } from "./src/types";

const DEFAULT_BASE_URL = getDefaultBaseUrl();
const SCREENSHOT_MODE = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === "1";

function isScreenshotUrl(value: string | null | undefined) {
  return Boolean(value && value.includes("screenshot/"));
}

export default function App() {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [booting, setBooting] = useState(true);
  const [screenshotMode, setScreenshotMode] = useState(SCREENSHOT_MODE);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const stored = await loadStoredSession();
      if (!stored) {
        if (mounted) setBooting(false);
        return;
      }

      try {
        const user = await loadMobileSession(stored.baseUrl, stored.token);
        if (!mounted) return;
        setSession({ ...stored, user });
      } catch {
        await clearStoredSession();
      } finally {
        if (mounted) setBooting(false);
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (isScreenshotUrl(url)) {
        setScreenshotMode(true);
      }
    }).catch(() => {});

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (isScreenshotUrl(url)) {
        setScreenshotMode(true);
      }
    });

    return () => subscription.remove();
  }, []);

  async function handleAuthenticated(nextSession: MobileSession, rememberMe: boolean) {
    setSession(nextSession);
    if (rememberMe) {
      await saveStoredSession(nextSession);
      return;
    }

    await clearStoredSession();
  }

  async function handleLogout(pushToken: string | null) {
    if (!session) {
      return;
    }
    setSession(null);
    await clearStoredSession();

    try {
      if (pushToken) {
        await unregisterMobileDevice(session.baseUrl, session.token, pushToken);
      }
      await revokeMobileSession(session.baseUrl, session.token);
    } catch {
      // Keep logout resilient even if the network is unavailable.
    }
  }

  if (screenshotMode) {
    return <MobileScreenshotMode />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {booting ? (
        <AuthScreenSkeleton />
      ) : session ? (
        <AuthenticatedMobileShell session={session} onLogout={handleLogout} />
      ) : (
        <MobileAuthFlow
          baseUrl={DEFAULT_BASE_URL}
          onAuthenticated={(nextSession, rememberMe) => handleAuthenticated(nextSession, rememberMe)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: mobileTheme.colors.white }
});
