import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class UserManagementPage extends BasePage {
  // Header & Sidebar Locators
  readonly pageHeading: Locator;
  readonly usersSidebarLink: Locator;

  // Dropdown Button & Options
  readonly manageUsersDropdownButton: Locator;
  readonly signUpRequestsOption: Locator;
  readonly signUpRequestsBadge: Locator;
  readonly singleUserOption: Locator;
  readonly uploadCsvOption: Locator;
  readonly deleteRequestsOption: Locator;
  readonly deleteRequestsBadge: Locator;

  // Reusable User Profile Form Locators (Used across Single User & Sign-Up Approvals)
  readonly employeeIdInput: Locator;
  readonly designationDropdown: Locator;
  readonly vesselNameDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly dropdownOptions: Locator;
  readonly registeredRadio: Locator;
  readonly unregisteredRadio: Locator;

  // Dropdown Search & Options Controls
  readonly dropdownSearchInput: Locator;
  readonly dropdownEmptyMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Main table search for User Management
    this.searchInput = page.getByPlaceholder('Search Name, Email Id or User Id');

    // Header & Navigation
    this.pageHeading = page.getByRole('heading', { name: 'Users' });
    this.usersSidebarLink = page.getByRole('link', { name: 'Users' }).or(page.locator('text=Users'));

    // Dropdown Trigger Button
    this.manageUsersDropdownButton = page.getByRole('button', { name: 'Manage Users' });

    // Dropdown Menu Options (Pure role + semantic text for badges, zero CSS classes!)
    this.signUpRequestsOption = page.getByRole('menuitem', { name: /Sign-Up Requests/i });
    this.signUpRequestsBadge = this.signUpRequestsOption.getByText(/\d+/);

    this.deleteRequestsOption = page.getByRole('menuitem', { name: /Delete Requests/i });
    this.deleteRequestsBadge = this.deleteRequestsOption.getByText(/\d+/);

    this.singleUserOption = page.getByRole('menuitem', { name: 'Single User' });
    this.uploadCsvOption = page.getByRole('menuitem', { name: 'Upload a CSV' });

    // Profile Form Locators
    this.employeeIdInput = page.getByPlaceholder('Enter the Employee ID');
    this.designationDropdown = page.getByRole('combobox', { name: /Designation/i });
    this.vesselNameDropdown = page.getByRole('combobox', { name: /Vessel Name/i });
    this.statusDropdown = page.getByRole('combobox', { name: /Status/i });
    this.dropdownOptions = page.getByRole('option');
    this.registeredRadio = page.getByRole('radio', { name: 'Registered' });
    this.unregisteredRadio = page.getByRole('radio', { name: 'Unregistered' });

    // Dropdown Search & Options Controls (Pure semantic user-facing locators)
    this.dropdownSearchInput = page.getByPlaceholder(/Search (designation|vessel|status)/i);
    this.dropdownEmptyMessage = page.getByText(/No .* found/i);
  }

  // --- Badge Count Extractors ---
  async getDropdownPendingCount(timeoutMs = 3000): Promise<number> {
    return await this.getSignUpRequestsPendingCount(timeoutMs);
  }

  async getSignUpRequestsPendingCount(timeoutMs = 3000): Promise<number> {
    const isVisible = await this.signUpRequestsBadge.isVisible({ timeout: timeoutMs }).catch(() => false);
    if (!isVisible) {
      return 0; // Badge not rendered = 0 requests (resolves in <=3s!)
    }
    const countText = await this.signUpRequestsBadge.innerText();
    return parseInt(countText.trim(), 10);
  }

  async getDeleteRequestsPendingCount(timeoutMs = 3000): Promise<number> {
    const isVisible = await this.deleteRequestsBadge.isVisible({ timeout: timeoutMs }).catch(() => false);
    if (!isVisible) {
      return 0; // Badge not rendered = 0 requests (resolves in <=3s!)
    }
    const countText = await this.deleteRequestsBadge.innerText();
    return parseInt(countText.trim(), 10);
  }

  // --- Page Actions ---
  async navigateToUsers() {
    await this.usersSidebarLink.click();
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async openManageUsersMenu() {
    await this.manageUsersDropdownButton.click();
    await this.signUpRequestsOption.waitFor({ state: 'visible' });
  }

  async navigateToSignUpRequests() {
    await this.openManageUsersMenu();
    await this.signUpRequestsOption.click();
    await this.page.waitForURL(/.*signup-request/i);
  }

  async navigateToDeleteRequests() {
    await this.openManageUsersMenu();
    await this.deleteRequestsOption.click();
    await this.page.waitForURL(/.*delete-request/i);
  }

  // --- Reusable User Profile Form Actions ---
  async fillEmployeeId(id?: string): Promise<string> {
    const empId = id || `EMP${Date.now().toString().slice(-6)}`;
    await this.employeeIdInput.fill(empId);
    return empId;
  }

  async clearEmployeeId() {
    await this.employeeIdInput.clear();
  }

  async selectDesignation(name?: string) {
    await this.designationDropdown.click();
    if (name) {
      await this.dropdownOptions.filter({ hasText: name }).click();
    } else {
      await this.dropdownOptions.nth(0).click();
    }
  }

  async selectVesselName(name?: string) {
    await this.vesselNameDropdown.click();
    if (name) {
      await this.dropdownOptions.filter({ hasText: name }).click();
    } else {
      await this.dropdownOptions.nth(0).click();
    }
  }

  async selectStatus(status?: string) {
    await this.statusDropdown.click();
    if (status) {
      await this.dropdownOptions.filter({ hasText: status }).click();
    } else {
      await this.dropdownOptions.nth(0).click();
    }
  }

  async selectRegistration(type: 'Registered' | 'Unregistered') {
    if (type === 'Registered') {
      await this.registeredRadio.check();
    } else {
      await this.unregisteredRadio.check();
    }
  }

  // --- High-Performance Dynamic Dropdown Methods ---
  async getRandomDropdownOptionText(): Promise<string> {
    await this.dropdownOptions.first().waitFor({ state: 'visible' });
    const totalOptions = await this.dropdownOptions.count();
    if (totalOptions === 0) {
      throw new Error('No options available in the dropdown.');
    }
    const poolSize = Math.min(totalOptions, 20);
    const randomIndex = Math.floor(Math.random() * poolSize);
    const randomText = await this.dropdownOptions.nth(randomIndex).innerText();
    return randomText.trim();
  }

  async searchAndSelectOption(dropdownTrigger: Locator, optionName?: string): Promise<string> {
    await dropdownTrigger.click();
    const targetOptionName = optionName || (await this.getRandomDropdownOptionText());

    await this.dropdownSearchInput.waitFor({ state: 'visible' });
    await this.dropdownSearchInput.fill(targetOptionName);

    const matchedOption = this.dropdownOptions.filter({ hasText: targetOptionName }).first();
    await matchedOption.waitFor({ state: 'visible' });
    await matchedOption.click();

    return targetOptionName;
  }

  async selectDesignationBySearch(name?: string): Promise<string> {
    return await this.searchAndSelectOption(this.designationDropdown, name);
  }

  async selectVesselNameBySearch(name?: string): Promise<string> {
    return await this.searchAndSelectOption(this.vesselNameDropdown, name);
  }

  async scrollDropdownToLoadMore() {
    await this.dropdownOptions.last().scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }
}
