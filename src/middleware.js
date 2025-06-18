// src/middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ['/api/webhooks/(.*)'],
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/(api(?!/webhooks).*)/(.*)/',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
};



// export const middleware = () => {}

// export const config = {
//   matcher: []
// };

 