import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";
export function GET() {
  return NextResponse.redirect(new URL("/browse", siteUrl()));
}
