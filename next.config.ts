import type { NextConfig } from "next";
const config: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  experimental: { useTypeScriptCli: false },
  allowedDevOrigins: ["whomever-cassette-granola.ngrok-free.dev"],
};
export default config;
