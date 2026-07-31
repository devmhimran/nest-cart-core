const ACTIVE_CHAT_KEY = 'nest_cart_ai_active_chat';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export interface StoredChatSession {
  chatId: string;
  lastActiveAt: number;
}

export function getSavedActiveChat(): { chatId: string | null; expired: boolean } {
  if (typeof window === 'undefined') return { chatId: null, expired: false };
  try {
    const raw = localStorage.getItem(ACTIVE_CHAT_KEY);
    if (!raw) return { chatId: null, expired: false };

    const data: StoredChatSession = JSON.parse(raw);
    if (!data || !data.chatId || typeof data.lastActiveAt !== 'number') {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
      return { chatId: null, expired: false };
    }

    const elapsed = Date.now() - data.lastActiveAt;
    if (elapsed >= THREE_HOURS_MS) {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
      return { chatId: null, expired: true };
    }

    return { chatId: data.chatId, expired: false };
  } catch {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    return { chatId: null, expired: false };
  }
}

export function saveActiveChat(chatId: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (chatId) {
      const data: StoredChatSession = {
        chatId,
        lastActiveAt: Date.now(),
      };
      localStorage.setItem(ACTIVE_CHAT_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function updateActiveChatTimestamp() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ACTIVE_CHAT_KEY);
    if (raw) {
      const data: StoredChatSession = JSON.parse(raw);
      if (data && data.chatId) {
        data.lastActiveAt = Date.now();
        localStorage.setItem(ACTIVE_CHAT_KEY, JSON.stringify(data));
      }
    }
  } catch {
    // Ignore
  }
}
