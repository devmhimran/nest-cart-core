export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_categories',
      description:
        'Search or list top-level categories. For UPDATE or DELETE, extract the existing name. For READ or LIST, pass the search term or "all". Also use this to resolve categoryId when creating/updating a subCategory or product.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Search query term (e.g., "Electronics", "Men", or "all" to list all categories).',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_subcategories',
      description:
        'Search or list subcategories. For UPDATE or DELETE, extract the existing name. For READ or LIST, pass the search term or "all". Also use this to resolve subCategoryId when creating/updating a product.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Search query term (e.g., "Shirts", "Laptops", or "all" to list all subcategories).',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_colors',
      description:
        'Search or list colors. For UPDATE or DELETE, extract the existing color name (e.g., "Magenta"). For READ or LIST, pass the name or "all". Also use this to resolve colorId for product variants.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Exact existing color name (e.g., "Magenta", or "all" to list all colors).',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_sizes',
      description:
        'Search or list sizes. For UPDATE or DELETE, extract the existing size name (e.g., "XL"). For READ or LIST, pass the name or "all". Also use this to resolve sizeId for product variants.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Exact existing size name (e.g., "XL", or "all" to list all sizes).',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Search or list products. For UPDATE or DELETE, extract the current title or slug. For READ or LIST, pass keywords or "all".',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Product title, slug, or search phrase (or "all" to list products).',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_promo_codes',
      description:
        'Search or list promo codes. For UPDATE or DELETE, extract the target promo code string. For READ or LIST, pass the code or "all".',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Promo code string or title (e.g., "SUMMER20" or "all" to list all).',
          },
        },
        required: [],
      },
    },
  },
];
