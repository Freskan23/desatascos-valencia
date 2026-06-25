// Crea (o promueve) la cuenta admin. Uso:
//   ADMIN_EMAIL=tu@email ADMIN_PASSWORD=... npm run seed:admin
// Requiere DATABASE_URL (Neon) ya migrada.
import 'dotenv/config';
import { auth } from '../src/lib/auth';
import { prisma } from '../src/lib/db';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Admin';

if (!email || !password) {
  console.error('Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD en el entorno.');
  process.exit(1);
}

const existing = await prisma.user.findUnique({ where: { email } });
if (!existing) {
  await auth.api.signUpEmail({ body: { email, password, name } });
  console.log('✓ Usuario creado:', email);
} else {
  console.log('• Usuario ya existía:', email);
}

await prisma.user.update({ where: { email }, data: { role: 'admin' } });
console.log('✓ Rol admin asignado a', email);
process.exit(0);
