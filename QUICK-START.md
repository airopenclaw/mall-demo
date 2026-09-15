# 🚀 快速部署指南

## 3步完成部署

### 1️⃣ 修改配置
```bash
vim scripts/quick-deploy.sh

# 修改这些变量：
SERVER_HOST="你的阿里云IP"      # 必须修改
SERVER_USER="root"               # 通常是 root
REMOTE_DIR="/data/www/mall-demo" # 部署目录
DOMAIN="www.example.com"         # 可选，你的域名
```

### 2️⃣ 执行部署
```bash
bash scripts/quick-deploy.sh
```

### 3️⃣ 验证
```
http://你的阿里云IP
```

---

## 📦 发布功能命令

```bash
# 本地开发
npm start                # 启动本地服务器

# 生成配置
npm run scan             # 扫描HTML生成config.js

# 打包项目
npm run publish          # 生成发布包

# 部署
npm run deploy           # 快速部署（推荐）
npm run deploy:full      # 完整部署（使用YAML配置）
```

---

## 🔧 常用命令

### 本地操作
```bash
# 启动本地服务器（端口3000）
node server.js

# 访问本地
open http://localhost:3000

# 生成页面配置
node scan_html.js
```

### 服务器操作
```bash
# SSH连接
ssh root@你的服务器IP

# 查看Nginx日志
tail -f /var/log/nginx/error.log

# 重启Nginx
systemctl restart nginx

# 手动生成配置
cd /data/www/mall-demo && node scan_html.js
```

### 手动部署
```bash
# 1. 本地打包
tar -czf /tmp/mall-demo.tar.gz \
  --exclude='node_modules' \
  --exclude='备份' \
  --exclude='.history' \
  支付分账/ 店铺首页/ 店铺中心/ 移动商城/ 商家入驻/ \
  server.js scan_html.js package.json

# 2. 上传
scp /tmp/mall-demo.tar.gz root@服务器IP:/data/www/

# 3. 服务器部署
ssh root@服务器IP << 'EOF'
cd /data/www
tar -xzf mall-demo.tar.gz
cd mall-demo
npm install
node scan_html.js
EOF
```

---

## ⚠️ 注意事项

### 部署前检查
- [ ] 服务器IP和SSH端口正确
- [ ] SSH密钥已配置（或密码登录已启用）
- [ ] 服务器防火墙开放22和80端口
- [ ] 服务器已安装Node.js

### 排除的文件
以下文件不会上传到服务器：
- `node_modules/` - 依赖包（服务器重新安装）
- `备份/` - 备份文件夹
- `.history/` - 编辑器历史
- `*.log` - 日志文件
- `.git/` - Git仓库

### 必须上传的文件
- `支付分账/` - 主业务原型
- `店铺首页/` - 店铺首页（如果有）
- `店铺中心/` - 店铺中心（如果有）
- `移动商城/` - 移动商城（如果有）
- `商家入驻/` - 商家入驻（如果有）
- `server.js` - 本地开发服务器
- `scan_html.js` - HTML扫描脚本
- `package.json` - npm配置

---

## 🐛 常见问题

### Q: SSH连接失败
```bash
# 检查连接
ssh -v root@服务器IP

# 检查防火墙
ssh root@服务器IP 'firewall-cmd --list-ports'
```

### Q: 页面空白
```bash
# 手动生成配置
ssh root@服务器IP 'cd /data/www/mall-demo && node scan_html.js'

# 检查config.js
ssh root@服务器IP 'cat /data/www/mall-demo/resources/scripts/config.js'
```

### Q: Nginx 502错误
```bash
# 查看错误日志
ssh root@服务器IP 'tail -f /var/log/nginx/error.log'

# 检查权限
ssh root@服务器IP 'ls -la /data/www/mall-demo/'
```

---

## 📞 获取帮助

- 📖 详细文档：`scripts/README.md`
- 📋 部署指南：`DEPLOY.md`
- ⚙️ 配置示例：`scripts/deploy.config.example.yaml`

---

**最后更新**: 2026-09-15
