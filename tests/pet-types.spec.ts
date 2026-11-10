import { test, expect } from './fixtures';


test.describe('Pet type management', () => {
  test.beforeEach(async ({ petTypesPage }) => {
    await petTypesPage.open();
  });

  test('lists existing pet types', async ({ petTypesPage }) => {
    await expect(petTypesPage.row('cat')).toBeVisible();
  });

  test('updates a pet type and restores the shared demo data', async ({ petTypesPage }) => {
    await expect(petTypesPage.row('cat')).toBeVisible();

    await petTypesPage.renameType('cat', 'rabbit');
    try {
      await expect(petTypesPage.row('rabbit')).toBeVisible();
    } finally {
      await petTypesPage.renameType('rabbit', 'cat');
    }

    await expect(petTypesPage.row('cat')).toBeVisible();
  });

  test('adds or deletes Lizard from the pet types list', async ({ petTypesPage }) => {
    await expect(petTypesPage.row('cat')).toBeVisible();

    const lizardRows = petTypesPage.row('Lizard');
    const lizardCount = await lizardRows.count();

    if (lizardCount > 0) {
      let confirmationMessage = '';
      petTypesPage.page.once('dialog', async (dialog) => {
        confirmationMessage = dialog.message();
        await dialog.accept();
      });
      await lizardRows.first().getByRole('button', { name: 'Delete', exact: true }).click();

      expect(confirmationMessage).toEqual('Delete the pet type?');
      await expect(lizardRows).toHaveCount(lizardCount - 1);
    } else {
      await petTypesPage.page.getByRole('button', { name: 'Add', exact: true }).click();
      await petTypesPage.page.locator('#name').fill('Lizard');
      await petTypesPage.page.getByRole('button', { name: 'Save', exact: true }).click();

      await expect(lizardRows).toHaveCount(1);
    }
  });
});
