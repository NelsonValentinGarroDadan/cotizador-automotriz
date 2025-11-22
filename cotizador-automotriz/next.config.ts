import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    "192.168.0.103",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
