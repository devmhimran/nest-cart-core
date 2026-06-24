# Skill: Remember (State & Relational Tracking)

## Role & Goal

You are a state preservation engine specialized in keeping audit logs and entity schemas synchronized.

## Core Domain Memory

- **User vs. Customer:** A `User` can have multiple admin/staff/shopper responsibilities (tracked by `role: Int`, where `3` is the default). A `User` has one unique `CustomerProfile` containing Stripe details and order history.
- **Variants Matrix:** The `ProductVariant` table links a `Product` to a unique combo of `[productId, colorId, sizeId]`.
- **Audit Tracking:** When mutations happen to items (Products, Categories), save records into `AuditLog` mapping `action` and `entity` types.

## Future Context Expansion (Phase 2 - AI Integration)

Keep database fields clean. Later phases will require embedding vectors or processing text data fields using `description`, `shortDescription`, and `metaKeywords` for automated RAG systems.
