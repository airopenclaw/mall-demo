# 🚀 Git Push 一键部署到阿里云服务器

## ✨ 功能特点

- ✅ **只影响本项目** - 不干扰其他项目
- ✅ **保留 GitHub 推送** - origin remote 不变
- ✅ **自动部署** - Push 后服务器自动更新
- ✅ **VSCode 集成** - 支持快捷键和任务面板
- ✅ **完整回滚** - 自动备份，随时回滚

---

## 📋 前置准备

### 1. 确保你拥有
- ✅ 阿里云 ECS 服务器（CentOS/Ubuntu）
- ✅ SSH 免密登录已配置
- ✅ Node.js 已安装在服务器上

### 2. SSH 免密登录配置

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519

# 上传公钥到服务器
ssh-copy-id root@你的服务器IP

# 测试连接
ssh root@你的服务器IP
```

---

## 🎯 快速配置（2步完成）

### 第1步：配置服务器环境

```bash
# 替换为你的服务器 IP
bash scripts/setup-git-deploy.sh 你的服务器IP
```

此脚本会自动：
- ✅ 在服务器创建 Git 裸仓库 `/data/git/mall-demo.git`
- ✅ 配置 post-receive hook（自动部署脚本）
- ✅ 本地添加 `server` remote

### 第2步：首次推送

```bash
# 首次部署需要先上传完整项目
bash scripts/quick-deploy.sh

# 然后推送到服务器（会触发自动部署）
git push server main
```

---

## 🎮 使用方式

### 方式 A：命令行 Push

```bash
# 推送到 GitHub（原功能，保持不变）
git push origin main

# 推送到阿里云服务器（新功能）
git push server main

# 同时推送到两者
git push origin main && git push server main
```

### 方式 B：VSCode 快捷键

配置完成后，可以使用 VSCode 的任务系统：

1. **打开任务面板** - `Cmd+Shift+B`
2. **选择任务**：
   - `Deploy to Aliyun Server` - 推送到服务器
   - `Deploy to GitHub & Server` - 同时推送到两者
   - `Check Git Remotes` - 查看远程仓库配置

### 方式 C：Git Alias（推荐高频使用）

```bash
# 添加自定义命令
git config --global alias.deploy '!git push server main'

# 使用
git deploy
```

---

## 🔧 VSCode 配置说明

项目已预配置 `.vscode/tasks.json`，包含三个任务：

### 1. Deploy to Aliyun Server
- **功能**：Push 到服务器
- **快捷键**：`Cmd+Shift+B`（默认构建任务）
- **适合**：日常开发，只需要更新服务器

### 2. Deploy to GitHub & Server
- **功能**：同时 Push 到 GitHub 和服务器
- **调用**：`Cmd+Shift+P` → "Tasks: Run Task"
- **适合**：需要同步到 GitHub 的场景

### 3. Check Git Remotes
- **功能**：查看当前配置的所有远程仓库
- **适合**：验证配置是否正确

---

## 📊 工作流程

```
┌─────────────┐
│  本地开发    │
└──────┬──────┘
       │ git push server main
       ▼
┌─────────────┐
│  阿里云服务器  │
│  /data/git/ │
│  (bare repo)│
└──────┬──────┘
       │ post-receive hook 自动触发
       ▼
┌─────────────┐
│  自动部署脚本  │
│  - 导出代码   │
│  - 备份旧版本 │
│  - 同步文件   │
│  - npm install│
│  - node scan  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  访问地址    │
│  http://IP  │
└─────────────┘
```

---

## 🛡️ 安全隔离

### 本项目配置不影响其他项目

- ✅ **独立的 Git Remote** - 只有本项目有 `server` remote
- ✅ **服务器独立仓库** - `/data/git/mall-demo.git` 独立存在
- ✅ **本地配置仅限本项目** - `.git/config` 只影响当前仓库

### 验证配置是否生效

```bash
# 查看当前项目的 remotes
cd /Users/mac/mall-demo
git remote -v

# 应该看到：
# origin    https://github.com/airopenclaw/mall-demo.git (fetch)
# origin    https://github.com/airopenclaw/mall-demo.git (push)
# server    ssh://root@服务器IP:/data/git/mall-demo.git (fetch)
# server    ssh://root@服务器IP:/data/git/mall-demo.git (push)

# 切换到其他项目，查看 remotes
cd ~/其他项目
git remote -v

# 应该只有该项目的 remote，不会有 server
```

---

## 🔄 自动部署流程

### 服务器端 Post-Receive Hook 执行流程

当执行 `git push server main` 后：

1. ✅ **接收 Push** - Git 触发 post-receive hook
2. ✅ **导出代码** - `git checkout -f` 到临时目录
3. ✅ **自动备份** - 备份当前版本到 `/backup/`
4. ✅ **同步文件** - rsync 同步到 `/data/www/mall-demo/`
5. ✅ **安装依赖** - `npm install --production`
6. ✅ **生成配置** - `node scan_html.js`
7. ✅ **设置权限** - `chmod 755`
8. ✅ **记录日志** - `/var/log/mall-demo-deploy.log`

### 查看部署日志

```bash
ssh root@服务器IP 'tail -f /var/log/mall-demo-deploy.log'
```

---

## 🐛 故障排查

### 问题1：Push 失败

```bash
# 检查 SSH 连接
ssh root@服务器IP

# 检查 Git 仓库
ssh root@服务器IP 'ls -la /data/git/mall-demo.git/'

# 检查 Hook 权限
ssh root@服务器IP 'chmod +x /data/git/mall-demo.git/hooks/post-receive'
```

### 问题2：部署后页面空白

```bash
# 检查 Web 目录
ssh root@服务器IP 'ls -la /data/www/mall-demo/'

# 检查 Nginx 配置
ssh root@服务器IP 'nginx -t'

# 手动生成配置
ssh root@服务器IP 'cd /data/www/mall-demo && node scan_html.js'
```

### 问题3：Hook 不执行

```bash
# 手动执行 Hook 测试
ssh root@服务器IP 'cd /data/git/mall-demo.git && hooks/post-receive'

# 查看日志
ssh root@服务器IP 'cat /var/log/mall-demo-deploy.log'
```

---

## 🗑️ 卸载配置

如果不需要了，可以完全移除：

```bash
# 1. 删除本地 Git remote
git remote remove server

# 2. 删除 VSCode 配置（可选）
rm -rf .vscode/tasks.json

# 3. 清理服务器（可选）
ssh root@服务器IP << 'EOF'
rm -rf /data/git/mall-demo.git
rm -rf /data/www/mall-demo
rm -rf /backup/mall-demo-backup-*
EOF
```

---

## 📞 技术支持

遇到问题？

1. **查看日志** - `ssh root@服务器IP 'cat /var/log/mall-demo-deploy.log'`
2. **测试连接** - `ssh root@服务器IP 'echo test'`
3. **查看文档** - `scripts/GIT-PUSH-DEPLOY.md`（完整版）

---

**最后更新**: 2026-09-29
**版本**: v1.0.0
