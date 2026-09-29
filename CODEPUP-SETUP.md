# 🎯 配置阿里云 Codeup 仓库

## ✨ 功能

本项目支持同时推送到多个 Git 仓库，互不干扰：

- ✅ **GitHub** (origin) - 代码备份
- ✅ **阿里云 Codeup** (codeup) - 企业内部仓库
- ✅ **阿里云服务器** (server) - 自动部署

---

## 🚀 快速配置（1分钟）

### 步骤1：获取仓库地址

1. 登录 [阿里云 Codeup](https://codeup.aliyun.com/)
2. 进入你的仓库
3. 点击 **克隆/下载** → 复制仓库地址

**仓库地址格式：**
```
HTTPS: https://your-company.devops.aliyun.com/group/repo.git
SSH:   git@your-company.devops.aliyun.com:group/repo.git
```

---

### 步骤2：一键配置

```bash
cd /Users/mac/mall-demo

# 运行配置脚本
bash scripts/setup-codeup.sh 你的Codeup仓库地址

# 示例
bash scripts/setup-codeup.sh https://your-company.devops.aliyun.com/group/mall-demo.git
```

**脚本会自动完成：**
- ✅ 添加 `codeup` remote
- ✅ 验证配置
- ✅ 显示使用说明

---

### 步骤3：开始推送

```bash
# 推送到 Codeup
git push codeup main

# 或创建别名（推荐）
git config --global alias.codeup '!git push codeup main'
git codeup
```

---

## 📊 配置对比

### ❌ 配置前

```bash
git remote -v
# 只有 GitHub

git push origin main
```

---

### ✅ 配置后

```bash
git remote -v
# origin    https://github.com/airopenclaw/mall-demo.git (fetch)
# origin    https://github.com/airopenclaw/mall-demo.git (push)
# codeup    https://your-company.devops.aliyun.com/group/repo.git (fetch)
# codeup    https://your-company.devops.aliyun.com/group/repo.git (push)

# 推送选项
git push origin main      # → GitHub
git push codeup main      # → Codeup
git push server main      # → 阿里云服务器（自动部署）
```

---

## 🎮 使用场景

### 场景1：推送到 Codeup（企业仓库）

```bash
git push codeup main
```

### 场景2：同时推送到 GitHub 和 Codeup

```bash
git push origin main && git push codeup main
```

### 场景3：推送到所有仓库

```bash
git push origin main && git push codeup main && git push server main
```

### 场景4：VSCode 一键推送

配置后，在 VSCode 中可以：
- `Cmd+Shift+B` → "Deploy to Aliyun Server"
- `Cmd+Shift+P` → "Tasks: Run Task" → 选择任务

---

## 🛡️ 多仓库管理

### 仓库隔离

每个远程仓库完全独立：
- ✅ **GitHub** - 公开代码备份
- ✅ **Codeup** - 企业内部代码仓库
- ✅ **Server** - 服务器自动部署

互不干扰，按需推送！

### 自定义 Remote 名称

如果你不想用 `codeup`，可以自定义：

```bash
# 使用自定义名称
bash scripts/setup-codeup.sh 仓库地址
# 脚本会提示你输入 remote 名称

# 或手动添加
git remote add my-gitlab 仓库地址
git push my-gitlab main
```

---

## 🔐 SSH 配置（可选）

### 使用 SSH 方式推送

如果 Codeup 配置了 SSH：

```bash
# 1. 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 2. 复制公钥到 Codeup
cat ~/.ssh/id_ed25519.pub

# 3. 在 Codeup → 个人设置 → SSH 公钥 → 添加公钥

# 4. 测试连接
ssh -T git@your-company.devops.aliyun.com

# 5. 添加 SSH 格式的 remote
git remote add codeup git@your-company.devops.aliyun.com:group/repo.git
```

---

## 🔄 常见工作流

### 工作流1：个人开发

```bash
# 本地开发
git add .
git commit -m "新增功能"

# 推送到 Codeup（企业仓库）
git push codeup main
```

---

### 工作流2：团队协作

```bash
# 1. 从 Codeup 拉取最新代码
git pull codeup main

# 2. 开发功能
git add .
git commit -m "新增功能"

# 3. 推送到 Codeup
git push codeup main
```

---

### 工作流3：多仓库同步

```bash
# 1. 推送到 Codeup（主要仓库）
git push codeup main

# 2. 推送到 GitHub（公开备份）
git push origin main

# 3. 推送到服务器（自动部署）
git push server main
```

---

## 📋 VSCode 集成

配置完成后，`.vscode/tasks.json` 会自动添加以下任务：

| 任务 | 功能 | 快捷键 |
|------|------|--------|
| **Deploy to Aliyun Server** | 推送到服务器 | `Cmd+Shift+B` |
| **Push to Codeup** | 推送到 Codeup | 任务面板 |
| **Deploy to GitHub & Codeup** | 同时推送到 GitHub 和 Codeup | 任务面板 |
| **Check Git Remotes** | 查看所有 remote | 任务面板 |

**使用：**
- `Cmd+Shift+P` → "Tasks: Run Task" → 选择任务

---

## 🐛 故障排查

### 问题1：Permission denied

```bash
# HTTPS 方式：检查账号密码
# SSH 方式：检查 SSH 密钥
ssh -T git@your-company.devops.aliyun.com
```

### 问题2：Repository not found

```bash
# 检查仓库地址是否正确
git remote -v

# 检查是否有访问权限
git ls-remote codeup
```

### 问题3：Push 被拒绝

```bash
# 先拉取最新代码
git pull codeup main --rebase

# 解决冲突后推送
git push codeup main
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `GIT-PUSH-SETUP.md` | Git Push 部署完整指南 |
| `GIT-DEPLOY.md` | 部署功能总览 |
| `DEPLOY.md` | 传统部署文档 |

---

## ✅ 检查清单

配置完成后，请验证：

- [ ] Codeup 仓库地址正确
- [ ] `codeup` remote 已添加
- [ ] 可以成功 push 到 Codeup
- [ ] VSCode 任务已更新（可选）
- [ ] Git Alias 已配置（可选）

---

## 🎉 开始使用

```bash
# 配置
bash scripts/setup-codeup.sh 你的仓库地址

# 推送
git push codeup main
```

---

**配置时间**: 2026-09-29
**影响范围**: 仅本项目
**文档版本**: v1.0.0
