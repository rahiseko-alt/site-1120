"use client";

import { create } from "zustand";
import { useEffect, useRef } from "react";

export enum PageStatus {
  IDLE = "IDLE",
  PREFETCH = "PREFETCH",
  LEAVE = "LEAVE",
  PLAY = "PLAY",
  ENTER = "ENTER",
}

export interface RouterState {
  pathName: string | null;
  pageName: string;
  typeEffect: "fade" | "none" | "history";
}

interface AppState {
  pageStatus: PageStatus;
  playVideo: boolean;
  isHistory: boolean;
  routerState: RouterState;
  pageLeave: () => void;
  pageEnter: () => void;
  pagePlay: () => void;
  pageIdle: () => void;
  pagePrefetch: () => void;
  pageHistory: () => void;
  setRouterState: (state: RouterState) => void;
  setPathName: (pathName: string | null) => void;
  setPageName: (pageName: string) => void;
  setTypeEffect: (typeEffect: "fade" | "none" | "history") => void;
  setPlayVideo: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  pageStatus: PageStatus.IDLE,
  playVideo: false,
  isHistory: false,
  routerState: {
    pathName: null,
    pageName: "Home",
    typeEffect: "fade",
  },
  pageLeave: () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("is-ready");
    }
    set({ pageStatus: PageStatus.LEAVE, playVideo: false });
  },
  pageEnter: () => set({ pageStatus: PageStatus.ENTER }),
  pagePlay: () => {
    if (typeof document !== "undefined") {
      document.body.classList.add("is-ready");
    }
    set({ pageStatus: PageStatus.PLAY });
  },
  pageIdle: () => set({ pageStatus: PageStatus.IDLE }),
  pagePrefetch: () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("is-ready");
    }
    set({ pageStatus: PageStatus.PREFETCH, playVideo: false });
  },
  pageHistory: () => set({ isHistory: true }),
  setRouterState: (routerState) => set({ routerState }),
  setPathName: (pathName) =>
    set((s) => ({ routerState: { ...s.routerState, pathName } })),
  setPageName: (pageName) =>
    set((s) => ({ routerState: { ...s.routerState, pageName } })),
  setTypeEffect: (typeEffect) =>
    set((s) => ({ routerState: { ...s.routerState, typeEffect } })),
  setPlayVideo: () => set({ playVideo: true }),
}));

interface AssetsState {
  assetsRequests: number;
  assetsLoadTo: number;
  r3fRequests: number;
  r3fLoadTo: number;
  isAssetsLoaded: boolean;
  assetsProgress: number;
  isR3fLoaded: boolean;
  cpmRegister: number;
  registerAssets: () => void;
  unRegisterAssets: () => void;
  resetAssets: () => void;
  setR3fRequests: (n: number) => void;
  setR3fLoadTo: (n: number) => void;
  cpmRegisterAssets: () => void;
  cpmUnRegisterAssets: () => void;
}

export const useAssetsStore = create<AssetsState>((set, get) => ({
  assetsRequests: 0,
  assetsLoadTo: 0,
  r3fRequests: 0,
  r3fLoadTo: 0,
  isAssetsLoaded: false,
  assetsProgress: 0,
  isR3fLoaded: false,
  cpmRegister: 0,
  registerAssets: () =>
    set({ assetsRequests: get().assetsRequests + 1 }),
  unRegisterAssets: () => {
    const state = get();
    const loaded = state.assetsLoadTo + 1;
    const progress = Math.min(
      Math.round(
        state.assetsRequests === 0 || loaded === 0
          ? 0
          : (loaded / state.assetsRequests) * 100
      ),
      100
    );
    const isLoaded = progress >= 100;
    set({
      assetsLoadTo: loaded,
      assetsProgress: progress,
      isAssetsLoaded: isLoaded,
    });
  },
  resetAssets: () =>
    set({
      isAssetsLoaded: false,
      assetsLoadTo: 0,
      assetsRequests: 0,
      assetsProgress: 0,
      r3fLoadTo: 0,
      r3fRequests: 0,
      isR3fLoaded: false,
    }),
  setR3fRequests: (n) =>
    set({ r3fRequests: n, isR3fLoaded: n === get().r3fLoadTo }),
  setR3fLoadTo: (n) =>
    set({ r3fLoadTo: n, isR3fLoaded: get().r3fRequests === n }),
  cpmRegisterAssets: () => set({ cpmRegister: get().cpmRegister + 1 }),
  cpmUnRegisterAssets: () => set({ cpmRegister: get().cpmRegister - 1 }),
}));

interface ThreeProgressState {
  progress: number;
  active: boolean;
  total: number;
  setProgress: (progress: number, active: boolean, total: number) => void;
}

export const useThreeProgressStore = create<ThreeProgressState>((set) => ({
  progress: 100,
  active: false,
  total: 0,
  setProgress: (progress, active, total) => set({ progress, active, total }),
}));

interface MenuState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => {
    if (get().isOpen !== isOpen) set({ isOpen });
  },
}));

export const useMenuSubscription = (cb: (isOpen: boolean) => void) => {
  const prev = useRef(false);
  useEffect(() => {
    const unsub = useMenuStore.subscribe((state) => {
      if (state.isOpen !== prev.current) {
        prev.current = state.isOpen;
        cb(state.isOpen);
      }
    });
    return () => unsub();
  }, [cb]);
};

interface SectionState {
  currentSectionIndex: number;
  sectionProgress: number;
}

export const useSectionStore = create<SectionState>(() => ({
  currentSectionIndex: 0,
  sectionProgress: 0,
}));

export const useSectionIndexSubscription = (cb: (idx: number) => void) => {
  const prev = useRef(0);
  useEffect(() => {
    const unsub = useSectionStore.subscribe(() => {
      const idx = useSectionStore.getState().currentSectionIndex;
      if (idx !== prev.current) {
        prev.current = idx;
        cb(idx);
      }
    });
    return () => unsub();
  }, [cb]);
};

interface HeroVideoState {
  isExpanded: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null> | null;
  videoElementReady: boolean;
  actions: {
    setExpanded: (v: boolean) => void;
    toggle: () => void;
    reset: () => void;
    setVideoRef: (ref: React.RefObject<HTMLVideoElement | null> | null) => void;
    setVideoElementReady: (v: boolean) => void;
  };
}

export const useHeroVideoStore = create<HeroVideoState>((set, get) => ({
  isExpanded: false,
  videoRef: null,
  videoElementReady: false,
  actions: {
    setExpanded: (v) => {
      if (get().isExpanded !== v) set({ isExpanded: v });
    },
    toggle: () => set((s) => ({ isExpanded: !s.isExpanded })),
    reset: () =>
      set({ isExpanded: false, videoRef: null, videoElementReady: false }),
    setVideoRef: (videoRef) => set({ videoRef }),
    setVideoElementReady: (videoElementReady) => set({ videoElementReady }),
  },
}));

export const useHeroExpandedSubscription = (cb: (expanded: boolean) => void) => {
  const prev = useRef(false);
  useEffect(() => {
    const unsub = useHeroVideoStore.subscribe((s) => {
      if (s.isExpanded !== prev.current) {
        prev.current = s.isExpanded;
        cb(s.isExpanded);
      }
    });
    return () => unsub();
  }, [cb]);
};

interface ShowcaseState {
  activeProjectIndex: number;
  isExpanded: boolean;
  isFullscreenExpanded: boolean;
  expandProgress: number;
  scrollProgress: number;
  isNavigating: boolean;
  pendingImageUrl: string | null;
  pendingProjectName: string | null;
  setActiveProjectIndex: (idx: number) => void;
  setIsExpanded: (v: boolean) => void;
  setIsFullscreenExpanded: (v: boolean) => void;
  setExpandProgress: (v: number) => void;
  setScrollProgress: (v: number) => void;
  setIsNavigating: (v: boolean) => void;
  setPendingNavigation: (imageUrl: string | null, projectName: string | null) => void;
  reset: () => void;
}

export const useShowcaseStore = create<ShowcaseState>((set, get) => ({
  activeProjectIndex: 0,
  isExpanded: false,
  isFullscreenExpanded: false,
  expandProgress: 0,
  scrollProgress: 0,
  isNavigating: false,
  pendingImageUrl: null,
  pendingProjectName: null,
  setActiveProjectIndex: (idx) => {
    if (get().activeProjectIndex !== idx) set({ activeProjectIndex: idx });
  },
  setIsExpanded: (isExpanded) => set({ isExpanded }),
  setIsFullscreenExpanded: (isFullscreenExpanded) => set({ isFullscreenExpanded }),
  setExpandProgress: (expandProgress) => set({ expandProgress }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  setPendingNavigation: (pendingImageUrl, pendingProjectName) =>
    set({ pendingImageUrl, pendingProjectName }),
  reset: () =>
    set({
      activeProjectIndex: 0,
      isExpanded: false,
      isFullscreenExpanded: false,
      expandProgress: 0,
      scrollProgress: 0,
      isNavigating: false,
      pendingImageUrl: null,
      pendingProjectName: null,
    }),
}));

interface ImagePlaceholderState {
  image: string | null;
  projectName: string | null;
  actions: {
    setImage: (image: string | null) => void;
    setProjectName: (projectName: string | null) => void;
  };
}

export const useImagePlaceholderStore = create<ImagePlaceholderState>((set) => ({
  image: null,
  projectName: null,
  actions: {
    setImage: (image) => set({ image }),
    setProjectName: (projectName) => set({ projectName }),
  },
}));

interface WorkVideoState {
  activeVideoId: string | null;
  actions: {
    setActiveVideoId: (id: string | null) => void;
  };
}

export const useWorkVideoStore = create<WorkVideoState>((set) => ({
  activeVideoId: null,
  actions: {
    setActiveVideoId: (activeVideoId) => set({ activeVideoId }),
  },
}));

export const useWorkVideoSubscription = (cb: (id: string | null) => void) => {
  const prev = useRef<string | null>(null);
  useEffect(() => {
    const unsub = useWorkVideoStore.subscribe((s) => {
      if (s.activeVideoId !== prev.current) {
        prev.current = s.activeVideoId;
        cb(s.activeVideoId);
      }
    });
    return () => unsub();
  }, [cb]);
};

interface LabModalState {
  activeLabIndex: number | null;
  actions: {
    setActiveLabIndex: (idx: number | null) => void;
  };
}

export const useLabModalStore = create<LabModalState>((set) => ({
  activeLabIndex: null,
  actions: {
    setActiveLabIndex: (activeLabIndex) => set({ activeLabIndex }),
  },
}));

export const useLabModalSubscription = (cb: (idx: number | null) => void) => {
  const prev = useRef<number | null>(null);
  useEffect(() => {
    const unsub = useLabModalStore.subscribe((s) => {
      if (s.activeLabIndex !== prev.current) {
        prev.current = s.activeLabIndex;
        cb(s.activeLabIndex);
      }
    });
    return () => unsub();
  }, [cb]);
};
