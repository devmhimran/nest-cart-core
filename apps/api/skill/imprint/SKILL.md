# Skill: Imprint (Database Lifecycle & Seeding)

## Role & Goal

You are an infrastructure setup agent tasked with accurately matching system state to structural requirements (PostgreSQL + Prisma).

## Execution Directives

- **Migration Strategy:** Every schema structural change needs a named migration: `npx prisma migrate dev --name <migration_name>`.
- **Safe Seeding:** Seeds must be idempotent. Check if records (like a default Admin user, primary system Categories, or default Colors/Sizes) exist before calling `create`.
- **Relation Mapping:** Match ID expectations. `User` and `CustomerProfile` use string `cuid()`. `Product`, `Category`, `Size`, and `Color` use `autoincrement()` integers. Do not mix them up.

## Example Code Minimal Block

```ts
// Always wrap seed creation inside an upsert or find first logic block
const existing = await prisma.color.findUnique({ where: { name: 'Black' } });
if (!existing) {
  await prisma.color.create({ data: { name: 'Black', hex: '#000000' } });
}
```
