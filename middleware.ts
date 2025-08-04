import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "./lib/auth-types";

async function getMiddleWareSession(req: NextRequest) {
  try {
    const { data: session } = await axios.get<Session>(
      "/api/auth/get-session",
      {
        baseURL: req.nextUrl.origin,
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );
    return session;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that should only be accessible when NOT authenticated
  const authRoutes = [
    "/sign-in",
    "/sign-up",
    "/email-verification",
    "/forgot-password",
    "/reset-password",
  ];

  // Routes that are completely public (no auth check needed)
  const publicRoutes = ["/", "/privacy", "/terms"];

  // Skip middleware for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const session = await getMiddleWareSession(request);

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (session && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (
    !session &&
    !authRoutes.includes(pathname) &&
    !publicRoutes.includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Role-based access control for authenticated users
  if (session?.user?.role) {
    const userRole = session.user.role;

    // Admin has access to everything
    if (userRole === "admin") {
      return NextResponse.next();
    }

    // User restrictions (regular user)
    if (userRole === "delivery") {
      // Block access to users management
      if (pathname.startsWith("/users")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Block modification APIs
      if (
        pathname.startsWith("/api/products") ||
        pathname.startsWith("/api/shipments")
      ) {
        const method = request.method;
        if (method === "POST" || method === "PUT" || method === "DELETE") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    // Cashier restrictions
    if (userRole === "cashier") {
      // Block access to users management
      if (pathname.startsWith("/users")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Block shipments API
      if (pathname.startsWith("/api/shipments")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Block product modification APIs
      if (pathname.startsWith("/api/products")) {
        const method = request.method;
        if (method === "POST" || method === "PUT" || method === "DELETE") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    // Delivery restrictions
    if (userRole === "delivery") {
      // Block access to users management
      if (pathname.startsWith("/users")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Block sales API
      if (pathname.startsWith("/api/sales")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Block product modification APIs
      if (pathname.startsWith("/api/products")) {
        const method = request.method;
        if (method === "POST" || method === "PUT" || method === "DELETE") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      // Block shipment creation/deletion APIs
      if (pathname.startsWith("/api/shipments")) {
        const method = request.method;
        if (method === "POST" || method === "DELETE") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on specific paths
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/users/:path*",
    "/settings/:path*",
    // Auth routes
    "/sign-in",
    "/sign-up",
    "/email-verification",
    "/forgot-password",
    "/reset-password",
    // API routes
    "/api/products/:path*",
    "/api/orders/:path*",
    "/api/shipments/:path*",
    "/api/sales/:path*",
  ],
};
