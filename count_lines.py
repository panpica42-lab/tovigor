#!/usr/bin/env python3
"""统计项目代码行数（注释行数只计算一半）"""

import os
from pathlib import Path

project_root = r'c:\wzl\HX-proj\tovigor_v1\tovigor_v1'
code_extensions = {'.vue', '.js', '.uts', '.ts', '.scss', '.css', '.json'}
exclude_dirs = {'node_modules', 'unpackage', '.git', 'dist'}
exclude_paths = {'uni_modules/qiun-data-charts'}

def is_comment_line(line, ext, in_js_block, in_html_block):
    """判断是否是注释行，分别追踪 JS 和 HTML 块注释状态"""
    stripped = line.strip()
    if not stripped:
        return False, in_js_block, in_html_block
    
    is_comment = False
    
    # JS/TS/UTS/SCSS/CSS 块注释
    if ext in {'.js', '.ts', '.uts', '.scss', '.css', '.vue'}:
        if stripped.startswith('//'):
            is_comment = True
        elif stripped.startswith('/*') and '*/' in stripped:
            is_comment = True
        elif stripped.startswith('/*'):
            is_comment = True
            in_js_block = True
        elif '*/' in stripped and in_js_block:
            is_comment = True
            in_js_block = False
        elif in_js_block:
            is_comment = True
    
    # HTML 注释（仅 Vue）
    if ext == '.vue' and not is_comment:
        if '<!--' in stripped and '-->' in stripped:
            is_comment = True
        elif '<!--' in stripped:
            is_comment = True
            in_html_block = True
        elif '-->' in stripped and in_html_block:
            is_comment = True
            in_html_block = False
        elif in_html_block:
            is_comment = True
    
    return is_comment, in_js_block, in_html_block

def count_file(filepath):
    """统计单个文件"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except:
        return 0, 0
    
    ext = Path(filepath).suffix
    total = len(lines)
    comments = 0
    in_js_block = False
    in_html_block = False
    
    for line in lines:
        is_c, in_js_block, in_html_block = is_comment_line(line, ext, in_js_block, in_html_block)
        if is_c:
            comments += 1
    
    return total, comments

# 开始统计
stats = {}
total_l = total_c = file_n = 0

for root, dirs, files in os.walk(project_root):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    rel = os.path.relpath(root, project_root).replace('\\', '/')
    if any(rel.startswith(e) for e in exclude_paths):
        continue
    
    for f in files:
        ext = Path(f).suffix
        if ext not in code_extensions:
            continue
        
        fp = os.path.join(root, f)
        l, c = count_file(fp)
        
        if ext not in stats:
            stats[ext] = {'files': 0, 'lines': 0, 'comments': 0}
        
        stats[ext]['files'] += 1
        stats[ext]['lines'] += l
        stats[ext]['comments'] += c
        total_l += l
        total_c += c
        file_n += 1

# 输出结果
print('=' * 60)
print('🏋️ Tovigor 健身应用 - 代码统计报告')
print('=' * 60)
print()
print(f"{'类型':<10}{'文件数':<10}{'总行数':<12}{'注释行':<12}{'有效行数':<12}")
print('-' * 60)

eff_t = 0
for ext in sorted(stats.keys()):
    d = stats[ext]
    eff = d['lines'] - d['comments'] * 0.5
    eff_t += eff
    print(f"{ext:<10}{d['files']:<10}{d['lines']:<12}{d['comments']:<12}{int(eff):<12}")

print('-' * 60)
print(f"{'合计':<10}{file_n:<10}{total_l:<12}{total_c:<12}{int(eff_t):<12}")
print()
print('=' * 60)
print('📈 统计摘要')
print('=' * 60)
print(f'  📁 总文件数: {file_n} 个')
print(f'  📝 原始总行数: {total_l} 行')
print(f'  💬 注释行数: {total_c} 行')
print(f'  ✨ 有效代码行数: {int(eff_t)} 行')
print(f'  📊 注释占比: {total_c/total_l*100:.1f}%')
print()
print('💡 计算公式: 有效行数 = 总行数 - 注释行数 × 0.5')
print('📌 已排除: node_modules, unpackage, qiun-data-charts(第三方图表库)')
