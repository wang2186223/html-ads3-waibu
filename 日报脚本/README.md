# 日报统计脚本使用指南

## 📊 脚本功能
`statistics_analyzer.py` 是一个独立的Python脚本，专门用于分析网站访问日志CSV文件并生成每日统计汇总表。

## 🚀 使用方法

### 基本用法
```bash
python3 statistics_analyzer.py "ads-recan - 详细-2025-10-11.csv"
```

### 指定输出文件
```bash
python3 statistics_analyzer.py "ads-recan - 详细-2025-10-11.csv" -o "10月11日统计报表.csv"
```

### 静默模式（不显示详细输出）
```bash
python3 statistics_analyzer.py "ads-recan - 详细-2025-10-11.csv" -q
```

### 查看帮助
```bash
python3 statistics_analyzer.py -h
```

## 📋 输入要求
脚本需要CSV文件包含以下列：
- `时间`: 访问时间
- `访问页面`: 完整的页面URL
- `用户属性`: 用户代理信息
- `来源页面`: 来源页面URL
- `ip`: 访问者IP地址

## 📈 输出内容
生成的统计表包含以下信息：
1. **时间**: 从文件名自动提取的日期（如：10月11日）
2. **域名来源**: 网站域名（不记录后缀）
3. **书籍名称**: 格式化后的书籍标题
4. **累计章节**: 包含`chapter-`的URL数量
5. **累计IP数量**: 去重后的独立访问者数量
6. **总访问次数**: 该书籍的总访问量

## 📊 示例输出
```
====================================================================================================
📊 访问统计汇总表
====================================================================================================
时间           域名来源                      书籍名称                                章节数      IP数量     总访问     
----------------------------------------------------------------------------------------------------
10月11日       re.cankalp.com            Heartbreak Billionaire: He Should Never Have Let Go 135      15       258     
10月11日       re.cankalp.com            Irresistible Seduction Married For Deception Loved For Real 96       19       268     
10月11日       re.cankalp.com            My Rejected Mate Regrets            25       1        28      
10月11日       re.cankalp.com            Runaway Heiress Reborn Crushing CEO Ex 96       7        144     
10月11日       re.cankalp.com            The Hidden Heiress Divorces The CEO 98       8        155     
----------------------------------------------------------------------------------------------------
总计                                                                       450      50       853     
====================================================================================================
```

## 📄 CSV输出格式
生成的CSV文件格式（符合您之前要求的格式）：
```csv
时间,域名来源（不记录后缀）,书籍名称,累计章节（含chapter的url）,累计ip数量（去重）,总访问次数
10月11日,re.cankalp.com,Heartbreak Billionaire: He Should Never Have Let Go,135,15,258
10月11日,re.cankalp.com,Irresistible Seduction Married For Deception Loved For Real,96,19,268
```

## 🔧 技术特点
1. **智能URL解析**: 自动从URL中提取书籍名称和章节信息
2. **IP去重**: 统计独立访问者数量
3. **书名格式化**: 将URL格式的书名转换为可读标题
4. **错误处理**: 对无效数据进行过滤和报告
5. **灵活输出**: 支持控制台显示和CSV文件保存
6. **日期自动提取**: 从文件名自动识别日期

## 🎯 实际测试结果
基于 `ads-recan - 详细-2025-10-11.csv` 文件：
- 总行数：860行
- 有效数据：853行
- 统计出5本书籍的访问情况
- 总计450个章节访问，50个独立IP

## 📝 日常使用建议
1. **每日定时分析**: 建议每天运行一次，分析前一天的数据
2. **文件命名**: 保持CSV文件名包含日期（YYYY-MM-DD格式）
3. **存档管理**: 建议保存每日的统计CSV文件作为历史记录
4. **数据对比**: 可以对比不同日期的统计结果，分析趋势

## 🔄 批量处理示例
如果要处理多个日期的文件：
```bash
# 处理多个文件
python3 statistics_analyzer.py "ads-recan - 详细-2025-10-09.csv" -o "10月09日统计.csv"
python3 statistics_analyzer.py "ads-recan - 详细-2025-10-10.csv" -o "10月10日统计.csv"
python3 statistics_analyzer.py "ads-recan - 详细-2025-10-11.csv" -o "10月11日统计.csv"
```

## 📝 注意事项
1. 确保CSV文件编码为UTF-8
2. 需要Python 3.x环境
3. 脚本会自动过滤无效的URL和IP地址
4. 默认输出文件名格式：`统计汇总-原文件名.csv`
5. 脚本完全独立，无需其他依赖