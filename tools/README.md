# 工具说明

## 包结构检查

```powershell
python tools/package_doctor.py
```

它只验证包结构、Markdown 围栏、JSON 和字体二进制是否误入；不能评价设计。

## 描述性 slop detector

在 A 通道无锚定设计评审已经保存后运行：

```powershell
node tools/slop_detector.mjs <实际前端源码目录>
node tools/slop_detector.mjs <实际前端源码目录> --json
```

检测器定位确定性源码信号与组合风险，并为每项给出置信度、假阳性风险和审查问题。它：

- 不输出设计分；
- 有命中也不让进程失败；
- 零命中不代表页面优秀；
- 只扫描你传入的实际 UI 目录，不要拿整个研究包当目标。

自测：

```powershell
node tools/test_slop_detector.mjs
```

盲测结果使用 `blind_test/03_RESULT_SHEET.csv` 人工记录。当前 RC 不提供自动风格选择、自动审美总分或强制 CI 门禁。
