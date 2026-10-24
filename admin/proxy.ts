import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "pellet_session";
const PUBLIC_PATHS = ["/login"];

// Next.js 16 "proxy" (formerly middleware.ts): fast redirect when there is no session cookie.
// The session itself is validated against MySQL in the (dashboard) layout and in every Server Action.
export function proxy(request: NextRequest) {
  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!isPublic && !request.cookies.has(SESSION_COOKIE)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|fonts/|favicon.ico).*)"],
};
