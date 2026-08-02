export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_categories_and_subcategories',
      description:
        'MUST BE CALLED whenever the user asks about categories, subcategories, or product types. Call with empty query or "all" to list all categories.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search term for categories or subcategories (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_colors_and_sizes',
      description:
        'MUST BE CALLED whenever the user asks about product colors, sizes, or attributes. Call with empty query or "all" to list all.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search term for attributes like color or size (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'MUST BE CALLED whenever the user asks about products, specific products, titles, or slugs. Call with empty query or "all" to list all products.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search term for product title or slug (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_promo_codes',
      description:
        'MUST BE CALLED whenever the user asks about promo codes, coupons, or discount codes. Call with empty query or "all" to list all.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search term for promo code or title (optional)',
          },
        },
      },
    },
  },
];
