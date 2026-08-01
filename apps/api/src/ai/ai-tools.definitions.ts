export const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_categories_and_subcategories',
      description:
        'MUST BE CALLED whenever the user asks about categories, subcategories, or product types. Returns category IDs and names.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search term for categories',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_colors_and_sizes',
      description:
        'MUST BE CALLED whenever the user asks about product colors, sizes, or attributes.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search term for attributes like color or size',
          },
        },
        required: ['query'],
      },
    },
  },
];
