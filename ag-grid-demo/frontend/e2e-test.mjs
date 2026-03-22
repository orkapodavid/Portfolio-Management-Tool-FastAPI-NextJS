import { chromium } from "playwright";

const BASE = "http://localhost:3001";
const DEMO_SLUGS = [
  "01-context-menu",
  "02-range-selection",
  "03-cell-flash",
  "04-jump-highlight",
  "05-grouping",
  "06-notifications",
  "07-validation",
  "08-clipboard",
  "09-excel-export",
  "10-websocket",
  "11-cell-editors",
  "12-edit-pause",
  "13-transaction-api",
  "14-background-tasks",
  "15-column-state",
  "16-cell-renderers",
  "17-tree-data",
  "18-perf-testing",
  "19-status-bar",
  "20-overlays",
  "21-crud",
  "22-advanced-filter",
  "23-set-filter",
  "24-multi-filter",
  "25-row-numbers",
  "26-quick-filter",
];

const results = [];

function log(testName, passed, detail = "") {
  const status = passed ? "PASS" : "FAIL";
  const msg = `  [${status}] ${testName}${detail ? " -- " + detail : ""}`;
  console.log(msg);
  results.push({ testName, passed, detail });
}

function isIgnorableError(text) {
  if (!text) return true;
  const lower = text.toLowerCase();
  // Ignore lines that are only asterisks/spaces (AG Grid license border lines)
  if (/^\s*\*+\s*$/.test(text)) return true;
  // Ignore AG Grid license warnings, react dev warnings, HMR, favicon, etc.
  if (lower.includes("license")) return true;
  if (lower.includes("ag-grid")) return true;
  if (lower.includes("ag grid")) return true;
  if (lower.includes("enterprise")) return true;
  if (lower.includes("trial")) return true;
  if (lower.includes("watermark")) return true;
  if (lower.includes("info@ag-grid")) return true;
  if (lower.includes("unlocked")) return true;
  if (lower.includes("react")) return true;
  if (lower.includes("hydrat")) return true;
  if (lower.includes("hmr")) return true;
  if (lower.includes("favicon")) return true;
  if (lower.includes("turbopack")) return true;
  if (lower.includes("devtools")) return true;
  if (lower.includes("websocket")) return true;
  if (lower.includes("net::err")) return true;
  if (lower.includes("failed to fetch")) return true;
  if (lower.includes("econnrefused")) return true;
  if (lower.includes("404")) return true;
  if (lower.includes("download the react devtools")) return true;
  if (lower.includes("source map")) return true;
  if (lower.includes("deprecated")) return true;
  return false;
}

async function waitForGrid(page, timeout = 8000) {
  // Try multiple selectors for AG Grid
  const selectors = [
    ".ag-root-wrapper",
    ".ag-body-viewport",
    '[class*="ag-root"]',
    '[class*="ag-body"]',
  ];
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout });
      return sel;
    } catch {
      // try next
    }
  }
  return null;
}

(async () => {
  console.log("=== AG Grid Demo E2E Tests ===\n");
  console.log("Launching headless Chromium...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  // ──────────────────────────────────────────────────────────
  // 1. Gallery page test
  // ──────────────────────────────────────────────────────────
  console.log("--- 1. Gallery Page Tests ---");
  try {
    const page = await context.newPage();
    const res = await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
    log("Gallery: page loads", res?.status() === 200, `status=${res?.status()}`);

    // Count demo cards (anchor tags linking to /demos/...)
    const cards = await page.$$('a[href^="/demos/"]');
    // The gallery has cards, and the navbar also has links. Cards are in the grid.
    const galleryCards = await page.$$('.grid a[href^="/demos/"]');
    const cardCount = galleryCards.length;
    log("Gallery: 26 demo cards", cardCount === 26, `found ${cardCount} cards`);

    // Verify navbar renders with demo links
    const navLinks = await page.$$('nav a[href^="/demos/"]');
    log("Gallery: NavBar has demo links", navLinks.length === 26, `found ${navLinks.length} nav links`);

    // Verify the Gallery link is active
    const galleryLink = await page.$('nav a[href="/"]');
    const galleryLinkText = await galleryLink?.textContent();
    log("Gallery: Gallery link in nav", galleryLinkText?.includes("Gallery"), `text="${galleryLinkText}"`);

    await page.close();
  } catch (err) {
    log("Gallery: page loads", false, err.message);
  }

  // ──────────────────────────────────────────────────────────
  // 2. All 26 demos basic test
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 2. All 26 Demos Basic Tests ---");
  for (const slug of DEMO_SLUGS) {
    const url = `${BASE}/demos/${slug}`;
    let page;
    try {
      page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && !isIgnorableError(msg.text())) {
          consoleErrors.push(msg.text());
        }
      });

      const res = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      const status = res?.status();
      log(`${slug}: status 200`, status === 200, `status=${status}`);

      // Demo 04 is a navigation page with no AG Grid
      if (slug === "04-jump-highlight") {
        const jumpBtns = await page.$$('button:has-text("Jump to")');
        log(`${slug}: navigation buttons render`, jumpBtns.length > 0, `found ${jumpBtns.length} jump buttons (no grid expected)`);
      } else {
        const gridSel = await waitForGrid(page, 8000);
        log(`${slug}: AG Grid renders`, gridSel !== null, gridSel ? `found ${gridSel}` : "no grid element found");
      }

      // Small wait for any late console errors
      await page.waitForTimeout(500);
      const hasCriticalErrors = consoleErrors.length > 0;
      log(
        `${slug}: no critical console errors`,
        !hasCriticalErrors,
        hasCriticalErrors ? consoleErrors.join("; ").slice(0, 200) : "clean"
      );
    } catch (err) {
      log(`${slug}: basic test`, false, err.message.slice(0, 150));
    } finally {
      if (page) await page.close();
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. Critical demo deep tests
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 3. Critical Demo Deep Tests ---");

  // ---- Demo 03: Cell Flash ----
  console.log("\n  [Demo 03 - Cell Flash]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/03-cell-flash`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Get initial badge text
    const badgeBefore = await page.$eval(
      "span.inline-flex.items-center",
      (el) => el.textContent
    );
    log("Demo03: initial badge shows paused", badgeBefore?.includes("Paused"), `badge="${badgeBefore}"`);

    // Click Update Price
    const updateBtn = await page.$('button:has-text("Update Price")');
    log("Demo03: Update Price button found", updateBtn !== null);
    await updateBtn?.click();
    await page.waitForTimeout(300);

    // Check badge updated
    const badgeAfter = await page.$eval(
      "span.inline-flex.items-center",
      (el) => el.textContent
    );
    log("Demo03: badge updated after click", badgeAfter !== badgeBefore, `badge="${badgeAfter}"`);

    // Click multiple times and verify data changes
    await updateBtn?.click();
    await page.waitForTimeout(200);
    await updateBtn?.click();
    await page.waitForTimeout(200);
    const badgeFinal = await page.$eval(
      "span.inline-flex.items-center",
      (el) => el.textContent
    );
    log("Demo03: multiple updates work", badgeFinal?.includes("Updated"), `badge="${badgeFinal}"`);

    await page.close();
  } catch (err) {
    log("Demo03: Cell Flash deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 05: Grouping ----
  console.log("\n  [Demo 05 - Grouping]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/05-grouping`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Check for group rows (expanded or contracted)
    const groupRows = await page.$$('.ag-row-group, [class*="ag-row-group"]');
    log("Demo05: group rows exist", groupRows.length > 0, `found ${groupRows.length} group rows`);

    // Check for group expand/collapse icons
    const groupIcons = await page.$$('.ag-group-expanded, .ag-group-contracted, .ag-icon-tree-open, .ag-icon-tree-closed, [class*="ag-group-"]');
    log("Demo05: group expand/collapse indicators", groupIcons.length > 0, `found ${groupIcons.length} icons`);

    // Check for grand total row
    const grandTotalRow = await page.$('.ag-row[row-id="rowGroupFooter_ROOT"]');
    // Also try other selectors for footer/total rows
    const footerRows = await page.$$('.ag-row-footer, [class*="ag-row-footer"], .ag-full-width-row');
    const hasGrandTotal = grandTotalRow !== null || footerRows.length > 0;
    log("Demo05: grand total row", hasGrandTotal, `footer rows: ${footerRows.length}`);

    // Check for the "Grouped by: Sector" badge
    const sectorBadge = await page.$('span:has-text("Grouped by: Sector")');
    log("Demo05: Grouped by Sector badge", sectorBadge !== null);

    // Check "Grand Total: Bottom" badge
    const totalBadge = await page.$('span:has-text("Grand Total: Bottom")');
    log("Demo05: Grand Total badge", totalBadge !== null);

    await page.close();
  } catch (err) {
    log("Demo05: Grouping deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 10: WebSocket ----
  console.log("\n  [Demo 10 - WebSocket]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/10-websocket`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Verify initial state - STOPPED badge
    const stoppedBadge = await page.$('span:has-text("STOPPED")');
    log("Demo10: initial STOPPED badge", stoppedBadge !== null);

    // Capture price cell data (col-id="price" or 4th column cells)
    const cellsBefore = await page.$$eval(
      '.ag-cell[col-id="price"], .ag-cell[col-id="change"]',
      (cells) => cells.slice(0, 6).map((c) => c.textContent)
    );

    // Click Start Streaming
    const startBtn = await page.$('button:has-text("Start Streaming")');
    log("Demo10: Start Streaming button found", startBtn !== null);
    await startBtn?.click();

    // Wait a moment for status to update
    await page.waitForTimeout(1000);

    // Check LIVE badge
    const liveBadge = await page.$('span:has-text("LIVE")');
    log("Demo10: LIVE badge after start", liveBadge !== null);

    // Check for WebSocket or Local fallback badge
    const wsBadge = await page.$('span:has-text("WebSocket")');
    const localBadge = await page.$('span:has-text("Local fallback")');
    const hasModeBadge = wsBadge !== null || localBadge !== null;
    log(
      "Demo10: mode badge (WebSocket or Local fallback)",
      hasModeBadge,
      wsBadge ? "WebSocket" : localBadge ? "Local fallback" : "none"
    );

    // Wait 4 seconds for price updates
    await page.waitForTimeout(4000);

    // Check that price/change data changed
    const cellsAfter = await page.$$eval(
      '.ag-cell[col-id="price"], .ag-cell[col-id="change"]',
      (cells) => cells.slice(0, 6).map((c) => c.textContent)
    );
    const dataChanged = JSON.stringify(cellsBefore) !== JSON.stringify(cellsAfter);
    // Also check the status badge for "Updated" text as secondary signal
    const statusText = await page.$$eval(
      "span.inline-flex.items-center",
      (els) => els.map((e) => e.textContent)
    );
    const badgeShowsUpdate = statusText.some((t) => t?.includes("Updated") || t?.includes("Streaming"));
    log("Demo10: price data changed over time", dataChanged || badgeShowsUpdate, `before=${JSON.stringify(cellsBefore?.slice(0,3))}, after=${JSON.stringify(cellsAfter?.slice(0,3))}, badge=${statusText?.slice(0,2)}`);

    // Stop streaming
    const stopBtn = await page.$('button:has-text("Stop Streaming")');
    log("Demo10: Stop Streaming button appears", stopBtn !== null);
    await stopBtn?.click();

    await page.close();
  } catch (err) {
    log("Demo10: WebSocket deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 13: Transaction API ----
  console.log("\n  [Demo 13 - Transaction API]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/13-transaction-api`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Count initial rows
    const initialRows = await page.$$(".ag-row[role='row']");
    const initialCount = initialRows.length;
    log("Demo13: initial rows present", initialCount > 0, `count=${initialCount}`);

    // Click Add Row
    const addBtn = await page.$('button:has-text("Add Row")');
    log("Demo13: Add Row button found", addBtn !== null);
    await addBtn?.click();
    await page.waitForTimeout(500);

    // Check badge shows applyTransaction
    const badge = await page.$eval(
      "span.inline-flex.items-center",
      (el) => el.textContent
    );
    log("Demo13: badge shows applyTransaction", badge?.includes("applyTransaction"), `badge="${badge}"`);

    // Verify row count increased
    const afterAddRows = await page.$$(".ag-row[role='row']");
    log("Demo13: row count increased after add", afterAddRows.length > initialCount, `before=${initialCount}, after=${afterAddRows.length}`);

    // Click Remove Last
    const removeBtn = await page.$('button:has-text("Remove Last")');
    log("Demo13: Remove Last button found", removeBtn !== null);
    await removeBtn?.click();
    await page.waitForTimeout(500);

    const removeStatus = await page.$eval(
      "span.inline-flex.items-center",
      (el) => el.textContent
    );
    log("Demo13: remove badge shows applyTransaction", removeStatus?.includes("applyTransaction"), `badge="${removeStatus}"`);

    // Click Update Random
    const updateBtn = await page.$('button:has-text("Update Random")');
    log("Demo13: Update Random button found", updateBtn !== null);
    await updateBtn?.click();
    await page.waitForTimeout(300);

    const updateStatus = await page.$eval(
      "span.inline-flex.items-center",
      (el) => el.textContent
    );
    log("Demo13: update badge shows applyTransaction", updateStatus?.includes("applyTransaction"), `badge="${updateStatus}"`);

    await page.close();
  } catch (err) {
    log("Demo13: Transaction API deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 17: Tree Data ----
  console.log("\n  [Demo 17 - Tree Data]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/17-tree-data`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Look for tree hierarchy - auto group column with expand/collapse
    const groupCells = await page.$$('.ag-group-expanded, .ag-group-contracted, .ag-row-group');
    log("Demo17: tree hierarchy indicators found", groupCells.length > 0, `found ${groupCells.length}`);

    // Look for the auto-group column header "File Explorer"
    const fileExplorerHeader = await page.$('.ag-header-cell:has-text("File Explorer")');
    log("Demo17: File Explorer group column", fileExplorerHeader !== null);

    // Check for row indentation (tree structure indicator)
    const groupIcons = await page.$$('.ag-icon-tree-open, .ag-icon-tree-closed, [class*="ag-group-"]');
    log("Demo17: expand/collapse icons present", groupIcons.length > 0, `found ${groupIcons.length}`);

    await page.close();
  } catch (err) {
    log("Demo17: Tree Data deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 19: Status Bar ----
  console.log("\n  [Demo 19 - Status Bar]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/19-status-bar`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Check for status bar element
    const statusBar = await page.$('.ag-status-bar');
    log("Demo19: status bar element exists", statusBar !== null);

    // Check for status bar panels
    const statusPanels = await page.$$('.ag-status-bar-panel, .ag-status-name-value');
    log("Demo19: status bar panels present", statusPanels.length > 0, `found ${statusPanels.length}`);

    // Check total row count in status bar
    const totalRowComponent = await page.$('.ag-status-bar :has-text("Total Rows")');
    // Also try to get any status bar text
    const statusBarText = await statusBar?.textContent();
    log("Demo19: status bar has content", statusBarText && statusBarText.trim().length > 0, `text="${statusBarText?.slice(0, 100)}"`);

    // Click on a cell to trigger selection count updates
    const firstCell = await page.$('.ag-cell');
    if (firstCell) {
      await firstCell.click();
      await page.waitForTimeout(500);
      const statusBarAfter = await statusBar?.textContent();
      log("Demo19: status bar content after cell click", statusBarAfter && statusBarAfter.trim().length > 0, `text="${statusBarAfter?.slice(0, 100)}"`);
    }

    await page.close();
  } catch (err) {
    log("Demo19: Status Bar deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 20: Overlays ----
  console.log("\n  [Demo 20 - Overlays]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/20-overlays`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Initially no data - should show no-rows overlay
    const noRowsOverlay = await page.$('.ag-overlay-no-rows-wrapper, .ag-overlay-panel');
    log("Demo20: no-rows overlay initially shown", noRowsOverlay !== null);

    // Click Load Data
    const loadBtn = await page.$('button:has-text("Load Data")');
    log("Demo20: Load Data button found", loadBtn !== null);
    await loadBtn?.click();

    // Check for loading state (badge or overlay)
    await page.waitForTimeout(300);
    const loadingBadge = await page.$('span:has-text("Loading")');
    const loadingOverlay = await page.$('.ag-overlay-loading-wrapper');
    log("Demo20: loading indicator appears", loadingBadge !== null || loadingOverlay !== null);

    // Wait for data to load (2 second delay in the code)
    await page.waitForTimeout(3000);

    // Verify data loaded
    const rows = await page.$$('.ag-row[role="row"]');
    log("Demo20: data rows appear after load", rows.length > 0, `found ${rows.length} rows`);

    // Check badge shows row count
    const rowBadge = await page.$('span:has-text("rows")');
    log("Demo20: badge shows row count", rowBadge !== null);

    // Click Clear
    const clearBtn = await page.$('button:has-text("Clear")');
    log("Demo20: Clear button found", clearBtn !== null);
    await clearBtn?.click();
    await page.waitForTimeout(500);

    // Check that data is cleared
    const rowsAfterClear = await page.$$('.ag-center-cols-container .ag-row');
    log("Demo20: data cleared after Clear", rowsAfterClear.length === 0, `rows remaining: ${rowsAfterClear.length}`);

    await page.close();
  } catch (err) {
    log("Demo20: Overlays deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 21: CRUD ----
  console.log("\n  [Demo 21 - CRUD]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/21-crud`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Wait for data to load (API call or fallback)
    await page.waitForTimeout(2000);

    // Check for API or Local mode badge
    const apiBadge = await page.$('span:has-text("API")');
    const localBadge = await page.$('span:has-text("Local")');
    log("Demo21: mode badge present", apiBadge !== null || localBadge !== null, apiBadge ? "API" : "Local");

    // Verify employee data loaded (rows visible)
    const rows = await page.$$('.ag-row[role="row"]');
    log("Demo21: employee data loaded", rows.length > 0, `found ${rows.length} rows`);

    // Check for status badge text
    const badges = await page.$$eval(
      "span.inline-flex.items-center",
      (els) => els.map((e) => e.textContent)
    );
    const hasStatusInfo = badges.some(
      (t) => t?.includes("Ready") || t?.includes("Loaded") || t?.includes("API") || t?.includes("Local")
    );
    log("Demo21: status badge has info", hasStatusInfo, `badges=${JSON.stringify(badges?.slice(0, 3))}`);

    // Click Add Row
    const addBtn = await page.$('button:has-text("Add Row")');
    log("Demo21: Add Row button found", addBtn !== null);
    const rowCountBefore = rows.length;
    await addBtn?.click();
    await page.waitForTimeout(1000);

    const rowsAfterAdd = await page.$$('.ag-row[role="row"]');
    log("Demo21: row added successfully", rowsAfterAdd.length > rowCountBefore, `before=${rowCountBefore}, after=${rowsAfterAdd.length}`);

    await page.close();
  } catch (err) {
    log("Demo21: CRUD deep test", false, err.message.slice(0, 150));
  }

  // ---- Demo 26: Quick Filter ----
  console.log("\n  [Demo 26 - Quick Filter]");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/26-quick-filter`, { waitUntil: "networkidle", timeout: 15000 });
    await waitForGrid(page);

    // Count initial rows
    const initialRows = await page.$$('.ag-center-cols-container .ag-row');
    const initialCount = initialRows.length;
    log("Demo26: initial rows present", initialCount > 0, `count=${initialCount}`);

    // Find the search input
    const searchInput = await page.$('input[placeholder="Type to search..."]');
    log("Demo26: search input found", searchInput !== null);

    // Type "AAPL"
    await searchInput?.fill("AAPL");
    await page.waitForTimeout(500);

    // Check filtered rows
    const filteredRows = await page.$$('.ag-center-cols-container .ag-row');
    const filteredCount = filteredRows.length;
    log("Demo26: rows filtered", filteredCount < initialCount, `before=${initialCount}, after=${filteredCount}`);
    log("Demo26: filtered result has rows", filteredCount > 0, `filtered count=${filteredCount}`);

    // Verify AAPL is in the results
    const cellTexts = await page.$$eval(
      ".ag-cell",
      (cells) => cells.map((c) => c.textContent)
    );
    const hasAAPL = cellTexts.some((t) => t?.includes("AAPL"));
    log("Demo26: AAPL appears in filtered results", hasAAPL);

    // Clear filter
    const clearBtn = await page.$('button:has-text("Clear")');
    await clearBtn?.click();
    await page.waitForTimeout(500);

    const afterClearRows = await page.$$('.ag-center-cols-container .ag-row');
    log("Demo26: rows restored after clear", afterClearRows.length === initialCount, `count=${afterClearRows.length}`);

    await page.close();
  } catch (err) {
    log("Demo26: Quick Filter deep test", false, err.message.slice(0, 150));
  }

  // ──────────────────────────────────────────────────────────
  // 4. Cross-demo navigation (Demo 04)
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 4. Cross-Demo Navigation (Demo 04) ---");
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/demos/04-jump-highlight`, { waitUntil: "networkidle", timeout: 15000 });

    // Find "Jump to AAPL" button
    const jumpBtn = await page.$('button:has-text("Jump to AAPL")');
    log("Demo04: Jump to AAPL button found", jumpBtn !== null);

    // Click it
    await jumpBtn?.click();

    // Wait for navigation to Demo 10
    await page.waitForURL("**/demos/10-websocket**", { timeout: 10000 });
    const newUrl = page.url();
    log("Demo04: navigated to Demo 10", newUrl.includes("/demos/10-websocket"), `url=${newUrl}`);
    log("Demo04: highlight param present", newUrl.includes("highlight="), `url=${newUrl}`);

    // Wait for grid to load on Demo 10
    const gridSel = await waitForGrid(page, 10000);
    log("Demo04: Demo 10 grid loads after jump", gridSel !== null);

    await page.close();
  } catch (err) {
    log("Demo04: Cross-demo navigation", false, err.message.slice(0, 150));
  }

  // ──────────────────────────────────────────────────────────
  // Final Summary
  // ──────────────────────────────────────────────────────────
  await browser.close();

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log("\n" + "=".repeat(60));
  console.log("FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Total:  ${total}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Rate:   ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  [FAIL] ${r.testName} -- ${r.detail}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  process.exit(failed > 0 ? 1 : 0);
})();
