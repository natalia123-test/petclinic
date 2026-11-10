import { expect, type Locator, type Page } from '@playwright/test';

export class PetTypesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('/');
    await this.page.getByText('Pet Types', { exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Pet Types' })).toBeVisible();
  }

  row(name: string): Locator {
    return this.page.getByRole('row', { name });
  }

  async renameType(currentName: string, newName: string) {
    await this.row(currentName).getByRole('button', { name: 'Edit' }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit Pet Type' })).toBeVisible();

    const nameField = this.page.getByRole('textbox');
    await expect(nameField).toHaveValue(currentName);
    await nameField.fill(newName);
    await this.page.getByRole('button', { name: 'Update' }).click();
  }
}
