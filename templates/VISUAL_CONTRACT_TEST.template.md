# 视觉契约测试模板

> 目的：把“已经批准的设计意图”编译成少量、稳定、可断言的测试。  
> 它不是像素截图大赛，也不是自动审美评分器。  
> 原则：只测试真正影响任务理解、视觉机制和响应式关系的不可变项。

# 【项目／页面】视觉契约

## 1. 先分类：哪些应自动化，哪些必须看图

| 类别 | 适合自动断言 | 示例 |
|---|---|---|
| A. 硬结构／行为 | 是 | 元素顺序、同位叠层、无重叠、无横向溢出、焦点返回、抽屉替代桌面侧栏 |
| B. 容差几何／排版 | 是，带容差 | 对齐误差 ≤1px、栏宽比例、行高、金额右对齐、最大行数、触控区 |
| C. 审美与意义 | 否，必须人工渲染审查 | 是否平平无奇、是否有判断、字体性格是否合适、页面是否仍像流行模板 |

不得把 C 类判断伪装成正则、卡片计数或单一分数。机器 GREEN 只能证明已声明的契约没有被破坏。

## 2. 每条契约的最小格式

复制以下块，通常保留 3—10 条即可：

```text
VC-ID = VC-01
INTENT = 【用户为什么需要这个设计关系】
SCOPE = 【页面／组件／状态】
FIXTURE = 【稳定数据或操作路径】
VIEWPORTS = 【例如 1440×900, 390×844】
OBSERVABLE = 【用户可看到的几何、顺序或行为】
SELECTORS = 【优先 data-vc / role / accessible name】
ASSERTION = 【明确断言】
TOLERANCE = 【0 / 1px / 2% / 其他】
FAILURE_MESSAGE = 【说明破坏了哪条设计意图】
FALSE_POSITIVE_BOUNDARY = 【什么变化不应导致失败】
EVIDENCE = 【自动测试 / 同状态截图 / 人工目视】
```

### 示例：会计临界点互补裁切

```text
VC-ID = VC-DOUBLE-EXPOSURE-01
INTENT = 让用户在同一空间比较旧判断与准则判断，而不是在两张卡片之间来回扫描。
SCOPE = 双重显影文字层。
FIXTURE = 任一含 A/B 两层文本的正式案例。
VIEWPORTS = 1440×900, 390×844。
OBSERVABLE = 两层拥有相同几何框；分界左侧只见 A，右侧只见 B；任何比例无重叠、无空缝。
SELECTORS = [data-vc="layer-a"], [data-vc="layer-b"], [data-vc="reveal-control"]。
ASSERTION = 0/25/50/75/100% 五个位置中，A 可见终点与 B 可见起点相等。
TOLERANCE = 1 CSS px。
FAILURE_MESSAGE = 双重显影不再是同位互补裁切，已退化为叠字、空缝或分离比较。
FALSE_POSITIVE_BOUNDARY = CSS 组织、组件拆分和类名变化不应影响测试。
EVIDENCE = Playwright + 50% 同状态截图人工复核。
```

## 3. 稳定测试钩子

推荐在语义节点上使用专用属性：

```html
<section data-vc="primary-workspace">...</section>
<div data-vc="layer-a">...</div>
<div data-vc="layer-b">...</div>
<input data-vc="reveal-control" type="range" />
<strong data-vc="final-result">5,850,000.00</strong>
```

规则：

- `data-vc` 只用于稳定定位，不参与样式。
- 可访问名称稳定时优先使用 `getByRole` / `getByLabel`。
- 不要为了测试暴露内部状态机细节。
- 不要断言脆弱的 Tailwind 类名、哈希类名或 DOM 层数。

## 4. Playwright 通用模板

把下面内容复制到项目测试目录，例如：

```text
tests/visual-contract.spec.ts
```

```ts
import { expect, test, type Locator, type Page } from '@playwright/test';

const CONTRACT = {
  url: '/REPLACE_WITH_STABLE_ROUTE',
  approvedFontKeyword: 'REPLACE_WITH_APPROVED_FONT',
  approvedMinWeight: 600,
  desktopMainRatio: { min: 0.62, max: 0.72 },
} as const;

type Rect = { x: number; y: number; width: number; height: number };

async function rect(locator: Locator): Promise<Rect> {
  const box = await locator.boundingBox();
  expect(box, '视觉契约目标必须真实可见').not.toBeNull();
  return box!;
}

function expectNear(actual: number, expected: number, tolerance = 1, message?: string) {
  expect(
    Math.abs(actual - expected),
    message ?? `期望 ${actual} 与 ${expected} 的差不超过 ${tolerance}px`,
  ).toBeLessThanOrEqual(tolerance);
}

async function expectSameRect(a: Locator, b: Locator, tolerance = 1) {
  const [ra, rb] = await Promise.all([rect(a), rect(b)]);
  expectNear(ra.x, rb.x, tolerance, '同位层 x 坐标偏离');
  expectNear(ra.y, rb.y, tolerance, '同位层 y 坐标偏离');
  expectNear(ra.width, rb.width, tolerance, '同位层宽度偏离');
  expectNear(ra.height, rb.height, tolerance, '同位层高度偏离');
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(metrics.scroll, '页面出现横向溢出').toBeLessThanOrEqual(metrics.viewport + 1);
}

async function expectNoOverlap(a: Locator, b: Locator, tolerance = 0) {
  const [ra, rb] = await Promise.all([rect(a), rect(b)]);
  const overlapX = Math.max(0, Math.min(ra.x + ra.width, rb.x + rb.width) - Math.max(ra.x, rb.x));
  const overlapY = Math.max(0, Math.min(ra.y + ra.height, rb.y + rb.height) - Math.max(ra.y, rb.y));
  expect(overlapX * overlapY, '两个区域发生了不允许的几何重叠').toBeLessThanOrEqual(tolerance);
}

function cssLengthToPx(token: string, basis: number): number {
  const value = token.trim();
  if (value === '0') return 0;
  if (value.endsWith('px')) return Number.parseFloat(value);
  if (value.endsWith('%')) return (Number.parseFloat(value) / 100) * basis;
  throw new Error(`视觉契约暂不支持 clip-path 长度：${value}`);
}

function expandFour(values: string[]): [string, string, string, string] {
  if (values.length === 1) return [values[0], values[0], values[0], values[0]];
  if (values.length === 2) return [values[0], values[1], values[0], values[1]];
  if (values.length === 3) return [values[0], values[1], values[2], values[1]];
  if (values.length === 4) return values as [string, string, string, string];
  throw new Error(`无法解析 inset 参数：${values.join(' ')}`);
}

function parseInset(clipPath: string, width: number, height: number) {
  const match = clipPath.match(/^inset\(([^)]+)\)$/);
  if (!match) throw new Error(`期望 inset()，实际为：${clipPath}`);
  const raw = match[1].split(/\s+round\s+/i)[0].trim().split(/\s+/);
  const [top, right, bottom, left] = expandFour(raw);
  return {
    top: cssLengthToPx(top, height),
    right: cssLengthToPx(right, width),
    bottom: cssLengthToPx(bottom, height),
    left: cssLengthToPx(left, width),
  };
}

async function expectComplementaryInsetClip(
  layerA: Locator,
  layerB: Locator,
  tolerance = 1,
) {
  await expectSameRect(layerA, layerB, tolerance);

  const [a, b] = await Promise.all([
    layerA.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, clipPath: getComputedStyle(el).clipPath };
    }),
    layerB.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, clipPath: getComputedStyle(el).clipPath };
    }),
  ]);

  const ia = parseInset(a.clipPath, a.width, a.height);
  const ib = parseInset(b.clipPath, b.width, b.height);

  // A 从左侧开始，B 延伸到右侧。
  expectNear(ia.left, 0, tolerance, 'A 层不应裁掉左边界');
  expectNear(ib.right, 0, tolerance, 'B 层不应裁掉右边界');
  expectNear(ia.top, 0, tolerance);
  expectNear(ia.bottom, 0, tolerance);
  expectNear(ib.top, 0, tolerance);
  expectNear(ib.bottom, 0, tolerance);

  const aVisibleEnd = a.width - ia.right;
  const bVisibleStart = ib.left;
  expectNear(
    aVisibleEnd,
    bVisibleStart,
    tolerance,
    'A 层终点与 B 层起点不互补，可能出现叠字或空缝',
  );
}

async function waitForStableVisual(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

test.describe('【页面】视觉契约', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONTRACT.url);
    await waitForStableVisual(page);
  });

  test('VC-01：互补裁切在全部显影比例下无重叠、无空缝', async ({ page }) => {
    const control = page.locator('[data-vc="reveal-control"]');
    const layerA = page.locator('[data-vc="layer-a"]');
    const layerB = page.locator('[data-vc="layer-b"]');

    for (const value of ['0', '25', '50', '75', '100']) {
      await control.evaluate((element, nextValue) => {
        const input = element as HTMLInputElement;
        input.value = String(nextValue);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
      await expectComplementaryInsetClip(layerA, layerB, 1);
    }
  });

  test('VC-02：窄屏无页面级横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.reload();
    await waitForStableVisual(page);
    await expectNoHorizontalOverflow(page);
  });

  test('VC-03：最终结果使用已批准数字特性', async ({ page }) => {
    const result = page.locator('[data-vc="final-result"]');
    await expect(result).toBeVisible();
    const style = await result.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        weight: s.fontWeight,
        variantNumeric: s.fontVariantNumeric,
        textAlign: s.textAlign,
      };
    });

    expect(style.family).toContain(CONTRACT.approvedFontKeyword);
    const numericWeight = style.weight === 'bold' ? 700 : Number.parseInt(style.weight, 10);
    expect(numericWeight).toBeGreaterThanOrEqual(CONTRACT.approvedMinWeight);
    expect(style.variantNumeric).toContain('tabular-nums');
    expect(style.textAlign).toBe('right');
  });

  test('VC-04：桌面主工作区与辅助区保持批准比例', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await waitForStableVisual(page);

    const main = await rect(page.locator('[data-vc="primary-workspace"]'));
    const support = await rect(page.locator('[data-vc="supporting-workspace"]'));
    const ratio = main.width / (main.width + support.width);

    expect(ratio, '主工作区宽度比例偏离已批准构图').toBeGreaterThanOrEqual(
      CONTRACT.desktopMainRatio.min,
    );
    expect(ratio).toBeLessThanOrEqual(CONTRACT.desktopMainRatio.max);
  });
});
```

删除不适用测试；不要保留占位断言。

## 5. 常见视觉意图如何编译为断言

| 设计意图 | 推荐断言 | 不推荐断言 |
|---|---|---|
| 两层内容同位比较 | 相同 bounding box；裁切边界互补 | DOM 必须正好嵌套三层 |
| 金额可纵向比较 | 右对齐、tabular nums、小数位规则 | 截图必须逐像素相同 |
| 主结果是唯一视觉焦点 | 主结果位置／尺度／有界表面标记；人工模糊测试 | “字号最大所以优秀” |
| 手机端改为连续记录流 | 元素纵向顺序、无独立卡片标记、无横向溢出 | 强制某个 CSS Grid 写法 |
| 桌面侧栏在手机变抽屉 | 断点两侧可见性、打开关闭、焦点返回 | 断言具体组件库名称 |
| 不允许卡片墙 | 对项目主动标注的 major surfaces 数量与职责断言 + 人工看图 | 全局统计所有 `div` 背景色 |
| 标题不承担装饰性编号 | 检查用户可见文本和语义顺序 | 禁止所有两位数字 |
| 唯一作者性动效 | 指定事件存在；其他区域无自动入场；reduced motion 等价 | 禁止全部 transition |

## 6. 有界表面契约（只在项目明确需要时使用）

不要用通用扫描器猜“什么是卡片”。由云端在设计中明确标注主要表面：

```html
<section data-vc-surface="major" data-vc-surface-job="result-and-uncertainty">...</section>
<aside data-vc-surface="support" data-vc-surface-job="evidence-review">...</aside>
```

示例断言：

```ts
const majorSurfaces = page.locator('[data-vc-surface="major"]');
await expect(majorSurfaces).toHaveCount(【批准数量】);
await expect(majorSurfaces.first()).toHaveAttribute(
  'data-vc-surface-job',
  '【批准职责】',
);
```

这只证明数量和职责未漂移，仍需人工判断这些表面是否真的成立。

## 7. 截图证据纪律

截图只用于需要视觉判断的 C 类问题，并固定：

```text
URL／路由
测试数据
用户权限
视口
主题
字体加载完成
滚动位置
状态
浏览器缩放
```

允许禁用随机动画以稳定截图，但不得注入会改变颜色、尺寸、间距、文案或可见性的“美化 CSS”。

推荐最小证据：

- 一张主要桌面状态；
- 一张主要移动状态；
- 一张本轮高风险状态；
- 只有在设计变更需要时才保留修改前同状态截图。

## 8. 防止“为了 GREEN 改测试”

视觉契约测试由云端设计决定，本地施工 AI只负责实现和运行。

未经云端批准，本地施工 AI不得：

- 删除断言；
- 放宽容差；
- 更换更容易通过的夹具；
- 隐藏真实内容或错误状态；
- 把用户可见断言改成私有类名断言；
- 使用 `skip`、`fixme`、`only` 或减少测试发现数量；
- 把设计偏离解释成“浏览器差异”而不提供证据。

若视觉契约本身需要改变，应停止修改测试并向云端报告：

```text
CONTRACT_CHANGE_REQUIRED
原契约：
真实环境冲突：
最小建议变更：
对视觉与功能的影响：
```

## 9. 完成判定

一条视觉契约只有在以下条件同时满足时才算通过：

- 测试使用真实渲染页面和稳定夹具；
- 断言对应批准的设计意图；
- 相关视口和状态均通过；
- 没有通过修改测试掩盖实现偏离；
- C 类审美问题已经由云端看真实截图或页面复核；
- 测试结果没有被冒充成“页面优秀”的充分证明。
