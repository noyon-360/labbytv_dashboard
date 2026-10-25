import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // Every page waits for the browser-side session check (the refresh token is in
    // localStorage), so no navigation here can be "instant" in Next's sense and the
    // default check flags every page as "dropped from rendering". Only validate
    // segments that opt in with `export const instant = true`.
    instantInsights: { validationLevel: "manual-warning" },
  },
  // Dev only: let the dev server be opened from other devices on the local network
  // (e.g. http://192.168.0.117:3000). Without this Next blocks its dev scripts and the page never hydrates.
  allowedDevOrigins: ["192.168.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
};

export default nextConfig;
