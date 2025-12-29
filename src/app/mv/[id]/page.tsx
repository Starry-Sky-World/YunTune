"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MvPage() {
  const params = useParams<{ id: string }>();
  return (
    <Card>
      <div className="text-sm font-medium">MV</div>
      <div className="mt-1 text-sm text-black/70 dark:text-white/70">
        MVP 暂不保证 MV 播放稳定性：当前仅提供占位页（可后续接入 `/mv/url` 等接口）。
      </div>
      <div className="mt-4">
        <Link href="/search">
          <Button variant="secondary" size="sm">
            返回搜索
          </Button>
        </Link>
      </div>
      <div className="mt-3 text-xs text-black/50 dark:text-white/50">MV ID: {params.id}</div>
    </Card>
  );
}
