// Singleton de PrismaClient con driver adapter de Neon (serverless-safe).
// Runtime: URL pooled (DATABASE_URL con -pooler). La conexión es perezosa (no conecta al importar).
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const g = globalThis as unknown as { __prisma?: PrismaClient };

function make(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = g.__prisma ?? make();
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma;
