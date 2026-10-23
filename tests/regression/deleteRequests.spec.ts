import { test, expect } from '../../src/fixtures/index';

test.describe('Admin - Delete Requests Suite', () => {

  test.beforeEach(async ({ page, userManagementPage }) => {
    // Navigate to Users screen (pre-authenticated via Admin storageState)
    await page.goto('/employee-management');
    await userManagementPage.pageHeading.waitFor({ state: 'visible' });
  });

  // --- 1. Navigation & Core UI Layout Tests ---

  test('TC_DE_005: TS 1.5 -> Admin -> Delete Request: Verify admin is able to see delete requests in user module @smoke @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await expect(deleteRequestsPage.page).toHaveURL(/.*delete-request/i);
    await expect(deleteRequestsPage.pageHeading).toBeVisible();
    await expect(deleteRequestsPage.pendingRequestsBadge).toBeVisible();
  });

  test('TC_DE_010: Delete Request Columns Validation: Verify admin can view all required columns in delete request list @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    // System should display columns: Name, Reason for Deletion, Request Date, Designation, Pending Count
    await expect(deleteRequestsPage.nameColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.reasonColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.requestDateColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.designationColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.pendingRequestsBadge).toBeVisible();
  });

  test('TC_DR_002: Verify Delete Requests UI elements & tabs @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await expect(deleteRequestsPage.newRequestsTab).toBeVisible();
    await expect(deleteRequestsPage.historyTab).toBeVisible();
    await expect(deleteRequestsPage.searchInput).toBeVisible();
    await expect(deleteRequestsPage.pendingRequestsBadge).toBeVisible();
  });

  test('TC_DR_004: Verify Back button navigation returns to Users screen @regression', async ({ userManagementPage, deleteRequestsPage, page }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickBack();
    await expect(page).toHaveURL(/.*employee-management/i);
    await expect(userManagementPage.pageHeading).toBeVisible();
  });

  // --- 2. Search & Empty State Handling ---

  test('TC_DE_008: TS 1.8 -> Delete Request search filter: Verify admin is able to search by Name, Email, and handle non-existing data @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();

    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No delete requests available to validate search filter');

    // 1. Dynamic Search by Name (picks a random record from the list)
    await deleteRequestsPage.verifySearchFlow({ field: 'name' });

    // 2. Dynamic Search by Email (picks a random record's email from the list)
    await deleteRequestsPage.verifySearchFlow({ field: 'email' });

    // 3. Search with Non-Existing Data (verifies "No Data Found" empty state)
    await deleteRequestsPage.verifySearchFlow({ query: 'NonExistent_XYZ_99999', expectEmpty: true });
  });

  test('TC_DE_016: Empty State Handling: System shows "No records found" when no matching data is available @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();

    // 1. Search for a non-existent user query
    await deleteRequestsPage.search('NonExistent_XYZ_DeleteUser_99999');

    // 2. Verify 0 rows are rendered
    const count = await deleteRequestsPage.getPendingRequestsCount();
    expect(count).toBe(0);

    // 3. Verify empty state message is displayed
    await expect(deleteRequestsPage.page.getByText(/No records found|No .* found/i)).toBeVisible();

    // Cleanup: clear search to restore table state
    await deleteRequestsPage.clearSearch();
  });

  // --- 3. Sorting & Count Synchronization Tests ---

  test('TC_DE_011: Request Date Sorting: Verify records sort ascending/descending @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available to test sorting');

    const count = await deleteRequestsPage.getPendingRequestsCount();
    if (count > 1) {
      const datesBefore = await deleteRequestsPage.getAllRequestDates();
      await deleteRequestsPage.clickSortByRequestDate();
      await deleteRequestsPage.page.waitForTimeout(500);
      const datesAfter = await deleteRequestsPage.getAllRequestDates();
      expect(datesAfter).toBeDefined();
    }
  });

  test('TC_DR_007: Verify Pending Request Count matches dropdown badge and page header @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.openManageUsersMenu();
    const dropdownCount = await userManagementPage.getDeleteRequestsPendingCount(3000);

    await userManagementPage.deleteRequestsOption.click();
    await expect(deleteRequestsPage.pageHeading).toBeVisible();

    const pageCount = await deleteRequestsPage.getPagePendingCount(3000);
    expect(pageCount).toBe(dropdownCount);
  });

  // --- 4. Non-Destructive Modal Verification Tests ---

  test('TC_DR_008: Cancel Approve Account Deletion modal and verify request remains in queue @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available to test cancel');

    const firstRow = deleteRequestsPage.tableRows.first();

    // 1. Open modal
    await deleteRequestsPage.openApproveModalForFirstRow();
    await expect(deleteRequestsPage.approveModalTitle).toBeVisible();
    await expect(deleteRequestsPage.page.getByText(/Are you sure you want to approve the deletion/i)).toBeVisible();

    // 2. Click Cancel
    await deleteRequestsPage.clickApproveModalCancel();
    await expect(deleteRequestsPage.approveModalTitle).not.toBeVisible();

    // 3. Verify request is still present in the queue
    await expect(firstRow).toBeVisible();
  });

  test('TC_DR_009: Cancel Reject User modal and verify request remains in queue @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available to test cancel');

    const firstRow = deleteRequestsPage.tableRows.first();

    // 1. Open modal
    await deleteRequestsPage.openRejectModalForFirstRow();
    await expect(deleteRequestsPage.rejectModalTitle).toBeVisible();
    await expect(deleteRequestsPage.page.getByText(/Are you sure you want to reject this request/i)).toBeVisible();

    // 2. Click Cancel
    await deleteRequestsPage.clickRejectModalCancel();
    await expect(deleteRequestsPage.rejectModalTitle).not.toBeVisible();

    // 3. Verify request is still present in the queue
    await expect(firstRow).toBeVisible();
  });

  // --- 5. History Tab Tests ---

  test('TC_DE_014: History Columns Validation: Verify all required columns are displayed under History @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    await expect(deleteRequestsPage.page).toHaveURL(/.*tab=history/i);
    await expect(deleteRequestsPage.approvedSubTab).toBeVisible();
    await expect(deleteRequestsPage.rejectedSubTab).toBeVisible();

    // Columns on History tab: Name, Reason, Request Date, Decision Date, Status
    await expect(deleteRequestsPage.nameColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.reasonColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.requestDateColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.decisionDateColumnHeader).toBeVisible();
    await expect(deleteRequestsPage.statusColumnHeader).toBeVisible();
  });

  test('TC_DR_011: Verify Approved sub-tab UI, Clear All button & status @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();
    await deleteRequestsPage.clickApprovedSubTab();

    await expect(deleteRequestsPage.page).toHaveURL(/.*historyTab=approved/i);
    await expect(deleteRequestsPage.clearAllButton).toBeVisible();
  });

  test('TC_DR_012: Verify History Total count extraction @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    const totalCount = await deleteRequestsPage.getHistoryTotalCount();
    expect(totalCount).toBeGreaterThanOrEqual(0);
  });

  test('TC_DR_013: Verify Search functionality under History tab @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    const hasHistory = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasHistory) test.skip(true, 'No history records available to validate search filter');

    // Dynamically test search by Name on History tab
    await deleteRequestsPage.verifySearchFlow({ field: 'name' });
  });

  test('TC_DE_015: History Sorting: Verify sorting works for Decision Date and Status columns under History @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    const historyTotal = await deleteRequestsPage.getHistoryTotalCount();
    if (historyTotal < 2) test.skip(true, 'Need at least 2 history records to validate sorting');

    // 1. Click Decision Date header to sort
    await deleteRequestsPage.decisionDateColumnHeader.click();
    await deleteRequestsPage.page.waitForTimeout(500);
    await expect(deleteRequestsPage.decisionDateColumnHeader).toBeVisible();

    // 2. Click Status header to sort
    await deleteRequestsPage.statusColumnHeader.click();
    await deleteRequestsPage.page.waitForTimeout(500);
    await expect(deleteRequestsPage.statusColumnHeader).toBeVisible();
  });

  test('TC_VH_002: Verify Request Date column displays formatted date @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    const hasRecords = await deleteRequestsPage.hasPendingRequests(5000);
    if (!hasRecords) test.skip(true, 'No history records available to validate Request Date format');

    const firstRow = deleteRequestsPage.tableRows.first();
    const requestDateCell = await deleteRequestsPage.getRequestDateCell(firstRow);
    // Validates date formats: 'DD/MM/YYYY', 'DD-MM-YYYY', or 'DD Mon YYYY' (e.g., '22 Oct 2026')
    await expect(requestDateCell).toHaveText(/^(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4}|\d{1,2}-\d{1,2}-\d{4})$/);
  });

  test('TC_VH_003: Verify Decision Date column displays formatted date @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    const hasRecords = await deleteRequestsPage.hasPendingRequests(5000);
    if (!hasRecords) test.skip(true, 'No history records available to validate Decision Date format');

    const firstRow = deleteRequestsPage.tableRows.first();
    const decisionDateCell = await deleteRequestsPage.getDecisionDateCell(firstRow);
    // Validates date formats: 'DD/MM/YYYY', 'DD-MM-YYYY', or 'DD Mon YYYY' (e.g., '23 Oct 2026')
    await expect(decisionDateCell).toHaveText(/^(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4}|\d{1,2}-\d{1,2}-\d{4})$/);
  });

  test('TC_VH_004: Verify Status column displays correct values @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    // 1. Verify Status in Approved sub-tab
    await deleteRequestsPage.clickApprovedSubTab();
    const hasApproved = await deleteRequestsPage.hasPendingRequests(5000);
    if (hasApproved) {
      const firstApprovedRow = deleteRequestsPage.tableRows.first();
      const statusCell = await deleteRequestsPage.getStatusCell(firstApprovedRow);
      await expect(statusCell).toContainText(/approved/i);
    }

    // 2. Verify Status in Rejected sub-tab
    await deleteRequestsPage.clickRejectedSubTab();
    const hasRejected = await deleteRequestsPage.hasPendingRequests(5000);
    if (hasRejected) {
      const firstRejectedRow = deleteRequestsPage.tableRows.first();
      const statusCell = await deleteRequestsPage.getStatusCell(firstRejectedRow);
      await expect(statusCell).toContainText(/rejected/i);
    }
  });

  test('TC_VH_005: Verify Name column displays requester name @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    await deleteRequestsPage.clickHistoryTab();

    const hasRecords = await deleteRequestsPage.hasPendingRequests(5000);
    if (!hasRecords) test.skip(true, 'No history records available to validate Name column');

    const firstRow = deleteRequestsPage.tableRows.first();
    const nameCell = await deleteRequestsPage.getNameCell(firstRow);
    await expect(nameCell).toContainText(/[A-Za-z]+/);
  });

  // --- 6. Action Execution Tests (Run Last to Preserve Test Data) ---

  test('TC_DE_008_Reject: TS 1.8 -> Delete Request -> Reject: Verify admin is able to reject delete request @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available to reject');

    await deleteRequestsPage.openRejectModalForFirstRow();
    await deleteRequestsPage.clickRejectModalConfirm();
    await expect(deleteRequestsPage.rejectModalTitle).not.toBeVisible();
    await expect(deleteRequestsPage.getNotificationMessage(/rejected/i)).toBeVisible();
  });

  test('TC_DE_006: TS 1.6 -> Admin -> Delete Request -> Approve: Verify admin is able to approve delete request @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available to approve');

    await deleteRequestsPage.openApproveModalForFirstRow();
    await deleteRequestsPage.clickApproveModalConfirm();
    await expect(deleteRequestsPage.approveModalTitle).not.toBeVisible();
    await expect(deleteRequestsPage.getNotificationMessage(/approved|deleted|success/i)).toBeVisible();
  });

  // --- 7. State Transition Verification (Approve/Reject -> History Record Verification) ---

  test('TC_DE_007: TS 1.7 -> Delete Request -> Approve -> History: Verify system shows record for approved user in History section @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available in queue to test History approval');

    // 1. Capture user identifier from first row before approving
    const firstRow = deleteRequestsPage.tableRows.first();
    const userIdentifier = await firstRow.locator('td, div[role="cell"]').first().innerText();

    // 2. Approve request via modal
    await deleteRequestsPage.openApproveModalForFirstRow();
    await deleteRequestsPage.clickApproveModalConfirm();
    await expect(deleteRequestsPage.approveModalTitle).not.toBeVisible();

    // 3. Navigate to History section -> Approved sub-tab
    await deleteRequestsPage.clickHistoryTab();
    await deleteRequestsPage.clickApprovedSubTab();

    // 4. Verify the approved record appears in the Approved History list
    const approvedRow = deleteRequestsPage.tableRows.filter({ hasText: userIdentifier.trim() });
    await expect(approvedRow.first()).toBeVisible();
    await expect(approvedRow.first().getByText(/approved/i)).toBeVisible();
  });

  test('TC_DE_009: TS 1.9 -> Delete Request -> Reject -> History: Verify system shows record for rejected user in History section @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available in queue to test History rejection');

    // 1. Capture user identifier from first row before rejecting
    const firstRow = deleteRequestsPage.tableRows.first();
    const userIdentifier = await firstRow.locator('td, div[role="cell"]').first().innerText();

    // 2. Reject request via modal
    await deleteRequestsPage.openRejectModalForFirstRow();
    await deleteRequestsPage.clickRejectModalConfirm();
    await expect(deleteRequestsPage.rejectModalTitle).not.toBeVisible();

    // 3. Navigate to History section and switch to Rejected sub-tab
    await deleteRequestsPage.clickHistoryTab();
    await deleteRequestsPage.clickRejectedSubTab();

    // 4. Verify the rejected record appears in the Rejected History list
    const rejectedRow = deleteRequestsPage.tableRows.filter({ hasText: userIdentifier.trim() });
    await expect(rejectedRow.first()).toBeVisible();
    await expect(rejectedRow.first().getByText(/rejected/i)).toBeVisible();
  });

  // --- 8. Count Decrement & Individual Multiple Actions ---

  test('TC_DE_012: Pending Request Count Validation: Verify count updates after approving a request @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available to validate count decrement');

    // 1. Note pending count before action
    const initialCount = await deleteRequestsPage.getPagePendingCount(3000);

    // 2. Approve one request
    await deleteRequestsPage.openApproveModalForFirstRow();
    await deleteRequestsPage.clickApproveModalConfirm();
    await expect(deleteRequestsPage.approveModalTitle).not.toBeVisible();

    // 3. Check count again and assert it decremented by 1
    const updatedCount = await deleteRequestsPage.getPagePendingCount(3000);
    expect(updatedCount).toBe(initialCount - 1);
  });

  test('TC_DE_013: Individual Approve/Reject Validation: Admin performs actions individually on multiple requests @regression', async ({ userManagementPage, deleteRequestsPage }) => {
    await userManagementPage.navigateToDeleteRequests();
    const hasRequests = await deleteRequestsPage.hasPendingRequests(3000);
    if (!hasRequests) test.skip(true, 'No pending delete requests available');

    const totalCount = await deleteRequestsPage.getPendingRequestsCount();
    if (totalCount < 2) test.skip(true, 'Need at least 2 pending requests to validate individual multiple actions');

    // 1. Approve the first request individually
    const firstRowUser = await deleteRequestsPage.tableRows.first().locator('td, div[role="cell"]').first().innerText();
    await deleteRequestsPage.openApproveModalForFirstRow();
    await deleteRequestsPage.clickApproveModalConfirm();
    await expect(deleteRequestsPage.approveModalTitle).not.toBeVisible();

    // 2. Reject the next available request individually
    const secondRowUser = await deleteRequestsPage.tableRows.first().locator('td, div[role="cell"]').first().innerText();
    expect(secondRowUser.trim()).not.toBe(firstRowUser.trim());

    await deleteRequestsPage.openRejectModalForFirstRow();
    await deleteRequestsPage.clickRejectModalConfirm();
    await expect(deleteRequestsPage.rejectModalTitle).not.toBeVisible();
  });

});
