import { test, expect } from "@playwright/test";

type Rect = { x: number; y: number; width: number; height: number };

function overlaps(a: Rect, b: Rect): boolean {
  const TOLERANCE = 1; // 1px tolerance for anti-aliasing / sub-pixel rounding
  return !(
    a.x + a.width  <= b.x + TOLERANCE ||
    b.x + b.width  <= a.x + TOLERANCE ||
    a.y + a.height <= b.y + TOLERANCE ||
    b.y + b.height <= a.y + TOLERANCE
  );
}

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`no panel overlap at ${vp.width}×${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto("/");
    // Wait for React to render
    await page.waitForSelector(".panel");
    await page.waitForTimeout(300);

    const panels = page.locator(".panel");
    const count = await panels.count();
    expect(count).toBeGreaterThan(0);

    const rects: (Rect | null)[] = await Promise.all(
      Array.from({ length: count }, (_, i) => panels.nth(i).boundingBox())
    );

    const issues: string[] = [];
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        if (!a || !b) continue;
        if (overlaps(a, b)) {
          issues.push(
            `Panel #${i} [${a.x.toFixed(0)},${a.y.toFixed(0)} ${a.width.toFixed(0)}×${a.height.toFixed(0)}]` +
            ` overlaps panel #${j} [${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}×${b.height.toFixed(0)}]`
          );
        }
      }
    }
    expect(issues, issues.join("\n")).toHaveLength(0);
  });

  test(`all panels fit within viewport at ${vp.width}×${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto("/");
    await page.waitForSelector(".panel");
    await page.waitForTimeout(300);

    const panels = page.locator(".panel");
    const count = await panels.count();

    const issues: string[] = [];
    for (let i = 0; i < count; i++) {
      const r = await panels.nth(i).boundingBox();
      if (!r) continue;
      if (r.x < 0 || r.y < 0 || r.x + r.width > vp.width + 1 || r.y + r.height > vp.height + 1) {
        issues.push(
          `Panel #${i} overflows: [${r.x.toFixed(0)},${r.y.toFixed(0)}] ${r.width.toFixed(0)}×${r.height.toFixed(0)}`
        );
      }
    }
    expect(issues, issues.join("\n")).toHaveLength(0);
  });
}
