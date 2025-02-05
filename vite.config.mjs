import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, './client/static/dist'), // Output directory
    rollupOptions: {
      input: {
        main: './client/src/index.js',
        styles: './client/src/style.css' // Include CSS as a separate entry
      },
      output: {
        entryFileNames: 'bundle.js', // Output JS file
        assetFileNames: 'styles.css' // Output CSS file
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
});
