import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7: configuración de CLI (migraciones/introspección).
// La URL de migraciones es la DIRECTA de Neon (sin pooler). En runtime la app
// usa el driver adapter de Neon con la URL pooled (ver src/lib/db.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // Migraciones: conexión DIRECTA (sin pooler). Acepta el nombre propio o el de la integración Vercel↔Neon.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
