/**
 * 原型查看器框架 - 支持实时文件夹扫描
 */

// 全局变量
let pageConfig = null;
let currentPage = null;

// 初始化
$(document).ready(function() {
    console.log('DOM 加载完成');

    // 加载配置
    loadConfig();

    // 生成页面列表
    generatePageList();

    // 绑定事件
    bindEvents();

    // 加载默认页面
    if (pageConfig && pageConfig.defaultPage) {
        loadPage(pageConfig.defaultPage);

        // 自动展开第一个版本
        const firstVersion = Object.keys(pageConfig.versions)[0];
        if (firstVersion) {
            toggleVersion(firstVersion);
            // 自动展开第一个版本下的第一个分类
            const firstVersionData = pageConfig.versions[firstVersion];
            if (firstVersionData.categories) {
                const firstCategory = Object.keys(firstVersionData.categories)[0];
                if (firstCategory) {
                    toggleCategory(firstVersion, firstCategory);
                }
            }
        }
    }

    console.log('初始化完成');
    console.log('版本数量:', pageConfig ? Object.keys(pageConfig.versions).length : 0);

    // 调试信息
    if (pageConfig) {
        console.log('pageConfig 结构:', pageConfig);
    }
});

/**
 * 加载配置 - 优先从 config.js 加载
 */
function loadConfig() {
    if (typeof defaultPageConfig !== 'undefined') {
        pageConfig = defaultPageConfig;
        console.log('✓ 从 config.js 加载配置');
    } else {
        console.error('❌ config.js 未加载');
        pageConfig = { versions: {}, defaultPage: '' };
    }

    console.log('版本数:', Object.keys(pageConfig.versions).length);
}

/**
 * 生成页面列表
 * 三层结构：版本 → 分类 → 页面
 */
function generatePageList() {
    console.log('开始生成页面列表...');
    const pageList = $('#pageList');

    if (pageList.length === 0) {
        console.error('pageList 元素不存在');
        return;
    }

    if (!pageConfig || !pageConfig.versions) {
        console.error('pageConfig 未初始化');
        return;
    }

    pageList.empty();

    Object.keys(pageConfig.versions).forEach((versionName, versionIndex) => {
        const version = pageConfig.versions[versionName];
        // 分类位于 version.categories 中，icon/description 是同级的元数据而非分类
        const versionCategories = version.categories || {};
        const isVersionExpanded = versionIndex === 0;

        console.log('生成版本:', versionName, '-', Object.keys(versionCategories).length, '个分类');

        // 创建版本组
        const versionGroup = $(`
            <div class="version-group ${isVersionExpanded ? 'expanded' : ''}" data-version="${versionName}">
                <div class="version-header" onclick="toggleVersion('${versionName}')">
                    <span class="version-icon">${version.icon || '📁'}</span>
                    <span class="version-name">${versionName}</span>
                    <span class="version-count">${Object.keys(versionCategories).length}</span>
                </div>
                <div class="version-categories" style="max-height: ${isVersionExpanded ? '2000px' : '0'}">
                </div>
            </div>
        `);

        // 遍历所有分类
        Object.keys(versionCategories).forEach((categoryName, categoryIndex) => {
            const category = versionCategories[categoryName];
            const isCategoryExpanded = isVersionExpanded && categoryIndex === 0;

            console.log('  生成分类:', categoryName, '-', category.pages.length, '个页面');

            // 创建分类组
            const categoryGroup = $(`
                <div class="category-group ${isCategoryExpanded ? 'expanded' : ''}" data-version="${versionName}" data-category="${categoryName}">
                    <div class="category-header" onclick="toggleCategory('${versionName}', '${categoryName}')">
                        <span class="category-name">${categoryName}</span>
                        <span class="category-count">${category.pages.length}</span>
                    </div>
                    <div class="category-pages" style="max-height: ${isCategoryExpanded ? '2000px' : '0'}">
                    </div>
                </div>
            `);

            // 添加页面项
            category.pages.forEach(page => {
                const pageItem = $(`
                    <div class="page-item" data-file="${page.file}">
                        <span class="page-name">${page.name}</span>
                    </div>
                `);

                pageItem.on('click', function() {
                    loadPage(page.file);
                });

                categoryGroup.find('.category-pages').append(pageItem);
            });

            versionGroup.find('.version-categories').append(categoryGroup);
        });

        pageList.append(versionGroup);
    });

    console.log('✓ 页面列表生成完成');
    console.log('  页面项数量:', $('.page-item').length);
    console.log('  分类数量:', $('.category-group').length);
    console.log('  版本数量:', $('.version-group').length);
}

/**
 * 切换版本展开/收起
 */
function toggleVersion(versionName) {
    const versionGroup = $(`.version-group[data-version="${versionName}"]`);
    versionGroup.toggleClass('expanded');

    const categoriesContainer = versionGroup.find('.version-categories');
    if (versionGroup.hasClass('expanded')) {
        categoriesContainer.css('max-height', '2000px');
    } else {
        categoriesContainer.css('max-height', '0');
    }
}

/**
 * 切换分类展开/收起
 */
function toggleCategory(versionName, categoryName) {
    const categoryGroup = $(`.category-group[data-version="${versionName}"][data-category="${categoryName}"]`);
    categoryGroup.toggleClass('expanded');

    const pagesContainer = categoryGroup.find('.category-pages');
    if (categoryGroup.hasClass('expanded')) {
        pagesContainer.css('max-height', '2000px');
    } else {
        pagesContainer.css('max-height', '0');
    }
}

/**
 * 加载页面
 */
function loadPage(pageFile) {
    // 更新活跃状态
    $('.page-item').removeClass('active');
    $(`.page-item[data-file="${pageFile}"]`).addClass('active');

    // 加载到 iframe
    const frame = $('#pageFrame');
    frame.attr('src', pageFile);

    currentPage = pageFile;
    console.log('加载页面:', pageFile);
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 切换侧边栏
    $('#toggleSidebar').on('click', function() {
        $('#sidebar').toggleClass('collapsed');
    });

    // 更新配置按钮
    $('#refreshConfigBtn').on('click', function() {
        refreshConfig();
    });

    // 搜索功能
    $('#searchInput').on('input', function() {
        const keyword = $(this).val().toLowerCase();
        filterPages(keyword);
    });
}

/**
 * 刷新配置
 */
function refreshConfig() {
    console.log('正在刷新配置...');

    // 显示加载提示
    showToast('正在更新配置...', 'info');

    // 检查是否通过 server.js 访问
    const isServerMode = window.location.hostname === 'localhost' && window.location.port === '3000';

    if (isServerMode) {
        // Server 模式：从 API 重新加载
        $.ajax({
            url: '/api/config',
            type: 'GET',
            dataType: 'json',
            success: function(config) {
                console.log('✓ 配置刷新成功');
                pageConfig = config;
                generatePageList();
                showToast('配置已更新', 'success');
            },
            error: function(xhr, status, error) {
                console.error('❌ 配置刷新失败:', error);
                showToast('配置更新失败，请检查服务器', 'error');
            }
        });
    } else {
        // 静态文件模式：重新加载页面
        showToast('正在刷新页面...', 'info');
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    // 移除旧的 toast
    $('.toast').remove();

    const toast = $(`<div class="toast ${type}">${message}</div>`);
    $('body').append(toast);

    // 3秒后自动移除
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * 过滤页面
 */
function filterPages(keyword) {
    if (!keyword) {
        $('.page-item').show();
        $('.version-group').show();
        return;
    }

    $('.page-item').each(function() {
        const pageName = $(this).find('.page-name').text().toLowerCase();
        if (pageName.includes(keyword)) {
            $(this).show();
            $(this).closest('.version-group').show();
        } else {
            $(this).hide();
        }
    });

    // 隐藏没有匹配页面的版本
    $('.version-group').each(function() {
        const visiblePages = $(this).find('.page-item:visible').length;
        if (visiblePages === 0) {
            $(this).hide();
        }
    });
}
