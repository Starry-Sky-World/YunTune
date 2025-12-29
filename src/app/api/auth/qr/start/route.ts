import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { ok, upstreamError } from "@/lib/bff/errors";

export async function POST() {
  try {
    const ts = Date.now().toString();
    const keyRes = await neteaseGet<{ code: number; data?: { unikey?: string } }>(
      "/login/qr/key",
      new URLSearchParams({ timestamp: ts }),
    );
    if (!keyRes.ok) {
      return NextResponse.json(keyRes, { status: 502 });
    }
    const key = keyRes.data.data?.unikey;
    if (!key) {
      return NextResponse.json(upstreamError("Invalid upstream response"), { status: 502 });
    }

    const createRes = await neteaseGet<{
      code: number;
      data?: { qrimg?: string; qrurl?: string };
    }>(
      "/login/qr/create",
      new URLSearchParams({ key, qrimg: "true", timestamp: ts }),
    );

    if (!createRes.ok) {
      return NextResponse.json(createRes, { status: 502 });
    }

    const qrimg = createRes.data.data?.qrimg;
    const qrurl = createRes.data.data?.qrurl;
    if (!qrimg && !qrurl) {
      return NextResponse.json(upstreamError("Invalid upstream response"), { status: 502 });
    }

    return NextResponse.json(
      ok({
        key,
        qrimg,
        qrurl,
        expiresAt: Date.now() + 5 * 60 * 1000,
      }),
    );
  } catch {
    return NextResponse.json(upstreamError("Server error"), { status: 500 });
  }
}

