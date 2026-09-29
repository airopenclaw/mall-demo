# Git Push 一键部署说明

## 🎯 新增功能

本项目现已支持通过 `git push` 一键部署到阿里云服务器，**完全独立于 GitHub**，不影响其他项目。

---

## ✨ 核心优势

- ✅ **只影响本项目** - 独立的 Git Remote，不影响其他项目
- ✅ **保留 GitHub 推送** - `origin` remote 不变，功能不变
- ✅ **自动部署** - Push 后服务器自动更新，无需手动操作
- ✅ **VSCode 集成** - 支持 `Cmd+Shift+B` 一键部署
- ✅ **自动备份** - 每次部署自动备份，可随时回滚
- ✅ **完整日志** - 部署过程记录在 `/var/log/mall-demo-deploy.log`

---

## 🚀 快速开始

### 方式一：自动配置（推荐）

```bash
# 1. 配置服务器环境
bash scripts/setup-git-deploy.sh 你的服务器IP

# 2. 首次推送（首次需要先手动上传一次）
bash scripts/quick-deploy.sh

# 3. 之后每次开发完成后
git push server main
```

### 方式二：手动配置

参考 [GIT-PUSH-DEPLOY.md](./GIT-PUSH-DEPLOY.md) 中的详细步骤

---

## 📋 使用场景对比

### 传统的快速部署

```bash
# 每次都要执行整个脚本
bash scripts/quick-deploy.sh
```

**适合**：首次部署、完整重新部署、大版本更新

---

### Git Push 部署（新增）

```bash
# 开发完成后，一键推送
git push server main
```

**适合**：
- ✅ 日常开发，频繁更新
- ✅ 小改动快速上线
- ✅ 配合 VSCode 快捷键 `Cmd+Shift+B`
- ✅ 团队协作，代码提交即部署

---

## 🔧 完整工作流

### 方案 A：纯 Git Push（仅服务器）

```bash
# 开发
git add .
git commit -m "新增功能"

# 推送到服务器
git push server main  # 自动部署
```

**优点**：快速、简洁
**适用**：只需要更新服务器

---

### 方案 B：Git Push + GitHub（两者都推送）

```bash
# 开发
git add .
git commit -m "新增功能"

# 推送到 GitHub
git push origin main

# 推送到服务器
git push server main
```

**优点**：代码备份 + 实时部署
**适用**：需要备份到 GitHub 的场景

---

### 方案 C：VSCode 快捷键一键部署

```bash
# 在 VSCode 中：
# 1. Cmd+Shift+B → 选择 "Deploy to Aliyun Server"
# 或
# 2. Cmd+Shift+P → "Tasks: Run Task" → "Deploy to Aliyun Server"
```

**优点**：可视化、无需记命令
**适用**：VSCode 用户、团队协作

---

## 📊 三种部署方式对比

| 特性 | 快速部署脚本 | Git Push 部署 | Rsync 同步 |
|------|-------------|---------------|------------|
| **配置难度** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 复杂 |
| **部署速度** | ⭐⭐⭐ 慢 | ⭐⭐ 中等 | ⭐⭐⭐ 快 |
| **适合场景** | 首次/大版本 | 日常开发 | 频繁更新 |
| **自动备份** | ❌ 否 | ✅ 是 | ❌ 否 |
| **VSCode 集成** | ❌ 否 | ✅ 是 | ❌ 否 |
| **团队协作** | ⭐ 一般 | ⭐⭐⭐ 优秀 | ⭐ 一般 |
| **独立项目** | ✅ 是 | ✅ 是 | ✅ 是 |

**推荐组合使用**：
- **首次部署**：使用 `quick-deploy.sh`
- **日常开发**：使用 `git push server main`
- **频繁热更**：使用 `rsync` 增量同步

---

## 🔒 安全与隔离

### 本项目配置独立

```bash
# 本项目配置
cd /Users/mac/mall-demo
git remote -v
# 看到 server remote

# 其他项目不受影响
cd ~/其他项目
git remote -v
# 只有该项目的 remote，没有 server
```

### 服务器端隔离

- `/data/git/mall-demo.git` - 仅此项目的 Git 仓库
- `/data/www/mall-demo` - 仅此项目的 Web 目录
- `/var/log/mall-demo-deploy.log` - 仅此项目的部署日志

---

## 📚 文档索引

| 文档 | 说明 |
|------|------|
| [DEPLOY.md](./DEPLOY.md) | 完整部署文档（三种方式） |
| [GIT-PUSH-DEPLOY.md](./GIT-PUSH-DEPLOY.md) | Git Push 部署完整指南 |
| [QUICK-DEPLOY-GUIDE.md](./QUICK-DEPLOY-GUIDE.md) | Git Push 快速指南 |
| [setup-git-deploy.sh](./setup-git-deploy.sh) | 服务器环境自动配置脚本 |
| [server-post-receive-hook.sh](./server-post-receive-hook.sh) | 服务器端部署 Hook |
| [quick-deploy.sh](./quick-deploy.sh) | 快速部署脚本 |

---

## 🎬 完整演示

### 第1天：配置环境

```bash
# 配置 SSH 免密登录
ssh-keygen -t ed25519
ssh-copy-id root@你的服务器IP

# 配置服务器 Git 环境
bash scripts/setup-git-deploy.sh 服务器IP

# 首次完整部署
bash scripts/quick-deploy.sh
```

### 第2天及以后：日常开发

```bash
# 方式1：命令行
git add .
git commit -m "新增功能"
git push server main

# 方式2：VSCode 快捷键 Cmd+Shift+B
# 方式3：git deploy（如果配置了 alias）
```

---

## 🔄 常见工作流

### 场景1：Bug 修复

```bash
# 修复 bug
git add .
git commit -m "fix: 修复提现计算错误"
git push server main  # 立即上线
```

### 场景2：功能开发

```bash
# 开发新功能
git add .
git commit -m "feat: 新增分账明细导出"

# 推送到 GitHub 备份
git push origin main

# 推送到服务器测试
git push server main
```

### 场景3：版本回滚

```bash
# 查看部署历史
ssh root@服务器IP 'ls -lt /backup/'

# 手动回滚到指定版本
ssh root@服务器IP << 'EOF'
# 停止当前版本
# 恢复到指定备份
# 重启服务
EOF
```

---

## 💡 最佳实践

### 1. 开发流程

```bash
# 本地开发 → 测试 → 推送
git add .
git commit -m "feat: 功能描述"
git push server main  # 推送到服务器测试

# 测试通过 → 推送到 GitHub
git push origin main
```

### 2. 分支策略

```bash
# main 分支 - 生产环境
git push server main

# develop 分支 - 测试环境（需额外配置）
git push server develop
```

### 3. 团队协作

```bash
# 每个开发者配置自己的 Git Alias
git config --global alias.deploy '!git push server main'

# 日常使用
git add .
git commit -m "功能描述"
git deploy  # 一键部署
```

---

## 🎉 总结

现在你的项目支持 **三种部署方式**：

1. **快速部署脚本** - 首次部署、大版本更新
2. **Git Push 部署** - 日常开发、快速迭代 ⭐新增
3. **Rsync 同步** - 频繁热更

**推荐组合**：
- 首次部署使用 `quick-deploy.sh`
- 日常开发使用 `git push server main`
- 团队协作使用 VSCode 快捷键

---

**最后更新**: 2026-09-29
**版本**: v1.0.0
