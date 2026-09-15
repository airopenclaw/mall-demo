#!/bin/bash

# ========================================
# 万商优选 - 快速部署脚本
# ========================================
# 使用方法:
#   1. 修改下面的配置变量
#   2. 运行: bash scripts/quick-deploy.sh
# ========================================

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  万商优选 - 快速部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ==================== 配置区域（请修改这里） ====================

# 服务器配置
SERVER_HOST="123.45.67.89"           # 替换为你的阿里云ECS公网IP
SERVER_USER="root"                    # SSH用户名
SERVER_PORT=22                        # SSH端口
REMOTE_DIR="/data/www/mall-demo"      # 服务器部署目录

# 域名配置（可选）
DOMAIN=""                             # 替换为你的域名，如 www.example.com
# DOMAIN="your-domain.com"

# ==============================================================

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# 检查配置
if [ "$SERVER_HOST" = "123.45.67.89" ]; then
    echo -e "${RED}错误: 请先修改脚本中的服务器配置${NC}"
    echo -e "${YELLOW}需要修改的变量:${NC}"
    echo "  - SERVER_HOST: 你的阿里云ECS公网IP"
    echo "  - SERVER_USER: SSH用户名"
    echo "  - REMOTE_DIR: 服务器部署目录"
    exit 1
fi

# 确认
echo -e "${YELLOW}部署配置:${NC}"
echo "  服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo "  部署目录: $REMOTE_DIR"
if [ -n "$DOMAIN" ]; then
    echo "  域名: $DOMAIN"
fi
echo ""

read -p "确认部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

# 1. 生成静态配置
echo -e "${GREEN}[1/5] 生成静态配置...${NC}"
node scan_html.js || echo -e "${YELLOW}⚠️  配置生成失败，继续...${NC}"

# 2. 打包
echo -e "${GREEN}[2/5] 打包项目...${NC}"
PACKAGE="/tmp/mall-demo-$(date +%Y%m%d-%H%M%S).tar.gz"

tar -czf "$PACKAGE" \
    --exclude='node_modules' \
    --exclude='备份' \
    --exclude='.history' \
    --exclude='*.log' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    支付分账/ 店铺首页/ 店铺中心/ 移动商城/ 商家入驻/ \
    server.js scan_html.js package.json README.md

SIZE=$(du -h "$PACKAGE" | cut -f1)
echo -e "${GREEN}✓ 打包完成: $SIZE${NC}"

# 3. 上传
echo -e "${GREEN}[3/5] 上传到服务器...${NC}"

# 测试SSH连接
if ! ssh -p $SERVER_PORT -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo '连接成功'" 2>/dev/null; then
    echo -e "${RED}❌ 无法连接服务器，请检查:${NC}"
    echo "  1. IP和端口是否正确"
    echo "  2. SSH密钥是否已配置"
    echo "  3. 防火墙是否开放SSH端口"
    exit 1
fi

# 创建远程目录
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

# 上传
scp -P $SERVER_PORT "$PACKAGE" $SERVER_USER@$SERVER_HOST:/tmp/
echo -e "${GREEN}✓ 上传完成${NC}"

# 4. 服务器端部署
echo -e "${GREEN}[4/5] 服务器端部署...${NC}"

ssh -t -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << EOF
cd $REMOTE_DIR && \
echo '解压文件...' && \
tar -xzf /tmp/$(basename $PACKAGE) && \
rm -f /tmp/$(basename $PACKAGE) && \
echo '安装依赖...' && \
npm install --production --silent && \
echo '生成配置...' && \
node scan_html.js && \
echo '设置权限...' && \
chmod -R 755 . && \
echo '部署完成' \
EOF

echo -e "${GREEN}✓ 服务器部署完成${NC}"

# 5. 配置Nginx（如果配置了域名）
if [ -n "$DOMAIN" ]; then
    echo -e "${GREEN}[5/5] 配置Nginx...${NC}"

    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << EOFNGINX
cat > /etc/nginx/conf.d/mall-demo.conf << 'EOFCONF'
server {
    listen 80;
    server_name $DOMAIN;

    root $REMOTE_DIR/支付分账/平台后台;
    index index.html;

    location ~* \.(html|css|js|png|jpg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOFCONF

nginx -t && systemctl restart nginx
EOFNGINX

    echo -e "${GREEN}✓ Nginx配置完成${NC}"
else
    echo -e "${YELLOW}[5/5] 跳过Nginx配置（配置DOMAIN变量可启用）${NC}"
fi

# 清理
rm -f "$PACKAGE"

# 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}访问地址:${NC}"
if [ -n "$DOMAIN" ]; then
    echo "  http://$DOMAIN"
fi
echo "  http://$SERVER_HOST"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "  1. 在浏览器访问"
echo "  2. 检查页面显示"
echo "  3. 查看日志: ssh $SERVER_USER@$SERVER_HOST 'journalctl -u nginx -f'"
echo ""
