const { chromium, expect } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:8096/?outfit-preview=1');
    const piece = id => page.getByTestId('outfit-item-' + id);
    const popup = page.getByTestId('outfit-popover');
    const quick = page.getByRole('button', { name: '换一件', exact: true });
    await piece('shirt').waitFor();
    const frames = await page.evaluate(async () => {
      const values = [];
      document.querySelector('[data-testid="outfit-item-shirt"]').click();
      const start = performance.now();
      await new Promise(resolve => {
        const sample = () => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(document.querySelector('[data-testid="outfit-motion-shirt"]')).transform);
          values.push({ y: matrix.m42, scale: matrix.a });
          if (performance.now() - start < 550) requestAnimationFrame(sample); else resolve();
        };
        requestAnimationFrame(sample);
      });
      return values;
    });
    expect(Math.min(...frames.map(frame => frame.y))).toBeLessThan(-22);
    expect(Math.max(...frames.map(frame => frame.scale))).toBeGreaterThan(1.07);
    expect(frames.at(-1).y).toBeCloseTo(-18, 0);
    await page.keyboard.press('Escape');
    await piece('shirt').click();
    await quick.click();
    await expect(piece('blouse')).toHaveAttribute('aria-pressed', 'true');
    await expect(popup).toBeVisible();
    await quick.click();
    await expect(piece('shirt')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '挑选单品', exact: true }).click();
    await page.getByRole('button', { name: '换成浅粉短袖衬衫', exact: true }).click();
    await expect(piece('blouse')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('outfit-candidates')).toHaveCount(0);
    await page.getByRole('button', { name: '保存这套搭配', exact: true }).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('outfit-studio-demo-saved-v1'))[0]);
    expect(saved.itemIds).toContain('blouse');
    expect(saved.itemIds).not.toContain('shirt');
    await piece('blouse').click();
    await quick.click();
    await expect(page.getByRole('button', { name: '保存这套搭配', exact: true })).toBeEnabled();
    // Every slot remains reachable; repeated selection dismisses without layout changes.
    await piece('trousers').click();
    await expect(piece('trousers')).toHaveAttribute('aria-pressed', 'true');
    await expect(piece('shirt')).toHaveAttribute('aria-pressed', 'false');
    await piece('trousers').click();
    await expect(popup).toHaveCount(0);
    for (const width of [320, 390, 1200]) {
      await page.setViewportSize({ width, height: 1000 });
      await piece('shirt').click();
      await expect(popup).toBeVisible();
      await page.waitForTimeout(500);
      const anchor = await page.getByTestId('outfit-anchor-shirt').boundingBox();
      let box = await popup.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(1000);
      const overlaps = box.x < anchor.x + anchor.width && box.x + box.width > anchor.x && box.y < anchor.y + anchor.height && box.y + box.height > anchor.y;
      expect(overlaps).toBe(false);
      await page.screenshot({ path: 'test-results/glass-' + width + '.png' });
      await page.getByRole('button', { name: '挑选单品', exact: true }).click();
      await page.waitForTimeout(200);
      box = await popup.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(1000);
      await page.mouse.move(10, 550); await page.mouse.wheel(0, 100);
      await page.waitForTimeout(200);
      if (await popup.count()) { box = await popup.boundingBox(); expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(1000); }
      await page.keyboard.press('Escape');
      await expect(popup).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
    await page.setViewportSize({ width: 390, height: 1000 });
    await piece('sneakers').click();
    await expect(page.getByText('暂无同类单品', { exact: true })).toBeVisible();
    await expect(quick).toBeDisabled();
    await page.getByText('YOUR DAILY EDIT', { exact: true }).click();
    await expect(popup).toHaveCount(0);
    await piece('shirt').focus(); await page.keyboard.press('Enter');
    await expect(popup).toBeVisible();
    await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await piece('shirt').click();
    await page.waitForTimeout(300);
    const motion = await page.getByTestId('outfit-motion-shirt').evaluate(el => { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { y: m.m42, scale: m.a }; });
    expect(motion.y).toBe(0); expect(motion.scale).toBe(1);
    await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    // Exercise the real wardrobe integration with an isolated test snapshot.
    await page.addInitScript(() => localStorage.setItem('home-whereabouts.snapshot', JSON.stringify({
      homes: [{ id: 'home', name: '测试家庭' }],
      rooms: [{ id: 'closet', homeId: 'home', name: '测试衣帽间', kind: 'walk-in-closet', layout: { rows: 6, cols: 6 } }],
      containers: [], items: [], categories: [],
      wardrobeItems: [{ id: 'a', name: '测试上衣', type: '衬衫', color: '白色', season: '四季' }, { id: 'b', name: '测试下装', type: '百褶裙', color: '蓝色', season: '四季' }],
    })));
    await page.route('**/api/chat', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('http://localhost:8096/');
    await page.getByRole('tab', { name: '房间', exact: true }).click();
    await page.getByRole('button', { name: '打开房间 测试衣帽间', exact: true }).click();
    await page.getByRole('button', { name: '一键生成今日穿搭', exact: true }).click();
    await expect(page.getByText('AI 暂不可用或返回格式不完整，已使用衣柜里的单品生成本地搭配。可以重新生成再试。')).toBeVisible();
    await expect(page.getByRole('button', { name: '选择测试上衣', exact: true })).toBeVisible();
    await expect(page.getByText('暂无单品图片', { exact: true })).toHaveCount(2);
    await page.route('**/api/chat', route => route.fulfill({ json: { answer: JSON.stringify({ title: '测试推荐', reason: '真实 ID 搭配', itemIds: ['a', 'b'] }) } }));
    await page.getByRole('button', { name: '重新搭配', exact: true }).click();
    await expect(page.getByText('测试推荐', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
    console.log('PASS: quick cycling, anchored picker, persistence reset, 3 responsive sizes, scroll, empty candidates, outside/Escape/keyboard dismissal, reduced motion, actual wardrobe fallback and AI recovery.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
