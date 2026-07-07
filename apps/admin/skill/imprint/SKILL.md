# Skill: Imprint (ι_imp)

## 🎯 Mandate

Execute hyper-optimized code generation routines to automatically stamp flawless CRUD features across your directories without redundant boilerplate overhead.

## 📝 Tokenized Code Blueprints (TPC)

### 1. α_api Layout Pattern

- **Behavior:** Export a domain-specific object mapping explicit network requests via `api` methods from `@/lib/fetch`.
- **Signature:** Include methods for collection fetch (`get`), single entity mutations (`create`, `update`), and destruction (`delete`).

### 2. ψ_hook Layout Pattern

- **Behavior:** Compose TanStack Query mutations and pagination-aware queries using `τ_typ` signature interfaces.
- **Signature:** Export functional query hook names following `use{Entity}` and mutation blocks following `use{Entity}Mutation`. Enforce query client invalidation rules (`qc.invalidateQueries`) targeting the active entity cache keys strictly upon `onSuccess` invocation. Use `keepPreviousData` configuration flags for paginated states.

### 3. τ_typ Layout Pattern

- **Behavior:** Dedicate distinct entity contract definition files (e.g., `color.ts`) and register their contents straight to the `types/index.ts` aggregator using `export * from './entity'` conventions.

### 4. φ_form Layout Pattern

- **Behavior:** Construct high-density controlled client forms driven by React Hook Form bound to a strict validation schema via `zodResolver(schema)`.
- **Typography & Primitive Controls:** Wrap every individual form interactive input block entirely inside a custom Shadcn `<FieldSet>` component configured to pass down local reactive `error` strings and field `label` headers automatically. Enforce a final, full-width submission element using a primary `<Button>` node.
- **Imports:** Every single design tree component must be extracted strictly from the `@repo/ui` workspace barrel.

### 5. λ_page Layout Pattern

- **Behavior:** Assemble an immersive management container component (e.g., `{Domain}SearchContainer`).
- **Visual Standards:** Render titles using modern, high-density typographic configurations: `text-3xl font-bold tracking-tight`.
- **State & Filter Interaction:** Integrate search string states and filtering matrices directly with custom fetching hooks. Provide an operational `<Dialog>` trigger modal containing the target matching `φ_form`. On form action completion (`onSuccess`), programmatically toggle the modal open state to false to smoothly transition layout focus.
