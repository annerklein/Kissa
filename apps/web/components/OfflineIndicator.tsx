'use client';

import { useOnlineStatus, useOfflineSync } from '../lib/hooks';
import { hasPendingOperations } from '../lib/offline-queue';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);

  // Set up offline sync
  useOfflineSync();

  // Check for pending operations
  useEffect(() => {
    const checkPending = () => {
      if (typeof window !== 'undefined') {
        const queue = localStorage.getItem('kissa_offline_queue');
        const count = queue ? JSON.parse(queue).length : 0;
        setPendingCount(count);
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 py-2 px-4 text-center text-sm font-medium z-50 ${
        isOnline
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {!isOnline ? (
        <>You're offline. Changes will sync when reconnected.</>
      ) : pendingCount > 0 ? (
        <>Syncing {pendingCount} pending changes...</>
      ) : null}
    </div>
  );
}
