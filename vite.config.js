import { defineConfig } from 'vite';
// import swc from 'vite-plugin-swc';
import path from 'path';

export default defineConfig({
//   plugins: [
//     swc() // SWC for JS/TS transpilation
//   ],
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
