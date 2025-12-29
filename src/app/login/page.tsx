"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StartRes =
  | { ok: true; data: { key: string; qrimg?: string; qrurl?: string; expiresAt: number } }
  | { ok: false; error: { code: string; message: string } };

type PollRes = { ok: true; data: { status: string } } | { ok: false; error: { code: string; message: string } };

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = React.useState<{
    loading: boolean;
    key?: string;
    qrimg?: string;
    expiresAt?: number;
    status?: string;
  }>({ loading: true });

  const start = React.useCallback(async () => {
    setState({ loading: true });
    const res = await fetch("/api/auth/qr/start", { method: "POST" });
    const json = (await res.json()) as StartRes;
    if (!json.ok) {
      toast.error("获取二维码失败", { description: json.error.message });
      setState({ loading: false });
      return;
    }
    setState({ loading: false, key: json.data.key, qrimg: json.data.qrimg, expiresAt: json.data.expiresAt, status: "waiting" });
  }, []);

  React.useEffect(() => {
    void start();
  }, [start]);

  React.useEffect(() => {
    if (!state.key) return;
    if (!state.expiresAt) return;

    let active = true;
    const tick = async () => {
      if (!active) return;
      if (Date.now() > state.expiresAt!) {
        setState((s) => ({ ...s, status: "expired" }));
        return;
      }
      try {
        const res = await fetch(`/api/auth/qr/poll?key=${encodeURIComponent(state.key!)}`);
        const json = (await res.json()) as PollRes;
        if (!json.ok) {
          toast.error("登录状态查询失败", { description: json.error.code });
          return;
        }
        const status = json.data.status;
        setState((s) => ({ ...s, status }));
        if (status === "authorized") {
          toast.success("登录成功");
          router.replace("/");
        }
      } catch {
        // ignore network blips
      }
    };

    const id = window.setInterval(() => void tick(), 2000);
    void tick();
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [router, state.expiresAt, state.key]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">二维码登录</h1>
      <p className="mt-2 text-sm text-black/70 dark:text-white/70">仅使用二维码登录，网易 Cookie 明文不会暴露给前端。</p>

      <Card className="mt-6">
        {state.loading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-36 w-36 rounded-3xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="rounded-3xl bg-black/5 p-3 dark:bg-white/10">
              {state.qrimg ? (
                <Image src={state.qrimg} alt="QR" width={180} height={180} className="h-40 w-40 rounded-2xl" />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center text-sm text-black/60 dark:text-white/60">
                  暂无二维码
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">使用网易云音乐 App 扫码登录</div>
              <div className="mt-2 text-sm text-black/70 dark:text-white/70">
                状态：
                {state.status === "waiting"
                  ? "等待扫码"
                  : state.status === "scanned"
                    ? "已扫码，等待确认"
                    : state.status === "expired"
                      ? "已过期"
                      : state.status === "authorized"
                        ? "已授权"
                        : "—"}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={() => void start()}>刷新二维码</Button>
                <Button variant="secondary" onClick={() => router.replace("/")}>
                  返回首页
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

