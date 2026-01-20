import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// 动态获取本机 IP 地址
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // 如果找不到，使用 localhost
}

const localIP = getLocalIP();
console.log(`🌐 检测到本机 IP: ${localIP}`);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 5173,
    strictPort: false,
    // HMR 配置：动态使用本机 IP 地址
    hmr: {
      host: localIP,
      port: 5173,
    },
  },
  preview: {
    host: '0.0.0.0', // 预览模式也允许局域网访问
    port: 4173,
  },
})
