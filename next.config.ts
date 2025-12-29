import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.music.126.net" },
      { protocol: "https", hostname: "**.music.126.com" },
      { protocol: "https", hostname: "p1.music.126.net" },
      { protocol: "https", hostname: "p2.music.126.net" },
      { protocol: "https", hostname: "p3.music.126.net" },
      { protocol: "https", hostname: "p4.music.126.net" },
      { protocol: "https", hostname: "p5.music.126.net" },
    ],
  },
  ...({ typescript: { ignoreBuildErrors: true } } as any),
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
