export type EntityType =
  | 'category'
  | 'subCategory'
  | 'color'
  | 'size'
  | 'promoCode'
  | 'product';

export interface ProductVariantEntity {
  colorId?: number;
  sizeId?: number;
  price: number;
  stock?: number;
}

export interface BaseEntityItem {
  id?: number | string;
  // Category / SubCategory / Color / Size / Product
  name?: string;
  title?: string;
  slug?: string;
  // Media & Foreign Keys
  imageId?: number;
  mainImageId?: number;
  secondaryImageId?: number;
  categoryId?: number;
  subCategoryId?: number;
  galleryMediaIds?: number[];
  // Color specific
  hex?: string;
  // Promo code specific
  code?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  // Product specific
  basePrice?: number;
  discountPrice?: number;
  description?: string;
  shortDescription?: string;
  additionalDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isNew?: boolean;
  isActive?: boolean;
  variants?: Array<ProductVariantEntity>;
  // Flexible index signature for unexpected keys
  [key: string]: unknown;
}

export interface ProposalData {
  entity: EntityType;
  action: 'create' | 'update' | 'delete';
  status: string;
  data: BaseEntityItem[];
}

export interface ReadData {
  entity: EntityType;
  data: BaseEntityItem[];
}

export interface AiMetadata {
  type?: 'proposal' | 'text' | string;
  proposal?: ProposalData;
  read?: ReadData;
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
