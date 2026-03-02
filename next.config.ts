import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export
  distDir: 'out',   // Output directory for GitHub Pages
  images: { unoptimized: true }, // Disable image optimization for static export
  trailingSlash: true, // Required for GitHub Pages
  basePath: '', // Set this to your repo name if deploying to a subpath
};

export default nextConfig;
