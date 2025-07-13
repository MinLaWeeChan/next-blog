// src/middleware.js
import { clerkMiddleware, createRouteMatcher, redirectToSignIn } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
};




 