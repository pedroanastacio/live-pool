import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { redisStorage } from '@better-auth/redis-storage';
import { PrismaService } from '@live-pool/database';
import type Redis from 'ioredis';

const {
  BETTER_AUTH_URL,
  AUTH_URL,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  KICK_CLIENT_ID,
  KICK_CLIENT_SECRET,
} = process.env;

export const createAuth = (
  prismaService: PrismaService,
  redisClient: Redis,
) => {
  const baseURL = BETTER_AUTH_URL ?? '';

  return betterAuth({
    database: prismaAdapter(prismaService, {
      provider: 'postgresql',
    }),
    secondaryStorage: redisStorage({
      client: redisClient,
      keyPrefix: 'better-auth:',
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
      expiresIn: 60 * 60 * 24 * 3,
      updateAge: 60 * 60 * 24,
      storeSessionInDatabase: true,
    },
    trustedOrigins: [AUTH_URL ?? ''],
    basePath: '/api/auth',
  });
};
