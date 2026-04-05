"use client";

import { useEffect, useState } from "react";
import { isLocalHostLike } from "@/lib/local-host";

export function useShouldLoadRemoteScript() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!isLocalHostLike(window.location.hostname)) {
      setShouldLoad(true);
    }
  }, []);

  return shouldLoad;
}
