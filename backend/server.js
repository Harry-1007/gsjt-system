const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 添加错误处理来捕获启动错误
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  console.error('错误堆栈:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

let scenariosRouter, resultsRouter, candidatesRouter;

try {
  scenariosRouter = require('./routes/scenarios');
  resultsRouter = require('./routes/results');
  candidatesRouter = require('./routes/candidates');
} catch (error) {
  console.error('加载路由失败:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
// CORS配置 - 允许所有来源（用于本地网络部署）
app.use(cors({
  origin: true, // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 静态文件服务 - 服务前端构建后的文件
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  console.log('✅ 静态文件服务已启用:', frontendDistPath);
} else {
  console.log('⚠️  前端构建文件不存在，仅提供 API 服务');
}

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/scenarios', scenariosRouter);
app.use('/api/results', resultsRouter);
app.use('/api/candidates', candidatesRouter);

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '后端服务器运行正常！' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({ 
    error: err.message || '服务器内部错误',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// API 404处理
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API 路由不存在' });
});

// SPA 路由处理 - 所有非 API 请求返回 index.html
if (fs.existsSync(frontendDistPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // 如果没有前端构建文件，返回 404
  app.use((req, res) => {
    res.status(404).json({ error: '路由不存在' });
  });
}

// 启动服务器 - 监听所有网络接口以支持局域网访问
const HOST = process.env.HOST || '0.0.0.0';
let server;

try {
  server = app.listen(PORT, HOST, async () => {
    console.log(`服务器运行在 http://${HOST}:${PORT}`);
    console.log(`本地访问: http://localhost:${PORT}`);
    // 获取本机IP地址
    try {
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      const addresses = [];
      for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(`http://${iface.address}:${PORT}`);
          }
        }
      }
      if (addresses.length > 0) {
        console.log(`局域网访问地址:`);
        addresses.forEach(addr => console.log(`  - ${addr}`));
      }
    } catch (ipError) {
      console.warn('无法获取IP地址:', ipError.message);
    }

    // 自动检查并导入场景数据（如果数据库为空）
    try {
      const { all } = require('./database/db');
      const scenarios = await all('SELECT COUNT(*) as count FROM scenarios');
      const count = parseInt(scenarios[0]?.count || 0);
      
      if (count === 0) {
        console.log('⚠️  数据库中没有场景数据，开始自动导入...');
        const { importScenarios } = require('./database/importScenarios');
        await importScenarios();
        console.log('✅ 场景数据导入完成');
      } else {
        console.log(`✅ 数据库已有 ${count} 个场景，跳过导入`);
      }
    } catch (error) {
      console.error('⚠️  检查/导入场景数据时出错:', error.message);
      // 不阻止服务器启动，只是记录错误
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 错误：端口 ${PORT} 已被占用！`);
      console.error('   请关闭占用该端口的程序，或修改 PORT 环境变量');
    } else {
      console.error('❌ 服务器启动错误:', err);
      console.error('错误堆栈:', err.stack);
    }
    process.exit(1);
  });

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    if (server) {
      server.close(() => {
        const { db } = require('./database/db');
        db.close((err) => {
          if (err) {
            console.error('关闭数据库连接失败:', err);
          } else {
            console.log('数据库连接已关闭');
          }
          process.exit(0);
        });
      });
    } else {
      process.exit(0);
    }
  });

  console.log('✅ 服务器启动成功！');
} catch (error) {
  console.error('❌ 启动服务器失败:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}

