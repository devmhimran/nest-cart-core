import { AiChatMessage, AiResponse } from './interfaces/ai-provider.interface';

const REQUIRED_UPDATE_FIELDS: Record<string, string[]> = {
  category: ['name', 'slug'],
  subCategory: ['name', 'slug', 'categoryId'],
  color: ['name', 'hex'],
  size: ['name'],
  promoCode: ['code', 'title', 'amount', 'startDate', 'endDate'],
  product: ['title', 'slug', 'basePrice'],
};

function toArray<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : [data];
}

export function backfillProposalFromToolResults(
  response: AiResponse,
  history: AiChatMessage[],
): AiResponse {
  const metadata = response.metadata;
  const proposal = metadata?.proposal;

  if (
    metadata?.type !== 'proposal' ||
    !proposal ||
    proposal.action !== 'update' ||
    !proposal.data
  ) {
    return response;
  }

  const requiredFields = REQUIRED_UPDATE_FIELDS[proposal.entity];
  if (!requiredFields) return response;

  const toolResultItems: Record<string, unknown>[] = [];
  for (const msg of history) {
    if (String(msg.role).toLowerCase() !== 'tool' || !msg.content) continue;
    try {
      const parsed: unknown = JSON.parse(msg.content);
      console.log(`Parsed tool result: ${JSON.stringify(parsed)}`);
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { items?: unknown }).items)
      ) {
        toolResultItems.push(
          ...(parsed as { items: Record<string, unknown>[] }).items,
        );
      }
    } catch {
      // not a JSON tool result — skip
    }
  }

  const wasArray = Array.isArray(proposal.data);
  const items = toArray(proposal.data) as Record<string, unknown>[];

  const backfilledItems = items.map((item) => {
    if (typeof item.id === 'undefined') return item;

    const match = toolResultItems.find((r) => r.id === item.id);
    if (!match) return item;

    const merged: Record<string, unknown> = { ...item };
    for (const field of requiredFields) {
      const current = merged[field];
      const candidate = match[field];
      if (
        (current === undefined || current === null) &&
        candidate !== undefined
      ) {
        merged[field] = candidate;
      }
    }
    return merged;
  });

  const backfilledData = wasArray ? backfilledItems : backfilledItems[0];

  return {
    ...response,
    metadata: {
      ...metadata,
      proposal: {
        ...proposal,
        data: backfilledData,
      },
    },
  };
}

export function enforceReadDataFromToolResults(
  response: AiResponse,
  history: AiChatMessage[],
): AiResponse {
  const metadata = response.metadata;
  const read = metadata?.read;

  if (metadata?.type !== 'read' || !read?.entity) {
    return response;
  }

  const toolResultItems: Record<string, unknown>[] = [];
  for (const msg of history) {
    console.log({ history });
    if (String(msg.role).toLowerCase() !== 'tool' || !msg.content) continue;
    try {
      const parsed: unknown = JSON.parse(msg.content);
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { items?: unknown }).items)
      ) {
        toolResultItems.push(
          ...(parsed as { items: Record<string, unknown>[] }).items,
        );
      }
    } catch {
      // not a JSON tool result — skip
    }
  }

  const matchingItems = toolResultItems.filter(
    (item) => item.entityType === read.entity,
  );

  if (matchingItems.length === 0) {
    return response;
  }

  const cleanedItems = matchingItems.map((item) => {
    const copy = { ...item };
    delete copy.entityType;
    return copy;
  });

  return {
    ...response,
    metadata: {
      ...metadata,
      read: {
        ...read,
        data: cleanedItems,
      },
    },
  };
}
