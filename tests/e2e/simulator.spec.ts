/**
 * E2E tests for Robot OLP Simulator
 *
 * Strategy:
 * - DOM state (sliders, text) → direct assertions
 * - Joint drag → verified via Zustand store exposed as window.__robotStore
 * - OrbitControls lock bug → verified via window.__orbitEnabled (TestMonitor)
 * - Camera orbit → verified via window.__orbitEnabled + screenshot diff
 *
 * Test globals (DEV mode only, injected by source):
 *   window.__robotStore  — Zustand store  (robotStore.ts)
 *   window.__orbitEnabled — OrbitControls.enabled  (Viewport3D TestMonitor)
 *   window.__j1Screen   — J1 joint screen {x, y}   (RobotArm useFrame)
 */
import { test, expect, type Page } from '@playwright/test'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function waitForScene(page: Page) {
  await page.goto('/')
  await expect(page.locator('canvas')).toBeVisible()
  // Wait for WebGL + Three.js init + troika font load
  await page.waitForTimeout(1200)
}

/** Read current joints array from the Zustand store */
async function getJoints(page: Page): Promise<number[]> {
  return page.evaluate(
    () => (window as { __robotStore?: { getState: () => { joints: number[] } } }).__robotStore?.getState().joints ?? [],
  )
}

/** Read OrbitControls.enabled from the TestMonitor */
async function isOrbitEnabled(page: Page): Promise<boolean> {
  return page.evaluate(
    () => (window as { __orbitEnabled?: boolean }).__orbitEnabled ?? true,
  )
}

/** Get J1 joint sphere screen coordinates */
async function getJ1Screen(page: Page): Promise<{ x: number; y: number } | null> {
  return page.evaluate(
    () => (window as { __j1Screen?: { x: number; y: number } }).__j1Screen ?? null,
  )
}

/** Wait for at least 2 rAF cycles so Three.js renders a new frame */
async function waitFrame(page: Page) {
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Robot OLP Simulator', () => {

  // ── 1. Page load ──────────────────────────────────────────────────────────
  test('page loads: canvas, 6 sliders, tab buttons visible', async ({ page }) => {
    await waitForScene(page)
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.locator('input[type="range"]')).toHaveCount(6)
    await expect(page.getByRole('button', { name: '관절 제어' })).toBeVisible()
    await expect(page.getByRole('button', { name: '프로그램' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'I/O' })).toBeVisible()
  })

  // ── 2. Slider → angle display ────────────────────────────────────────────
  test('moving J1 slider updates the angle display', async ({ page }) => {
    await waitForScene(page)

    const j1 = page.locator('input[type="range"]').nth(0)
    await j1.evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(el, '90')
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await expect(page.getByText(/90\.0°/)).toBeVisible()
  })

  // ── 3. Reset button ──────────────────────────────────────────────────────
  test('홈 위치 button resets joints to default values', async ({ page }) => {
    await waitForScene(page)

    // Move J2 away from default (20°)
    await page.locator('input[type="range"]').nth(1).evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(el, '80')
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await page.getByText('홈 위치').click()

    // J2 default is 20.0°
    await expect(page.getByText(/20\.0°/)).toBeVisible()
  })

  // ── 4. Tab switching ─────────────────────────────────────────────────────
  test('control panel tab switching works', async ({ page }) => {
    await waitForScene(page)

    // Switch to Program tab → sliders should disappear
    await page.getByRole('button', { name: '프로그램' }).click()
    await expect(page.locator('input[type="range"]').first()).not.toBeVisible()

    // Switch back → sliders reappear
    await page.getByRole('button', { name: '관절 제어' }).click()
    await expect(page.locator('input[type="range"]').first()).toBeVisible()
  })

  // ── 5. [BUG FIX] OrbitControls re-enable after joint drag ────────────────
  // Regression test for: controls staying disabled after pointer release
  test('OrbitControls.enabled returns true after drag ends (bug fix)', async ({ page }) => {
    await waitForScene(page)

    // Get J1 joint sphere position in screen space
    const j1 = await getJ1Screen(page)
    expect(j1).not.toBeNull()

    // Confirm controls start enabled
    expect(await isOrbitEnabled(page)).toBe(true)

    // Click down on J1 sphere → controls should disable
    await page.mouse.move(j1!.x, j1!.y)
    await page.mouse.down()
    await waitFrame(page)

    // Drag (movementX drives J1 rotation)
    await page.mouse.move(j1!.x + 60, j1!.y, { steps: 8 })

    // Release pointer — the bug: controls stayed false after this
    await page.mouse.up()
    await waitFrame(page)

    // Controls MUST be re-enabled (the fix registers pointerup on gl.domElement)
    expect(await isOrbitEnabled(page)).toBe(true)
  })

  // ── 6. Joint drag changes angle via store ────────────────────────────────
  test('dragging J1 sphere changes joint[0] in the store', async ({ page }) => {
    await waitForScene(page)

    const j1Screen = await getJ1Screen(page)
    expect(j1Screen).not.toBeNull()

    const before = await getJoints(page)

    await page.mouse.move(j1Screen!.x, j1Screen!.y)
    await page.mouse.down()
    await page.mouse.move(j1Screen!.x + 80, j1Screen!.y, { steps: 10 })
    await page.mouse.up()
    await waitFrame(page)

    const after = await getJoints(page)
    expect(after[0]).not.toBeCloseTo(before[0], 0)
  })

  // ── 7. Escape key deselects joint ────────────────────────────────────────
  test('Escape key clears selectedJoint and leaves controls enabled', async ({ page }) => {
    await waitForScene(page)

    const j1Screen = await getJ1Screen(page)
    if (j1Screen) {
      // Click to select joint
      await page.mouse.click(j1Screen.x, j1Screen.y)
      await waitFrame(page)
    }

    // Press Escape
    await page.keyboard.press('Escape')
    await waitFrame(page)

    // selectedJoint should be null
    const selected = await page.evaluate(
      () => (window as { __robotStore?: { getState: () => { selectedJoint: number | null } } }).__robotStore?.getState().selectedJoint,
    )
    expect(selected).toBeNull()

    // Controls must still be enabled
    expect(await isOrbitEnabled(page)).toBe(true)
  })

  // ── 8. Camera orbits after drag (no permanent controls lock) ─────────────
  test('camera can orbit after a joint drag completes', async ({ page }) => {
    await waitForScene(page)

    const j1Screen = await getJ1Screen(page)
    expect(j1Screen).not.toBeNull()

    // Joint drag
    await page.mouse.move(j1Screen!.x, j1Screen!.y)
    await page.mouse.down()
    await page.mouse.move(j1Screen!.x + 60, j1Screen!.y, { steps: 8 })
    await page.mouse.up()
    await waitFrame(page)

    // OrbitControls must be enabled before we try to orbit
    expect(await isOrbitEnabled(page)).toBe(true)

    // Take screenshot, orbit, take screenshot again — expect visual change
    const box = await page.locator('canvas').boundingBox()
    if (!box) throw new Error('no canvas')

    await waitFrame(page)
    const before = await page.screenshot({ clip: box })

    // Large orbit drag on empty area (bottom-right corner)
    const sx = box.x + box.width * 0.8
    const sy = box.y + box.height * 0.8
    await page.mouse.move(sx, sy)
    await page.mouse.down()
    await page.mouse.move(sx - 260, sy - 80, { steps: 25 })
    await page.mouse.up()

    // Wait for render loop to commit the new frame
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    )
    await page.waitForTimeout(100)

    const after = await page.screenshot({ clip: box })
    // Scene should look different after camera orbit
    expect(Buffer.compare(before, after)).not.toBe(0)
  })
})
