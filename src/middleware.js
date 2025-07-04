// src/middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn();
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/(api(?!/webhooks).*)/(.*)/',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
};




 