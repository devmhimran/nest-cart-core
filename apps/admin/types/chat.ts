export interface AiMetadata {
  type?: 'proposal' | 'text' | string;
  proposal?: {
    entity: string;
    action: 'create' | 'update' | 'delete';
    status: string;
    data: Record<string, unknown>;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  metadata?: AiMetadata;
}

export interface ChatContainerProps {
  chatId?: string | null;
  onChatCreated?: (newChatId: string) => void;
}

export interface ProposalData {
  entity: string;
  action: 'create' | 'update' | 'delete';
  status: string;
  data: {
    name?: string;
    slug?: string;
    id?: string;
    [key: string]: unknown;
  };
}

export interface ChatSessionPayload {
  id: string;
  title?: string;
  [key: string]: unknown;
}

export interface ChatMessagePayload {
  id: string;
  content: string;
  role: 'user' | 'assistant' | string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface StreamDonePayload {
  assistantMessage?: ChatMessagePayload;
  [key: string]: unknown;
}

export interface StreamCallbacks {
  onSessionCreated?: (session: ChatSessionPayload) => void;
  onUserMessageCreated?: (userMessage: ChatMessagePayload) => void;
  onToken: (token: string) => void;
  onDone?: (data?: StreamDonePayload) => void;
  onError?: (error: string) => void;
}

export interface AiChatConversation {
  id: string;
  title?: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages?: number;
  };
}
