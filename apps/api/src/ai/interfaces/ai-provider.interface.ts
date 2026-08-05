import { MessageRole } from '../../constants/enums';

export interface AiToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AiChatMessage {
  role: MessageRole;
  content: string;
  tool_calls?: AiToolCall[];
  tool_call_id?: string;
}

export interface AiProposalData {
  entity: string;
  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'created' | 'updated' | 'deleted' | 'cancelled';
  data: Record<string, any> | Record<string, any>[];
}

export interface AiResponseMetadata {
  type: 'proposal' | 'text' | 'read';
  proposal?: AiProposalData;
  read?: {
    entity: string;
    data: Record<string, any>[];
  };
  [key: string]: any;
}

export interface AiResponse {
  message: string;
  metadata?: AiResponseMetadata;
}

export interface IAiProvider {
  generateResponse(
    history: AiChatMessage[],
    dynamicSystemPrompt?: string,
    hasExecutedTools?: boolean,
  ): Promise<AiResponse>;
  generateResponseStream(
    history: AiChatMessage[],
    dynamicSystemPrompt?: string,
  ): AsyncIterable<string>;
}

export const AI_PROVIDER_STRATEGY = 'AI_PROVIDER_STRATEGY';
