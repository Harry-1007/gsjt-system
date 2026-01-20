# Git 推送命令详解

## `git push -u origin master` 详解

### 命令组成部分

```bash
git push -u origin master
```

- `git push` - Git 推送命令
- `-u` 或 `--set-upstream` - 设置上游分支（upstream）
- `origin` - 远程仓库的别名（默认）
- `master` - **本地分支名**

### `master` 的含义

`master` 是**本地分支的名称**，不是远程分支名。这个命令的意思是：
- 将本地的 `master` 分支推送到远程 `origin` 的 `master` 分支

### `-u` 参数的作用

`-u` (或 `--set-upstream`) 的作用是**建立跟踪关系**：

1. **设置上游分支**：告诉 Git 本地 `master` 分支跟踪远程 `origin/master`
2. **简化后续命令**：设置后，以后只需要 `git push` 即可，不需要指定 `origin master`

### 对比不同命令

#### 1. `git push -u origin master`（首次推送，推荐）

```bash
git push -u origin master
```

**作用**：
- 推送本地 `master` 到远程 `origin/master`
- 建立跟踪关系
- 以后可以直接用 `git push`

**使用场景**：第一次推送某个分支时

---

#### 2. `git push origin master`（不设置上游）

```bash
git push origin master
```

**作用**：
- 推送本地 `master` 到远程 `origin/master`
- **不**建立跟踪关系
- 以后每次都需要指定 `origin master`

**使用场景**：临时推送，不需要建立跟踪关系

---

#### 3. `git push`（已设置上游后）

```bash
git push
```

**作用**：
- 推送到已设置的上游分支
- 需要先用 `-u` 设置一次

**使用场景**：日常推送（已设置上游后）

---

#### 4. `git push origin main`（使用 main 分支）

```bash
git push origin main
```

**作用**：
- 推送本地 `main` 分支到远程 `origin/main`
- GitHub 现在默认使用 `main` 而不是 `master`

**使用场景**：GitHub 新仓库默认分支是 `main`

---

## master vs main 的区别

### 历史背景

- **master**：Git 的传统默认分支名（2020年之前）
- **main**：GitHub 2020年后改为使用 `main` 作为默认分支名

### 当前情况

- **GitHub 新仓库**：默认分支是 `main`
- **本地仓库**：可能还是 `master`（取决于创建时间）

### 如何检查

```bash
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支（本地+远程）
git branch -a
```

### 如何统一

如果本地是 `master`，但远程是 `main`：

```bash
# 方法1：重命名本地分支为 main
git branch -M main
git push -u origin main

# 方法2：推送 master 到远程 main
git push -u origin master:main
```

---

## 常见推送场景

### 场景1：首次推送新仓库

```bash
# 如果远程是 main
git branch -M main
git push -u origin main

# 如果远程是 master
git push -u origin master
```

### 场景2：日常推送（已设置上游）

```bash
git push
```

### 场景3：推送到不同分支

```bash
# 推送当前分支到远程的 main
git push origin HEAD:main

# 推送 master 到远程的 main
git push origin master:main
```

### 场景4：强制推送（谨慎使用）

```bash
git push -u origin master --force
```

---

## 总结对比表

| 命令 | 设置上游 | 需要指定分支 | 使用场景 |
|------|---------|------------|---------|
| `git push -u origin master` | ✅ 是 | ❌ 否（首次） | 首次推送 |
| `git push origin master` | ❌ 否 | ✅ 是（每次） | 临时推送 |
| `git push` | ✅ 已设置 | ❌ 否 | 日常推送 |
| `git push origin main` | ❌ 否 | ✅ 是 | 推送到 main |

---

## 推荐做法

1. **首次推送**：使用 `git push -u origin <分支名>`
2. **日常推送**：使用 `git push`（已设置上游后）
3. **检查分支**：推送前用 `git branch -a` 确认分支名
4. **统一分支名**：本地和远程保持一致（都是 `main` 或都是 `master`）
