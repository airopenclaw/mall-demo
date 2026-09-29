# 🎯 Git Push 一键部署完整配置指南

## ✅ 已创建的文件

本项目已为你准备好所有配置，包括：

1. ✅ **`scripts/server-post-receive-hook.sh`** - 服务器端自动部署脚本
2. ✅ **`scripts/setup-git-deploy.sh`** - 服务器环境一键配置脚本
3. ✅ **`scripts/QUICK-DEPLOY-GUIDE.md`** - Git Push 快速指南
4. ✅ **`scripts/GIT-PUSH-DEPLOY.md`** - 完整详细文档
5. ✅ **`GIT-DEPLOY.md`** - 部署功能总览
6. ✅ **`.vscode/tasks.json`** - VSCode 任务配置
7. ✅ **更新了 `.gitignore`** - 确保 .vscode 配置不上传到服务器

---

## 🚀 完整配置流程

### 前置要求

```bash
# 1. 确保有阿里云服务器
# 2. 确保 SSH 免密登录已配置
ssh-keygen -t ed25519                    # 生成密钥（如果还没有）
ssh-copy-id root@你的服务器IP             # 上传公钥
ssh root@你的服务器IP                     # 测试连接
```

---

### 第1步：配置服务器环境（只需一次）

```bash
cd /Users/mac/mall-demo

# 运行配置脚本（替换为你的服务器 IP）
bash scripts/setup-git-deploy.sh 你的服务器IP
```

**此脚本会自动完成：**
- ✅ 在服务器创建 Git 裸仓库 `/data/git/mall-demo.git`
- ✅ 配置 post-receive hook（自动部署脚本）
- ✅ 本地添加 `server` remote
- ✅ 验证配置

---

### 第2步：首次部署（只需一次）

如果服务器 `/data/www/mall-demo` 是空的，需要先手动上传一次：

```bash
# 方法1: 使用快速部署脚本
bash scripts/quick-deploy.sh

# 方法2: 使用 Git Push
git push server main
```

---

### 第3步：日常使用

配置完成后，每次开发完只需要：

```bash
# 提交代码
git add .
git commit -m "新增功能"

# 一键部署
git push server main
```

**或者使用 VSCode：**
- `Cmd+Shift+B` → 选择 "Deploy to Aliyun Server"

---

## 📊 配置对比

### ❌ 之前：每次都要手动部署

```bash
# 步骤1: 生成配置
node scan_html.js

# 步骤2: 打包
tar -czf /tmp/mall-demo.tar.gz ...

# 步骤3: 上传
scp /tmp/mall-demo.tar.gz root@服务器IP:/data/www/

# 步骤4: 解压部署
ssh root@服务器IP << 'EOF'
cd /data/www
tar -xzf ...
npm install
node scan_html.js
EOF
```

**耗时：2-5 分钟**

---

### ✅ 现在：一键部署

```bash
# 开发完成
git add .
git commit -m "新增功能"
git push server main  # 完成！
```

**耗时：5-10 秒**

---

## 🔒 安全隔离验证

### 验证本项目配置

```bash
cd /Users/mac/mall-demo
git remote -v
```

**输出示例：**
```
origin    https://github.com/airopenclaw/mall-demo.git (fetch)
origin    https://github.com/airopenclaw/mall-demo.git (push)
server    ssh://root@123.45.67.89:/data/git/mall-demo.git (fetch)
server    ssh://root@123.45.67.89:/data/git/mall-demo.git (push)
```

---

### 验证其他项目不受影响

```bash
cd ~/其他项目
git remote -v
```

**输出示例：**
```
origin    https://github.com/用户名/其他项目.git (fetch)
origin    https://github.com/用户名/其他项目.git (push)
```

**结论：** 其他项目只有自己的 remote，不会有 `server`，完全不受影响！

---

## 🎮 VSCode 集成

### 已配置的任务

打开 VSCode，按 `Cmd+Shift+P` → "Tasks: Run Task"，可以看到：

1. **Deploy to Aliyun Server**
   - 推送到服务器
   - 默认构建任务，`Cmd+Shift+B`

2. **Deploy to GitHub & Server**
   - 同时推送到 GitHub 和服务器

3. **Check Git Remotes**
   - 查看远程仓库配置

---

## 🔄 自动部署流程

```
你开发代码
    ↓
git push server main
    ↓
SSH 推送到服务器 /data/git/mall-demo.git
    ↓
触发 post-receive hook
    ↓
├─ 导出最新代码到临时目录
├─ 备份当前版本到 /backup/
├─ rsync 同步到 /data/www/mall-demo/
├─ npm install --production
├─ node scan_html.js
└─ chmod 755 设置权限
    ↓
部署完成！
    ↓
浏览器访问 http://服务器IP
```

---

## 📝 完整使用示例

### 场景1：日常开发

```bash
# 早上上班
cd /Users/mac/mall-demo

# 开发一整天...
# 修改了 10 个文件，新增了 2 个页面

# 下班前部署
git add .
git commit -m "feat: 新增分账报表功能，优化提现流程"
git push server main

# 完成！5 秒后服务器自动更新
```

---

### 场景2：Bug 修复

```bash
# 线上发现 bug
cd /Users/mac/mall-demo

# 修复 bug
# 编辑 店铺后台/1店-货款账户.html

# 快速修复并部署
git add .
git commit -m "fix: 修复货款账户余额显示错误"
git push server main  # 立即上线
```

---

### 场景3：团队协作

```bash
# 开发者 A 推送功能
git push server main

# 开发者 B 拉取最新代码并推送修复
git pull server main
# 修复问题
git push server main

# 每次 push 都会自动部署，保持多人开发同步
```

---

## 🐛 常见问题

### Q1: Push 时提示 Permission denied

**解决：**
```bash
# 1. 检查 SSH 连接
ssh root@服务器IP

# 2. 如果无法连接，重新上传公钥
ssh-copy-id root@服务器IP

# 3. 测试
ssh root@服务器IP 'echo test'
```

---

### Q2: Push 成功但服务器没更新

**解决：**
```bash
# 1. 检查 Hook 是否有执行权限
ssh root@服务器IP 'chmod +x /data/git/mall-demo.git/hooks/post-receive'

# 2. 手动执行 Hook 测试
ssh root@服务器IP 'cd /data/git/mall-demo.git && hooks/post-receive'

# 3. 查看日志
ssh root@服务器IP 'tail -20 /var/log/mall-demo-deploy.log'
```

---

### Q3: 部署后页面显示 502

**解决：**
```bash
# 1. 检查文件是否存在
ssh root@服务器IP 'ls -la /data/www/mall-demo/'

# 2. 检查 Nginx 配置
ssh root@服务器IP 'nginx -t'

# 3. 查看 Nginx 错误日志
ssh root@服务器IP 'tail -f /var/log/nginx/error.log'

# 4. 重新生成配置
ssh root@服务器IP 'cd /data/www/mall-demo && node scan_html.js'
```

---

### Q4: 想同时推送到 GitHub 和服务器

**解决：**
```bash
# 方法1: 使用 VSCode 任务
# Cmd+Shift+P → "Tasks: Run Task" → "Deploy to GitHub & Server"

# 方法2: 使用 Git Alias
git config --global alias.pushall '!git push origin main && git push server main'
git pushall

# 方法3: 创建 npm script（添加到 package.json）
{
  "scripts": {
    "deploy": "git push origin main && git push server main"
  }
}
npm run deploy
```

---

## 🔄 回滚版本

### 自动备份

每次部署会自动备份到 `/backup/`：

```bash
# 查看备份列表
ssh root@服务器IP 'ls -lt /backup/'

# 输出示例：
# mall-demo-backup-20260929-143022
# mall-demo-backup-20260928-091530
```

### 手动回滚

```bash
# 1. 停止服务
ssh root@服务器IP 'systemctl stop nginx' 2>/dev/null

# 2. 恢复备份
ssh root@服务器IP << 'EOF'
cd /data/www
mv mall-demo mall-demo-current
cp -r /backup/mall-demo-backup-20260928-091530 mall-demo
EOF

# 3. 重启服务
ssh root@服务器IP 'systemctl start nginx' 2>/dev/null
```

---

## 🎯 完整工作流建议

### 方案 A：个人开发

```bash
# 本地开发
git add .
git commit -m "功能开发"

# 推送到服务器
git push server main
```

---

### 方案 B：团队协作 + GitHub 备份

```bash
# 开发完成
git add .
git commit -m "功能开发"

# 1. 推送到 GitHub（代码备份）
git push origin main

# 2. 推送到服务器（自动部署）
git push server main
```

---

### 方案 C：严格流程（开发 → 测试 → 生产）

```bash
# 开发环境
git push server main

# 测试通过后
git push origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 生产环境
git push server main
```

---

## 📞 技术支持

### 查看所有文档

```bash
ls -la /Users/mac/mall-demo/scripts/*.md
```

### 相关文件

- `GIT-DEPLOY.md` - 部署总览
- `scripts/QUICK-DEPLOY-GUIDE.md` - Git Push 快速指南
- `scripts/GIT-PUSH-DEPLOY.md` - Git Push 完整文档
- `DEPLOY.md` - 传统部署文档

---

## ✅ 检查清单

配置完成后，请验证：

- [ ] SSH 免密登录已配置
- [ ] 服务器 Git 仓库已创建 (`/data/git/mall-demo.git`)
- [ ] post-receive hook 已配置
- [ ] 本地 `server` remote 已添加
- [ ] 首次部署已成功
- [ ] VSCode 任务已配置（可选）
- [ ] Git Alias 已配置（可选）

---

## 🎉 开始使用

```bash
# 配置环境
bash scripts/setup-git-deploy.sh 你的服务器IP

# 首次部署
bash scripts/quick-deploy.sh

# 日常开发
git add .
git commit -m "新增功能"
git push server main  # ✨ 一键部署！
```

---

**配置时间**: 2026-09-29
**影响范围**: 仅本项目
**文档版本**: v1.0.0
