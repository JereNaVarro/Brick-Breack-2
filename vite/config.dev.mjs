import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    resolve: {
        alias: {
          'phaser': 'node_modules/phaser/dist/phaser.js'
        }
      },
    server: {
        port: 8080
    }
});
