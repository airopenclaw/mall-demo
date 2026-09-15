/**
 * 自动扫描 HTML 文件并生成静态配置
 * 与 server.js 的 /api/config 共用同一套扫描逻辑（require 复用，不启动服务器）
 * 输出被 index.html 直接加载：resources/scripts/config.js
 * 使用方法: node scan_html.js
 *          然后直接打开 index.html（或访问 http://localhost:3000）
 */

const fs = require('fs');
const path = require('path');

// 复用 server.js 的配置生成逻辑
const { generateConfig, dir } = require('./server.js');

// 静态配置输出位置（index.html 通过 <script src="resources/scripts/config.js"> 加载）
const outputFile = path.join(dir, 'resources', 'scripts', 'config.js');

console.log('=== HTML 文件扫描工具（静态模式）===\n');
console.log(`扫描目录: ${dir}\n`);

// 生成与 /api/config 结构一致的配置
const config = generateConfig();

// 统计信息
const versionCount = Object.keys(config.versions).length;
let categoryCount = 0;
let pageCount = 0;
Object.values(config.versions).forEach(version => {
    const categories = version.categories || {};
    categoryCount += Object.keys(categories).length;
    Object.values(categories).forEach(category => {
        pageCount += (category.pages || []).length;
    });
});

// 写入 config.js
const configCode = `// 页面数据配置 - 自动生成于 ${new Date().toLocaleString('zh-CN')}
// 由 scan_html.js 生成，结构与 server.js /api/config 一致
// 重新生成: node scan_html.js

const defaultPageConfig = ${JSON.stringify(config, null, 4)};
`;

fs.writeFileSync(outputFile, configCode);

console.log(`✅ 扫描完成: ${versionCount} 个版本 / ${categoryCount} 个分类 / ${pageCount} 个页面`);
console.log(`✓ 配置已保存到: ${outputFile}`);
console.log('✓ 直接打开 index.html 即可查看（或访问 http://localhost:3000）');
