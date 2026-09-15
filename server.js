const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// 使用绝对路径避免权限问题
const baseDir = path.resolve('/Users/mac/mall-demo');
// 扫描根目录 = 项目根目录：每个顶层内容文件夹作为一个"版本"（同级文件夹在目录中同级）
const dir = baseDir;

// 排除的非内容文件夹（axure 框架/资源目录/备份，不作为版本）
const versionExcludeDirs = [
    'resources', 'data', 'files', 'images', 'plugins',
    'prototype', 'axure', 'player', '.git', '备份', '.history'
];


// 说明：原先有 excludeFiles 列表用于过滤项目根目录的测试页面（index.html、debug.html 等），
// 但当前扫描只读取"顶层内容文件夹"内部的文件，根目录的散文件根本不会被扫到，
// 所以该列表已无作用并已移除——内容文件夹里的 .html 均为真实页面，一律纳入扫描。

// 递归扫描文件夹
function scanFolder(currentPath, currentName) {
    const pages = [];

    // 获取当前文件夹中的所有 HTML 文件
    // 注意：excludeFiles 只用于过滤"项目根目录"的测试页面；
    // 内容文件夹里的 .html 都是真实页面，不能按文件名排除（否则会漏掉如 axure_index.html 这类真实页面）
    const files = fs.readdirSync(currentPath)
        .filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const pageName = file.replace('.html', '');
        const cleanName = pageName.replace(/^.*_/, ''); // 去掉前缀

        pages.push({
            name: cleanName,
            file: currentName ? `${currentName}/${file}` : file
        });
    });

    // 递归扫描子文件夹
    const subDirs = fs.readdirSync(currentPath)
        .filter(f => {
            const fullPath = path.join(currentPath, f);
            return fs.statSync(fullPath).isDirectory();
        })
        .sort();

    const result = {};
    if (pages.length > 0) {
        result[''] = pages;
    }

    subDirs.forEach(subDir => {
        const subDirName = path.basename(subDir);
        const newName = currentName ? `${currentName}/${subDirName}` : subDirName;
        const subResult = scanFolder(path.join(currentPath, subDir), newName);

        Object.keys(subResult).forEach(key => {
            const fullKey = key ? `${subDirName}/${key}` : subDirName;
            result[fullKey] = subResult[key];
        });
    });

    return result;
}

// 获取分类图标
function getCategoryIcon(categoryName) {
    const icons = {
        '店铺后台': '🏪',
        '平台后台': '⚙️',
        '移动商城': '📱',
        '后端接口': '🔌',
        '基础功能': '📂',
        '数据与活动': '📊',
        '权限管理': '👥',
        '分账设置': '💰',
        '订单管理': '🛒'
    };
    return icons[categoryName] || '📁';
}

// 获取版本图标
function getVersionIcon(versionName) {
    const icons = {
        '支付分账': '📦',
        '分账设置': '💰'
    };
    return icons[versionName] || '📁';
}

// 获取版本描述
function getVersionDesc(versionName) {
    const descs = {
        '支付分账': '万商优选原型'
    };
    return descs[versionName] || `${versionName} 原型`;
}

// 判断文件夹内（含子目录）是否包含 HTML 文件，避免把空文件夹/纯资源目录当成版本
function hasHtmlFiles(currentPath) {
    const entries = fs.readdirSync(currentPath);
    for (const entry of entries) {
        const fullPath = path.join(currentPath, entry);
        let stat;
        try { stat = fs.statSync(fullPath); } catch (e) { continue; }
        if (stat.isDirectory()) {
            if (hasHtmlFiles(fullPath)) return true;
        } else if (entry.endsWith('.html')) {
            return true;
        }
    }
    return false;
}

// 扫描所有顶层内容文件夹：每个文件夹作为一个"版本"，文件夹内的子文件夹作为"分类"
function scanAllFolders() {
    const versions = {};

    // 顶层文件夹（排除框架/资源目录，只保留包含 HTML 的内容文件夹；支付分账排最前）
    const topDirs = fs.readdirSync(dir)
        .filter(f => {
            if (versionExcludeDirs.includes(f)) return false;
            const fullPath = path.join(dir, f);
            if (!fs.statSync(fullPath).isDirectory()) return false;
            return hasHtmlFiles(fullPath);
        })
        .sort((a, b) => (a === '支付分账' ? -1 : b === '支付分账' ? 1 : a.localeCompare(b, 'zh-CN')));

    topDirs.forEach(folderName => {
        const folderPath = path.join(dir, folderName);
        const folderData = scanFolder(folderPath, folderName);

        // 每个子文件夹（含页面的）作为一个分类
        const categories = {};
        Object.keys(folderData).forEach(categoryKey => {
            const categoryName = categoryKey || '其他页面';
            categories[categoryName] = {
                icon: getCategoryIcon(categoryName),
                pages: folderData[categoryKey]
            };
        });

        versions[folderName] = {
            icon: getVersionIcon(folderName),
            description: getVersionDesc(folderName),
            categories: categories
        };
    });

    return versions;
}

// 生成配置 JSON
function generateConfig() {
    const versions = scanAllFolders();

    // 默认页：优先 支付分账 → 店铺后台 → 第一个页面
    let defaultPage = '';
    const payVersion = versions['支付分账'];
    if (payVersion && payVersion.categories && payVersion.categories['店铺后台'] && payVersion.categories['店铺后台'].pages[0]) {
        defaultPage = payVersion.categories['店铺后台'].pages[0].file;
    } else {
        const firstVersion = Object.keys(versions)[0];
        if (firstVersion) {
            const firstCategory = Object.keys(versions[firstVersion].categories)[0];
            if (firstCategory && versions[firstVersion].categories[firstCategory].pages[0]) {
                defaultPage = versions[firstVersion].categories[firstCategory].pages[0].file;
            }
        }
    }

    return {
        versions: versions,
        defaultPage: defaultPage
    };
}

// 创建服务器
const server = http.createServer((req, res) => {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API 路由
    if (req.url === '/api/config') {
        try {
            const config = generateConfig();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(config, null, 2));
            console.log(`[${new Date().toLocaleTimeString()}] 配置已更新`);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // 静态文件服务（浏览器会对中文文件名做百分号编码，需先解码）
    const urlPath = (req.url || '').split('?')[0].split('#')[0];
    let filePath;
    try {
        filePath = path.join(baseDir, decodeURIComponent(urlPath));
    } catch (e) {
        filePath = path.join(baseDir, urlPath);
    }

    // 防止路径越界
    if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    if (filePath.endsWith('/')) {
        filePath = path.join(filePath, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 直接运行 `node server.js` 时启动服务器；被 scan_html.js 引用时仅复用配置生成逻辑
if (require.main === module) {
    console.log(`工作目录: ${baseDir}`);
    console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 扫描目录: ${dir}`);
    console.log(`🔄 访问 http://localhost:${PORT}/api/config 获取实时配置\n`);
    server.listen(PORT);
}

// 供 scan_html.js 复用同一套配置生成逻辑，保证 /api/config 与静态 config.js 结构一致
module.exports = { generateConfig, dir, baseDir };
