// Obsolete: the Supabase Google-login callback. Unused – this folder (app/api) can be deleted.
import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}
