import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({

  // Configure the development server.
  // server: {
  //   port: 3001, // You can specify the port for the dev server (default is 5173)
  //   open: true, // Automatically open the browser when the server starts
  // },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps for the builds
    rollupOptions: {
      input: {
        main: './index.html', // Main entry point
      },
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [vitePluginCompressTemplateComponents()],
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
};
