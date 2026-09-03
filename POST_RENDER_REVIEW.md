# POST RENDER REVIEW · 阶段二 A：无锚定设计评审

第一版真实页面已经存在。现在先形成**不受检测器和反模式清单锚定**的设计判断。

本阶段只读取：

```text
review_after_first_render/00A_UNANCHORED_DESIGN_REVIEW.md
review_after_first_render/04_REVIEW_LENSES.md
knowledge/09_COGNITIVE_LOAD_LENS.md   # 仅复杂学习、表单、数据或诊断页按需
```

不要运行 `tools/slop_detector.mjs`，不要打开 GPT 默认配方、AI 特征库或 M-A／M-B／M-C 清单。

固定真实 URL、数据、权限、视口、主题、字体加载和状态，完成：

```text
3 秒：页面是什么、主角是谁、下一步是什么？
30 秒：对象、结果、形成关系、风险与验证路径是什么？
真实路径：完成一次主要操作，观察错误和恢复。
```

把独立观察写入：

```text
templates/RENDER_REVIEW_A.template.md
```

或者写入 `PROJECT_DESIGN.md` 的 First Render Review A 部分。必须先保存这份记录。

A 通道完成后，才读取根目录：

```text
POST_RENDER_EVIDENCE_AND_REVISE.md
```

若当前环境可无额外打扰地使用隔离子代理，可以将 A、B 分开；否则在同一上下文严格按文件顺序执行即可。不要为了形式向用户索要额外授权。
