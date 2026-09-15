#!/bin/bash

# ========================================
# 万商优选 - 一键部署到阿里云脚本
# ========================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  万商优选 - 阿里云部署工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 读取配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/deploy.config.yaml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}错误: 找不到配置文件 $CONFIG_FILE${NC}"
    exit 1
fi

# 解析配置（简单版，使用 grep 和 sed）
SERVER_HOST=$(grep -A 10 '^server:' "$CONFIG_FILE" | grep 'host:' | sed 's/.*"\([^"]*\)".*/\1/')
SERVER_USER=$(grep -A 10 '^server:' "$CONFIG_FILE" | grep 'user:' | sed 's/.*"\([^"]*\)".*/\1/')
SERVER_PORT=$(grep -A 10 '^server:' "$CONFIG_FILE" | grep 'port:' | sed 's/.*: *"\([^"]*\)".*/\1/')
REMOTE_DIR=$(grep -A 10 '^server:' "$CONFIG_FILE" | grep 'remote_dir:' | sed 's/.*"\([^"]*\)".*/\1/')
DOMAIN_ENABLED=$(grep -A 10 '^domain:' "$CONFIG_FILE" | grep 'enabled:' | sed 's/.*: *\([^#]*\).*/\1/')
DOMAIN_NAME=$(grep -A 10 '^domain:' "$CONFIG_FILE" | grep 'name:' | sed 's/.*"\([^"]*\)".*/\1/')

# 检查配置
if [ "$SERVER_HOST" = "your-server-ip" ] || [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}错误: 请先修改 $CONFIG_FILE 中的服务器配置${NC}"
    echo -e "${YELLOW}需要修改的字段:${NC}"
    echo "  - server.host: 你的阿里云ECS公网IP"
    echo "  - server.user: SSH用户名（通常是 root）"
    echo "  - server.remote_dir: 服务器部署目录"
    exit 1
fi

# 确认部署
echo -e "${YELLOW}部署配置:${NC}"
echo "  服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo "  部署目录: $REMOTE_DIR"
if [ "$DOMAIN_ENABLED" = "true" ]; then
    echo "  域名: $DOMAIN_NAME"
fi
echo ""

read -p "确认部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消部署"
    exit 0
fi

# 项目根目录
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# 1. 生成静态配置
echo -e "${GREEN}[1/5] 生成静态配置...${NC}"
if [ -f "scan_html.js" ]; then
    node scan_html.js || echo -e "${YELLOW}警告: scan_html.js 执行失败，继续部署...${NC}"
fi

# 2. 打包项目
echo -e "${GREEN}[2/5] 打包项目...${NC}"
TEMP_DIR="$SCRIPT_DIR/tmp"
mkdir -p "$TEMP_DIR"
PACKAGE_NAME="mall-demo-$(date +%Y%m%d-%H%M%S).tar.gz"
PACKAGE_PATH="$TEMP_DIR/$PACKAGE_NAME"

# 读取排除项
EXCLUDES=$(grep -A 20 'excludes:' "$CONFIG_FILE" | grep -E '^\s*-' | sed 's/.*"\([^"]*\)".*/\1/' | tr '\n' ' ')

# 构建排除参数
EXCLUDE_ARGS=""
for exclude in $EXCLUDES; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude='$exclude'"
done

# 读取包含项
INCLUDE_FOLDERS=$(grep -A 20 'include_folders:' "$CONFIG_FILE" | grep -E '^\s*-' | sed 's/.*"\([^"]*\)".*/\1/' | tr '\n' ' ')
INCLUDE_FILES=$(grep -A 20 'include_files:' "$CONFIG_FILE" | grep -E '^\s*-' | sed 's/.*"\([^"]*\)".*/\1/' | tr '\n' ' ')

# 执行打包
echo -e "${YELLOW}正在打包文件...${NC}"
eval "tar -czf '$PACKAGE_PATH' $EXCLUDE_ARGS $INCLUDE_FOLDERS $INCLUDE_FILES"

if [ ! -f "$PACKAGE_PATH" ]; then
    echo -e "${RED}错误: 打包失败${NC}"
    exit 1
fi

PACKAGE_SIZE=$(du -h "$PACKAGE_PATH" | cut -f1)
echo -e "${GREEN}打包完成: $PACKAGE_NAME (大小: $PACKAGE_SIZE)${NC}"

# 3. 上传到服务器
echo -e "${GREEN}[3/5] 上传到服务器...${NC}"
echo -e "${YELLOW}正在连接 $SERVER_USER@$SERVER_HOST...${NC}"

# 测试SSH连接
if ! ssh -p $SERVER_PORT -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'SSH连接成功'" 2>/dev/null; then
    echo -e "${RED}错误: 无法连接到服务器，请检查:${NC}"
    echo "  1. 服务器IP和端口是否正确"
    echo "  2. SSH密钥是否已配置"
    echo "  3. 服务器防火墙是否开放SSH端口"
    exit 1
fi

# 创建远程目录
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

# 上传文件
scp -P $SERVER_PORT "$PACKAGE_PATH" $SERVER_USER@$SERVER_HOST:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 文件上传失败${NC}"
    exit 1
fi

echo -e "${GREEN}上传完成${NC}"

# 4. 服务器端解压和部署
echo -e "${GREEN}[4/5] 服务器端部署...${NC}"

# 构建远程执行命令
REMOTE_COMMANDS="
cd $REMOTE_DIR && \
echo '解压文件...' && \
tar -xzf /tmp/$(basename $PACKAGE_PATH) && \
rm -f /tmp/$(basename $PACKAGE_PATH) && \
echo '安装依赖...' && \
npm install --production --silent && \
echo '生成静态配置...' && \
node scan_html.js && \
echo '设置文件权限...' && \
chmod -R 755 . && \
echo '部署完成' \
"

# 执行远程命令
ssh -t -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "$REMOTE_COMMANDS"

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 服务器端部署失败${NC}"
    exit 1
fi

echo -e "${GREEN}服务器端部署完成${NC}"

# 5. 配置 Nginx（可选）
if [ "$DOMAIN_ENABLED" = "true" ]; then
    echo -e "${GREEN}[5/5] 配置 Nginx...${NC}"

    # 生成Nginx配置
    NGINX_CONF=$(grep -A 50 'template:' "$CONFIG_FILE" | grep -v 'template:' | sed "s/{{DOMAIN}}/$DOMAIN_NAME/g" | sed "s|{{REMOTE_DIR}}|$REMOTE_DIR|g")

    # 上传配置
    echo "$NGINX_CONF" | ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cat > /etc/nginx/conf.d/mall-demo.conf"

    # 测试并重启Nginx
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "nginx -t && systemctl restart nginx" || \
        echo -e "${YELLOW}警告: Nginx配置失败，请手动检查${NC}"
else
    echo -e "${YELLOW}[5/5] 跳过Nginx配置（在配置文件中启用 domain.enabled: true 可自动配置）${NC}"
fi

# 6. 清理临时文件
echo -e "${GREEN}清理临时文件...${NC}"
rm -rf "$TEMP_DIR"

# 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}访问地址:${NC}"
if [ "$DOMAIN_ENABLED" = "true" ]; then
    echo "  域名: http://$DOMAIN_NAME"
fi
echo "  IP: http://$SERVER_HOST"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "  1. 在浏览器中访问上述地址"
echo "  2. 检查页面是否正常显示"
echo "  3. 如有问题，查看服务器日志: ssh $SERVER_USER@$SERVER_HOST 'journalctl -u nginx -f'"
echo ""
