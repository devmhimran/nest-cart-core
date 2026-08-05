import { AI_TOOLS } from './ai-tools.definitions';

export const KNOWN_TOOL_NAMES = new Set(AI_TOOLS.map((t) => t.function.name));

// Maps normalized entity keywords -> the real tool name that handles them.
const ENTITY_TOOL_MAP: Record<string, string> = {
  category: 'search_categories',
  categories: 'search_categories',

  subcategory: 'search_subcategories',
  subcategories: 'search_subcategories',
  subcat: 'search_subcategories',
  subcats: 'search_subcategories',

  color: 'search_colors',
  colors: 'search_colors',

  size: 'search_sizes',
  sizes: 'search_sizes',

  product: 'search_products',
  products: 'search_products',

  promocode: 'search_promo_codes',
  promocodes: 'search_promo_codes',
  coupon: 'search_promo_codes',
  coupons: 'search_promo_codes',
  discount: 'search_promo_codes',
  discounts: 'search_promo_codes',
};

const VERB_PREFIX_REGEX =
  /^(search|find|get|list|view|fetch|query|lookup|create|update|edit|change|set|modify|delete|remove|add|insert)_/i;

export function resolveToolAlias(hallucinatedName: string): string | null {
  if (KNOWN_TOOL_NAMES.has(hallucinatedName)) return hallucinatedName;

  const normalized = hallucinatedName
    .replace(VERB_PREFIX_REGEX, '')
    .replace(/[_\-\s]/g, '')
    .toLowerCase();

  if (ENTITY_TOOL_MAP[normalized]) return ENTITY_TOOL_MAP[normalized];

  // Fallback: substring match against known entity keywords, in case of
  // slight variations (e.g. "subcat", "promocodesearch").
  for (const [keyword, toolName] of Object.entries(ENTITY_TOOL_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return toolName;
    }
  }

  return null;
}
