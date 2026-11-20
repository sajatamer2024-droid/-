import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Shared module-level store so beforeinstallprompt is captured immediately at startup
// and shared across App, Navbar, HeroSection, and MobileAppInstallModal.
let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
let sharedIsInstalled =
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach(cb => cb());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    sharedDeferredPrompt = e as BeforeInstallPromptEvent;
    notifySubscribers();
  });

  window.addEventListener('appinstalled', () => {
    sharedIsInstalled = true;
    sharedDeferredPrompt = null;
    notifySubscribers();
  });

  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        sharedIsInstalled = true;
        sharedDeferredPrompt = null;
        notifySubscribers();
      }
    });
  }
}

export function usePWAInstall() {
  const [, setTick] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    subscribers.add(update);

    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      setIsAndroid(/android/.test(userAgent));
    }

    return () => {
      subscribers.delete(update);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!sharedDeferredPrompt) return false;
    try {
      await sharedDeferredPrompt.prompt();
      const { outcome } = await sharedDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        sharedIsInstalled = true;
        sharedDeferredPrompt = null;
        notifySubscribers();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    isInstallable: !!sharedDeferredPrompt,
    isInstalled: sharedIsInstalled,
    isIOS,
    isAndroid,
    install,
  };
}
