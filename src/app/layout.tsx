import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/toaster";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { Header } from "@/components/shell/header";
import { AudioController } from "@/components/player/audio-controller";
import { PlayerBar } from "@/components/player/player-bar";
import { RecentTracker } from "@/components/player/recent-tracker";
import { getPublicServerEnv } from "@/lib/server-env";

export const metadata: Metadata = {
  title: (() => {
    const { appName } = getPublicServerEnv();
    return { default: appName, template: `%s · ${appName}` };
  })(),
  description: "YunTune — a lightweight Netease music client",
  manifest: "/manifest.webmanifest",
  appleWebApp: (() => {
    const { appName } = getPublicServerEnv();
    return { capable: true, statusBarStyle: "black-translucent" as const, title: appName };
  })(),
  icons: { icon: "/icon", apple: "/apple-icon" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <AudioController />
          <RecentTracker />
          <Header />
          <main className="mx-auto max-w-5xl px-4 pb-[calc(env(safe-area-inset-bottom)+10rem)] pt-6">{children}</main>
          <PlayerBar />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
