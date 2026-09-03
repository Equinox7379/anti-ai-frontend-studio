# 单一方法论，多平台入口

本包不维护十四份互相复制的设计规则。所有平台都读取同一权威源：

```text
00_READ_FIRST.md
core/01_DESIGN_DIRECTOR_CORE.md
DESIGN_VERBS.md
review_after_first_render/00_READ_AFTER_FIRST_RENDER.md
```

## ChatGPT / GPT Pro

上传 ZIP，粘贴 `PROMPT_TO_USE.txt`。平台不稳定浏览多文件时使用 `ONE_FILE_MODE.md`；首稿后依次读取根目录 `POST_RENDER_REVIEW.md` 与 `POST_RENDER_EVIDENCE_AND_REVISE.md`。

## Codex / Claude Code / Cursor / OpenCode

将完整包放在项目外的稳定工具目录，或项目中明确的只读辅助目录。让 Agent Skill 指向包根 `skill/SKILL.md`；不要复制整套方法到多份项目规则中。

项目级 `AGENTS.md`、CLAUDE.md 或 Cursor rules 只需写：

```text
前端设计任务先读取 <包路径>/skill/SKILL.md，方法论以该包为单一权威源；项目本地规则只补充仓库、权限和运行事实。
```

## 发行纪律

- 平台适配层只描述“如何找到和执行权威源”，不复制设计正文；
- 修改方法时只更新权威源，再检查入口是否仍正确；
- 不因平台支持 hook／sub-agent／browser 就强制所有项目启用；
- 浏览器、子代理和检测器不可用时，明确降级路径，不虚构完成。
