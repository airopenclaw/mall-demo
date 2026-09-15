/**
 * 菜单组件 JavaScript
 * 提供顶部菜单栏和左侧菜单的动态生成和状态管理
 *
 * 使用方法：
 * 1. 引入本文件：<script src="menu-component.js"></script>
 * 2. 在页面 DOM 加载完成后调用 initMenu() 函数
 *
 * @version 1.0.0
 * @created 2025-03-04
 */

(function() {
    'use strict';

    // ==================== 菜单配置 ====================

    /**
     * 顶部菜单配置
     * 每个页面共用相同的顶部菜单
     */
    const TOP_MENU_CONFIG = [
        { id: 'operation', text: '运营', href: null },
        { id: 'product', text: '商品', href: null },
        { id: 'order', text: '订单', href: null },
        { id: 'customer', text: '客户', href: null },
        { id: 'plusCustomer', text: 'plus客户', href: null },
        { id: 'marketing', text: '营销', href: null },
        { id: 'decoration', text: '装修', href: null },
        { id: 'shop', text: '店铺', href: null },
        { id: 'finance', text: '财务', href: null },
        { id: 'riskControl', text: '风控', href: null },
        { id: 'merchant', text: '入驻', href: null },
        { id: 'settings', text: '设置', href: null }
    ];

    /**
     * 左侧菜单配置
     * 支持多个分组，每个分组包含多个菜单项
     */
    const LEFT_MENU_CONFIG = [
        {
            id: 'merchant-mgmt',
            title: '商家管理',
            items: [
                { id: 'merchant-audit', text: '商家审核', href: '商家审核.html' },
                { id: 'payment-account', text: '货款账户', href: '1货款账户.html' },
                { id: 'account-flow', text: '账户流水', href: '账户流水.html' },
                { id: 'payment-refund-flow', text: '交易流水', href: '交易流水.html' }
            ]
        },
        {
            id: 'financial-mgmt',
            title: '财务管理',
            items: [
                { id: 'split-detail', text: '分账明细', href: '分账明细.html' }
            ]
        },
        {
            id: 'split-settings',
            title: '分账设置',
            items: [
                { id: 'split-rule', text: '分账规则', href: '分账规则.html' },
                { id: 'category-fee', text: '类目服务费', href: '类目服务费.html' }
            ]
        }
    ];

    // ==================== 私有函数 ====================

    /**
     * 生成顶部菜单 HTML
     * @private
     * @param {string|null} activeId - 激活的菜单ID
     * @returns {string} 顶部菜单 HTML
     */
    function _generateTopMenuHTML(activeId) {
        let html = '<div class="top-menu-left">';

        TOP_MENU_CONFIG.forEach(item => {
            const isActive = item.id === activeId ? ' active' : '';
            const clickHandler = item.href
                ? `onclick="window.location.href='${item.href}'"`
                : '';

            html += `<div class="top-menu-item${isActive}" ${clickHandler}>${item.text}</div>`;
        });

        html += '</div>';
        return html;
    }

    /**
     * 生成单个左侧菜单分组的 HTML
     * @private
     * @param {Object} section - 菜单分组配置
     * @param {string} activeItemId - 激活的菜单项ID
     * @returns {string} 菜单分组 HTML
     */
    function _generateMenuSectionHTML(section, activeItemId) {
        let html = '<div class="menu-level-1">';

        // 分组标题
        html += `<div class="menu-level-1-header">${section.title}</div>`;

        // 分组菜单项
        html += '<div class="menu-level-2">';
        section.items.forEach(item => {
            const isActive = item.id === activeItemId ? ' active' : '';
            const clickHandler = item.href
                ? `onclick="window.location.href='${item.href}'"`
                : '';

            html += `<div class="menu-level-2-item${isActive}" ${clickHandler}>${item.text}</div>`;
        });
        html += '</div>';

        html += '</div>';
        return html;
    }

    /**
     * 生成左侧菜单 HTML
     * @private
     * @param {string} activeItemId - 激活的菜单项ID
     * @returns {string} 左侧菜单 HTML
     */
    function _generateLeftMenuHTML(activeItemId) {
        let html = '';

        LEFT_MENU_CONFIG.forEach(section => {
            html += _generateMenuSectionHTML(section, activeItemId);
        });

        return html;
    }

    // ==================== 公共 API ====================

    /**
     * 初始化顶部菜单
     * @param {string} activeMenuId - 当前激活的顶部菜单项ID
     */
    function initTopMenu(activeMenuId) {
        const container = document.getElementById('topMenu');
        if (!container) {
            console.warn('未找到顶部菜单容器 #topMenu');
            return;
        }

        // 保留标题和右侧区域，只更新菜单项
        const existingItems = container.querySelector('.top-menu-left');
        if (existingItems) {
            existingItems.outerHTML = _generateTopMenuHTML(activeMenuId);
        } else {
            container.innerHTML += _generateTopMenuHTML(activeMenuId);
        }
    }

    /**
     * 初始化左侧菜单
     * @param {string} activeMenuItemId - 当前激活的左侧菜单项ID
     */
    function initLeftMenu(activeMenuItemId) {
        const container = document.getElementById('leftSidebar');
        if (!container) {
            console.warn('未找到左侧菜单容器 #leftSidebar');
            return;
        }

        container.innerHTML = _generateLeftMenuHTML(activeMenuItemId);
    }

    /**
     * 初始化完整菜单（顶部 + 左侧）
     * @param {Object} config - 菜单配置对象
     * @param {string} [config.topMenuId=null] - 激活的顶部菜单ID
     * @param {string} [config.leftMenuItemId=null] - 激活的左侧菜单项ID
     * @param {string} [config.topMenuTitle='平台后台'] - 顶部标题
     *
     * @example
     * // 基础用法
     * initMenu({
     *     topMenuId: 'merchant',        // 顶部菜单"入驻"选中
     *     leftMenuItemId: 'payment-account'  // 左侧菜单"货款账户"选中
     * });
     *
     * @example
     * // 只初始化左侧菜单
     * initMenu({
     *     leftMenuItemId: 'split-rule'
     * });
     *
     * @example
     * // 只初始化顶部菜单
     * initMenu({
     *     topMenuId: 'finance'
     * });
     */
    function initMenu(config) {
        if (!config || typeof config !== 'object') {
            console.warn('initMenu 需要传入配置对象');
            return;
        }

        const {
            topMenuId = null,
            leftMenuItemId = null,
            topMenuTitle = '平台后台'
        } = config;

        // 设置顶部标题
        const titleElement = document.getElementById('topMenuTitle');
        if (titleElement) {
            titleElement.textContent = topMenuTitle;
        }

        // 初始化顶部菜单
        if (topMenuId) {
            initTopMenu(topMenuId);
        }

        // 初始化左侧菜单
        if (leftMenuItemId) {
            initLeftMenu(leftMenuItemId);
        }
    }

    /**
     * 获取完整的菜单配置（供调试和扩展使用）
     * @returns {Object} 包含顶部菜单和左侧菜单的配置
     */
    function getMenuConfig() {
        return {
            topMenu: TOP_MENU_CONFIG,
            leftMenu: LEFT_MENU_CONFIG
        };
    }

    /**
     * 动态添加左侧菜单分组
     * @param {Object|Array} newSections - 新的菜单分组配置
     * @returns {boolean} 是否添加成功
     *
     * @example
     * addLeftMenuSections({
     *     id: 'new-section',
     *     title: '新菜单',
     *     items: [
     *         { id: 'new-item', text: '新菜单项', href: 'new-page.html' }
     *     ]
     * });
     */
    function addLeftMenuSections(newSections) {
        if (!newSections) {
            console.warn('addLeftMenuSections 需要传入菜单配置');
            return false;
        }

        const sections = Array.isArray(newSections) ? newSections : [newSections];

        sections.forEach(section => {
            if (!section.id || !section.title || !Array.isArray(section.items)) {
                console.warn('菜单分组配置不完整，需要 id、title 和 items', section);
                return;
            }

            // 检查是否已存在相同 ID 的分组
            const exists = LEFT_MENU_CONFIG.some(s => s.id === section.id);
            if (exists) {
                console.warn(`菜单分组 ID "${section.id}" 已存在，跳过添加`);
                return;
            }

            LEFT_MENU_CONFIG.push(section);
        });

        return true;
    }

    /**
     * 动态添加左侧菜单项到指定分组
     * @param {string} sectionId - 目标分组ID
     * @param {Object|Array} newItems - 新的菜单项配置
     * @returns {boolean} 是否添加成功
     *
     * @example
     * addLeftMenuItems('merchant-mgmt', [
     *     { id: 'new-item-1', text: '新功能1', href: 'feature1.html' },
     *     { id: 'new-item-2', text: '新功能2', href: 'feature2.html' }
     * ]);
     */
    function addLeftMenuItems(sectionId, newItems) {
        if (!sectionId || !newItems) {
            console.warn('addLeftMenuItems 需要传入 sectionId 和 items');
            return false;
        }

        const section = LEFT_MENU_CONFIG.find(s => s.id === sectionId);
        if (!section) {
            console.warn(`未找到菜单分组: ${sectionId}`);
            return false;
        }

        const items = Array.isArray(newItems) ? newItems : [newItems];

        items.forEach(item => {
            if (!item.id || !item.text) {
                console.warn('菜单项配置不完整，需要 id 和 text', item);
                return;
            }

            // 检查是否已存在相同 ID 的菜单项
            const exists = section.items.some(i => i.id === item.id);
            if (exists) {
                console.warn(`菜单项 ID "${item.id}" 已存在，跳过添加`);
                return;
            }

            section.items.push(item);
        });

        return true;
    }

    /**
     * 更新菜单项配置
     * @param {string} menuId - 菜单项ID（可以是顶部或左侧）
     * @param {Object} updates - 要更新的配置
     * @returns {boolean} 是否更新成功
     *
     * @example
     * updateMenuItem('payment-account', {
     *     text: '货款账户（新版）',
     *     href: 'account-new.html'
     * });
     */
    function updateMenuItem(menuId, updates) {
        // 搜索左侧菜单
        for (const section of LEFT_MENU_CONFIG) {
            const item = section.items.find(i => i.id === menuId);
            if (item) {
                Object.assign(item, updates);
                return true;
            }
        }

        // 搜索顶部菜单
        const topItem = TOP_MENU_CONFIG.find(item => item.id === menuId);
        if (topItem) {
            Object.assign(topItem, updates);
            return true;
        }

        console.warn(`未找到菜单项: ${menuId}`);
        return false;
    }

    // ==================== 导出 API ====================

    // 将公共 API 挂载到全局 window 对象
    window.MenuComponent = {
        initMenu,
        initTopMenu,
        initLeftMenu,
        getMenuConfig,
        addLeftMenuSections,
        addLeftMenuItems,
        updateMenuItem
    };

})();
