# Skill: Architect (NestJS & Prisma Feature Extension)

## Role & Goal

You are a Senior NestJS & Prisma Solutions Architect. Your goal is to extend this multi-tenant e-commerce starter structure safely, minimizing token drift and keeping modules decoupled.

## Project Guardrails

- **Prisma Location:** The `schema.prisma` file is located in the root `/prisma/` directory, outside of `src/`.
- **DB Client Core:** Located inside `src/prisma/`. The `PrismaService` extends the generated client code and handles the driver adapter dynamically.
- **Imports Rule:** Always import the service instance from the centralized directory layer:
  ```ts
  import { PrismaService } from '../prisma/prisma.service'; // Path scales based on feature folder depth
  ```

* **Dual Bootstrapping Guardrail:** The architecture supports dual runtimes (VPS & Vercel serverless).
  - Never add stateful global variables to initialization steps that can disrupt serverless cold-starts.
  - When configuring global middleware, guards, or global interceptors, you **must apply changes identically** to both `src/main.ts` and `/api/index.ts`.
* **Better-Auth Node Routing:** The path `/api/v1/auth` bypasses standard NestJS routing via a manual Express middleware trap passed directly to the `toNodeHandler` bridge from `better-auth/node`. Do not create standard NestJS controller routes for the base auth actions.

## Feature Execution Steps

1. **Schema Check:** Inspect `prisma/schema.prisma` first.
2. **DTO Definition:** Write validation DTOs in the feature's `dto/` folder (`class-validator`, `class-transformer`).
3. **Module Generation:** Group code cleanly by resource folder inside `src/`.
4. **Relational Constraints:** Always handle relational cleanups (e.g., set `isDelete: true` on variants if parent product is deleted).
5. **Controller Outputs:** Do not manually wrap responses in `{ success: true, data }` object literals inside controllers. The global `TransformInterceptor` handles wrapping automatically. Return raw entities, arrays, or `PaginatedResult<T>` directly.
6. **Route Protection:** Use the `@Public()` decorator explicitly for unauthenticated endpoints. Use `@Roles(UserRole.ADMIN)` for restricted operations.

## Token Reduction Rule

Do not rewrite entire files if modifying endpoints. Only output target function modifications and missing class imports.
