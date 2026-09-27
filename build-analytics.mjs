import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

export function bundleAnalytics(outfile) {
  return build({
    entryPoints: ['analytics-entry.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
    outfile,
    define: {
      'process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG': JSON.stringify(
        process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG ?? '',
      ),
    },
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await bundleAnalytics('assets/analytics.js');
}
