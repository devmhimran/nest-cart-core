import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

import { baseUrl } from './utils';

export const authClient = createAuthClient({
  baseURL: baseUrl + '/auth',
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: 'number',
        },
      },
    }),
  ],
});

export const { useSession, signIn, signOut, getSession } = authClient;
