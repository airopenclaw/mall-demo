# 万商优选 - 发布部署文档

## 📦 发布功能说明

本项目提供三种发布方式，支持一键部署到阿里云服务器。

---

## 🚀 方式一：快速部署（推荐）

### 适用场景
快速部署到已配置好的阿里云服务器，只需修改几个变量即可。

### 使用步骤

1. **修改配置**
   ```bash
   # 编辑快速部署脚本
   vim scripts/quick-deploy.sh

   # 修改以下变量：
   SERVER_HOST="你的阿里云IP"
   SERVER_USER="root"
   REMOTE_DIR="/data/www/mall-demo"
   DOMAIN="你的域名（可选）"
   ```

2. **执行部署**
   ```bash
   bash scripts/quick-deploy.sh
   ```

3. **完成**
   脚本会自动完成：
   - ✅ 生成静态配置
   - ✅ 打包项目（排除不需要的文件）
   - ✅ 上传到服务器
   - ✅ 解压并安装依赖
   - ✅ 配置 Nginx（如果配置了域名）

---

## 📋 方式二：分步部署

### 适用场景
需要更精细的控制，或不想使用YAML配置。

#### 步骤1: 打包项目
```bash
# 在本地执行
cd /Users/mac/mall-demo

# 打包（排除不需要的文件）
tar -czf /tmp/mall-demo.tar.gz \
  --exclude='node_modules' \
  --exclude='备份' \
  --exclude='.history' \
  --exclude='*.log' \
  支付分账/ 店铺首页/ 店铺中心/ 移动商城/ 商家入驻/ \
  server.js scan_html.js package.json README.md
```

#### 步骤2: 上传到服务器
```bash
# 上传
scp /tmp/mall-demo.tar.gz root@你的服务器IP:/data/www/

# 连接服务器
ssh root@你的服务器IP
```

#### 步骤3: 服务器端部署
```bash
# 进入目录
cd /data/www

# 解压
tar -xzf mall-demo.tar.gz
cd mall-demo

# 安装依赖
npm install

# 生成配置
node scan_html.js

# 设置权限
chmod -R 755 .
```

#### 步骤4: 配置Nginx
```bash
# 创建Nginx配置
cat > /etc/nginx/conf.d/mall-demo.conf << 'EOF'
server {
    listen 80;
    server_name 你的域名或IP;

    root /data/www/mall-demo/支付分账/平台后台;
    index index.html;

    location ~* \.(html|css|js|png|jpg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 测试并重启
nginx -t
systemctl restart nginx
```

---

## 🔧 方式三：使用 npm scripts

### 适用场景
喜欢使用 npm 命令的开发者。

#### 可用命令

```bash
# 安装依赖
npm install

# 启动本地服务器
npm start

# 生成静态配置
npm run scan

# 打包项目（生成发布包）
npm run publish

# 一键部署（需要先配置 server.js）
npm run deploy
```

---

## ⚙️ 配置说明

### 服务器要求
- ✅ 阿里云 ECS 实例（Linux）
- ✅ SSH 访问权限
- ✅ Node.js 环境（用于生成配置）
- ✅ Nginx（可选，用于域名访问）

### 端口要求
- SSH: 22（默认）
- HTTP: 80（Web访问）

### 文件说明

```
scripts/
├── deploy.config.yaml      # 部署配置文件（YAML格式）
├── deploy.sh               # 完整部署脚本（使用配置文件）
├── quick-deploy.sh         # 快速部署脚本（直接配置变量）
├── publish.js              # 发布打包脚本（Node.js）
└── README.md               # 本文件
```

---

## 📝 配置模板

### deploy.config.yaml 说明

```yaml
server:
  host: "your-server-ip"        # 服务器IP
  user: "root"                   # SSH用户
  port: 22                       # SSH端口
  remote_dir: "/data/www/mall-demo"  # 部署目录

domain:
  enabled: false                 # 是否启用域名
  name: "your-domain.com"        # 域名

deploy:
  excludes:                      # 打包时排除的文件
    - "node_modules"
    - "备份"
    - ".history"
    - "*.log"

deploy:
  include_folders:               # 包含的文件夹
    - "支付分账"
    - "店铺首页"
    - "店铺中心"
    - "移动商城"
    - "商家入驻"

  include_files:                 # 包含的根目录文件
    - "server.js"
    - "scan_html.js"
    - "package.json"
```

---

## 🔍 验证部署

部署完成后，在浏览器访问：

```
http://你的服务器IP
```

或（如果配置了域名）

```
http://你的域名
```

### 检查清单
- [ ] 页面正常加载
- [ ] 左侧菜单显示正确
- [ ] 静态资源（CSS/JS/图片）加载正常
- [ ] 分账明细页面数据显示正常
- [ ] 账户流水页面数据显示正常

---

## 🐛 故障排查

### 问题1: SSH连接失败
```bash
# 检查SSH服务是否运行
ssh -v root@你的服务器IP

# 检查防火墙
ssh root@服务器IP 'firewall-cmd --list-ports'
```

### 问题2: Nginx 502错误
```bash
# 检查Nginx错误日志
ssh root@服务器IP 'tail -f /var/log/nginx/error.log'

# 检查文件权限
ssh root@服务器IP 'ls -la /data/www/mall-demo/'
```

### 问题3: 页面显示空白
```bash
# 检查Node.js配置
ssh root@服务器IP 'cd /data/www/mall-demo && node scan_html.js'

# 检查config.js是否生成
ssh root@服务器IP 'cat /data/www/mall-demo/resources/scripts/config.js | head -20'
```

### 问题4: 中文路径乱码
确保服务器系统支持UTF-8：
```bash
ssh root@服务器IP 'locale'
# 应该看到: LANG=zh_CN.UTF-8
```

---

## 📊 部署流程对比

| 特性 | 快速部署 | 分步部署 | npm scripts |
|------|---------|---------|-------------|
| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 灵活性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 自动化程度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 配置难度 | 简单 | 中等 | 简单 |
| 推荐场景 | 一键部署 | 精细控制 | 开发环境 |

---

## 💡 最佳实践

1. **首次部署**：使用快速部署脚本，测试环境是否正常
2. **正式发布**：使用分步部署，每步验证
3. **日常更新**：使用快速部署，效率最高
4. **备份**：部署前备份服务器旧版本
   ```bash
   ssh root@服务器IP 'tar -czf /backup/mall-demo-backup-$(date +%Y%m%d).tar.gz /data/www/mall-demo/'
   ```

---

## 🔐 安全建议

1. **SSH密钥认证**
   ```bash
   # 本地生成SSH密钥
   ssh-keygen -t ed25519

   # 上传公钥到服务器
   ssh-copy-id root@服务器IP
   ```

2. **禁用SSH密码登录**（可选）
   编辑 `/etc/ssh/sshd_config`:
   ```
   PasswordAuthentication no
   PermitRootLogin no
   ```

3. **启用HTTPS**（生产环境）
   ```bash
   # 安装Certbot
   ssh root@服务器IP 'yum install certbot-nginx'

   # 申请SSL证书
   ssh root@服务器IP 'certbot --nginx -d your-domain.com'
   ```

---

## 📞 技术支持

遇到问题？
1. 查看服务器日志：`journalctl -u nginx -f`
2. 检查本地打包：`npm run publish`
3. 查看配置文件：`cat scripts/deploy.config.yaml`

---

**最后更新**: 2026-09-15
