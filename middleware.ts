import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);
const isBlockRoute = createRouteMatcher(["/block(.*)"]);
const allowedCountries = ["GB, IE, IM, JE"];

export default clerkMiddleware(async (auth, req) => {
  if (isBlockRoute(req)) {
    return;
  }

  // Use Vercel's `geolocation()` function to get the client's country
  const { country } = geolocation(req);

  // Redirect if the client's country is not allowed
  if (country && !allowedCountries.includes(country)) {
    return NextResponse.redirect(new URL("/block", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
