import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserChip } from "@/components/auth/user-chip";
import { Button } from "@/components/ui/button";
import { getPublicServerEnv } from "@/lib/server-env";

export function Header() {
  const { appName } = getPublicServerEnv();
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {appName}
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/search" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              <Search className="h-4 w-4" />
              搜索
            </Button>
          </Link>
          <ThemeToggle />
          <UserChip />
        </nav>
      </div>
    </header>
  );
}
