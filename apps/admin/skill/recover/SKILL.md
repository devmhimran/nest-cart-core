# Skill: Recover (ε_rec)

## 🎯 Mandate

Locate, isolate, and debug runtime anomalies, build script errors, or backend contract changes using the minimum token fingerprint footprint possible.

## 🛠 Operational Fix Vectors

1. **Validation Failures:** Audit schema alignments across `apps/admin/config/env.ts` whenever configuration properties throw environment mismatches.
2. **Network Failures:** Inspect custom interceptor behaviors within the `apps/admin/lib/fetch.ts` client layer on authentication or connection trace disruptions.
3. **Type Safety & Export Integrity:** Check for circular references or syntax breaks inside `apps/admin/types/index.ts`. Verify data signatures against definitions in `packages/ui/types/common.ts`. Use dense, inline structural casting (`as any`) strictly as a last resort to bypass breaking compiler block sequences.
4. **Cache Synchronization Drops:** Trace query key configurations whenever data arrays fail to refresh immediately following successful mutation changes. Ensure cache clear strings align perfectly with invalidation targets.
