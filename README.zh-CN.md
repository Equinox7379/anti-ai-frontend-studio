# Anti-AI Frontend Studio（中文说明）

v6.0.0-rc2 · 面向无上下文强 AI 的冷启动设计方法论工作包。

## 这是什么

一套让编码/设计 Agent 从产品简报、现有界面或粗略创意出发，完成设计、实现、
真实渲染、无锚定批评与实际修正的工作方法与配套工具——避开常见的 AI 设计默认配方。

核心分层：**首稿前只加载正向设计方法；首稿真实渲染后才加载反默认诊断材料**，
防止 AI 围绕禁令收敛成新的无性格模板。

## 最简用法

将本仓库提供给能力强的设计/编码 Agent，粘贴 `PROMPT_TO_USE.txt` 并附上你的简报。

多文件读取不稳定时，使用两阶段单文件：

```text
ONE_FILE_MODE.md → 完成第一版真实渲染
POST_RENDER_REVIEW.md → 无锚定设计评审（先保存）
POST_RENDER_EVIDENCE_AND_REVISE.md → 运行证据检查并修正真实代码
```

## 目录

- `core/` 主动设计方法（必读）
- `knowledge/` 按任务深入（每任务最多两篇）
- `review_after_first_render/` 首稿后专用反退化材料
- `templates/` 项目设计/产品上下文/施工交接/视觉契约模板
- `tools/` 零依赖描述性检测器与包自检
- `cases/` 校准案例（正例/反例/修复链，不可整体模仿）
- `blind_test/` 多模型盲测协议与任务书
- `deep_library/` 与 `archive/` 历史归档（非现行指令）

## 状态

RC2：结构与工具已验证；跨模型设计效果由盲测决定，尚未声称已证明。

## 协议

Apache License 2.0。见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE.md)。
