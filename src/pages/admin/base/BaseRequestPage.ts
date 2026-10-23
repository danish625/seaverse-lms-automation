import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../base/BasePage';

export interface SearchFlowOptions {
  field?: 'name' | 'email' | number;
  query?: string;
  rowIndex?: number;
  expectEmpty?: boolean;
}

export class BaseRequestPage extends BasePage {
  readonly pageHeading: Locator;
  readonly newRequestsTab: Locator;
  readonly historyTab: Locator;
  readonly pendingRequestsBadge: Locator;

  // Table & Common Column Headers
  readonly tableRows: Locator;
  readonly nameColumnHeader: Locator;
  readonly requestDateColumnHeader: Locator;
  readonly decisionDateColumnHeader: Locator;
  readonly statusColumnHeader: Locator;

  // History Sub-Tabs & Badges
  readonly approvedSubTab: Locator;
  readonly rejectedSubTab: Locator;
  readonly historyTotalBadge: Locator;
  readonly clearAllButton: Locator;

  constructor(page: Page, headingName: string) {
    super(page);

    this.pageHeading = page.getByRole('heading', { name: headingName });
    this.newRequestsTab = page.getByRole('tab', { name: 'New Requests' }).or(page.getByText('New Requests'));
    this.historyTab = page.getByRole('tab', { name: 'History' }).or(page.getByText('History'));
    this.pendingRequestsBadge = page.getByText(/Pending Requests/i);

    // Shared Search input assigned to BasePage's searchInput property:
    this.searchInput = page.getByPlaceholder('Search by User Name or Email ID');

    // Table rows (matches tbody tr or grid row, excluding empty state placeholder rows)
    this.tableRows = page.locator('tbody tr:not(:has-text("No Data Found")):not(:has-text("No records found")), div.grid[role="row"]:not(:has-text("No Data Found")):not(:has-text("No records found"))');

    // Common Column Headers (Pure getByRole, no .first() or .or())
    this.nameColumnHeader = page.getByRole('columnheader', { name: 'Name', exact: true });
    this.requestDateColumnHeader = page.getByRole('columnheader', { name: /Request Date/i });
    this.decisionDateColumnHeader = page.getByRole('columnheader', { name: 'Decision Date', exact: true });
    this.statusColumnHeader = page.getByRole('columnheader', { name: 'Status', exact: true });

    // History Sub-Tabs & Badges
    this.approvedSubTab = page.getByRole('button', { name: 'Approved' });
    this.rejectedSubTab = page.getByRole('button', { name: 'Rejected' });
    this.historyTotalBadge = page.getByText(/Total\s*:\s*\d+/i);
    this.clearAllButton = page.getByRole('button', { name: 'Clear All' });
  }

  // --- Search Alias (Keeps 100% backward compatibility with existing tests) ---
  async searchRequest(query: string) {
    await this.search(query);
  }

  /**
   * Universal dynamic data extractor for search parameters.
   * Supports:
   * - 'name': Extracts the user name from any record
   * - 'email': Extracts email address (contains '@') from any record
   * - number: Extracts text from any column index (for future modules e.g. Role, Course, Department)
   * - rowIndex: target row (picks a random row if omitted)
   */
  async extractSearchTerm(field: 'name' | 'email' | number = 'name', rowIndex?: number): Promise<string> {
    const count = await this.getPendingRequestsCount();
    if (count === 0) return '';

    const targetIndex = rowIndex !== undefined ? rowIndex : Math.floor(Math.random() * count);
    const row = this.tableRows.nth(targetIndex);

    if (typeof field === 'number') {
      const cell = row.locator('td, div[role="cell"]').nth(field);
      const text = await cell.innerText();
      return text.split('\n')[0].trim();
    }

    if (field === 'email') {
      const emailLocator = row.locator('text=@');
      if (await emailLocator.count() > 0) {
        const emailText = await emailLocator.first().innerText();
        return emailText.trim();
      }
    }

    // Default 'name': extracts name portion from primary cell
    const firstCellText = await row.locator('td, div[role="cell"]').first().innerText();
    return firstCellText.split('\n')[0].split(' ')[0].trim();
  }

  /**
   * Universal search validation cycle:
   * Executes search, verifies filtered records or empty state, clears search, and validates restoration.
   */
  async verifySearchFlow(options: SearchFlowOptions = {}): Promise<void> {
    const initialCount = await this.getPendingRequestsCount();

    if (options.expectEmpty) {
      // Non-existing data flow
      const query = options.query || 'NonExistent_XYZ_99999';
      await this.search(query);

      // Wait for empty state message to be visible (waits for skeleton loaders to resolve)
      await expect(this.page.getByText(/No Data Found|No records found/i)).toBeVisible();
      const filteredCount = await this.getPendingRequestsCount();
      expect(filteredCount).toBe(0);
    } else {
      // Dynamic matching data flow (by name, email, or column index)
      const query = options.query || await this.extractSearchTerm(options.field || 'name', options.rowIndex);
      if (!query) return;

      await this.search(query);
      await this.page.waitForTimeout(500);

      const filteredCount = await this.getPendingRequestsCount();
      expect(filteredCount).toBeGreaterThan(0);
      await expect(this.tableRows.first()).toContainText(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    }

    // Restore state
    await this.clearSearch();
    await this.page.waitForTimeout(500);
    const restoredCount = await this.getPendingRequestsCount();
    expect(restoredCount).toBe(initialCount);
  }

  // --- Back Navigation (Defaults to /.*employee-management/i) ---
  override async clickBack(expectedUrlPattern: RegExp = /.*employee-management/i) {
    await super.clickBack(expectedUrlPattern);
  }

  // --- Queue State & Row Actions ---
  getRowByEmail(email: string): Locator {
    return this.tableRows.filter({ hasText: email });
  }

  /**
   * Fast queue presence checker (default: 3 seconds).
   * Auto-waits up to timeoutMs for the backend API to render table rows.
   * - Returns true if at least 1 row renders.
   * - Returns false if 0 rows appear (resolves in 3s instead of hanging 30s).
   */
  async hasPendingRequests(timeoutMs = 3000): Promise<boolean> {
    try {
      await this.tableRows.first().waitFor({ state: 'visible', timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  async getPendingRequestsCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Safe Page Pending Count reader (default: 3 seconds).
   * - Reads number if badge exists.
   * - Returns 0 if badge is not present on empty queue.
   */
  async getPagePendingCount(timeoutMs = 3000): Promise<number> {
    try {
      await this.pendingRequestsBadge.waitFor({ state: 'visible', timeout: timeoutMs });
      const text = await this.pendingRequestsBadge.innerText();
      const match = text.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    } catch {
      return 0;
    }
  }

  async clickSortByRequestDate() {
    await this.requestDateColumnHeader.click();
  }

  async getAllRequestDates(): Promise<string[]> {
    return await this.tableRows.locator('text=/\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}/').allInnerTexts();
  }

  // --- Shared History Tab Actions ---
  async clickHistoryTab() {
    await this.historyTab.click();
    await this.page.waitForURL(/.*tab=history/i);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clickApprovedSubTab() {
    await this.approvedSubTab.click();
    await this.page.waitForURL(/.*historyTab=approved/i);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clickRejectedSubTab() {
    await this.rejectedSubTab.click();
    await this.page.waitForURL(/.*historyTab=rejected/i);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getHistoryTotalCount(): Promise<number> {
    await this.historyTotalBadge.waitFor({ state: 'visible' });
    const text = await this.historyTotalBadge.innerText();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // --- Dynamic Column Cell Getters (Pure getByRole, 100% Header-Aligned) ---

  /**
   * Resolves a cell within a row dynamically by matching its column header name.
   * Pure role-based (columnheader + cell) and resilient to column order changes.
   */
  async getCellByHeader(row: Locator, headerPattern: string | RegExp): Promise<Locator> {
    const headers = this.page.getByRole('columnheader');
    const count = await headers.count();
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).innerText();
      if (typeof headerPattern === 'string' ? text.includes(headerPattern) : headerPattern.test(text)) {
        return row.getByRole('cell').nth(i);
      }
    }
    return row.getByRole('cell').first();
  }

  async getNameCell(row: Locator): Promise<Locator> {
    return await this.getCellByHeader(row, /^Name$/i);
  }

  async getRequestDateCell(row: Locator): Promise<Locator> {
    return await this.getCellByHeader(row, /Request Date/i);
  }

  async getDecisionDateCell(row: Locator): Promise<Locator> {
    return await this.getCellByHeader(row, /Decision Date/i);
  }

  async getStatusCell(row: Locator): Promise<Locator> {
    return await this.getCellByHeader(row, /^Status$/i);
  }
}
