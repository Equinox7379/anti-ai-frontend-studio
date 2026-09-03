# Read → Apply → Render → Verify：让模型真正执行

长规范不会自动提高遵守率。低能力模型容易只记住几个“不要”，编码时又回到组件库默认。标准／重大改造采用下列短回路；局部小修不强制增加文档。

## 1. Compile：把设计依据压成一页

云端设计负责人完成获批 `DESIGN_SPEC.json` 和可选 `EXCELLENCE_NOTE.md` 后运行：

```powershell
python tools/compile_implementation_brief.py `
  --spec DESIGN_SPEC.json `
  --excellence EXCELLENCE_NOTE.md `
  --output IMPLEMENTATION_BRIEF.md
```

输出只保留当前任务、保留项、领域不变量、功能焦点、矩形政策、结构装置、字体角色、唯一大胆动作、三套默认风险、必要状态与视口。它不生成新方向，也不允许本地施工者重新选主题。

## 2. Read 与 Ack

本地施工者先读项目 `AGENTS.md` 和一页 Brief，再读直接相关源码。写代码前用不超过十行复述：

```text
TARGET
PRESERVE
PRIMARY_FOCUS
FOCAL_MECHANISM
RECTANGLE_POLICY
STRUCTURAL_DEVICES
TYPE_POLICY
MOTION_POLICY
FORBIDDEN_DEFAULTS
STOP_WHEN
```

复述冲突时停止并指出具体缺口，不向用户请求普通确认。

## 3. Apply

一次只做一个聚焦 Pass。每次准备新增完整容器、字体家族、强调色、阴影、渐变或作者性动效时，先检查 Brief 是否批准；未批准不得用“合理默认”补齐。

## 4. Render

在相同视口、数据、状态、主题和滚动位置生成修改前后截图。需要时运行 `rendered_surface_audit.js` 或其可选 Python 包装器，检查大型有界表面、重复同型表面和首屏盒子覆盖率。工具只提供线索，不替代人眼。

## 5. Verify

检查去皮肤、轮廓、对象、合并、三套 GPT 默认配方、`Inter + Playfair Display`、装饰性编号、唯一大胆动作和真实删减。必要状态与视口按风险计划执行，不把局部任务扩大成全站证据工程。

## 6. Receipt

施工结束后填写 `IMPLEMENTATION_RECEIPT.md`，把焦点机制、主要表面、结构装置、字体、动效、删减和截图映射到真实文件或组件。运行：

```powershell
python tools/implementation_receipt_lint.py IMPLEMENTATION_RECEIPT.md `
  --root <交付目录> --json
```

Receipt 不是通过证明。云端审核者必须读取真实代码和截图，并随机核对至少两项映射。

## 7. Handoff

施工者只允许报告 `READY_FOR_INDEPENDENT_REVIEW`、`NEEDS_WORK` 或 `BLOCKED`，不得自评设计分或签发 PASS。
