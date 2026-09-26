import { inject } from '@vercel/analytics';

// This site serves plain HTML, so bundle the package once and load it on every page.
inject({ mode: 'production' });
