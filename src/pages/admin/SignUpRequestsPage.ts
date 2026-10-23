import { Page, Locator } from '@playwright/test';
import { BaseRequestPage } from './base/BaseRequestPage';

export class SignUpRequestsPage extends BaseRequestPage {
  // Unique Column
  readonly emailColumnHeader: Locator;

  // Complete Profile Details Modal Locators
  readonly modalTitle: Locator;
  readonly modalCancelButton: Locator;
  readonly modalAcceptRequestButton: Locator;

  // Reject User Confirmation Modal Locators
  readonly rejectModalTitle: Locator;
  readonly rejectModalCancelButton: Locator;
  readonly rejectModalConfirmButton: Locator;

  // Clear All Modal Locators
  readonly clearAllModalTitle: Locator;
  readonly clearAllModalCancelButton: Locator;
  readonly clearAllModalConfirmButton: Locator;

  constructor(page: Page) {
    super(page, 'Sign Up Requests'); // Inherits shared tabs, search, counters, and table

    this.emailColumnHeader = page.getByRole('columnheader', { name: 'Email', exact: true });

    // Complete Profile Modal Controls
    this.modalTitle = page.getByRole('heading', { name: 'Complete Profile Details' });
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.modalAcceptRequestButton = page.getByRole('button', { name: 'Accept Request' });

    const confirmModal = page.getByRole('alertdialog').or(page.getByRole('dialog'));

    // Reject User Modal Controls (Alertdialog / Dialog-scoped)
    this.rejectModalTitle = page.getByRole('heading', { name: 'Reject User', exact: true });
    this.rejectModalCancelButton = confirmModal.getByRole('button', { name: 'Cancel', exact: true });
    this.rejectModalConfirmButton = confirmModal.getByRole('button', { name: 'Reject User', exact: true });

    // Clear All Confirmation Modal Controls (Alertdialog / Dialog-scoped)
    this.clearAllModalTitle = page.getByRole('heading', { name: 'Remove All Rejected Requests', exact: true });
    this.clearAllModalCancelButton = confirmModal.getByRole('button', { name: 'Cancel', exact: true });
    this.clearAllModalConfirmButton = confirmModal.getByRole('button', { name: 'Remove All', exact: true });
  }

  // --- Row-Level Dynamic Actions (By Specific Email) ---
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
