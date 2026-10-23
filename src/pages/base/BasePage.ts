import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly backButton: Locator;
  searchInput: Locator;

  constructor(page: Page, defaultSearchLocator?: Locator) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: /Back/i }).or(page.getByText('Back'));
    this.searchInput = defaultSearchLocator || page.locator('input[type="search"], input[placeholder*="Search"]');
  }

  // --- Universal Back Button Navigation ---
  async clickBack(expectedUrlPattern?: RegExp) {
    await this.backButton.click();
    if (expectedUrlPattern) {
      await this.page.waitForURL(expectedUrlPattern);
    }
  }

  // --- Universal Main Table Search Actions ---
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.keyboard.press('Enter');
  }

  // --- Universal Toast / Notification Helper ---
  getNotificationMessage(expectedText: string | RegExp): Locator {
    return this.page.locator('p', { hasText: expectedText });
  }

  // --- Universal Infinite Scroll / Lazy-Loading Validation Helper ---

  /**
   * Universal Infinite Scroll Batch Validator
   * 
   * Verifies that scrolling triggers lazy-loading and increments item count
   * for a controlled number of batches (default: 3 batches), preventing 
   * timeouts or memory crashes on massive datasets.
   *
   * @param itemsLocator - Locator matching repeating items (table rows, dropdown options, filter items)
   * @param maxBatches   - Number of batches to load and verify (default: 3)
   * @param waitTimeout  - Max time to wait for next batch to render (default: 5000ms)
   * @returns Object with initialCount, finalCount, and batchesLoaded
   */
  async verifyInfiniteScrollBatches(
    itemsLocator: Locator,
    maxBatches = 3,
    waitTimeout = 5000
  ): Promise<{ initialCount: number; finalCount: number; batchesLoaded: number }> {
    const initialCount = await itemsLocator.count();
    let previousCount = initialCount;
    let batchesLoaded = 0;

    for (let batch = 1; batch <= maxBatches; batch++) {
      if (previousCount === 0) break;

      // 1. Scroll the current last visible item into view to trigger lazy loading
      await itemsLocator.last().scrollIntoViewIfNeeded();

      // 2. Auto-wait for the count to increase via network response
      try {
        await expect(async () => {
          const currentCount = await itemsLocator.count();
          expect(currentCount).toBeGreaterThan(previousCount);
        }).toPass({ timeout: waitTimeout });

        previousCount = await itemsLocator.count();
        batchesLoaded++;
      } catch {
        // Reached end of available data in small lists
        break;
      }
    }

    return {
      initialCount,
      finalCount: previousCount,
      batchesLoaded,
    };
  }
}
