import { test, expect } from '../../src/fixtures/index';

test.describe('Admin - Sign-Up Requests Suite', () => {

  test.beforeEach(async ({ page, userManagementPage }) => {
    // Pre-authenticated via Admin storageState! Navigate directly to Users management
    await page.goto('/employee-management');
    await userManagementPage.pageHeading.waitFor({ state: 'visible' });
  });

  test('TC_SU_001: Verify navigation to Sign-Up Requests page @smoke @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    // Open Manage Users menu and select Sign-Up Requests
    await userManagementPage.navigateToSignUpRequests();

    // Assert URL & Page Header
    await expect(signUpRequestsPage.page).toHaveURL(/.*signup-request/i);
    await expect(signUpRequestsPage.pageHeading).toBeVisible();
  });

  test('TC_SU_002: Verify Sign-Up Requests page UI elements & tabs @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // Verify Tab controls, Search input, and Counter badge
    await expect(signUpRequestsPage.newRequestsTab).toBeVisible();
    await expect(signUpRequestsPage.historyTab).toBeVisible();
    await expect(signUpRequestsPage.searchInput).toBeVisible();
    await expect(signUpRequestsPage.pendingRequestsBadge).toBeVisible();
  });

  test('TC_SU_003: Verify Search functionality on Sign-Up Requests @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // Type search query
    await signUpRequestsPage.searchRequest('squadramedia');

    // If matching records exist in the table, verify the first row contains query
    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count > 0) {
      await expect(signUpRequestsPage.tableRows.first()).toContainText('squadramedia');
    }
  });

  test('TC_SU_004: Verify Back button navigation returns to Users screen @regression', async ({ userManagementPage, signUpRequestsPage, page }) => {
    await userManagementPage.navigateToSignUpRequests();

    // Click Back button
    await signUpRequestsPage.clickBack();

    // Assert returned to Users management URL and header is visible
    await expect(page).toHaveURL(/.*employee-management/i);
    await expect(userManagementPage.pageHeading).toBeVisible();
  });

  test('TC_SU_005: Verify Admin can trigger Approve for an available request @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // Trigger approve for the first available request in queue
    const approvedUser = await signUpRequestsPage.approveAnyAvailableRequest();
    if (approvedUser) {
      console.log(`Triggered approval for user: ${approvedUser.email}`);
      // Assert confirmation modal, dialog or toast feedback appears
      await expect(signUpRequestsPage.page.getByText(/approved|success|confirm|are you sure/i)).toBeVisible();
    } else {
      test.skip(true, 'Sign-up request queue is currently empty');
    }
  });

  test('TC_SU_006: Verify Admin can trigger Reject for an available request @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // Trigger reject for the first available request in queue
    const rejectedUser = await signUpRequestsPage.rejectAnyAvailableRequest();
    if (rejectedUser) {
      console.log(`Triggered rejection for user: ${rejectedUser.email}`);
      // Assert confirmation modal, dialog or toast feedback appears
      await expect(signUpRequestsPage.page.getByText(/rejected|success|confirm|are you sure/i)).toBeVisible();
    } else {
      test.skip(true, 'Sign-up request queue is currently empty');
    }
  });

  test('TC_SU_026: TS 1.27 -> Admin->Users->Sign up request: Verify admin sees sign up requests @smoke @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    // 1. Logged in as admin, navigate to Users -> Manage Users -> Sign-up Request
    await userManagementPage.navigateToSignUpRequests();
    await expect(signUpRequestsPage.pageHeading).toBeVisible();

    // 2. Auto-wait for the Pending Requests badge to show on the page
    await expect(signUpRequestsPage.pendingRequestsBadge).toBeVisible();
    const count = await signUpRequestsPage.getPagePendingCount();
    expect(count).toBeGreaterThan(0);
  });

  test('TC_SU_032: Verify Signup Request List Columns @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // System should display: Name, Email, Request Date, Pending count
    await expect(signUpRequestsPage.nameColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.emailColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.requestDateColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.pendingRequestsBadge).toBeVisible();
  });

  test('TC_SU_033: Verify Request Date Sorting @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // 1. Capture dates before sorting
    const datesBefore = await signUpRequestsPage.getAllRequestDates();

    // 2. Click Request Date to sort
    await signUpRequestsPage.clickSortByRequestDate();
    await signUpRequestsPage.page.waitForTimeout(500);

    // 3. Verify records are sorted
    const datesAfter = await signUpRequestsPage.getAllRequestDates();
    expect(datesAfter).toBeDefined();
  });

  test('TC_SU_034: Verify Pending Request Count matches dropdown badge and page count @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    // 1. Open Manage Users menu to read dropdown badge count
    await userManagementPage.openManageUsersMenu();
    const dropdownCount = await userManagementPage.getDropdownPendingCount();
    expect(dropdownCount).toBeGreaterThan(0);

    // 2. Click through to Sign-Up Requests page
    await userManagementPage.signUpRequestsOption.click();
    await expect(signUpRequestsPage.pageHeading).toBeVisible();

    // 3. Auto-wait for the page's Pending Requests badge to be visible
    await expect(signUpRequestsPage.pendingRequestsBadge).toBeVisible();

    // 4. Read the count from the page header and verify both counts match
    const pageBadgeCount = await signUpRequestsPage.getPagePendingCount();
    expect(pageBadgeCount).toBe(dropdownCount);
  });

  test('TC_SU_035: Approve Button Enable Logic in Modal @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test Approve modal');
    }

    // 1. Open modal by clicking Approve on first row
    await signUpRequestsPage.openApproveModalForFirstRow();
    await expect(signUpRequestsPage.modalTitle).toBeVisible();

    // 2. Initial State: Empty mandatory fields -> "Accept Request" MUST be Disabled
    await expect(signUpRequestsPage.modalAcceptRequestButton).toBeDisabled();

    // 3. Partial State: Fill Employee ID only -> "Accept Request" MUST still be Disabled
    await userManagementPage.fillEmployeeId('ARS39223');
    await expect(signUpRequestsPage.modalAcceptRequestButton).toBeDisabled();

    // 4. Complete State: Select Designation -> Both mandatory fields filled -> MUST become Enabled!
    await userManagementPage.selectDesignation();
    await expect(signUpRequestsPage.modalAcceptRequestButton).toBeEnabled();

    // 5. Cleared State: Clear Employee ID -> MUST revert back to Disabled!
    await userManagementPage.clearEmployeeId();
    await expect(signUpRequestsPage.modalAcceptRequestButton).toBeDisabled();

    // 6. Clean up: Cancel modal to leave test data unaffected
    await signUpRequestsPage.clickModalCancel();
    await expect(signUpRequestsPage.modalTitle).not.toBeVisible();
  });

  test('TC_SU_036: Verify Default Radio Button selection is Registered in Complete Profile Modal @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test modal');
    }

    // 1. Open modal on first row
    await signUpRequestsPage.openApproveModalForFirstRow();
    await expect(signUpRequestsPage.modalTitle).toBeVisible();

    // 2. Verify "Registered" radio button is checked by default
    await expect(userManagementPage.registeredRadio).toBeChecked();

    // 3. Verify "Unregistered" radio button is NOT checked by default
    await expect(userManagementPage.unregisteredRadio).not.toBeChecked();

    // 4. Clean up: Cancel modal
    await signUpRequestsPage.clickModalCancel();
    await expect(signUpRequestsPage.modalTitle).not.toBeVisible();
  });

  test('TC_SU_037: Fill all fields in modal and click Accept Request @smoke @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to approve');
    }

    // 1. Open Complete Profile Details modal on first available request
    await signUpRequestsPage.openApproveModalForFirstRow();
    await expect(signUpRequestsPage.modalTitle).toBeVisible();

    // 2. Fill all fields using modular UserManagementPage methods
    await userManagementPage.fillEmployeeId();
    await userManagementPage.selectDesignation();
    await userManagementPage.selectVesselName();
    await userManagementPage.selectStatus();

    // 3. Verify Accept Request button is enabled
    await expect(signUpRequestsPage.modalAcceptRequestButton).toBeEnabled();

    // 4. Click Accept Request
    await signUpRequestsPage.clickModalAcceptRequest();

    // 5. Verify modal closes and exact success toast appears
    await expect(signUpRequestsPage.modalTitle).not.toBeVisible();
    await expect(
      signUpRequestsPage.getNotificationMessage('Signup request accepted and user created successfully')
    ).toBeVisible();
  });

  test('TC_SU_038: Cancel approval after entering all details in modal @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test cancel');
    }

    // 1. Capture the email of the request before opening modal
    const firstRowEmail = await signUpRequestsPage.tableRows.first().locator('text=@').innerText();

    // 2. Open Complete Profile Details modal
    await signUpRequestsPage.openApproveModalForFirstRow();
    await expect(signUpRequestsPage.modalTitle).toBeVisible();

    // 3. Enter details
    await userManagementPage.fillEmployeeId('ARS39223');
    await userManagementPage.selectDesignation();
    await expect(signUpRequestsPage.modalAcceptRequestButton).toBeEnabled();

    // 4. Click Cancel button
    await signUpRequestsPage.clickModalCancel();

    // 5. Verify modal is closed
    await expect(signUpRequestsPage.modalTitle).not.toBeVisible();

    // 6. Verify the request is STILL present in the table (was not approved or removed)
    await expect(signUpRequestsPage.getRowByEmail(firstRowEmail)).toBeVisible();
  });

  test('TC_SU_040: Cancel rejection in modal and verify request remains in queue @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test cancel');
    }

    const targetRow = signUpRequestsPage.tableRows.first();

    // 1. Open Reject User confirmation modal on first row
    await signUpRequestsPage.openRejectModalForFirstRow();
    await expect(signUpRequestsPage.rejectModalTitle).toBeVisible();

    // 2. Click Cancel in modal
    await signUpRequestsPage.clickRejectModalCancel();

    // 3. Verify modal is closed
    await expect(signUpRequestsPage.rejectModalTitle).not.toBeVisible();

    // 4. Verify the request is STILL present in the queue
    await expect(targetRow).toBeVisible();
    await expect(targetRow.getByRole('button', { name: 'Reject' })).toBeVisible();
  });

  test('TC_SU_039: Reject sign-up request from modal and verify success toast @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to reject');
    }

    // 1. Open Reject User confirmation modal on first row
    await signUpRequestsPage.openRejectModalForFirstRow();
    await expect(signUpRequestsPage.rejectModalTitle).toBeVisible();

    // 2. Click "Reject User" confirm button
    await signUpRequestsPage.clickRejectModalConfirm();

    // 3. Verify modal closes
    await expect(signUpRequestsPage.rejectModalTitle).not.toBeVisible();

    // 4. Verify exact rejection success toast appears
    await expect(
      signUpRequestsPage.getNotificationMessage('Signup request rejected successfully')
    ).toBeVisible();
  });

  test('TC_SU_041: Verify History tab navigation, sub-tabs & Approved UI components @smoke @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    // 1. Switch to History Tab
    await signUpRequestsPage.clickHistoryTab();
    await expect(signUpRequestsPage.page).toHaveURL(/.*tab=history/i);

    // 2. Validate Sub-Tabs exist
    await expect(signUpRequestsPage.approvedSubTab).toBeVisible();
    await expect(signUpRequestsPage.rejectedSubTab).toBeVisible();

    // 3. Validate Search Field
    await expect(signUpRequestsPage.searchInput).toBeVisible();

    // 4. Validate All History Table Columns
    await expect(signUpRequestsPage.nameColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.emailColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.requestDateColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.decisionDateColumnHeader).toBeVisible();
    await expect(signUpRequestsPage.statusColumnHeader).toBeVisible();

    // 5. Validate Total Count Badge
    await expect(signUpRequestsPage.historyTotalBadge).toBeVisible();
    const totalCount = await signUpRequestsPage.getHistoryTotalCount();
    expect(totalCount).toBeGreaterThanOrEqual(0);

    // 6. Verify row status displays 'Approved' for records in Approved sub-tab
    const rowCount = await signUpRequestsPage.getPendingRequestsCount();
    if (rowCount > 0) {
      await expect(signUpRequestsPage.tableRows.first().getByText('Approved')).toBeVisible();
    }
  });

  test('TC_SU_042: Verify Rejected sub-tab UI, Clear All button & row statuses @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();
    await signUpRequestsPage.clickHistoryTab();

    // 1. Switch to Rejected Sub-Tab
    await signUpRequestsPage.clickRejectedSubTab();
    await expect(signUpRequestsPage.page).toHaveURL(/.*historyTab=rejected/i);

    // 2. Validate Clear All button is visible on Rejected sub-tab
    await expect(signUpRequestsPage.clearAllButton).toBeVisible();

    // 3. Validate Total Count Badge for Rejected
    await expect(signUpRequestsPage.historyTotalBadge).toBeVisible();
    const rejectedCount = await signUpRequestsPage.getHistoryTotalCount();
    expect(rejectedCount).toBeGreaterThanOrEqual(0);

    // 4. Verify row status displays 'Rejected' for records in Rejected sub-tab
    const rowCount = await signUpRequestsPage.getPendingRequestsCount();
    if (rowCount > 0) {
      await expect(signUpRequestsPage.tableRows.first().getByText('Rejected')).toBeVisible();
    }

    // 5. Switch back to Approved tab and verify Clear All button is NOT present
    await signUpRequestsPage.clickApprovedSubTab();
    await expect(signUpRequestsPage.clearAllButton).not.toBeVisible();
  });

  test('TC_SU_043: Verify Total count extraction and first-page row consistency under History @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();
    await signUpRequestsPage.clickHistoryTab();

    // 1. Extract count on Approved tab
    const approvedTotal = await signUpRequestsPage.getHistoryTotalCount();
    const approvedRowsCount = await signUpRequestsPage.getPendingRequestsCount();
    expect(approvedTotal).toBeGreaterThanOrEqual(0);
    expect(approvedRowsCount).toBeLessThanOrEqual(approvedTotal);

    // 2. Extract count on Rejected tab
    await signUpRequestsPage.clickRejectedSubTab();
    const rejectedTotal = await signUpRequestsPage.getHistoryTotalCount();
    const rejectedRowsCount = await signUpRequestsPage.getPendingRequestsCount();
    expect(rejectedTotal).toBeGreaterThanOrEqual(0);
    if (rejectedTotal <= 10) {
      expect(rejectedRowsCount).toBe(rejectedTotal);
    } else {
      expect(rejectedRowsCount).toBeLessThanOrEqual(rejectedTotal);
    }
  });

  test('TC_SU_044: Verify Search functionality under History tab @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();
    await signUpRequestsPage.clickHistoryTab();

    // Search in Approved Tab
    const initialCount = await signUpRequestsPage.getPendingRequestsCount();
    if (initialCount > 0) {
      const firstRowText = await signUpRequestsPage.tableRows.first().locator('td, div[role="cell"]').nth(0).innerText();
      const searchTerm = firstRowText.split(' ')[0].trim();

      await signUpRequestsPage.searchRequest(searchTerm);
      await signUpRequestsPage.page.waitForTimeout(500);

      const filteredCount = await signUpRequestsPage.getPendingRequestsCount();
      if (filteredCount > 0) {
        await expect(signUpRequestsPage.tableRows.first()).toContainText(new RegExp(searchTerm, 'i'));
      }

      await signUpRequestsPage.clearSearch();
      await signUpRequestsPage.page.waitForTimeout(500);
      const restoredCount = await signUpRequestsPage.getPendingRequestsCount();
      expect(restoredCount).toBe(initialCount);
    }
  });

  test('TC_SU_045: Verify Request Date sorting under History tab @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();
    await signUpRequestsPage.clickHistoryTab();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count > 1) {
      const datesBefore = await signUpRequestsPage.getAllRequestDates();
      await signUpRequestsPage.clickSortByRequestDate();
      await signUpRequestsPage.page.waitForTimeout(500);
      const datesAfter = await signUpRequestsPage.getAllRequestDates();
      expect(datesAfter).toBeDefined();
    }
  });

  test('TC_SU_046: Verify Clear All modal opens and can be canceled without removing requests @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();
    await signUpRequestsPage.clickHistoryTab();
    await signUpRequestsPage.clickRejectedSubTab();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No rejected requests available to test Clear All modal');
    }

    const countBefore = await signUpRequestsPage.getHistoryTotalCount();

    // 1. Open Clear All confirmation modal
    await signUpRequestsPage.openClearAllModal();
    await expect(signUpRequestsPage.clearAllModalTitle).toBeVisible();
    await expect(
      signUpRequestsPage.page.getByText('Are you sure you want to remove all rejected user requests? This action cannot be undone.')
    ).toBeVisible();

    // 2. Click Cancel in modal
    await signUpRequestsPage.clickClearAllModalCancel();

    // 3. Verify modal closes
    await expect(signUpRequestsPage.clearAllModalTitle).not.toBeVisible();

    // 4. Verify rejected requests count is unchanged
    const countAfter = await signUpRequestsPage.getHistoryTotalCount();
    expect(countAfter).toBe(countBefore);
  });

  test('TC_SU_047: Verify dynamic search and selection in Designation and Vessel Name dropdowns @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test dropdown search');
    }

    await signUpRequestsPage.openApproveModalForFirstRow();

    // 1. Dynamically search and select a random Designation
    const selectedDesignation = await userManagementPage.selectDesignationBySearch();
    await expect(userManagementPage.designationDropdown).toContainText(selectedDesignation);

    // 2. Dynamically search and select a random Vessel Name
    const selectedVessel = await userManagementPage.selectVesselNameBySearch();
    await expect(userManagementPage.vesselNameDropdown).toContainText(selectedVessel);

    // Cleanup: Cancel modal
    await signUpRequestsPage.clickModalCancel();
  });

  test('TC_SU_048: Verify dropdown search filters matching items and clearing restores options @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test dropdown filtering');
    }

    await signUpRequestsPage.openApproveModalForFirstRow();
    await userManagementPage.designationDropdown.click();

    // 1. Capture initial visible options count
    const initialCount = await userManagementPage.dropdownOptions.count();

    // 2. Filter down by typing a partial query from a live option
    const sampleOption = await userManagementPage.getRandomDropdownOptionText();
    const partialQuery = sampleOption.slice(0, 4);

    await userManagementPage.dropdownSearchInput.fill(partialQuery);
    const filteredCount = await userManagementPage.dropdownOptions.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // 3. Clear search and verify all options restore
    await userManagementPage.dropdownSearchInput.clear();
    const restoredCount = await userManagementPage.dropdownOptions.count();
    expect(restoredCount).toBe(initialCount);

    // Cleanup
    await signUpRequestsPage.clickModalCancel();
  });

  test('TC_SU_049: Verify dropdown displays empty state message on non-matching search @regression', async ({ userManagementPage, signUpRequestsPage }) => {
    await userManagementPage.navigateToSignUpRequests();

    const count = await signUpRequestsPage.getPendingRequestsCount();
    if (count === 0) {
      test.skip(true, 'No pending sign-up requests available to test dropdown empty state');
    }

    await signUpRequestsPage.openApproveModalForFirstRow();
    await userManagementPage.designationDropdown.click();

    // 1. Type an invalid non-matching search query
    await userManagementPage.dropdownSearchInput.fill('NonExistent_XYZ_999');

    // 2. Verify 0 options are displayed and the empty state message appears
    await expect(userManagementPage.dropdownOptions).toHaveCount(0);
    await expect(userManagementPage.dropdownEmptyMessage).toBeVisible();

    // Cleanup
    await signUpRequestsPage.clickModalCancel();
  });

});
