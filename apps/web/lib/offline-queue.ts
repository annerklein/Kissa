// Offline Queue for Kissa
// Stores pending operations when offline and syncs when back online

const QUEUE_KEY = 'kissa_offline_queue';

export interface QueuedOperation {
  id: string;
  type: 'CREATE_BREW' | 'UPDATE_BREW' | 'RATING' | 'GRINDER_APPLY';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

// Get queued operations from localStorage
export function getQueue(): QueuedOperation[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save queue to localStorage
function saveQueue(queue: QueuedOperation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Add operation to queue
export function addToQueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>) {
  const queue = getQueue();
  const newOp: QueuedOperation = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  queue.push(newOp);
  saveQueue(queue);
  return newOp;
}

// Remove operation from queue
export function removeFromQueue(id: string) {
  const queue = getQueue();
  const newQueue = queue.filter((op) => op.id !== id);
  saveQueue(newQueue);
}

// Increment retry count
export function incrementRetry(id: string) {
  const queue = getQueue();
  const op = queue.find((op) => op.id === id);
  if (op) {
    op.retries += 1;
  }
  saveQueue(queue);
}

// Clear entire queue
export function clearQueue() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_KEY);
}

// Process a single operation
async function processOperation(
  op: QueuedOperation,
  apiUrl: string
): Promise<boolean> {
  try {
    let endpoint = '';
    let method = 'POST';
    let body = op.data;

    switch (op.type) {
      case 'CREATE_BREW':
        endpoint = '/api/brews';
        break;
      case 'UPDATE_BREW':
        endpoint = `/api/brews/${op.data.id}`;
        method = 'PATCH';
        break;
      case 'RATING':
        endpoint = `/api/brews/${op.data.brewId}/rating`;
        method = 'PATCH';
        body = op.data.rating as Record<string, unknown>;
        break;
      case 'GRINDER_APPLY':
        endpoint = '/api/grinder/apply';
        break;
      default:
        return false;
    }

    const res = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return res.ok;
  } catch {
    return false;
  }
}

// Process all queued operations
export async function processQueue(apiUrl: string): Promise<{
  processed: number;
  failed: number;
}> {
  const queue = getQueue();
  let processed = 0;
  let failed = 0;

  for (const op of queue) {
    const success = await processOperation(op, apiUrl);
    if (success) {
      removeFromQueue(op.id);
      processed += 1;
    } else {
      incrementRetry(op.id);
      // Remove if too many retries
      if (op.retries >= 5) {
        removeFromQueue(op.id);
      }
      failed += 1;
    }
  }

  return { processed, failed };
}

// Check if there are pending operations
export function hasPendingOperations(): boolean {
  return getQueue().length > 0;
}

// Hook to process queue when coming back online
export function setupOnlineListener(apiUrl: string) {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    if (hasPendingOperations()) {
      console.log('Back online, processing queued operations...');
      const result = await processQueue(apiUrl);
      console.log(`Processed ${result.processed}, failed ${result.failed}`);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
