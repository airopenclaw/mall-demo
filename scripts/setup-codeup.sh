#!/bin/bash
# ========================================
# 配置阿里云 Codeup Git 仓库
# ========================================
# 使用方法: bash scripts/setup-codeup.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  配置阿里云 Codeup 仓库${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

cd "$(dirname "$0")/.."

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  bash scripts/setup-codeup.sh <仓库地址>"
    echo ""
    echo -e "${YELLOW}仓库地址示例:${NC}"
    echo "  HTTPS: https://your-company.devops.aliyun.com/group/repo.git"
    echo "  SSH:   git@your-company.devops.aliyun.com:group/repo.git"
    echo ""
    echo -e "${YELLOW}获取仓库地址:${NC}"
    echo "  1. 登录 https://codeup.aliyun.com/"
    echo "  2. 进入仓库 → 克隆/下载 → 复制 HTTPS 或 SSH 地址"
    echo ""
    exit 1
fi

CODEPUP_REPO="$1"

echo -e "${YELLOW}配置信息:${NC}"
echo "  仓库地址: $CODEPUP_REPO"
echo ""

# 询问 remote 名称
read -p "请输入 remote 名称 (默认: codeup): " REMOTE_NAME
REMOTE_NAME="${REMOTE_NAME:-codeup}"

echo ""
echo -e "${GREEN}[1/2] 添加 Git Remote...${NC}"

# 检查是否已存在
if git remote | grep -q "^${REMOTE_NAME}$"; then
    echo -e "${YELLOW}⚠️  '${REMOTE_NAME}' remote 已存在，更新 URL...${NC}"
    git remote set-url "${REMOTE_NAME}" "${CODEPUP_REPO}"
else
    echo "添加 '${REMOTE_NAME}' remote..."
    git remote add "${REMOTE_NAME}" "${CODEPUP_REPO}"
fi

echo -e "${GREEN}✓ Git Remote 添加成功${NC}"

echo ""
echo -e "${GREEN}[2/2] 验证配置...${NC}"

echo ""
echo -e "${YELLOW}当前 Git Remotes:${NC}"
git remote -v

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}使用方式:${NC}"
echo "  推送到 Codeup:"
echo "    git push ${REMOTE_NAME} main"
echo ""
echo "  同时推送到 GitHub 和 Codeup:"
echo "    git push origin main && git push ${REMOTE_NAME} main"
echo ""
echo -e "${YELLOW}Git Alias (可选):${NC}"
echo "  git config --global alias.codeup '!git push ${REMOTE_NAME} main'"
echo "  # 使用: git codeup"
echo ""
