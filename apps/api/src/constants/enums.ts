export enum UserRole {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  MODERATOR = 2,
  CUSTOMER = 3,
}

export enum OrderStatus {
  PENDING = 0,
  CONFIRMED = 1,
  PROCESSING = 2,
  SHIPPING = 3,
  DELIVERED = 4,
  COMPLETED = 5,
  CANCELLED = 6,
  RETURNED = 7,
}

export enum PaymentStatus {
  INCOMPLETE = 0,
  PENDING = 1,
  PAID = 2,
  FAILED = 3,
  REFUNDED = 4,
}

export enum AuditAction {
  CREATE = 0,
  UPDATE = 1,
  DELETE = 2,
  RESTORE = 3,
  LOGIN = 4,
  SIGNOUT = 5,
}

export enum EntityType {
  USER = 0,
  SIZE = 1,
  COLOR = 2,
  PRODUCT = 3,
  CATEGORY = 4,
  ORDER = 5,
  BANNER = 6,
  PROMO_CODE = 7,
  SUB_CATEGORY = 8,
  MEDIA = 9,
}

export enum UserStatusInput {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  TOOL = 'TOOL',
  SYSTEM = 'SYSTEM',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
