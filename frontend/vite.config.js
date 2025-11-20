export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      }
    }
  }
});
