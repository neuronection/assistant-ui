import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

const MIN_STORIES = 50

const meta = JSON.parse(
  readFileSync(join(process.cwd(), 'build', 'meta.json'), 'utf8'),
) as { stories: Record<string, { name: string }> }
const ids = Object.keys(meta.stories).sort()

test('gallery ships at least the floor number of stories', () => {
  expect(
    ids.length,
    `meta.json lists only ${ids.length} stories — the stories glob may be broken`,
  ).toBeGreaterThanOrEqual(MIN_STORIES)
})

for (const id of ids) {
  test(`story ${id}`, async ({ page }) => {
    await page.goto(`/?story=${id}`)
    await page.waitForSelector('main.ladle-main > *')
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(`${id}.png`, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.003,
    })
  })
}
