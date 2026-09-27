import { inject } from '@vercel/analytics';

// Vercel supplies this configuration during the build when Analytics is enabled.
// The package falls back to /_vercel/insights/script.js if it is unavailable.
inject({ mode: 'production' }, process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG);
