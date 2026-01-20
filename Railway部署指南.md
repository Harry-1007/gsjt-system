# Railway 部署指南

## 项目结构

这是一个全栈应用，包含：
- **前端**：React + Vite（位于 `frontend/`）
- **后端**：Node.js + Express（位于 `backend/`）

## 部署步骤

### 1. 准备 Railway 项目

1. 访问 [Railway](https://railway.app/)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的 `gsjt-system` 仓库

### 2. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

#### 必需的环境变量

```env
# 服务器配置
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# PostgreSQL 数据库配置
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=gsjt
DB_USER=postgres
DB_PASSWORD=your_password

# 前端 API URL（可选，如果前端需要单独配置）
VITE_API_URL=https://your-app.railway.app/api
```

#### 在 Railway 中设置环境变量

1. 进入项目设置
2. 点击 "Variables" 标签
3. 添加上述环境变量

### 3. 添加 PostgreSQL 数据库

1. 在 Railway 项目中点击 "New"
2. 选择 "Database" → "Add PostgreSQL"
3. Railway 会自动创建数据库并设置环境变量：
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

4. 更新后端代码以支持 `DATABASE_URL`（如果使用）

### 4. 配置构建和启动命令

Railway 会自动检测 `package.json` 中的脚本：

- **构建命令**：`npm run build`（构建前端）
- **启动命令**：`npm start`（启动后端服务器）

这些已在根目录 `package.json` 中配置。

### 5. 部署流程

Railway 会自动执行以下步骤：

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建前端**
   ```bash
   npm run build
   ```
   这会：
   - 进入 `frontend/` 目录
   - 安装前端依赖
   - 构建前端到 `frontend/dist/`

3. **启动后端**
   ```bash
   npm start
   ```
   这会：
   - 进入 `backend/` 目录
   - 安装后端依赖
   - 启动 Express 服务器
   - 服务器会：
     - 提供 API 路由（`/api/*`）
     - 服务前端静态文件（`frontend/dist/`）
     - 处理 SPA 路由（所有非 API 请求返回 `index.html`）

### 6. 初始化数据库

部署后，需要初始化数据库表：

#### 方法 1: 使用 Railway CLI

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 连接到项目
railway link

# 运行数据库初始化脚本
railway run node backend/database/initTables.js

# 导入场景数据
railway run node backend/database/importScenarios.js
```

#### 方法 2: 使用 Railway Web Console

1. 进入项目
2. 点击 "Deployments"
3. 选择最新的部署
4. 点击 "View Logs"
5. 使用 "Shell" 功能执行命令

#### 方法 3: 添加初始化脚本到部署流程

可以在 `package.json` 中添加 `postinstall` 脚本（可选）：

```json
{
  "scripts": {
    "postinstall": "node backend/database/initTables.js || true"
  }
}
```

⚠️ **注意**：这会在每次部署时运行，可能导致重复初始化。

### 7. 验证部署

1. **检查 API**
   ```
   https://your-app.railway.app/api/test
   ```
   应该返回：`{"message":"后端服务器运行正常！"}`

2. **检查前端**
   ```
   https://your-app.railway.app/
   ```
   应该显示前端应用

3. **检查数据库连接**
   查看 Railway 日志，确认数据库连接成功

## 常见问题

### Q: 构建失败？

**A:** 检查：
- Node.js 版本（需要 >= 18）
- 依赖安装是否成功
- 构建日志中的错误信息

### Q: 前端无法访问？

**A:** 检查：
- `frontend/dist/` 目录是否存在
- 后端是否正确配置了静态文件服务
- Railway 日志中的错误信息

### Q: 数据库连接失败？

**A:** 检查：
- 环境变量是否正确设置
- PostgreSQL 服务是否已启动
- 数据库凭据是否正确

### Q: API 返回 404？

**A:** 检查：
- API 路由是否正确（应该是 `/api/*`）
- 后端路由是否正确加载
- Railway 日志中的错误信息

### Q: 如何查看日志？

**A:** 
1. 在 Railway 项目中
2. 点击 "Deployments"
3. 选择部署
4. 点击 "View Logs"

## 优化建议

### 1. 使用 Railway 的 PostgreSQL 插件

Railway 提供托管的 PostgreSQL，自动配置环境变量。

### 2. 配置自定义域名

1. 在项目设置中
2. 点击 "Settings" → "Networking"
3. 添加自定义域名

### 3. 启用 HTTPS

Railway 自动提供 HTTPS，无需额外配置。

### 4. 环境变量管理

- 使用 Railway 的环境变量功能
- 区分开发和生产环境
- 不要提交敏感信息到 Git

## 文件说明

- `package.json` - 根目录配置，包含构建和启动脚本
- `railway.json` - Railway 配置文件（可选）
- `railway.toml` - Railway 配置文件（可选）
- `backend/server.js` - 后端服务器，已配置静态文件服务
- `backend/env.example` - 环境变量示例

## 部署检查清单

- [ ] Railway 项目已创建
- [ ] GitHub 仓库已连接
- [ ] PostgreSQL 数据库已添加
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 数据库表已初始化
- [ ] 场景数据已导入
- [ ] API 测试通过
- [ ] 前端访问正常

## 支持

如有问题，请查看：
- Railway 文档：https://docs.railway.app/
- Railway 日志：项目 → Deployments → View Logs
- GitHub Issues：你的仓库 Issues
