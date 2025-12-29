import type { MetadataRoute } from "next";
import { getPublicServerEnv } from "@/lib/server-env";

export default function manifest(): MetadataRoute.Manifest {
  const { appName } = getPublicServerEnv();
  return {
    name: appName,
    short_name: appName,
    description: "YunTune — a lightweight Netease music client",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
