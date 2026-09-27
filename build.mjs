import { cp, mkdir, rm } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { bundleAnalytics } from './build-analytics.mjs';

const projectRoot = process.cwd();
const output = resolve(projectRoot, 'dist');
if (relative(projectRoot, output) !== 'dist') {
  throw new Error('Build output must stay inside the project.');
}
const staticFiles = [
  'index.html',
  'styles.css',
  'script.js',
  'demo-form.js',
  'leads-config.js',
];
const staticDirectories = ['assets', 'work', 'pricing', 'outputs', 'integrations'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of staticFiles) {
  await cp(file, join(output, file));
}
for (const directory of staticDirectories) {
  await cp(directory, join(output, directory), { recursive: true });
}

await bundleAnalytics(join(output, 'assets', 'analytics.js'));
