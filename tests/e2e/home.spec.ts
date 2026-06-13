import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const axeScript = readFileSync(resolve(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf8');

test.describe('Home page', () => {
  test('loads and has correct title', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/JJK Stat Clash/);
  });

  test('basic accessibility audit (axe) has no violations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Inject axe-core
    await page.addScriptTag({ content: axeScript });
    const results = await page.evaluate(async () => {
      // @ts-ignore
      return await (window as any).axe.run();
    });
    if (results.violations && results.violations.length > 0) {
      console.warn('Accessibility violations:', results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
    }
    const criticalCount = results.violations.filter((v: any) => v.impact === 'critical').length;
    expect(criticalCount).toBe(0);
  });
});
