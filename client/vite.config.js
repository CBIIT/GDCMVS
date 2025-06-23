import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Base public path when served in production.
  // base: '/',

  // Project root directory.
  root: './',

  // Directory to serve static assets from during development.
  publicDir: 'public',

  //Configure the development server.
  server: {
    host: '0.0.0.0', // Allow access from any IP address
    port: 3000, // You can specify the port for the dev server (default is 5173)
    open: true, // Automatically open the browser when the server starts
    proxy: {
      // Proxy requests to the backend server
      '/api': {
        target: 'http://localhost:5000', // Change this to your backend server URL
        changeOrigin: true, // Change the origin of the host header to the target URL
        rewrite: (path) => path.replace(/^\/api/, '') // Remove /api prefix from the request path
      }
    },
    watch: {
      ignored: [
        '**/playwright-report/**',
        '**/node_modules/**',
        '**/test-results/**',
        '**/tests/**'
      ] // Ignore changes in these directories
    }
  },

  // Directory to output build files to.
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps for the builds
    // Configure Rollup options
    rollupOptions: {
      input: {
        main: './index.html' // Main entry point
      },
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 500 // Set a higher limit for chunk size warnings
  },
  plugins: [vitePluginCompressTemplateComponents()]
});

function vitePluginCompressTemplateComponents() {
  return {
    name: 'vite-plugin-compress-template-components', // Plugin name
    transform(code, id) {
      // Check if the file is a JavaScript file
      if (id.endsWith('.js')) {
        let transformedCode = code;

        // Replace template components with compressed content
        transformedCode = transformedCode.replace(
          /`([\s]*<template-[\w-]+[\s\w="]+>[\s\S]*?<\/template-[\w-]+>[\s]*)`/g,
          (match, content) => {
            // Compress the content by removing unnecessary whitespace
            const compressedContent = content
              .replace(/>\s+</g, '><') // Remove whitespace between tags
              .replace(/`\s+</g, '`<') // Remove whitespace between template literals and tags
              .replace(/>\s+`/g, '>`') // Remove whitespace between tags and template literals
              .replace(/>\s+\${/g, '>${') // Remove whitespace between tags and expressions
              .replace(/}\s+</g, '}<') // Remove whitespace between expressions and tags
              .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
              .trim(); // Trim leading and trailing whitespace
            return match.replace(content, compressedContent);
          }
        );

        return {
          code: transformedCode, // Return the transformed code
          map: null // No source map
        };
      }
      return null; // Return null for files that don't match the extensions
    }
  };
}
