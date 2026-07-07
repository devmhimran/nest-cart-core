# Skill: Remember (μ_rem)

## 🎯 Mandate

Retain global workspace selections, environment variable states, architecture schemas, and custom API interceptor requirements throughout multi-step conversational lifecycles.

## 🧠 Continuous Memory Core

- **Monorepo Separation Awareness:** Maintain permanent clarity on package splits, specifically recognizing what code patterns belong inside the workspace consumer application (`apps/admin/`) versus the localized library provider package (`packages/ui/`).
- **Centralization Rules:** Prevent feature drift by verifying that general operations and shared utilities consistently extend existing features found inside `packages/ui/lib/utils.ts`, `apps/admin/types/index.ts` structures, and application configurations defined within `⚙_cfg`.
