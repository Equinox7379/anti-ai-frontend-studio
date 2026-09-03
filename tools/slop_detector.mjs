#!/usr/bin/env node
/**
 * Descriptive anti-slop detector.
 *
 * It locates known source signals and risky combinations. It deliberately does
 * not score design quality, select a visual direction, or fail a build because
 * a legitimate project happens to use one flagged element.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCANNABLE = new Set([
  '.html', '.htm', '.css', '.scss', '.sass', '.less',
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.mdx',
]);

const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', '.next', 'out', 'coverage',
  '.cache', '.turbo', '.svelte-kit', '.astro', '__pycache__',
  'playwright-report', 'test-results',
]);

const RULES = [
  {
    id: 'S001', signal: 'transition-all', confidence: 'high',
    falsePositiveRisk: 'low',
    patterns: [/\btransition-all\b/i, /transition\s*:\s*all\b/i],
    question: '哪些具体属性需要过渡？若无法列出，请改为显式属性。',
  },
  {
    id: 'S002', signal: 'gradient-text', confidence: 'high',
    falsePositiveRisk: 'medium',
    patterns: [/bg-clip-text[^\n"'`]*text-transparent/i, /-webkit-background-clip\s*:\s*text/i],
    question: '渐变文字是否来自真实品牌资产，而不是通用强调手段？',
  },
  {
    id: 'S003', signal: 'purple-blue-gradient', confidence: 'medium',
    falsePositiveRisk: 'high',
    patterns: [/(from|via|to)-(violet|purple|indigo|blue)-[3-8]00/i,
      /#(?:6366f1|4f46e5|7c3aed|8b5cf6|a855f7|3b82f6)\b/i,
      /linear-gradient\([^\n]*(?:#7c3aed|#8b5cf6)[^\n]*(?:#3b82f6|#2563eb)/i],
    question: '这组紫蓝是否由品牌与内容推导，还是模型默认的“科技感”？',
  },
  {
    id: 'S004', signal: 'three-equal-grid', confidence: 'medium',
    falsePositiveRisk: 'high',
    patterns: [/grid-cols-(?:1[^\n"']*)?(?:md:|lg:)?grid-cols-3/i,
      /repeat\(\s*3\s*,\s*(?:minmax\([^)]*\)|1fr)\s*\)/i],
    question: '三项是否真是同级可比较对象？若不是，不要用三等分骨架。',
  },
  {
    id: 'S005', signal: 'large-or-pill-radius', confidence: 'medium',
    falsePositiveRisk: 'high',
    patterns: [/\brounded-(?:2xl|3xl|full)\b/i,
      /border-radius\s*:\s*(?:9999?px|[2-9]\dpx|[2-9](?:\.\d+)?rem)/i],
    question: '该圆角角色是否与对象、层级或品牌一致，而非全站同一默认？',
  },
  {
    id: 'S006', signal: 'decorative-glow', confidence: 'medium',
    falsePositiveRisk: 'medium',
    patterns: [/shadow-\[0_0_/i, /drop-shadow-\[0_0_/i,
      /(?:box|text)-shadow\s*:[^;\n]*\b0\s+0\s+\d{2,}px/i],
    question: '光晕是否表达真实状态或品牌材质？若只是增加“高级感”，删除。',
  },
  {
    id: 'S007', signal: 'placeholder-copy', confidence: 'high',
    falsePositiveRisk: 'low',
    patterns: [/\bLorem ipsum\b/i, /\b(?:John Doe|Jane Smith|Acme Corp|Feature One)\b/i,
      /样板槽位|结构样例|非正式课程|Phase\s*0|工作底稿组件样例/i],
    question: '正式界面为何仍包含占位或设计过程文案？',
  },
  {
    id: 'S008', signal: 'emoji-as-ui-icon', confidence: 'medium',
    falsePositiveRisk: 'high',
    patterns: [/[🚀✨⚡🔥💡🔒✅🎯🌟📈🛡️📦🗂️]/u],
    question: 'Emoji 是内容的一部分，还是在替代一致的图标系统？',
  },
  {
    id: 'S009', signal: 'dead-link', confidence: 'high',
    falsePositiveRisk: 'medium',
    patterns: [/href\s*=\s*["']#["']/i, /to\s*=\s*["']#["']/i],
    question: '这是尚未实现的动作还是合法锚点？正式交付不得保留假功能。',
  },
  {
    id: 'S010', signal: 'viewport-height-risk', confidence: 'medium',
    falsePositiveRisk: 'medium',
    patterns: [/\bh-screen\b/i, /height\s*:\s*100vh\b/i],
    question: '移动浏览器地址栏变化时是否跳动？是否应使用动态视口单位或内容驱动高度？',
  },
  {
    id: 'S011', signal: 'latin-first-cjk-stack', confidence: 'high',
    falsePositiveRisk: 'low',
    patterns: [/font-family\s*:[^;\n]*(?:Inter|Geist|Roboto|Arial)[^;\n]*(?:Noto\s+Sans\s+SC|Noto\s+Serif\s+SC|PingFang\s+SC|Microsoft\s+YaHei|Source\s+Han)/i],
    question: '中文指标是否被英文 starter font 支配？请先验证 CJK 主字体与回退。',
  },
  {
    id: 'S012', signal: 'starter-font-default', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/font-family\s*:\s*["']?(?:Inter|Geist|Roboto|Arial)\b/i,
      /fontFamily\s*:\s*["'](?:Inter|Geist|Roboto|Arial)\b/i],
    question: '该字体是否是项目已批准身份，还是 starter 默认？名字本身不构成罪名。',
  },
  {
    id: 'S013', signal: 'display-serif-default', confidence: 'medium',
    falsePositiveRisk: 'high',
    patterns: [/\b(?:Playfair\s+Display|Instrument\s+Serif|Fraunces|Cormorant|DM\s+Serif|Noto\s+Serif\s+SC|Source\s+Han\s+Serif|Songti\s+SC|SimSun)\b/i],
    question: '展示衬线是否服务明确的品牌／出版任务，还是“高级感”自动人格？',
  },
  {
    id: 'S014', signal: 'decorative-numbering', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/>\s*0[1-9]\s*</i, /["']0[1-9]["']/i],
    question: '编号是否编码真实流程、排名或时间？若只是填版，请删除。',
  },
  {
    id: 'S015', signal: 'colored-left-stripe', confidence: 'medium',
    falsePositiveRisk: 'medium',
    patterns: [/border-left\s*:\s*[2-9]px[^;\n]*(?:#|rgb|hsl|oklch)/i,
      /\bborder-l-[2-9]\b[^\n"']*(?:blue|green|red|amber|violet|indigo|emerald)/i],
    question: '左侧色条是否拥有不可替代的状态语义？',
  },
  {
    id: 'S016', signal: 'utility-class-overload', confidence: 'low',
    falsePositiveRisk: 'high',
    custom(line) {
      const match = line.match(/class(?:Name)?\s*=\s*["']([^"']+)["']/i);
      if (!match) return false;
      return match[1].trim().split(/\s+/).length >= 14;
    },
    question: '单元素大量工具类是否掩盖了重复视觉系统或不可维护的任意值？',
  },
  {
    id: 'S017', signal: 'pulse-status', confidence: 'medium',
    falsePositiveRisk: 'medium',
    patterns: [/\banimate-pulse\b/i, /animation[^;\n]*(?:pulse|blink)/i],
    question: '脉冲是否代表实时活动，还是在表演“系统正在认真工作”？',
  },
  {
    id: 'S018', signal: 'cream-canvas', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/#(?:f4f1ea|faf8f5|f5f1e8|f3eee3|fdfbf7|f7f3ec|faf6ef|fbf7f0)\b/i],
    question: '暖米白是否来自品牌／使用环境，而非“高级编辑感”默认？',
  },
  {
    id: 'S019', signal: 'terracotta-or-sage-accent', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/#(?:a34f3b|b4533c|9f4f3d|15573a|285943|315f49|547764)\b/i],
    question: '砖红／鼠尾草绿是否与奶油底、衬线、发丝线共同形成默认配方？',
  },
  {
    id: 'S020', signal: 'near-black-canvas', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/background(?:-color)?\s*:\s*#(?:000000|050505|080808|0a0a0a|111111)\b/i,
      /\bbg-(?:black|zinc-950|slate-950|neutral-950)\b/i],
    question: '近黑画布是否由使用环境和内容推导，而非“反 slop”默认？',
  },
  {
    id: 'S021', signal: 'acid-accent', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/#(?:b6ff00|ccff00|00ff66|ff3b30|ff4d00)\b/i,
      /\b(?:lime|green)-(?:300|400)\b/i],
    question: '荧光色是否是项目身份，还是黑底页面的自动搭配？',
  },
  {
    id: 'S022', signal: 'hairline-density', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/border-(?:top|bottom|left|right)?\s*:\s*(?:0\.5|1)px/i,
      /border-(?:t|b|l|r|x|y)(?:-[^\s"']+)?\b/i],
    question: '这些细线是否编码分组、总计或状态，还是报纸式填空？',
  },
  {
    id: 'S023', signal: 'eyebrow-kicker', confidence: 'low',
    falsePositiveRisk: 'high',
    patterns: [/\b(?:eyebrow|kicker|overline|section-label)\b/i],
    question: '眉题是否提供标题无法承担的真实上下文？',
  },
];

const CLUSTERS = [
  {
    id: 'C01', name: 'Classic AI SaaS', threshold: 3,
    signals: ['purple-blue-gradient', 'gradient-text', 'three-equal-grid', 'large-or-pill-radius', 'decorative-glow', 'pulse-status'],
  },
  {
    id: 'C02', name: 'Tasteful editorial default', threshold: 3,
    signals: ['cream-canvas', 'display-serif-default', 'terracotta-or-sage-accent', 'hairline-density', 'decorative-numbering', 'eyebrow-kicker'],
  },
  {
    id: 'C03', name: 'Black acid anti-slop default', threshold: 2,
    signals: ['near-black-canvas', 'acid-accent', 'pulse-status'],
  },
  {
    id: 'C04', name: 'Inter/Geist plus display-serif pairing', threshold: 2,
    signals: ['starter-font-default', 'display-serif-default'],
  },
];

async function collectFiles(target) {
  const stat = await fs.stat(target);
  if (stat.isFile()) return SCANNABLE.has(path.extname(target).toLowerCase()) ? [target] : [];
  const files = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && entry.name !== '.storybook') {
        if (SKIP_DIRS.has(entry.name) || entry.name !== '.storybook') continue;
      }
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && SCANNABLE.has(path.extname(entry.name).toLowerCase())) files.push(full);
    }
  }
  await walk(target);
  return files;
}

function lineMatches(rule, line) {
  if (rule.custom) return Boolean(rule.custom(line));
  return rule.patterns.some((pattern) => pattern.test(line));
}

export async function scanPath(targetPath) {
  const target = path.resolve(targetPath);
  const files = await collectFiles(target);
  const findings = [];
  const signalCounts = new Map();

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    if (!raw.includes('\n') && raw.length > 30000) continue; // likely generated/minified
    const lines = raw.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      for (const rule of RULES) {
        if (!lineMatches(rule, line)) continue;
        findings.push({
          ruleId: rule.id,
          signal: rule.signal,
          confidence: rule.confidence,
          falsePositiveRisk: rule.falsePositiveRisk,
          file: path.relative(target, file) || path.basename(file),
          line: index + 1,
          excerpt: line.trim().slice(0, 220),
          reviewQuestion: rule.question,
        });
        signalCounts.set(rule.signal, (signalCounts.get(rule.signal) ?? 0) + 1);
      }
    }
  }

  const activeSignals = new Set(signalCounts.keys());
  const clusters = CLUSTERS.map((cluster) => {
    const matchedSignals = cluster.signals.filter((signal) => activeSignals.has(signal));
    return {
      id: cluster.id,
      name: cluster.name,
      threshold: cluster.threshold,
      matchedSignals,
      reviewRequired: matchedSignals.length >= cluster.threshold,
    };
  }).filter((cluster) => cluster.reviewRequired);

  return {
    detectorVersion: '1.0.0-rc2',
    target,
    filesScanned: files.length,
    findings,
    signalCounts: Object.fromEntries([...signalCounts.entries()].sort()),
    clusters,
    designScore: null,
    verdict: 'DESCRIPTIVE_ONLY',
    note: 'A clean scan is only a mechanical floor. Every finding requires rendered, task-specific review; no finding or cluster proves poor design by itself.',
  };
}

function printText(report) {
  console.log(`slop-detector ${report.detectorVersion}`);
  console.log(`files scanned: ${report.filesScanned}`);
  console.log(`findings: ${report.findings.length}`);
  for (const cluster of report.clusters) {
    console.log(`\n[CLUSTER] ${cluster.name}: ${cluster.matchedSignals.join(', ')}`);
  }
  for (const finding of report.findings) {
    console.log(`\n[${finding.confidence.toUpperCase()}] ${finding.ruleId} ${finding.signal}`);
    console.log(`${finding.file}:${finding.line}`);
    console.log(finding.excerpt);
    console.log(`Review: ${finding.reviewQuestion}`);
    console.log(`False-positive risk: ${finding.falsePositiveRisk}`);
  }
  console.log(`\n${report.note}`);
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const positional = args.filter((arg) => !arg.startsWith('--'));
  const target = positional[0] ?? '.';
  try {
    const report = await scanPath(target);
    if (json) console.log(JSON.stringify(report, null, 2));
    else printText(report);
  } catch (error) {
    console.error(JSON.stringify({
      detectorVersion: '1.0.0-rc2',
      operationalError: error instanceof Error ? error.message : String(error),
    }, null, 2));
    process.exitCode = 2;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
