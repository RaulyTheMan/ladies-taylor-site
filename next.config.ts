import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Admin forms (desktop windows, events, brands, posts, dock apps) all
    // upload images straight through Server Actions. Next's default 1MB
    // cap gets hit by any normal phone photo, so it's raised to cover
    // typical uploads with headroom.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      // The sales pipeline moved permanently to the standalone CRM, and these
      // two sections are deleted in the same commit as this redirect — the
      // pages and the redirect must never coexist, or the sections become
      // silently unreachable. Kept as 308s so old bookmarks still land
      // somewhere useful.
      {
        source: "/admin/leads",
        destination: "https://leads.ladiestaylor.com",
        permanent: true,
      },
      {
        source: "/admin/forms",
        destination: "https://leads.ladiestaylor.com",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Blocks the whole site (including /admin/login) from being
          // framed by another origin — the main clickjacking defense.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
