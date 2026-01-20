# 解决 Git 推送问题

## 问题分析

推送失败通常是因为：
1. 远程仓库有内容（如 GitHub 自动创建的 README）
2. 本地和远程分支名称不一致（master vs main）
3. 历史记录不匹配

## 解决方案

### 方案 1: 拉取并合并（推荐）

如果远程仓库已有内容，先拉取并合并：

```bash
# 拉取远程内容
git pull origin master --allow-unrelated-histories

# 如果有冲突，解决冲突后：
git add .
git commit -m "Merge remote-tracking branch"

# 然后推送
git push origin master
```

### 方案 2: 强制推送（谨慎使用）

如果确定要覆盖远程内容：

```bash
git push origin master --force
```

⚠️ **警告**: 这会覆盖远程仓库的所有内容！

### 方案 3: 切换到 main 分支

如果远程仓库使用 `main` 分支：

```bash
# 重命名本地分支
git branch -M main

# 推送
git push origin main
```

### 方案 4: 检查远程仓库是否存在

如果仓库不存在，需要先在 GitHub 上创建：
1. 访问 https://github.com/new
2. 创建新仓库 `gsjt-system`
3. **不要**初始化 README、.gitignore 或 license
4. 然后推送

## 快速修复命令

根据你的情况，运行以下命令之一：

**如果远程有内容需要合并：**
```bash
git pull origin master --allow-unrelated-histories
git push origin master
```

**如果要强制覆盖（确保远程没有重要内容）：**
```bash
git push origin master --force
```

**如果远程使用 main 分支：**
```bash
git branch -M main
git push origin main
```
