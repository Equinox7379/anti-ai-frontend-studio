# 第一版渲染后：先无锚定评审，再检测，再综合

现在已经有真实页面。评审分成两条互不替代的通道，顺序不可颠倒。

## A 通道：无锚定设计评审

先读取：

```text
00A_UNANCHORED_DESIGN_REVIEW.md
04_REVIEW_LENSES.md
```

在**不运行静态检测器、不读取 GPT 默认配方和 AI 特征库**的情况下，先记录页面任务、设计特异性、强项和优先问题。这样可以降低检测规则对审美判断的锚定。

## B 通道：确定性检测与反模式证据

A 通道记录完成后，再读取并执行：

```text
00B_DETERMINISTIC_EVIDENCE.md
01_MA_MB_MC_FAILURES.md
02_GPT_DEFAULT_RECIPES.md
03_AI_TELLS_DISTILLED.md
```

可运行：

```text
node tools/slop_detector.mjs <实际前端源码目录> --json
```

B 通道只报告可定位的源码信号、浏览器事实、组合风险和可能的误报，不评价作品是否优秀。

## 综合与修正

最后读取：

```text
00C_SYNTHESIS_AND_REVISION.md
core/02_RENDER_REVIEW_REVISE.md
```

说明两通道在哪里一致、哪里冲突、哪些检测结果是假阳性，并按用户影响修改实际代码。不得把两个通道合成一个“设计健康分”，也不得让检测器 GREEN 替代真实视觉判断。

如果当前环境支持互相隔离的子代理或评审上下文，可以让 A、B 分开执行；若不支持，必须在同一上下文中严格顺序执行，并先保存 A 的记录再开始 B。不要为了获得“双代理”形式额外打扰用户。
