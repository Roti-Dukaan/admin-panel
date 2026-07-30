import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const isVercelBuild = process.env.VERCEL === "1";

if (isVercelBuild && (!apiUrl || /localhost|127\.0\.0\.1/.test(apiUrl))) {
  throw new Error(
    [
      "NEXT_PUBLIC_API_URL must be set for Vercel deployments.",
      "In Vercel → Project Settings → Environment Variables, add:",
      "  NEXT_PUBLIC_API_URL=https://backend-dev.rotidukaan.com",
      "Apply to Production and Preview, then redeploy.",
    ].join("\n")
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;