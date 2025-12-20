import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN";
    const isCP = token?.role === "CHANNEL_PARTNER";
    const isVisitor = token?.role === "VISITOR";

    // Admin routes
    if (req.nextUrl.pathname.startsWith("/dashboard") && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Channel Partner routes
    if (req.nextUrl.pathname.startsWith("/cp") && !isCP && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't need auth
        const publicRoutes = ["/", "/projects", "/price-trends", "/login", "/register-cp"];
        if (publicRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route))) {
          return true;
        }

        // Protected routes need token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/cp/:path*"],
};

