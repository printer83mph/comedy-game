import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

const env = loadEnv('all', process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: `${env.VITE_BACKEND_URL}`,
        changeOrigin: true,
      },
    },
  },
});
