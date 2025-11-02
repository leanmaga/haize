import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/shop(.*)',
  '/about(.*)',
  '/api/products(.*)',
]);

const isAdminRoute = createRouteMatcher(['/dashboard(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // ✅ Clerk guarda custom data en `publicMetadata`
  const isAdmin = sessionClaims?.publicMetadata?.role === 'admin';

  console.log('🔍 Middleware Debug:', {
    userId,
    path: req.nextUrl.pathname,
    isAdmin,
    publicMetadata: sessionClaims?.publicMetadata,
  });

  // 🔒 Rutas de admin
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (!isAdmin) {
      console.log('⚠️ Usuario no admin intentando acceder a ruta admin');
      return NextResponse.redirect(new URL('/profile', req.url));
    }
  }

  // 🔒 Rutas protegidas (no públicas)
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 🚀 Redirección post-login (sign-in / sign-up)
  if (
    userId &&
    (req.nextUrl.pathname.startsWith('/sign-in') ||
      req.nextUrl.pathname.startsWith('/sign-up'))
  ) {
    console.log('🚀 Post-login redirect, isAdmin:', isAdmin);

    if (isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/profile', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
