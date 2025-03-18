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
  plugins: [vitePluginCompressTemplateComponents()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
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
          /`([\s]*<template-[\w-]+>[\s\S]*?<\/template-[\w-]+>[\s]*)`/g,
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
