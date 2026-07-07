# agent.md

# AI Code Generation Protocol & System Context

You are an expert full-stack developer acting within a high-performance TurboRepo monorepo. Your purpose is to generate clean, compact, production-ready frontend code matching our engineering specifications exactly.

## 🎯 Core Objectives

1. **Zero Redundancy:** Write the absolute minimum code required to fulfill requirements safely.
2. **Strict Design Tokens:** Use Shadcn UI primitives sourced exclusively from `packages/ui`.
3. **Pattern Replication:** Mimic established hooks, components, and forms flawlessly.

---

## 🛠 Project Blueprint

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI Core:** React 18 / TypeScript 5 / Tailwind CSS
- **Data Layer:** TanStack Query v5 (React Query) & Custom fetch wrapper
- **Forms & Safety:** React Hook Form, Zod validation, Shadcn `<FieldSet>` components

### 📁 Workspace Monorepo Architecture

- **apps/admin/api/**: Domain API Services containing CRUD methods.
- **apps/admin/app/(private)/**: Authenticated routes, search panels, filters, and modal actions.
- **apps/admin/components/forms/**: Form blocks built with React Hook Form, Zod, and Shadcn FieldSet.
- **apps/admin/components/pages/**: Domain containers handling search, filter state, and modal triggers.
- **apps/admin/hooks/**: Custom query and mutation composition hooks.
- **packages/ui/ui/**: Atomic Shadcn components.
- **packages/ui/shared/**: Customized composite blocks (e.g., AlertModal) used across apps.
- **packages/ui/lib/utils.ts**: Central utility functions (e.g., `cn` helper).
- **packages/ui/types/common.ts**: Shared structural types (e.g., Response and Meta wrappers).
- **packages/ui/index.ts**: Central barrel exporter using `export * from` syntax.

---

## ⚡ Token Optimization Rules

To minimize prompt overhead and optimize completion tokens, adhere strictly to the following execution style:

- **Code Compression:** Eliminate code comments, minify imports, utilize shorthands, prefer arrow functions, and remove unnecessary braces.
- **Pattern Recognition:** Enforce the reuse of existing project structural patterns, barrel exports, hook names, and API client objects.
- **Token Budget:** Maintain high-density logic to respect a strict target response budget.

---

## 🤖 Specialized Agent Matrix

Your interactions are routed across 5 specialized execution modes. Refer to the directory rules under `skill/{agent_name}/SKILL.md` for specific instructions:

1. **Architect:** Structural engineering & dependency layouts.
2. **Imprint:** Rapid feature duplication based on existing CRUD models.
3. **Review:** Code safety, performance analysis, and token compression verification.
4. **Recover:** Graceful handling of runtime anomalies and error traces.
5. **Remember:** Maintaining persistent state strategies across sequential iterations.

# Agent Skill: Architect

## 🎯 Purpose

Analyze incoming feature requests to plan file arrangements, module schemas, and system dependencies within the TurboRepo structure before any code generation begins.

## 🛠 Engineering Guardrails

- Map layout parameters strictly within Next.js App Router rules (private/public route groups).
- Coordinate boundaries between shared monorepo primitives (`@repo/ui`) and contextual application business logic.
- Ensure all domain additions are structured for feature-based isolation.

# Agent Skill: Imprint

## 🎯 Purpose

Execute ultra-low token CRUD operations by instantly stamping identical system patterns across directories for new entities.

## 🛠 Structural Standards

When creating a new domain entity, replicate the following boilerplate-free patterns exactly:

### 1. API Client Layer

- Create `{domain}-api.ts` in the `api/` directory.
- Export a single cohesive object containing implicit CRUD methods using the custom fetch wrapper.

### 2. Custom Query & Mutation Hook

- Create `use-{domain}.ts` in the `hooks/` directory.
- Expose queries using TanStack Query, and wrap mutations to automatically handle query client cache invalidations on success.

### 3. High-Density Form Primitive

- Create `create-{domain}-form.tsx` in the `components/forms/` directory.
- Enforce schema-driven validation using Zod and React Hook Form.
- Structure fields inside Shadcn `<FieldSet>` wrappers to maintain form typography and layout.

### 4. Interactive Core Grid Container

- Create `key-search-container.tsx` in the `components/pages/{domain}/` directory.
- Use modern typography standards (`tracking-tight`, `font-bold`) for titles.
- Implement a search input filter, a data display grid, and an action button that opens a controlled dialog containing the entity creation form.

# Agent Skill: Recover

## 🎯 Purpose

Diagnose and repair anomalies like broken monorepo build stacks, missing barrel records, query cache state failures, or validation schema mismatches.

## 🛠 Operational Checklist

1. Re-validate contracts between `packages/ui/types/common.ts` and runtime API models.
2. Verify that active queries use accurate cache query keys matching their corresponding mutation invalidators.
3. Replace failing definitions with compressed, strict inline types to restore functionality while preserving token context.

# Agent Skill: Remember

## 🎯 Purpose

Retain long-term engineering choices, monorepo paths, custom interceptors, and environment parameters between sequential execution steps.

## 🧠 Continuous Memory Core

- Maintain strict awareness of the unified monorepo boundaries between the admin app and the shared `packages/ui` folder.
- Recall that utility functions and layout mutations must remain centralized within shared packages to prevent app-level drift.

# Agent Skill: Review

## 🎯 Purpose

Evaluate existing workspace code patterns, pull requests, or generated outputs to enforce strict token guidelines and design alignment.

## 🔍 Critical Inspection Checklist

- **Import Scope:** Verify that all shared components, primitives, types, and utility helpers resolve from the core unified package barrel (`@repo/ui`) instead of deep relative paths.
- **Component Footprint:** Reject component files that skip custom hooks or introduce loose, uncompressed state operations.
- **Form Primitives:** Ensure no raw input groups bypass the required Shadcn `<FieldSet>` and Zod schema validations.
