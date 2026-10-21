import { Page, Locator } from '@playwright/test';

export class SignUpRequestsPage {
  readonly page: Page;

  // Header & Controls
  readonly pageHeading: Locator;
  readonly backButton: Locator;
  readonly newRequestsTab: Locator;
  readonly historyTab: Locator;
  readonly searchInput: Locator;
  readonly pendingRequestsBadge: Locator;

  // Table Locators
  readonly tableRows: Locator;
  readonly nameColumnHeader: Locator;
  readonly emailColumnHeader: Locator;
  readonly requestDateColumnHeader: Locator;

  // Complete Profile Details Modal Locators
  readonly modalTitle: Locator;
  readonly modalCancelButton: Locator;
  readonly modalAcceptRequestButton: Locator;

  // Reject User Confirmation Modal Locators
  readonly rejectModalTitle: Locator;
  readonly rejectModalCancelButton: Locator;
  readonly rejectModalConfirmButton: Locator;

  // History Sub-Tabs
  readonly approvedSubTab: Locator;
  readonly rejectedSubTab: Locator;

  // History Specific Columns
  readonly decisionDateColumnHeader: Locator;
  readonly statusColumnHeader: Locator;

  // History Controls & Badges
  readonly clearAllButton: Locator;
  readonly historyTotalBadge: Locator;

  // Remove All Rejected Requests Modal Locators
  readonly clearAllModalTitle: Locator;
  readonly clearAllModalCancelButton: Locator;
  readonly clearAllModalConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', { name: 'Sign Up Requests' });
    this.backButton = page.getByRole('button', { name: /Back/i }).or(page.getByText('Back'));
    this.newRequestsTab = page.getByRole('tab', { name: 'New Requests' }).or(page.getByText('New Requests'));
    this.historyTab = page.getByRole('tab', { name: 'History' }).or(page.getByText('History'));
    this.searchInput = page.getByPlaceholder('Search by User Name or Email ID');
    this.pendingRequestsBadge = page.getByText(/Pending Requests/i);

    // Matches any table rows or grid rows in the list
    this.tableRows = page.locator('tbody tr, div.grid[role="row"]');

    // Column Headers (Pure getByRole, no .first() or .or())
    this.nameColumnHeader = page.getByRole('columnheader', { name: 'Name', exact: true });
    this.emailColumnHeader = page.getByRole('columnheader', { name: 'Email', exact: true });
    this.requestDateColumnHeader = page.getByRole('columnheader', { name: /Request Date/i });

    // Complete Profile Modal Controls
    this.modalTitle = page.getByRole('heading', { name: 'Complete Profile Details' });
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.modalAcceptRequestButton = page.getByRole('button', { name: 'Accept Request' });

    // Reject User Modal Controls
    this.rejectModalTitle = page.getByRole('heading', { name: 'Reject User', exact: true });
    this.rejectModalCancelButton = page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true });
    this.rejectModalConfirmButton = page.getByRole('dialog').getByRole('button', { name: 'Reject User', exact: true });

    // History Sub-Tabs
    this.approvedSubTab = page.getByRole('tab', { name: 'Approved' });
    this.rejectedSubTab = page.getByRole('tab', { name: 'Rejected' });

    // History Specific Columns
    this.decisionDateColumnHeader = page.getByRole('columnheader', { name: 'Decision Date', exact: true });
    this.statusColumnHeader = page.getByRole('columnheader', { name: 'Status', exact: true });

    // History Controls & Badges
    this.clearAllButton = page.getByRole('button', { name: 'Clear All' });
    this.historyTotalBadge = page.getByText(/Total:\s*\d+/i);

    // Clear All Confirmation Modal Controls
    this.clearAllModalTitle = page.getByRole('heading', { name: 'Remove All Rejected Requests', exact: true });
    this.clearAllModalCancelButton = page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true });
    this.clearAllModalConfirmButton = page.getByRole('dialog').getByRole('button', { name: 'Remove All', exact: true });
  }

  // --- Search Actions ---
  async searchRequest(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.keyboard.press('Enter');
  }

  // --- Row-Level Dynamic Actions (By Specific Email) ---
  getRowByEmail(email: string): Locator {
    return this.tableRows.filter({ hasText: email });
  }

  async approveUserByEmail(email: string) {
    await this.searchRequest(email);
    const userRow = this.getRowByEmail(email);
    await userRow.getByRole('button', { name: 'Approve' }).click();
  }

  async rejectUserByEmail(email: string) {
    await this.searchRequest(email);
    const userRow = this.getRowByEmail(email);
    await userRow.getByRole('button', { name: 'Reject' }).click();
  }

  // --- Actions: Handle Available Requests in Queue ---
  async getPendingRequestsCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async approveAnyAvailableRequest(): Promise<{ email: string } | null> {
    const count = await this.getPendingRequestsCount();
    if (count === 0) {
      return null;
    }

    const firstRow = this.tableRows.first();
    const emailText = await firstRow.locator('text=@').innerText();
    await firstRow.getByRole('button', { name: 'Approve' }).click();
    return { email: emailText };
  }

  async rejectAnyAvailableRequest(): Promise<{ email: string } | null> {
    const count = await this.getPendingRequestsCount();
    if (count === 0) {
      return null;
    }

    const firstRow = this.tableRows.first();
    const emailText = await firstRow.locator('text=@').innerText();
    await firstRow.getByRole('button', { name: 'Reject' }).click();
    return { email: emailText };
  }

  async clickBack() {
    await this.backButton.click();
    await this.page.waitForURL(/.*employee-management/i);
  }

  // --- Sorting & Count Helpers ---
  async clickSortByRequestDate() {
    await this.requestDateColumnHeader.click();
  }

  async getAllRequestDates(): Promise<string[]> {
    return await this.tableRows.locator('text=/\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}/').allInnerTexts();
  }

  async getPagePendingCount(): Promise<number> {
    const text = await this.pendingRequestsBadge.innerText();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // --- Complete Profile Modal Actions ---
  async openApproveModalForFirstRow() {
    await this.tableRows.first().getByRole('button', { name: 'Approve' }).click();
    await this.modalTitle.waitFor({ state: 'visible' });
  }

  async clickModalAcceptRequest() {
    await this.modalAcceptRequestButton.click();
  }

  async clickModalCancel() {
    await this.modalCancelButton.click();
  }

  // --- Toast / Notification Helper ---
  getNotificationMessage(expectedText: string): Locator {
    return this.page.locator('p', { hasText: expectedText });
  }

  // --- Reject User Modal Actions ---
  async openRejectModalForFirstRow() {
    await this.tableRows.first().getByRole('button', { name: 'Reject' }).click();
    await this.rejectModalTitle.waitFor({ state: 'visible' });
  }

  async clickRejectModalConfirm() {
    await this.rejectModalConfirmButton.click();
  }

  async clickRejectModalCancel() {
    await this.rejectModalCancelButton.click();
  }

  // --- History Tab Actions ---
  async clickHistoryTab() {
    await this.historyTab.click();
    await this.page.waitForURL(/.*tab=history/i);
  }

  async clickApprovedSubTab() {
    await this.approvedSubTab.click();
    await this.page.waitForURL(/.*historyTab=approved/i);
  }

  async clickRejectedSubTab() {
    await this.rejectedSubTab.click();
    await this.page.waitForURL(/.*historyTab=rejected/i);
  }

  async getHistoryTotalCount(): Promise<number> {
    await this.historyTotalBadge.waitFor({ state: 'visible' });
    const text = await this.historyTotalBadge.innerText();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // --- Clear All Rejected Modal Actions ---
  async openClearAllModal() {
    await this.clearAllButton.click();
    await this.clearAllModalTitle.waitFor({ state: 'visible' });
  }

  async clickClearAllModalCancel() {
    await this.clearAllModalCancelButton.click();
  }

  async clickClearAllModalConfirm() {
    await this.clearAllModalConfirmButton.click();
  }
}
