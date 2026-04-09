import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '@live-pool/database';

const {
  BETTER_AUTH_URL,
  AUTH_URL,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  KICK_CLIENT_ID,
  KICK_CLIENT_SECRET,
} = process.env;

export const createAuth = (prismaService: PrismaService) => {
  const baseURL = BETTER_AUTH_URL ?? '';

  return betterAuth({
    database: prismaAdapter(prismaService, {
      provider: 'postgresql',
    }),
    baseURL,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      twitch: {
        clientId: TWITCH_CLIENT_ID ?? '',
        clientSecret: TWITCH_CLIENT_SECRET ?? '',
      },
      kick: {
        clientId: KICK_CLIENT_ID ?? '',
        clientSecret: KICK_CLIENT_SECRET ?? '',
      },
    },
    session: {
      expiresIn: 60 * 5, // 5 minutes (access token)
      updateAge: 60 * 60, // 1 hour (how often to check/extend session)
    },
    trustedOrigins: [AUTH_URL ?? ''],
    basePath: '/api/auth',
  });
};

export const auth = createAuth;
export type Auth = typeof auth;
