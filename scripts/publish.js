#!/usr/bin/env node

/**
 * 万商优选 - 发布脚本
 * 功能：打包项目、验证配置、生成发布清单
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRIPT_DIR = __dirname;
const CONFIG_FILE = path.join(SCRIPT_DIR, 'deploy.config.yaml');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, total, message) {
    log(`\n[${step}/${total}] ${message}`, 'blue');
}

// 读取配置文件
function readConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        log('错误: 找不到配置文件 scripts/deploy.config.yaml', 'red');
        process.exit(1);
    }

    const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');

    // 简单解析YAML（提取关键配置）
    const config = {
        server: {
            host: extractValue(configContent, 'host:'),
            user: extractValue(configContent, 'user:'),
            port: parseInt(extractValue(configContent, 'port:')),
            remoteDir: extractValue(configContent, 'remote_dir:')
        },
        domain: {
            enabled: extractValue(configContent, 'enabled:') === 'true',
            name: extractValue(configContent, 'name:')
        },
        deploy: {
            excludes: extractList(configContent, 'excludes:'),
            includeFolders: extractList(configContent, 'include_folders:'),
            includeFiles: extractList(configContent, 'include_files:')
        }
    };

    return config;
}

function extractValue(content, key) {
    const match = content.match(new RegExp(`${key}\\s*"([^"]*)"`));
    return match ? match[1] : '';
}

function extractList(content, key) {
    const regex = new RegExp(`${key}[\\s\\S]*?((?:-\\s*"[^"]*"\\s*)+)`);
    const match = content.match(regex);
    if (!match) return [];

    return match[1]
        .split('-')
        .map(item => item.replace(/\s*"([^"]*)"/, '$1').trim())
        .filter(item => item.length > 0);
}

// 检查配置
function validateConfig(config) {
    log('检查配置...', 'yellow');

    if (!config.server.host || config.server.host === 'your-server-ip') {
        log('❌ 未配置服务器IP，请修改 scripts/deploy.config.yaml', 'red');
        log('   设置 server.host = "你的阿里云ECS公网IP"', 'yellow');
        return false;
    }

    if (!config.server.user) {
        log('❌ 未配置SSH用户名', 'red');
        return false;
    }

    log('✓ 配置检查通过', 'green');
    return true;
}

// 检查必要文件
function checkRequiredFiles(config) {
    log('检查项目文件...', 'yellow');

    const allFiles = [
        ...config.deploy.includeFolders,
        ...config.deploy.includeFiles
    ];

    let allExist = true;
    for (const file of allFiles) {
        const filePath = path.join(PROJECT_ROOT, file);
        if (!fs.existsSync(filePath)) {
            log(`❌ 文件不存在: ${file}`, 'red');
            allExist = false;
        } else {
            log(`✓ ${file}`, 'green');
        }
    }

    return allExist;
}

// 生成静态配置
function generateStaticConfig() {
    log('生成静态配置...', 'yellow');

    const scanScript = path.join(PROJECT_ROOT, 'scan_html.js');
    if (!fs.existsSync(scanScript)) {
        log('⚠️  未找到 scan_html.js，跳过配置生成', 'yellow');
        return true;
    }

    try {
        execSync('node scan_html.js', {
            cwd: PROJECT_ROOT,
            stdio: 'pipe'
        });
        log('✓ 静态配置生成成功', 'green');
        return true;
    } catch (error) {
        log('⚠️  配置生成失败: ' + error.message, 'yellow');
        return true; // 不阻塞部署
    }
}

// 打包项目
function packageProject(config) {
    log('打包项目...', 'yellow');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const packageName = `mall-demo-${timestamp}.tar.gz`;
    const packagePath = path.join(SCRIPT_DIR, 'tmp', packageName);

    // 创建临时目录
    if (!fs.existsSync(path.join(SCRIPT_DIR, 'tmp'))) {
        fs.mkdirSync(path.join(SCRIPT_DIR, 'tmp'), { recursive: true });
    }

    // 构建排除参数
    const excludeArgs = config.deploy.excludes
        .map(ex => `--exclude='${ex}'`)
        .join(' ');

    // 构建包含参数
    const includeArgs = [
        ...config.deploy.includeFolders,
        ...config.deploy.includeFiles
    ].join(' ');

    // 执行打包
    try {
        execSync(
            `tar -czf "${packagePath}" ${excludeArgs} ${includeArgs}`,
            {
                cwd: PROJECT_ROOT,
                stdio: 'pipe'
            }
        );

        const stats = fs.statSync(packagePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

        log(`✓ 打包完成: ${packageName}`, 'green');
        log(`  大小: ${sizeMB} MB`, 'green');
        log(`  路径: ${packagePath}`, 'green');

        return { path: packagePath, name: packageName, size: sizeMB };
    } catch (error) {
        log('❌ 打包失败: ' + error.message, 'red');
        return null;
    }
}

// 生成发布清单
function generateReleaseManifest(config, packageInfo) {
    log('生成发布清单...', 'yellow');

    const manifest = {
        version: new Date().toISOString(),
        package: packageInfo,
        config: config,
        files: {
            folders: config.deploy.includeFolders,
            files: config.deploy.includeFiles
        },
        server: {
            host: config.server.host,
            remoteDir: config.server.remoteDir,
            deployTime: new Date().toISOString()
        }
    };

    const manifestPath = path.join(SCRIPT_DIR, 'tmp', 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    log(`✓ 发布清单已生成: ${manifestPath}`, 'green');
    return manifest;
}

// 主函数
function main() {
    log('\n========================================', 'blue');
    log('  万商优选 - 发布打包工具', 'blue');
    log('========================================\n', 'blue');

    // 1. 读取配置
    const config = readConfig();

    // 2. 验证配置
    if (!validateConfig(config)) {
        process.exit(1);
    }

    // 3. 检查文件
    if (!checkRequiredFiles(config)) {
        process.exit(1);
    }

    // 4. 生成静态配置
    generateStaticConfig();

    // 5. 打包项目
    const packageInfo = packageProject(config);
    if (!packageInfo) {
        process.exit(1);
    }

    // 6. 生成发布清单
    generateReleaseManifest(config, packageInfo);

    log('\n========================================', 'green');
    log('  打包完成!', 'green');
    log('========================================\n', 'green');

    log('下一步:', 'yellow');
    log('  1. 运行部署: npm run deploy', 'blue');
    log('  2. 或手动上传: scp <package> user@server:/tmp/', 'blue');
    log('  3. 查看配置: cat scripts/deploy.config.yaml', 'blue');
    log('');
}

// 执行
main();
