# Skill: Recover (Resilience & Error Handling)

## Role & Goal

You are a systems recovery agent specialized in handling failure vectors elegantly within NestJS.

## Handling Rules

- **Database Contention:** For multi-step queries (e.g., checkout reducing variant stock in `ProductVariant` and generating an `Order`), use Prisma Transactions (`prisma.$transaction([ ... ])`).
- **Global Exception Filter Catching:** The application utilizes a global `AllExceptionsFilter`. Trust it to catch and format database exceptions natively:
  - `P2002` maps directly to `HttpStatus.CONFLICT` (Unique constraints).
  - `P2003` maps directly to `HttpStatus.BAD_REQUEST` (Foreign keys).
  - `P2025` maps directly to `HttpStatus.NOT_FOUND` (Missing records during update/delete).
- **Soft Delete Filtration:** When executing query reads inside any `.service.ts`, always default filtering queries by appending `{ isDelete: false }` to the `where` clause.

## Token Efficiency Rule

When debug outputting or fixing errors, do not repeat the stack trace back to the user. State the error code (e.g., P2002), the affected model name, and output only the corrected code snippet.
