import { defineMiddleware } from 'astro:middleware';
import { auth } from '@/lib/auth';

// Protege /dashboard (sesión) y /api/admin + /dashboard/editor (solo admin).
// El resto (marketing estático en public/, /api/contact|chat|events|auth, /login) pasa libre.
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const needsSession = path.startsWith('/dashboard') || path.startsWith('/api/admin');
  if (!needsSession) return next();

  const session = await auth.api.getSession({ headers: context.request.headers });

  if (!session) {
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login?next=' + encodeURIComponent(path));
  }

  context.locals.user = session.user as App.Locals['user'];

  const adminOnly = path.startsWith('/api/admin') || path.startsWith('/dashboard/editor');
  if (adminOnly && session.user.role !== 'admin') {
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Requiere rol admin' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/dashboard');
  }

  return next();
});
