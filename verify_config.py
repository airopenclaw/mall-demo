#!/usr/bin/env python3
"""
验证 framework.js 配置文件的结构和完整性
"""

import re
import os

def verify_config():
    with open('resources/scripts/framework.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 统计页面数量
    page_count = len(re.findall(r"file: '[^']+\.html'", content))

    # 查找所有版本（通过 icon 属性定位版本对象）
    version_icons = re.findall(r"versions:\s*\{[^}]*icon:\s*'([^']+)'", content, re.DOTALL)

    print("=" * 70)
    print("📊 原型浏览器框架 - 配置验证报告")
    print("=" * 70)
    print()

    print(f"✅ 页面总数: {page_count}")
    print(f"✅ 版本数量: {len(version_icons)}")
    print()

    # 提取并显示每个版本的基本信息
    versions = re.findall(r"'([^']+)':\s*\{[^}]*icon:\s*'([^']+)'[^}]*description:\s*'([^']+)'", content)

    print("📋 版本列表:")
    print("-" * 70)
    for idx, (name, icon, desc) in enumerate(versions, 1):
        print(f"{idx}. {icon} {name}")
        print(f"   {desc}")
    print()

    # 检查所有页面文件是否存在
    print("🔍 页面文件完整性检查:")
    print("-" * 70)

    page_files = re.findall(r"file: '([^']+)'", content)
    missing = []
    found = []

    for page_file in page_files:
        if os.path.exists(page_file):
            found.append(page_file)
        else:
            missing.append(page_file)

    print(f"✅ 找到: {len(found)} 个页面文件")
    print(f"❌ 缺失: {len(missing)} 个页面文件")
    print()

    if missing:
        print("缺失的文件:")
        for f in missing:
            print(f"  - {f}")
    else:
        print("🎉 所有页面文件完整！")

    print()
    print("=" * 70)
    print("✅ 验证完成")
    print("=" * 70)

if __name__ == "__main__":
    os.chdir('/Users/mac/Documents/原型HTML/支付分账')
    verify_config()
