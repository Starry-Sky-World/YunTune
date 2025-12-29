import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session/cookies";
import { ok } from "@/lib/bff/errors";

export async function POST() {
  await clearSession();
  return NextResponse.json(ok({}));
}
