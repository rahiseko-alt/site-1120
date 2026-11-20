"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PageStatus,
  useAppStore,
  useAssetsStore,
  useThreeProgressStore,
} from "@/stores/appStore";
import { BREAKPOINTS, RESIZE_DEBOUNCE } from "@/lib/constants";

export function usePageEnter(
  cb: () => void,
  deps: unknown[] = [],
  once = false
) {
  useEffect(() => {
    const unsub = useAppStore.subscribe(({ pageStatus }) => {
      if (pageStatus === PageStatus.ENTER) {
        cb();
        if (once) unsub();
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cb, once]);
}

export function usePageLeave(
  cb: () => void,
  deps: unknown[] = [],
  once = false
) {
  useEffect(() => {
    const unsub = useAppStore.subscribe(({ pageStatus }) => {
      if (pageStatus === PageStatus.LEAVE) {
        cb();
        if (once) unsub();
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cb, once]);
}

export function usePagePlay(
  cb: () => void,
  deps: unknown[] = [],
  once = false
) {
  useEffect(() => {
    const unsub = useAppStore.subscribe(({ pageStatus }) => {
      if (pageStatus === PageStatus.PLAY) {
        cb?.();
        if (once) unsub();
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cb, once]);
}

export function usePagePrefetch(
  cb: () => void,
  deps: unknown[] = [],
  once = false
) {
  useEffect(() => {
    const unsub = useAppStore.subscribe(({ pageStatus }) => {
      if (pageStatus === PageStatus.PREFETCH) {
        cb();
        if (once) unsub();
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cb, once]);
}

export function usePageReady(
  cb: () => void,
  deps: unknown[] = [],
  once = false
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsub1 = useAssetsStore.subscribe((state) => {
      if (
        Math.min(state.assetsProgress, useThreeProgressStore.getState().progress) >= 100 &&
        useAppStore.getState().pageStatus === PageStatus.LEAVE
      ) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(cb, 50);
        if (once) unsub1();
      }
    });
    const unsub2 = useThreeProgressStore.subscribe((state) => {
      if (
        Math.min(useAssetsStore.getState().assetsProgress, state.progress) >= 100 &&
        useAppStore.getState().pageStatus === PageStatus.LEAVE
      ) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(cb, 50);
        if (once) unsub2();
      }
    });
    return () => {
      unsub1();
      unsub2();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, cb, once]);
}

export function getViewportFlags(width: number) {
  return {
    isDesktop: width >= BREAKPOINTS.DESKTOP,
    isTablet: width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP,
    isMobile: width < BREAKPOINTS.TABLET,
  };
}

export function useViewport() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [flags, setFlags] = useState(() => getViewportFlags(0));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWidth(w);
      setHeight(h);
      setFlags(getViewportFlags(w));
    };
    update();
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(update, RESIZE_DEBOUNCE);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { width, height, ...flags };
}

export function useRouterTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const routerPrefetch = useCallback(
    ({
      pathName,
      pageName = "Home",
      typeEffect = "fade",
    }: {
      pathName: string;
      pageName?: string;
      typeEffect?: "fade" | "none" | "history";
    }) => {
      if (pathName === pathname) return;
      router.prefetch(pathName);
      useAppStore.getState().setRouterState({ pathName, pageName, typeEffect });
      useAppStore.getState().pagePrefetch();
    },
    [router, pathname]
  );

  const routerPush = useCallback(() => {
    const target = useAppStore.getState().routerState.pathName;
    if (!target || target === pathname) return;
    useAppStore.getState().pageLeave();
    router.push(target);
  }, [router, pathname]);

  return { routerPrefetch, routerPush };
}

export function useTabVideoVisibility(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  useEffect(() => {
    let wasPlaying = false;
    const onVisChange = () => {
      const el = videoRef.current;
      if (!el) return;
      if (document.hidden) {
        if (!el.paused) {
          el.pause();
          wasPlaying = true;
        }
      } else if (wasPlaying) {
        wasPlaying = false;
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [videoRef]);
}
