export type LikeSyncPayload = {
  postId: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  source?: string;
};

const EVENT_NAME = 'aiblog:like-updated';
const CHANNEL_NAME = 'aiblog-likes';

function createLikeEvent(payload: LikeSyncPayload): CustomEvent<LikeSyncPayload> {
  return new CustomEvent<LikeSyncPayload>(EVENT_NAME, { detail: payload });
}

export function emitLikeUpdate(payload: LikeSyncPayload): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(createLikeEvent(payload));

  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    } catch {
      // Best-effort sync channel.
    }
  }
}

export function subscribeLikeUpdates(onUpdate: (payload: LikeSyncPayload) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const onWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<LikeSyncPayload>;
    if (customEvent.detail?.postId) {
      onUpdate(customEvent.detail);
    }
  };

  window.addEventListener(EVENT_NAME, onWindowEvent as EventListener);

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<LikeSyncPayload>) => {
        if (event.data?.postId) {
          onUpdate(event.data);
        }
      };
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener(EVENT_NAME, onWindowEvent as EventListener);
    if (channel) {
      channel.close();
    }
  };
}