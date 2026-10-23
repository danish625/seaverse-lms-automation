import { Page, Locator } from '@playwright/test';
import { BaseRequestPage } from './base/BaseRequestPage';

export class DeleteRequestsPage extends BaseRequestPage {
  // Unique Delete Columns
  readonly reasonColumnHeader: Locator;
  readonly designationColumnHeader: Locator;

  // Approve Account Deletion Modal Locators
  readonly approveModalTitle: Locator;
  readonly approveModalCancelButton: Locator;
  readonly approveModalConfirmButton: Locator;

  // Reject User Confirmation Modal Locators
  readonly rejectModalTitle: Locator;
  readonly rejectModalCancelButton: Locator;
  readonly rejectModalConfirmButton: Locator;

  // Clear All Modal Locators
  readonly clearAllModalTitle: Locator;
  readonly clearAllModalCancelButton: Locator;
  readonly clearAllModalConfirmButton: Locator;

  constructor(page: Page) {
    super(page, 'Delete Requests'); // Inherits shared tabs, search, counters, and table

    // Unique Column Headers
    this.reasonColumnHeader = page.getByRole('columnheader', { name: /Reason For Deletion/i });
    this.designationColumnHeader = page.getByRole('columnheader', { name: 'Designation', exact: true });

    // Approve Deletion Modal
    this.approveModalTitle = page.getByRole('heading', { name: 'Approve Account Deletion', exact: true });
    this.approveModalCancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.approveModalConfirmButton = page.getByRole('button', { name: 'Approve & Delete', exact: true });

    // Reject User Modal
    this.rejectModalTitle = page.getByRole('heading', { name: 'Reject User', exact: true });
    this.rejectModalCancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.rejectModalConfirmButton = page.getByRole('button', { name: 'Reject User', exact: true });

    // Clear All Confirmation Modal Controls
    this.clearAllModalTitle = page.getByRole('heading', { name: 'Remove All Rejected Requests', exact: true });
    this.clearAllModalCancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.clearAllModalConfirmButton = page.getByRole('button', { name: 'Remove All', exact: true });
  }

  // --- Approve Modal Actions ---
  async openApproveModalForFirstRow() {
    await this.tableRows.first().getByRole('button', { name: 'Approve' }).click();
    await this.approveModalTitle.waitFor({ state: 'visible' });
    await this.approveModalConfirmButton.waitFor({ state: 'visible' });
  }

  async clickApproveModalCancel() {
    await this.approveModalCancelButton.click();
  }

  async clickApproveModalConfirm() {
    await this.approveModalConfirmButton.waitFor({ state: 'visible' });
    await this.approveModalConfirmButton.click({ force: true });
  }

  // --- Reject Modal Actions ---
  async openRejectModalForFirstRow() {
    await this.tableRows.first().getByRole('button', { name: 'Reject' }).click();
    await this.rejectModalTitle.waitFor({ state: 'visible' });
    await this.rejectModalConfirmButton.waitFor({ state: 'visible' });
  }

  async clickRejectModalCancel() {
    await this.rejectModalCancelButton.click();
  }

  async clickRejectModalConfirm() {
    await this.rejectModalConfirmButton.waitFor({ state: 'visible' });
    await this.rejectModalConfirmButton.click({ force: true });
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
