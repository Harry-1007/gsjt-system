# GitHub 推送指南

## 问题：Repository not found

这个错误表示远程仓库不存在或无法访问。

## 解决步骤

### 步骤 1: 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 仓库名称：`gsjt-system`
3. 描述（可选）：Government Service Judgment Test System
4. **重要**：选择 **Public** 或 **Private**
5. **不要**勾选以下选项：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. 点击 **Create repository**

### 步骤 2: 推送代码

创建仓库后，GitHub 会显示推送命令。根据你的情况选择：

#### 如果仓库是空的（推荐）

```bash
git push -u origin master
```

或者如果 GitHub 使用 `main` 分支：

```bash
git branch -M main
git push -u origin main
```

#### 如果仓库已有内容（如 README）

```bash
# 拉取并合并
git pull origin master --allow-unrelated-histories

# 解决冲突（如果有）
git add .
git commit -m "Merge remote repository"

# 推送
git push origin master
```

### 步骤 3: 验证

访问 https://github.com/Harry-1007/gsjt-system 确认代码已上传。

## 常见问题

### Q: 推送时要求输入用户名和密码？

A: GitHub 已不再支持密码认证，需要使用 Personal Access Token：

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 选择权限：`repo`（完整仓库权限）
4. 生成后复制 token
5. 推送时：
   - 用户名：你的 GitHub 用户名
   - 密码：使用 token（不是 GitHub 密码）

### Q: 想使用 SSH 而不是 HTTPS？

A: 更改远程 URL：

```bash
git remote set-url origin git@github.com:Harry-1007/gsjt-system.git
```

需要先配置 SSH 密钥。

### Q: 分支名称不匹配？

A: 如果远程使用 `main`，重命名本地分支：

```bash
git branch -M main
git push -u origin main
```

## 快速命令参考

```bash
# 检查远程仓库配置
git remote -v

# 更改远程 URL（如果需要）
git remote set-url origin https://github.com/Harry-1007/gsjt-system.git

# 推送代码
git push -u origin master

# 如果失败，尝试强制推送（谨慎使用）
git push origin master --force
```
