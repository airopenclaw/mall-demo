# 支付分账原型系统 - 使用说明

## 启动方式

### 方式一：启动服务器（推荐）
```bash
cd /Users/mac/mall-demo
node server.js
```
然后访问：http://localhost:3000

**优点：**
- ✅ 实时扫描文件夹，无需手动生成配置
- ✅ 点击"更新"按钮即可刷新目录
- ✅ 自动检测新增/删除的页面

### 方式二：静态配置

cd /Users/mac/mall-demo && node scan_html.js

然后直接打开 `index.html` 文件

**缺点：**
- ⚠️ 修改文件夹后需要重新运行 scan_html.js
- ⚠️ 只能通过"更新"按钮刷新页面

## 访问地址

- **主页**：http://localhost:3000
- **配置 API**：http://localhost:3000/api/config
- **诊断工具**：http://localhost:3000/debug.html

## 目录结构

```
支付分账/
  ├── 后端接口/          # 6 个页面
  ├── 平台后台/          # 2 个页面
  ├── 店铺后台/          # 8 个页面
  └── 移动商城/          # 1 个页面
```

## 常见问题

### Q: 为什么左侧目录是空白的？
**A:** 可能的原因：
1. ❌ 没有启动 server.js，直接打开了 index.html
   - ✅ 解决：运行 `node server.js` 后访问 http://localhost:3000
2. ❌ 浏览器缓存了旧版本
   - ✅ 解决：Ctrl+Shift+R 强制刷新
3. ❌ config.js 为空或错误
   - ✅ 解决：运行 `node scan_html.js` 重新生成

### Q: 点击"更新"按钮没反应？
**A:**
1. 确保通过 http://localhost:3000 访问，而不是 file:// 协议
2. 查看浏览器控制台（F12）的错误信息
3. 访问 http://localhost:3000/debug.html 查看诊断信息

### Q: 新增页面后如何更新目录？
**A:**
- **服务器模式**：点击顶部"更新"按钮即可
- **静态模式**：重新运行 `node scan_html.js`，然后刷新页面

### Q: 如何停止服务器？
**A:**
```bash
# 查找进程
ps aux | grep "node server.js"

# 停止进程
kill <PID>
```

## 配置文件说明

### config.js
静态配置文件，每次修改文件夹后需要重新生成：
```bash
node scan_html.js
```

### server.js
实时配置服务器，每次访问 `/api/config` 都会重新扫描文件夹。

**API 响应示例：**
```json
{
  "versions": {
    "支付分账": {
      "icon": "📦",
      "description": "万商优选原型",
      "categories": {
        "店铺后台": {
          "icon": "🏪",
          "pages": [...]
        }
      }
    }
  }
}
```

## 快速启动脚本

```bash
#!/bin/bash
# start_server.sh
cd /Users/mac/Documents/原型HTML/mall
node server.js
```

使用：
```bash
bash start_server.sh
```
