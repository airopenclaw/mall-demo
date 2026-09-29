# VSCode Git Push 自动部署配置指南

## 📋 目录

1. [配置步骤](#配置步骤)
2. [使用方式](#使用方式)
3. [故障排查](#故障排查)
4. [高级配置](#高级配置)

---

## 配置步骤

### 方案一：Git Push 直接推送到服务器（推荐）

#### 第1步：在阿里云服务器上配置 Git 仓库

SSH 登录到你的阿里云服务器，执行以下命令：

```bash
# 1. 创建裸仓库目录
mkdir -p /data/git/mall-demo.git
cd /data/git/mall-demo.git

# 2. 初始化裸仓库
git init --bare

# 3. 配置 Git 信息（重要！）
git config user.name "Deploy Bot"
git config user.email "deploy@your-server.com"

# 4. 创建 Web 目录
mkdir -p /data/www/mall-demo
chmod 755 /data/www/mall-demo

# 5. 复制 hook 脚本
# 将本地的 scripts/server-post-receive-hook.sh 上传到服务器：
# scp scripts/server-post-receive-hook.sh root@服务器IP:/data/git/mall-demo.git/hooks/post-receive

# 6. 设置 hook 脚本执行权限
chmod +x /data/git/mall-demo.git/hooks/post-receive
```

**或者使用以下一条龙命令**（通过 SSH）：

```bash
ssh root@你的服务器IP << 'EOF'
# 创建 Git 仓库
mkdir -p /data/git/mall-demo.git
cd /data/git/mall-demo.git
git init --bare
git config user.name "Deploy Bot"
git config user.email "deploy@your-server.com"

# 创建 Web 目录
mkdir -p /data/www/mall-demo

# 创建 post-receive hook
cat > hooks/post-receive << 'HOOK_EOF'
#!/bin/bash
set -e

WEB_DIR="/data/www/mall-demo"
TEMP_DIR="/tmp/mall-demo-deploy-$$"
LOG_FILE="/var/log/mall-demo-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "开始自动部署"
log "=========================================="

# 创建临时目录
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 导出最新代码
git --work-tree="$TEMP_DIR" --git-dir="$(pwd)" checkout -f

# 备份当前版本
if [ -d "$WEB_DIR/.git" ]; then
    BACKUP_DIR="/backup/mall-demo-backup-$(date +%Y%m%d-%H%M%S)"
    log "备份当前版本到: $BACKUP_DIR"
    mkdir -p /backup
    cp -r "$WEB_DIR" "$BACKUP_DIR"
fi

# 同步文件（排除 .git）
rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='备份' \
    --exclude='.history' \
    --exclude='*.log' \
    "$TEMP_DIR/" "$WEB_DIR/"

log "文件已同步"

# 安装依赖
cd "$WEB_DIR"
npm install --production --silent 2>/dev/null || log "⚠️  npm install 失败"

# 生成配置
node scan_html.js 2>/dev/null || log "⚠️  配置生成失败"

# 设置权限
chmod -R 755 "$WEB_DIR"
chown -R nginx:nginx "$WEB_DIR" 2>/dev/null || chown -R www-data:www-data "$WEB_DIR" 2>/dev/null || true

# 清理
rm -rf "$TEMP_DIR"

log "=========================================="
log "部署完成！"
log "=========================================="
HOOK_EOF

chmod +x hooks/post-receive
echo "✓ Git 仓库和 Hook 配置完成"
EOF
```

#### 第2步：本地添加服务器为 Git Remote

```bash
cd /Users/mac/mall-demo

# 添加服务器作为远程仓库（替换为你的服务器信息）
git remote add server ssh://root@你的服务器IP:/data/git/mall-demo.git

# 验证
git remote -v
# 应该看到 origin 和 server 两个远程仓库
```

**重要：分离 GitHub 和服务器推送**

```bash
# push 到 GitHub（保持原有功能）
git push origin main

# push 到阿里云服务器（新增功能）
git push server main
```

#### 第3步：配置 VSCode（可选）

在 VSCode 中配置一键部署：

1. 按 `Cmd+Shift+P`
2. 输入 "Tasks: Configure Task"
3. 选择 "Create tasks.json file from template"
4. 选择 "Others"
5. 替换内容为：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Deploy to Aliyun",
      "type": "shell",
      "command": "git push server main",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    }
  ]
}
```

保存后，可以通过以下方式触发部署：
- `Cmd+Shift+B`（默认构建快捷键）
- VSCode 命令面板 → "Tasks: Run Task" → "Deploy to Aliyun"

---

### 方案二：使用 Git Alias 简化命令

如果你不想修改 `git push` 命令，可以创建自定义命令：

```bash
# 添加 Git alias
git config --global alias.deploy '!f() { git push server main; }; f'

# 使用方式
git deploy
```

---

### 方案三：VSCode 自动化推送（包含 GitHub 和服务器）

如果希望在 push 时**同时推送到 GitHub 和服务器**，可以配置 VSCode 任务：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Push to GitHub & Server",
      "type": "shell",
      "command": "git push origin main && git push server main",
      "group": "build",
      "presentation": {
        "reveal": "always"
      },
      "problemMatcher": []
    }
  ]
}
```

---

## 使用方式

### 方式 A：命令行 push

```bash
# 推送到 GitHub（原功能）
git push origin main

# 推送到阿里云服务器（新功能）
git push server main
```

### 方式 B：VSCode 快捷键

1. 按 `Cmd+Shift+B` → 选择 "Deploy to Aliyun"
2. 或 `Cmd+Shift+P` → "Tasks: Run Task" → "Deploy to Aliyun"

### 方式 C：Git Alias

```bash
git deploy  # 一键推送到服务器
```

---

## 故障排查

### 问题1：Permission denied (publickey)

**原因：** SSH 密钥未配置

**解决：**
```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519

# 上传公钥到服务器
ssh-copy-id root@服务器IP

# 测试连接
ssh root@服务器IP
```

### 问题2：Hook 脚本不执行

**原因：** 脚本无执行权限

**解决：**
```bash
ssh root@服务器IP 'chmod +x /data/git/mall-demo.git/hooks/post-receive'
```

### 问题3：部署后 502 错误

**检查：**
```bash
ssh root@服务器IP << 'EOF'
# 检查文件是否存在
ls -la /data/www/mall-demo/

# 检查权限
ls -ld /data/www/mall-demo/

# 检查 Nginx 配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
EOF
```

---

## 高级配置

### 1. 部署到特定分支

```bash
# 在服务器的 post-receive hook 中修改：
while read oldrev newrev ref
do
    # 只部署 main 分支
    if [[ $ref = refs/heads/main ]];
    then
        echo "Main branch ref received. Deploying ${BRANCH} to ${TARGET_PATH}"
        # 部署逻辑...
    fi
done
```

### 2. 自动重启 Node.js 服务

如果使用了 `server.js`，可以在 hook 中添加：

```bash
# 重启 Node.js 服务
ssh root@服务器IP 'systemctl restart mall-demo' 2>/dev/null || \
ssh root@服务器IP 'pkill -f "node server.js" && cd /data/www/mall-demo && nohup node server.js > /dev/null 2>&1 &'
```

### 3. 部署通知

添加 Slack/钉钉/企业微信通知：

```bash
# 在 hook 脚本末尾添加
curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"msgtype": "text", "text": {"content": "🚀 mall-demo 部署成功！"}}'
```

---

## 安全建议

### 1. 禁用密码登录（SSH Key Only）

```bash
# 服务器端编辑 /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no

# 重启 SSH
systemctl restart sshd
```

### 2. 配置防火墙

```bash
# 只开放必要端口
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### 3. 限制 Git 仓库访问

```bash
# 创建专用 Git 用户
useradd -r -m -s /usr/bin/git-shell git
chown -R git:git /data/git/mall-demo.git
```

---

## 相关文件

- `scripts/server-post-receive-hook.sh` - 服务器端部署脚本
- `scripts/quick-deploy.sh` - 快速部署脚本（首次部署用）
- `.vscode/` - VSCode 配置（可选）

---

**最后更新**: 2026-09-29
**版本**: v1.0.0
