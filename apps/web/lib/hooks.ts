// Custom hooks for Kissa
'use client';

import { useEffect } from 'react';
import { useAppStore } from './store';
import { setupOnlineListener, processQueue, hasPendingOperations } from './offline-queue';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hook to track online/offline status
export function useOnlineStatus() {
  const { isOnline, setIsOnline } = useAppStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  return isOnline;
}

// Hook to sync offline queue when coming back online
export function useOfflineSync() {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline && hasPendingOperations()) {
      processQueue(API_URL).then((result) => {
        if (result.processed > 0) {
          console.log(`Synced ${result.processed} offline operations`);
        }
      });
    }
  }, [isOnline]);

  useEffect(() => {
    return setupOnlineListener(API_URL);
  }, []);
}

// Hook for optimistic grinder updates
export function useOptimisticGrinder() {
  const { grinder, applyGrinderSetting } = useAppStore();
  const isOnline = useOnlineStatus();

  const apply = async (newSetting: number) => {
    // Optimistically update local state
    applyGrinderSetting(newSetting);

    if (isOnline) {
      // Try to sync with server
      try {
        const res = await fetch(`${API_URL}/api/grinder/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newSetting }),
        });

        if (!res.ok) {
          // Revert on error - in a real app, you'd handle this better
          console.error('Failed to sync grinder setting');
        }
      } catch (error) {
        console.error('Error syncing grinder:', error);
        // Keep the optimistic update - will sync when back online
      }
    }
  };

  return {
    currentSetting: grinder.currentSetting,
    grinderModel: grinder.grinderModel,
    apply,
  };
}

// Hook to use synced settings
export function useSyncedSettings() {
  const { settings, setSettings } = useAppStore();
  const isOnline = useOnlineStatus();

  const update = async (updates: { defaultServings?: number; gramsPerServing?: number }) => {
    // Optimistically update local state
    setSettings(updates);

    if (isOnline) {
      try {
        await fetch(`${API_URL}/api/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error('Error syncing settings:', error);
      }
    }
  };

  return {
    settings,
    update,
  };
}
