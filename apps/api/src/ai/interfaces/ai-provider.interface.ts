export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProposalData {
  entity: string;
  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'created' | 'updated' | 'deleted' | 'cancelled';
  data: Record<string, any> | Record<string, any>[];
}

export interface AiResponseMetadata {
  type: 'proposal' | 'text';
  proposal?: AiProposalData;
  [key: string]: any;
}

export interface AiResponse {
  message: string;
  metadata?: AiResponseMetadata;
}

export interface IAiProvider {
  /**
   * Generates a structured response based on message history and system prompts.
   * Must handle provider-specific errors and map structured outputs consistently.
   */
  generateResponse(history: AiChatMessage[]): Promise<AiResponse>;
}

export const AI_PROVIDER_STRATEGY = 'AI_PROVIDER_STRATEGY';
