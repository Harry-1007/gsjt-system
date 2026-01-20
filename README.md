# GSJT 系统

政府服务判断测试系统（Government Service Judgment Test System）

## 项目结构

```
gsjt-system/
├── backend/          # 后端服务（Node.js + Express + PostgreSQL）
├── frontend/         # 前端应用（React + Vite）
├── scenarios.json    # 场景数据文件
└── 部署脚本/         # 部署相关脚本
```

## 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   # 后端
   cd backend
   npm install
   
   # 前端
   cd frontend
   npm install
   ```

2. **配置数据库**
   - 安装 PostgreSQL
   - 创建数据库 `gsjt`
   - 配置 `backend/.env` 文件（参考 `backend/env.example`）

3. **初始化数据库**
   ```bash
   cd backend/database
   node initTables.js
   node importScenarios.js
   ```

4. **启动服务**
   ```bash
   # 后端（终端1）
   cd backend
   npm run dev
   
   # 前端（终端2）
   cd frontend
   npm run dev
   ```

5. **访问应用**
   - 前端：http://localhost:5173
   - 后端 API：http://localhost:3001/api

## 环境要求

- Node.js 18+
- PostgreSQL 12+
- npm 或 yarn

## 配置说明

### 后端配置 (`backend/.env`)

```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gsjt
DB_USER=postgres
DB_PASSWORD=your_password
```

### 前端配置 (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

## 部署

详细部署说明请参考 `公网部署指南.md`

## 技术栈

- **后端**: Node.js, Express, PostgreSQL
- **前端**: React, Vite, Tailwind CSS
- **数据库**: PostgreSQL

## 许可证

[您的许可证]
