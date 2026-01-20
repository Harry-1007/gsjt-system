import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取本机 IP 地址
function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
console.log(`🌐 检测到本机 IP: ${ip}`);
console.log();

// 更新 .env 文件
const envPath = path.join(__dirname, '.env');
const envContent = `# 后端API地址
# 局域网部署：使用服务器IP地址（自动检测）
VITE_API_URL=http://${ip}:3001/api
`;

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ .env 文件已更新');
console.log(`   API地址: http://${ip}:3001/api`);
console.log();

// 更新 vite.config.js（HMR配置）
const configPath = path.join(__dirname, 'vite.config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// 检查是否已经有动态IP获取代码
if (configContent.includes('getLocalIP()')) {
  console.log('✅ vite.config.js 已配置动态IP（无需更新）');
} else {
  // 如果还是硬编码的IP，更新它
  const oldHmrPattern = /hmr:\s*\{[^}]*host:\s*['"][^'"]*['"][^}]*\}/s;
  if (oldHmrPattern.test(configContent)) {
    configContent = configContent.replace(
      oldHmrPattern,
      `hmr: {\n      host: localIP,\n      port: 5173,\n    }`
    );
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log('✅ vite.config.js HMR配置已更新');
  } else {
    console.log('⚠️  vite.config.js 结构可能已改变，请手动检查');
  }
}

console.log('✅ 配置已自动更新，正在启动前端服务器...');
console.log();

