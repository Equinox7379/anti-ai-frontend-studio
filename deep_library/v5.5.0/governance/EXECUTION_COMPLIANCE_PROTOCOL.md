# 读过不等于执行：设计遵从闭环

很多施工 AI 会完整读取规范，却在编码时重新回到组件库默认。v5.5 使用一个轻量闭环，不新增大型发布治理。

## 开工前：Design Basis Ack

本地施工者在修改源码前，必须用不超过十行复述：

```text
TARGET =
PRESERVE =
PRIMARY_FOCUS =
BOLD_MOVE =
BOUNDARY_POLICY =
TYPE_POLICY =
MOTION_POLICY =
FORBIDDEN_DEFAULTS =
STOP_WHEN =
```

复述与批准依据冲突时不得开工。它不是让用户确认，而是让施工者暴露是否真正理解。

## 施工中：按决策而不是按感觉

每次准备新增容器、字体、颜色、阴影、渐变或非状态动效时，先检查设计依据是否批准。未批准时不补“合理默认”。

## 收工前：Implementation Receipt

标准／重大改版，或云端明确要求时，施工者填写 `IMPLEMENTATION_RECEIPT.md`。它把批准的主焦点、容器政策、字体角色、唯一大胆动作、三套 GPT 默认配方、编号和动效落实到具体组件、选择器和截图。

运行：

```powershell
python tools/implementation_receipt_lint.py IMPLEMENTATION_RECEIPT.md `
  --root <交付目录> --source <实际前端目录> --tools-dir tools --gate --json
```

工具只检查遵从证据与明显矛盾，不评价审美。涉及矩形主导风险时，在真实页面上下文运行 `rendered_surface_audit.js`，并把结果作为 Receipt 的可选证据；大型卡片式按钮也属于待检查表面。局部小修默认不要求 Receipt。

## 独立审核

审核者随机抽取至少两项 Receipt 映射到真实源码和截图；若映射不实，视为未执行规范，而不是“文档小问题”。施工者仍不得自评或签发 PASS。
