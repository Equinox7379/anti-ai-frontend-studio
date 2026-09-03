# A 通道：无锚定设计评审

本轮先不要打开 AI 味特征库，也不要运行检测器。只看真实页面、相关源码和主要任务路径，像一个不了解生成过程的设计负责人一样判断。

## 1. 先看，而不是先解释

固定 URL、数据、权限、视口、主题、字体加载和状态。先做：

```text
3 秒：这是什么任务？第一主角是谁？下一步是什么？
30 秒：对象、结果、形成关系、风险和验证路径是什么？
真实路径：完成一次主要操作，观察错误和恢复。
```

## 2. 必须记录

```text
METHOD = isolated-dual-context / sequential-single-context
TARGET =
DESIGN_SPECIFICITY = authored-for-this-product / partly-generic / interchangeable
PRIMARY_THESIS =
FIRST_VISUAL_FOCUS =
TASK_PATH =
```

随后写：

- 2—3 个真正成立的强项；
- 3—5 个按影响排序的问题；
- 页面平淡、吵闹或模板化的根因；
- 具体到位置、用户影响和最小修正的建议；
- 静态截图无法验证的事项。

## 3. 认知负荷的可选检查

复杂学习、表单、数据与诊断页面可打开 `knowledge/09_COGNITIVE_LOAD_LENS.md`。不要为了使用理论而强行打分。

## 4. 结束条件

把结论写入 `templates/RENDER_REVIEW_A.template.md` 或 `PROJECT_DESIGN.md` 的首稿评审部分。记录完成以前，不得运行 `tools/slop_detector.mjs`，也不得阅读后续反模式清单。
