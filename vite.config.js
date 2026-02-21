import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "PhishGuard – Cyber Threat Training",
        short_name: "PhishGuard",
        description: "Master phishing detection through gamified simulations and adaptive quizzes.",
        theme_color: "#0a0e1a",
        background_color: "#0a0e1a",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        icons: [
          { src: "/pwa-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/pwa-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
          { src: "/pwa-512x512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" },
        ],
        categories: ["education", "games", "productivity"],
        shortcuts: [
          {
            name: "Take a Quiz",
            short_name: "Quiz",
            description: "Jump straight into a phishing quiz",
            url: "/quiz",
            icons: [{ src: "/pwa-192x192.svg", sizes: "192x192" }],
          },
          {
            name: "Simulator",
            short_name: "Simulate",
            description: "Run the phishing simulator",
            url: "/simulator",
            icons: [{ src: "/pwa-192x192.svg", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        // Cache Firebase SDK + app assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "firebase-storage-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
            handler: "NetworkOnly",
            options: { cacheName: "firebase-real-time" },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: { "@": "/src" },
  },

  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
