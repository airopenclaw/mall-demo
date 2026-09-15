/* ============================
   家电S2B2B支付分账系统 - 页面切换与导航
   ============================ */

const pageTitles = {
  'dashboard.html': '数据概览',
  'store.html': '店铺信息',
  'products.html': '商品列表',
  'categories.html': '分类管理',
  'orders.html': '订单列表',
  'refunds.html': '退款管理',
  'split_rules.html': '分账规则',
  'split_records.html': '分账记录',
  'payment_channels.html': '支付渠道',
  'payment_accounts.html': '支付账户',
  'payment_records.html': '支付记录',
  'suppliers.html': '供应商列表',
  'warehouses.html': '仓库管理',
  'promotions.html': '满返活动',
  'commissions.html': '奖励佣金',
  'settings.html': '基本设置',
  'users.html': '用户管理',
  'roles.html': '角色管理'
};

function initNavigation() {
  // Menu item click
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      if (!page) return;
      navigateTo(page);
      // Active state
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function navigateTo(page) {
  // Update page title
  const title = pageTitles[page] || page;
  const titleEl = document.getElementById('page-title');
  const headerTitle = document.getElementById('page-header-title');
  if (titleEl) titleEl.textContent = title;
  if (headerTitle) headerTitle.textContent = title;

  // Load page content
  fetchPageContent(page);
}

function fetchPageContent(page) {
  const body = document.getElementById('page-body');
  const actions = document.getElementById('page-header-actions');
  if (!body) return;

  // Show loading
  body.innerHTML = '<div style="text-align:center;padding:40px;color:#909399;">加载中...</div>';
  if (actions) actions.innerHTML = '';

  fetch(page)
    .then(res => {
      if (!res.ok) throw new Error('Page not found');
      return res.text();
    })
    .then(html => {
      // Extract page-body content from the fetched HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newBody = doc.getElementById('page-body');
      if (newBody) {
        body.innerHTML = newBody.innerHTML;
        // Update header actions
        const newActions = doc.getElementById('page-header-actions');
        if (actions && newActions) actions.innerHTML = newActions.innerHTML;
      } else {
        body.innerHTML = '<div class="alert alert-warning">页面内容加载失败</div>';
      }
      // Re-init any page-specific JS
      initPageScripts(page);
    })
    .catch(err => {
      console.error(err);
      body.innerHTML = '<div class="alert alert-error">页面加载失败: ' + err.message + '</div>';
    });
}

function initPageScripts(page) {
  // Page-specific initialization (forms, modals, etc.)
  if (page === 'orders.html') initOrderActions();
  if (page === 'payment_channels.html') initPaymentActions();
}

function initOrderActions() {
  // Order action buttons
  document.querySelectorAll('.order-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => alert('查看订单详情（静态演示）'));
  });
}

function initPaymentActions() {
  // Payment channel actions
  document.querySelectorAll('.channel-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => alert('编辑支付渠道（静态演示）'));
  });
}

function toggleSection(el) {
  el.parentElement.classList.toggle('collapsed');
}

// Init
document.addEventListener('DOMContentLoaded', initNavigation);
