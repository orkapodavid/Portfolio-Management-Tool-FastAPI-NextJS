/* eslint-env node */
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isTauriBuild = process.env.TAURI_BUILD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isTauriBuild
    ? {
        output: 'export',
        images: {
          unoptimized: true,
        },
      }
    : {}),
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
          async: true, // Run type checking synchronously to block the build
          typescript: {
            configOverwrite: {
              compilerOptions: {
                skipLibCheck: true,
              },
            },
          },
        })
      );
    }
    return config;
  },
};

export default nextConfig;
