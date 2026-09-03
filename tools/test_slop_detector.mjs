#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanPath } from './slop_detector.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(here, 'fixtures', 'slop_detector', name);

const classic = await scanPath(fixture('classic-ai.html'));
assert.equal(classic.verdict, 'DESCRIPTIVE_ONLY');
assert.equal(classic.designScore, null);
assert.ok(classic.clusters.some((item) => item.id === 'C01'));
assert.ok(classic.findings.some((item) => item.signal === 'transition-all'));

const editorial = await scanPath(fixture('editorial-default.html'));
assert.ok(editorial.clusters.some((item) => item.id === 'C02'));
assert.ok(editorial.findings.some((item) => item.signal === 'cream-canvas'));

const pairing = await scanPath(fixture('font-pairing.css'));
assert.ok(pairing.clusters.some((item) => item.id === 'C04'));

const clean = await scanPath(fixture('clean-workbench.html'));
assert.equal(clean.clusters.length, 0);
assert.equal(clean.findings.filter((item) => item.confidence === 'high').length, 0);

console.log('slop_detector tests: 4/4 PASS');
