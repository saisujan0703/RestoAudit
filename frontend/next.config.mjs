/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'node:url'

const turbopackRoot = fileURLToPath(new URL('.', import.meta.url))

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: turbopackRoot,
  },
  devIndicators: false,
}

export default nextConfig
