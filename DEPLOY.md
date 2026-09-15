# 🚀 万商优选 - 发布部署指南

本项目提供完整的发布部署功能，支持一键部署到阿里云服务器。

---

## 📦 发布功能清单

### ✅ 已实现的发布功能

| 功能 | 文件 | 说明 |
|------|------|------|
| **快速部署脚本** | `scripts/quick-deploy.sh` | 一键部署，只需修改几个变量 |
| **完整部署脚本** | `scripts/deploy.sh` | 使用YAML配置文件，功能完整 |
| **发布打包工具** | `scripts/publish.js` | Node.js打包脚本，生成发布包 |
| **配置文件** | `scripts/deploy.config.yaml` | YAML格式部署配置 |
| **配置示例** | `scripts/deploy.config.example.yaml` | 配置模板 |
| **Nginx配置生成** | 自动生成 | 根据配置自动生成Nginx配置 |
| **自动生成config.js** | `scan_html.js` | 自动扫描HTML生成页面目录 |

---

## 🚀 快速开始（3步完成部署）

### 第1步：修改配置

编辑 `scripts/quick-deploy.sh`，修改以下变量：

```bash
SERVER_HOST="123.45.67.89"      # 你的阿里云ECS公网IP
SERVER_USER="root"               # SSH用户名
SERVER_PORT=22                   # SSH端口
REMOTE_DIR="/data/www/mall-demo" # 部署目录
DOMAIN="www.example.com"         # 你的域名（可选）
```

### 第2步：执行部署

```bash
bash scripts/quick-deploy.sh
```

脚本会自动完成：
1. ✅ 生成静态配置（`node scan_html.js`）
2. ✅ 打包项目（排除node_modules、备份等）
3. ✅ 上传到服务器
4. ✅ 解压并安装依赖
5. ✅ 配置Nginx（如果配置了域名）

### 第3步：验证

在浏览器访问：
```
http://你的服务器IP
```
或（如果配置了域名）
```
http://你的域名
```

---

## 📋 三种部署方式对比

### 方式一：快速部署 ⭐⭐⭐⭐⭐（推荐）

**适用场景**：快速部署到已配置好的服务器

**优点**：
- ✅ 最简单，只需修改5个变量
- ✅ 全自动化，一键完成
- ✅ 包含错误检查
- ✅ 彩色输出，清晰直观

**使用**：
```bash
bash scripts/quick-deploy.sh
```

---

### 方式二：分步部署 ⭐⭐⭐⭐

**适用场景**：需要精细控制每个步骤

**优点**：
- ✅ 每步独立可控
- ✅ 适合学习和调试
- ✅ 可以在任何步骤暂停

**使用**：
```bash
# 1. 本地打包
tar -czf /tmp/mall-demo.tar.gz \
  --exclude='node_modules' \
  --exclude='备份' \
  --exclude='.history' \
  支付分账/ 店铺首页/ 店铺中心/ 移动商城/ 商家入驻/ \
  server.js scan_html.js package.json README.md

# 2. 上传
scp /tmp/mall-demo.tar.gz root@服务器IP:/data/www/

# 3. 服务器端部署
ssh root@服务器IP << 'EOF'
cd /data/www
tar -xzf mall-demo.tar.gz
cd mall-demo
npm install
node scan_html.js
chmod -R 755 .
EOF

# 4. 配置Nginx（可选）
ssh root@服务器IP 'cat > /etc/nginx/conf.d/mall-demo.conf << EOF ... EOF'
```

---

### 方式三：使用 npm scripts ⭐⭐⭐⭐

**适用场景**：喜欢使用npm命令的开发者

**可用命令**：
```bash
npm install              # 安装依赖
npm start                # 启动本地服务器
npm run scan             # 生成静态配置
npm run publish          # 打包项目
npm run deploy           # 一键部署（需配置）
```

---

## ⚙️ 配置详解

### 服务器配置

```yaml
server:
  host: "123.45.67.89"         # 阿里云ECS公网IP
  user: "root"                  # SSH用户名
  port: 22                      # SSH端口
  remote_dir: "/data/www/mall-demo"  # 部署目录
```

### 域名配置（可选）

```yaml
domain:
  enabled: true                 # 启用域名
  name: "www.example.com"       # 你的域名
```

启用后会自动：
- 生成Nginx配置
- 配置80端口监听
- 重启Nginx服务

### 打包配置

```yaml
deploy:
  excludes:                     # 打包时排除
    - "node_modules"
    - "备份"
    - ".history"
    - "*.log"
    - ".git"
    - ".DS_Store"

  include_folders:              # 包含的文件夹
    - "支付分账"
    - "店铺首页"
    - "店铺中心"
    - "移动商城"
    - "商家入驻"

  include_files:                # 包含的文件
    - "server.js"
    - "scan_html.js"
    - "package.json"
    - "README.md"
```

---

## 📂 项目结构

```
万商优选/
├── 📄 package.json                    # npm配置（新增）
├── 📄 server.js                       # 本地开发服务器
├── 📄 scan_html.js                    # HTML扫描脚本
├── 📁 支付分账/                        # 主业务原型
│   ├── 平台后台/
│   │   ├── 1货款账户.html
│   │   ├── 2账户流水.html
│   │   ├── 4分账明细.html
│   │   └── ...
│   └── 移动端/
├── 📁 店铺首页/                        # 店铺首页原型
├── 📁 店铺中心/                        # 店铺中心原型
├── 📁 移动商城/                        # 移动商城原型
├── 📁 商家入驻/                        # 商家入驻原型
└── 📁 scripts/                         # 发布脚本（新增）
    ├── quick-deploy.sh               # 快速部署脚本
    ├── deploy.sh                     # 完整部署脚本
    ├── deploy.config.yaml            # 部署配置
    ├── deploy.config.example.yaml    # 配置示例
    ├── publish.js                    # 发布打包工具
    └── README.md                     # 本文档
```

---

## 🔧 服务器端要求

### 系统要求
- ✅ Linux系统（CentOS/Ubuntu）
- ✅ SSH访问权限
- ✅ Root或sudo权限

### 软件要求
```bash
# 必需
- Node.js 14+         # 用于生成静态配置
- tar, gzip           # 解压工具（系统自带）

# 可选
- Nginx              # Web服务器（用于域名访问）
- firewall-cmd/ufw    # 防火墙管理
```

### 安装Node.js（如果未安装）
```bash
# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# 验证
node --version
npm --version
```

### 安装Nginx（可选）
```bash
# CentOS/RHEL
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Ubuntu/Debian
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 🔐 安全建议

### 1. SSH密钥认证（推荐）

```bash
# 本地生成SSH密钥
ssh-keygen -t ed25519 -C "your-email@example.com"

# 上传公钥到服务器
ssh-copy-id root@你的服务器IP

# 测试免密登录
ssh root@你的服务器IP
```

### 2. 配置防火墙

```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload

# Ubuntu/Debian (ufw)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

### 3. 禁用SSH密码登录

编辑 `/etc/ssh/sshd_config`:
```
PasswordAuthentication no
PermitRootLogin no
```

重启SSH：
```bash
sudo systemctl restart sshd
```

---

## 🐛 故障排查

### SSH连接失败
```bash
# 检查连接
ssh -v root@服务器IP

# 检查防火墙
ssh root@服务器IP 'sudo firewall-cmd --list-ports'

# 检查SSH服务
ssh root@服务器IP 'systemctl status sshd'
```

### Nginx 502/404错误
```bash
# 检查错误日志
ssh root@服务器IP 'tail -f /var/log/nginx/error.log'

# 检查文件权限
ssh root@服务器IP 'ls -la /data/www/mall-demo/'

# 检查Nginx配置
ssh root@服务器IP 'nginx -t'
```

### config.js未生成
```bash
# 手动生成
ssh root@服务器IP 'cd /data/www/mall-demo && node scan_html.js'

# 检查输出
ssh root@服务器IP 'cat /data/www/mall-demo/resources/scripts/config.js | head -20'
```

### 中文乱码
```bash
# 检查系统编码
ssh root@服务器IP 'locale'

# 设置UTF-8
ssh root@服务器IP 'export LANG=zh_CN.UTF-8'
```

---

## 📊 发布流程

```
┌─────────────┐
│   本地开发    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  npm run    │
│  publish    │  ← 打包项目
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ bash scripts│
│ /quick-deploy│  ← 一键部署
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   阿里云ECS  │
│  /data/www/ │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Nginx     │
│   :80       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   浏览器访问  │
└─────────────┘
```

---

## 💡 常见场景

### 场景1: 首次部署
```bash
# 1. 修改配置
vim scripts/quick-deploy.sh

# 2. 首次部署
bash scripts/quick-deploy.sh
```

### 场景2: 日常更新
```bash
# 直接运行，会自动打包最新代码
bash scripts/quick-deploy.sh
```

### 场景3: 回滚版本
```bash
# 在服务器上备份当前版本
ssh root@服务器IP 'tar -czf /backup/mall-demo-backup-$(date +%Y%m%d-%H%M%S).tar.gz /data/www/mall-demo/'

# 重新部署旧版本
bash scripts/quick-deploy.sh
```

### 场景4: 多环境部署
```bash
# 开发环境
bash scripts/quick-deploy.sh  # 使用开发服务器配置

# 测试环境
vim scripts/quick-deploy.sh   # 修改为测试服务器
bash scripts/quick-deploy.sh

# 生产环境
vim scripts/quick-deploy.sh   # 修改为生产服务器
bash scripts/quick-deploy.sh
```

---

## 📞 技术支持

遇到问题？

1. **查看日志**
   ```bash
   ssh root@服务器IP 'journalctl -u nginx -f'
   ```

2. **检查配置**
   ```bash
   ssh root@服务器IP 'cat /data/www/mall-demo/resources/scripts/config.js'
   ```

3. **重新生成配置**
   ```bash
   ssh root@服务器IP 'cd /data/www/mall-demo && node scan_html.js'
   ```

---

## 📄 相关文件

- `scripts/quick-deploy.sh` - 快速部署脚本
- `scripts/deploy.sh` - 完整部署脚本
- `scripts/publish.js` - 发布打包工具
- `scripts/deploy.config.yaml` - 部署配置
- `scripts/deploy.config.example.yaml` - 配置示例

---

**最后更新**: 2026-09-15
**版本**: v1.0.0
