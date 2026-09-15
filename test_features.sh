#!/bin/bash
echo "🧪 测试拖拽编辑功能"
echo "================================"
echo ""

# 检查文件
echo "📁 检查核心文件:"
for file in index.html resources/css/framework.css resources/scripts/framework.js; do
    if [ -f "$file" ]; then
        echo "  ✅ $file ($(wc -c < "$file") 字节)"
    else
        echo "  ❌ $file 缺失"
    fi
done
echo ""

# 检查 JavaScript 语法
echo "🔍 检查 JavaScript 语法:"
if node -c resources/scripts/framework.js 2>/dev/null; then
    echo "  ✅ framework.js 语法正确"
else
    echo "  ❌ framework.js 语法错误"
fi
echo ""

# 检查关键功能
echo "🔧 检查关键功能:"
echo "  📌 拖拽功能:"
grep -q "handleDragStart" resources/scripts/framework.js && echo "    ✅ 拖拽开始处理" || echo "    ❌ 拖拽开始处理缺失"
grep -q "handleDrop" resources/scripts/framework.js && echo "    ✅ 拖拽放置处理" || echo "    ❌ 拖拽放置处理缺失"
grep -q "movePage" resources/scripts/framework.js && echo "    ✅ 页面移动逻辑" || echo "    ❌ 页面移动逻辑缺失"

echo "  📌 编辑功能:"
grep -q "toggleEditMode" resources/scripts/framework.js && echo "    ✅ 编辑模式切换" || echo "    ❌ 编辑模式切换缺失"
grep -q "showEditModal" resources/scripts/framework.js && echo "    ✅ 编辑模态框" || echo "    ❌ 编辑模态框缺失"
grep -q "saveEdit" resources/scripts/framework.js && echo "    ✅ 保存编辑" || echo "    ❌ 保存编辑缺失"
grep -q "deleteItem" resources/scripts/framework.js && echo "    ✅ 删除功能" || echo "    ❌ 删除功能缺失"

echo "  📌 持久化功能:"
grep -q "localStorage" resources/scripts/framework.js && echo "    ✅ localStorage" || echo "    ❌ localStorage 缺失"
grep -q "saveConfig" resources/scripts/framework.js && echo "    ✅ 保存配置" || echo "    ❌ 保存配置缺失"
grep -q "loadConfig" resources/scripts/framework.js && echo "    ✅ 加载配置" || echo "    ❌ 加载配置缺失"

echo "  📌 导出功能:"
grep -q "generateConfigCode" resources/scripts/framework.js && echo "    ✅ 生成配置代码" || echo "    ❌ 生成配置代码缺失"
grep -q "copyToClipboard" resources/scripts/framework.js && echo "    ✅ 复制到剪贴板" || echo "    ❌ 复制到剪贴板缺失"
grep -q "downloadConfig" resources/scripts/framework.js && echo "    ✅ 下载配置" || echo "    ❌ 下载配置缺失"

echo ""
echo "  📌 新增页面功能:"
grep -q "showAddPageModal" resources/scripts/framework.js && echo "    ✅ 新增页面模态框" || echo "    ❌ 新增页面模态框缺失"
grep -q "addNewPage" resources/scripts/framework.js && echo "    ✅ 添加新页面" || echo "    ❌ 添加新页面缺失"
echo ""

# 检查样式
echo "🎨 检查 CSS 样式:"
grep -q ".edit-mode" resources/css/framework.css && echo "  ✅ 编辑模式样式" || echo "  ❌ 编辑模式样式缺失"
grep -q ".dragging" resources/css/framework.css && echo "  ✅ 拖拽样式" || echo "  ❌ 拖拽样式缺失"
grep -q ".drop-target" resources/css/framework.css && echo "  ✅ 放置目标样式" || echo "  ❌ 放置目标样式缺失"
grep -q ".toast" resources/css/framework.css && echo "  ✅ 提示消息样式" || echo "  ❌ 提示消息样式缺失"
echo ""

# 检查 HTML 结构
echo "📄 检查 HTML 结构:"
grep -q "editToggle" index.html && echo "  ✅ 编辑按钮" || echo "  ❌ 编辑按钮缺失"
grep -q "exportConfig" index.html && echo "  ✅ 导出按钮" || echo "  ❌ 导出按钮缺失"
grep -q "editModal" index.html && echo "  ✅ 编辑模态框" || echo "  ❌ 编辑模态框缺失"
grep -q "addPageModal" index.html && echo "  ✅ 新增页面模态框" || echo "  ❌ 新增页面模态框缺失"
grep -q "exportModal" index.html && echo "  ✅ 导出模态框" || echo "  ❌ 导出模态框缺失"
echo ""

echo "================================"
echo "✅ 测试完成"
