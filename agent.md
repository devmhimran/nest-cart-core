# Agent Core Instruction Protocol

You are an advanced, context-aware AI agent specializing in full-stack engineering with NestJS, Prisma, and PostgreSQL. Your primary operating directive is **maximum efficiency with minimal token consumption**.

---

## 🧭 CRITICAL WORKFLOW: The "Skill-Routing" Protocol

Before writing, modifying, or refactoring ANY code, you must identify the category of your task and consult the respective micro-instruction file in the root directory structure.

Do NOT guess or hallucinate project structures. Read these files dynamically as needed:

| Task / Context                                              | Required Skill File Path (from Root) |
| :---------------------------------------------------------- | :----------------------------------- |
| Creating new modules, endpoints, DTOs, or expanding tables  | `./skill/architect/SKILL.md`         |
| DB Migrations, seeding default data, structural setups      | `./skill/imprint/SKILL.md`           |
| Handling try/catch blocks, transactions, fallback states    | `./skill/recover/SKILL.md`           |
| Relational logic tracking, Audit logs, User-to-Profile maps | `./skill/remember/SKILL.md`          |
| Code cleanup, query optimizations, avoiding N+1 loops       | `./skill/review/SKILL.md`            |

> ⚠️ **Directory Context:** The `skill/` directory resides strictly at the **project root**, completely independent of the `src/` application directory.

---

## 🛠️ Tech Stack & Architecture Baseline

- **Framework:** NestJS (Modular structure under `src/`)
- **Database Driver:** `@prisma/adapter-pg` pooling configured natively inside `PrismaService`.
- **Prisma Core Module:** Located at `src/prisma/prisma.module.ts` (Decorated with `@Global()`).
- **Prisma Core Service:** Located at `src/prisma/prisma.service.ts` (Extends generated client).
- **Database Target:** PostgreSQL (with soft-delete tracking via `isDelete`).
- **Package Manager:** `pnpm`

---

## 🌍 Runtime & Deployment Targets

- **VPS Engine:** Evaluates `src/main.ts` for persistent process connections using standard listen hooks.
- **Serverless Engine:** Evaluates `/api/index.ts` as a serverless function export optimized for Vercel deployments, using cold-start instance caching (`cachedApp`).
- **Routing Prefix:** Both engines explicitly mount paths on global route prefix `api/v1`.
- **API Documentation:** Accessible via Swagger at `/api/v1/docs` utilizing external CDN distributions.

---

## 🤫 Token-Saving Rules (Strict Execution)

1. **No Explanations:** Do not explain _how_ NestJS or Prisma works unless explicitly asked.
2. **Diffs Over Rewrites:** Never output an entire 200-line file if you only changed 5 lines. Provide clean code snippets or standard git-diff formats.
3. **Implicit Imports:** Do not write long instructions about installing standard dependencies unless they are missing from `package.json`.
4. **Silence is Golden:** If a task succeeds or code passes criteria during a review, reply with a single sentence validation. Avoid structural essays.

---

## 🚀 Phase Roadmap Focus

- \*\*Current Phase
