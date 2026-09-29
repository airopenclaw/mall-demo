# 🚀 Git 多仓库配置快速参考

## 📊 支持的所有 Git 仓库

| 仓库名称 | Remote 名称 | 用途 | 配置命令 |
|---------|------------|------|---------|
| **GitHub** | `origin` | 代码备份（已有） | - |
| **阿里云 Codeup** | `codeup` | 企业仓库 | `bash scripts/setup-codeup.sh 地址` |
| **阿里云服务器** | `server` | 自动部署 | `bash scripts/setup-git-deploy.sh IP` |

---

## 🔧 配置命令速查

### 配置阿里云 Codeup

```bash
# 获取仓库地址后在 Codeup 控制台
bash scripts/setup-codeup.sh https://xxx.devops.aliyun.com/group/repo.git
```

### 配置阿里云服务器部署

```bash
# 首次配置服务器
bash scripts/setup-git-deploy.sh 你的服务器IP
```

### 查看所有 Remotes

```bash
git remote -v
```

---

## 📤 Push 命令速查

### 推送命令

```bash
# 推送到 GitHub
git push origin main

# 推送到 Codeup
git push codeup main

# 推送到服务器（自动部署）
git push server main

# 同时推送到所有仓库
git push origin main && git push codeup main && git push server main
```

### Git Alias（自定义命令）

```bash
# Codeup 快捷命令
git config --global alias.codeup '!git push codeup main'
git codeup

# 服务器快捷命令
git config --global alias.deploy '!git push server main'
git deploy

# 推送到所有仓库
git config --global alias.pushall '!git push origin main && git push codeup main && git push server main'
git pushall
```

---

## 🎮 VSCode 任务速查

按 `Cmd+Shift+P` → "Tasks: Run Task"

| 任务 | 功能 |
|------|------|
| Deploy to Aliyun Server | 推送到服务器（`Cmd+Shift+B`） |
| Push to Codeup | 推送到 Codeup |
| Deploy to GitHub & Codeup | 同时推送到 GitHub 和 Codeup |
| Deploy to GitHub & Server | 同时推送到 GitHub 和服务器 |
| Check Git Remotes | 查看所有远程仓库 |

---

## 📋 配置检查清单

### ✅ GitHub（已配置）

```bash
git remote -v
# origin  https://github.com/airopenclaw/mall-demo.git
```

### ⬜ Codeup（需配置）

```bash
bash scripts/setup-codeup.sh 你的Codeup仓库地址
```

### ⬜ 阿里云服务器（需配置）

```bash
bash scripts/setup-git-deploy.sh 你的服务器IP
```

---

## 🔒 安全隔离

### 本项目配置

```bash
cd /Users/mac/mall-demo
git remote -v
# 包含所有配置的 remotes ✅
```

### 其他项目不受影响

```bash
cd ~/其他项目
git remote -v
# 只有该项目的 remotes ✅
```

---

## 📚 文档索引

| 文档 | 用途 |
|------|------|
| **`CODEPUP-SETUP.md`** | 阿里云 Codeup 配置指南 ⭐ |
| **`GIT-PUSH-SETUP.md`** | Git Push 完整配置指南 ⭐ |
| `GIT-DEPLOY.md` | 部署功能总览 |
| `DEPLOY.md` | 传统部署文档 |

---

## 🎯 推荐工作流

### 方案 A：个人开发（推荐）

```bash
git add .
git commit -m "新增功能"
git push codeup main  # 推送到企业仓库
```

### 方案 B：团队协作

```bash
git pull codeup main  # 拉取最新代码
git push codeup main  # 推送到企业仓库
```

### 方案 C：完整流程

```bash
git push origin main    # GitHub 备份
git push codeup main    # 企业仓库
git push server main    # 服务器部署
```

---

**最后更新**: 2026-09-29
**版本**: v1.0.0
