import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';

export const prerender = false;

// Better Auth maneja todos sus endpoints bajo /api/auth/** (sign-in, sign-out, session, ...)
export const ALL: APIRoute = ({ request }) => auth.handler(request);
