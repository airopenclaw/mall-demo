#!/bin/bash
# ========================================
# 阿里云服务器 Git 部署环境配置脚本
# ========================================
# 在本地运行，通过 SSH 自动配置服务器
# ========================================

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  阿里云 Git 部署环境配置${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  bash scripts/setup-git-deploy.sh 你的服务器IP"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  bash scripts/setup-git-deploy.sh 121.40.123.45"
    exit 1
fi

SERVER_IP="$1"

# 确认
echo -e "${YELLOW}配置信息:${NC}"
echo "  服务器: root@$SERVER_IP"
echo ""
read -p "确认配置? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""
echo -e "${GREEN}[1/3] 测试 SSH 连接...${NC}"

# 测试 SSH 连接
if ! ssh -o ConnectTimeout=10 root@$SERVER_IP "echo '连接成功'" 2>/dev/null; then
    echo -e "${RED}❌ 无法连接服务器${NC}"
    echo "请检查:"
    echo "  1. IP 地址是否正确"
    echo "  2. SSH 密钥是否已配置（运行: ssh-copy-id root@$SERVER_IP）"
    echo "  3. 防火墙是否开放 SSH 端口"
    exit 1
fi

echo -e "${GREEN}✓ SSH 连接成功${NC}"
echo ""

echo -e "${GREEN}[2/3] 配置服务器环境...${NC}"

# 在服务器上配置 Git 仓库
ssh root@$SERVER_IP << EOF
set -e

echo "创建 Git 仓库目录..."
mkdir -p /data/git
mkdir -p /data/git/mall-demo.git
cd /data/git/mall-demo.git

echo "初始化裸仓库..."
git init --bare
git config user.name "Deploy Bot"
git config user.email "deploy@$(curl -s ifconfig.me 2>/dev/null || echo 'server')"

echo "创建 Web 目录..."
mkdir -p /data/www/mall-demo

echo "创建 post-receive hook..."
cat > hooks/post-receive << 'HOOK_EOF'
#!/bin/bash
set -e

WEB_DIR="/data/www/mall-demo"
TEMP_DIR="/tmp/mall-demo-deploy-$$"
LOG_FILE="/var/log/mall-demo-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] \$1" | tee -a "\$LOG_FILE"
}

log "=========================================="
log "开始自动部署"
log "=========================================="

# 创建临时目录
rm -rf "\$TEMP_DIR"
mkdir -p "\$TEMP_DIR"

# 导出最新代码
git --work-tree="\$TEMP_DIR" --git-dir="\$(pwd)" checkout -f

# 备份当前版本
if [ -d "\$WEB_DIR/.git" ]; then
    BACKUP_DIR="/backup/mall-demo-backup-$(date +%Y%m%d-%H%M%S)"
    log "备份当前版本到: \$BACKUP_DIR"
    mkdir -p /backup
    cp -r "\$WEB_DIR" "\$BACKUP_DIR"
fi

# 同步文件
rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='备份' \
    --exclude='.history' \
    --exclude='*.log' \
    "\$TEMP_DIR/" "\$WEB_DIR/"

log "文件已同步"

# 安装依赖
cd "\$WEB_DIR"
npm install --production --silent 2>/dev/null || log "⚠️  npm install 失败"

# 生成配置
node scan_html.js 2>/dev/null || log "⚠️  配置生成失败"

# 设置权限
chmod -R 755 "\$WEB_DIR"
chown -R nginx:nginx "\$WEB_DIR" 2>/dev/null || chown -R www-data:www-data "\$WEB_DIR" 2>/dev/null || true

# 清理
rm -rf "\$TEMP_DIR"

log "=========================================="
log "部署完成！"
log "=========================================="
HOOK_EOF

chmod +x hooks/post-receive

echo "✓ Git 仓库和 Hook 配置完成"
EOF

echo -e "${GREEN}✓ 服务器环境配置完成${NC}"
echo ""

echo -e "${GREEN}[3/3] 配置本地 Git Remote...${NC}"

# 添加 Git remote
cd "$(dirname "$0")/.."

# 检查是否已存在 server remote
if git remote | grep -q "^server$"; then
    echo -e "${YELLOW}⚠️  'server' remote 已存在，更新 URL...${NC}"
    git remote set-url server ssh://root@$SERVER_IP:/data/git/mall-demo.git
else
    echo "添加 'server' remote..."
    git remote add server ssh://root@$SERVER_IP:/data/git/mall-demo.git
fi

echo -e "${GREEN}✓ Git Remote 配置完成${NC}"
echo ""

# 完成
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}当前 Git Remotes:${NC}"
git remote -v
echo ""
echo -e "${YELLOW}使用方式:${NC}"
echo "  1. 推送到 GitHub（原功能）:"
echo "     git push origin main"
echo ""
echo "  2. 推送到阿里云服务器（新功能）:"
echo "     git push server main"
echo ""
echo "  3. 同时推送到两者:"
echo "     git push origin main && git push server main"
echo ""
echo -e "${YELLOW}首次部署:${NC}"
echo "  如果服务器 /data/www/mall-demo 为空，首次推送前需要手动上传一次:"
echo "  bash scripts/quick-deploy.sh"
echo ""
echo -e "${YELLOW}注意事项:${NC}"
echo "  • 此配置仅影响本项目"
echo "  • GitHub (origin) 和服务器 (server) 是两个独立的远程仓库"
echo "  • Push 到服务器会自动触发 post-receive hook 进行部署"
echo ""
