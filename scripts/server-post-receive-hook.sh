#!/bin/bash
# ========================================
# 阿里云服务器 Git Hook - 自动部署
# ========================================
# 此脚本在服务器端执行，当收到 Git Push 时自动部署

set -e

# 配置变量
WEB_DIR="/data/www/mall-demo"           # Web 访问目录
TEMP_DIR="/tmp/mall-demo-deploy"        # 临时部署目录
LOG_FILE="/var/log/mall-demo-deploy.log" # 部署日志

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "开始自动部署"
log "=========================================="

# 检查 Web 目录是否存在
if [ ! -d "$WEB_DIR" ]; then
    log "错误: Web 目录不存在: $WEB_DIR"
    log "请先手动创建目录: mkdir -p $WEB_DIR"
    exit 1
fi

# 创建临时目录
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 导出最新代码到临时目录
git --work-tree="$TEMP_DIR" --git-dir="$(pwd)" checkout -f

log "代码已导出到临时目录"

# 备份当前版本（如果存在）
if [ -d "$WEB_DIR/.git" ]; then
    BACKUP_DIR="/backup/mall-demo-backup-$(date +%Y%m%d-%H%M%S)"
    log "备份当前版本到: $BACKUP_DIR"
    mkdir -p /backup
    cp -r "$WEB_DIR" "$BACKUP_DIR"
fi

# 同步文件到 Web 目录（保留 .git 目录）
rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='备份' \
    --exclude='.history' \
    --exclude='*.log' \
    "$TEMP_DIR/" "$WEB_DIR/"

log "文件已同步到 Web 目录"

# 安装依赖
if [ -f "$WEB_DIR/package.json" ]; then
    log "安装依赖..."
    cd "$WEB_DIR"
    npm install --production --silent
fi

# 生成静态配置
if [ -f "$WEB_DIR/scan_html.js" ]; then
    log "生成页面配置..."
    cd "$WEB_DIR"
    node scan_html.js
fi

# 设置权限
log "设置文件权限..."
chmod -R 755 "$WEB_DIR"
chown -R nginx:nginx "$WEB_DIR" 2>/dev/null || chown -R www-data:www-data "$WEB_DIR" 2>/dev/null || true

# 清理临时目录
rm -rf "$TEMP_DIR"

log "=========================================="
log "部署完成！"
log "=========================================="
log "访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
log ""

exit 0
