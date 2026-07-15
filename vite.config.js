import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const apiPort = Number(process.env.API_PORT || process.env.PORT || 3001);
const host = process.env.HOST || '0.0.0.0';
export default defineConfig({
  plugins:[react()],
  server:{
    host,
    proxy:{'/api':{target:`http://127.0.0.1:${apiPort}`,changeOrigin:true}}
  },
  build:{sourcemap:true}
});
