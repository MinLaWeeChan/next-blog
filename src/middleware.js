import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/api/webhooks(.*)'],
});

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    // Protected API routes (excluding webhooks)
    '/(api(?!/webhooks).*)/:path*',
    // Auth routes
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
};

// export const middleware = () => {}

// export const config = {
//   matcher: []
// };

 