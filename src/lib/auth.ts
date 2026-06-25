import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db';

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:4321';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [
    baseURL,
    'https://desatascos-valencia.vercel.app',
    'https://desatascosvalencia24h.com',
  ],
  user: {
    additionalFields: {
      // rol de la app: "admin" | "user". No se puede setear en el registro (input:false).
      role: { type: 'string', required: false, defaultValue: 'user', input: false },
    },
  },
});

export type AppSession = typeof auth.$Infer.Session;
