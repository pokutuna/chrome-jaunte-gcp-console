import * as path from 'path';

import {defineConfig} from 'vite';

import packageJson from './package.json' with {type: 'json'};
import {manifestPlugin} from './scripts/vite-manifest-plugin.ts';

const rootDir = import.meta.dirname;
const srcDir = path.join(rootDir, 'src');

export default defineConfig({
  root: srcDir,
  publicDir: false,
  build: {
    outDir: path.join(rootDir, 'build'),
    emptyOutDir: true,
    minify: false,
    sourcemap: 'inline',
    rollupOptions: {
      input: {
        background: path.join(srcDir, 'background.ts'),
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  plugins: [
    manifestPlugin({
      srcManifest: path.join(srcDir, 'manifest.json'),
      srcImgDir: path.join(srcDir, 'img'),
      packageDescription: packageJson.description,
      packageVersion: packageJson.version,
    }),
  ],
});
