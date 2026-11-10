import { faker } from '@faker-js/faker';
import { test, expect } from './fixtures';

function validName(value: string): string {
  return value.length >= 2 ? value : faker.string.alpha({ length: 6 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Veterinarians', exact: true }).click();

  const veterinarianActions = page.getByRole('link', { name: /^(All|Add New)$/ });
  await expect(veterinarianActions).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'All', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add New', exact: true })).toBeVisible();
});

test('creates a veterinarian', async ({ page }) => {
  const firstName = validName(faker.person.firstName());
  const lastName = validName(faker.person.lastName());
  const fullName = `${firstName} ${lastName}`;

  await page.getByRole('link', { name: 'Add New', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'New Veterinarian', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);

  const typeSelect = page.getByRole('combobox', { name: 'Type' });
  await typeSelect.selectOption({ label: 'surgery' });
  await page.getByRole('button', { name: 'Save Vet', exact: true }).click();

  const veterinarianRow = page.getByRole('row')
    .filter({ has: page.getByText(fullName, { exact: true }) });
  await expect(veterinarianRow).toBeVisible();
  await expect(veterinarianRow).toContainText('surgery');
});

test('updates specialties for a random surgery veterinarian', async ({ page }) => {
  await page.getByRole('link', { name: 'All', exact: true }).click();

  const veterinarianRow = page.getByRole('row')
    .filter({ hasText: 'surgery' })
    .filter({ has: page.getByRole('button', { name: 'Edit Vet', exact: true }) })
    .first();
  await veterinarianRow.getByRole('button', { name: 'Edit Vet', exact: true }).click();

  await page.locator('.selected-specialties').click();

  for (const checkbox of await page.getByRole('checkbox').all()) {
    await checkbox.check();
  }
  await page.locator('#surgery').uncheck();

  await page.getByRole('heading', { name: 'Edit Veterinarian' }).click();
  const selectedSpecialties = page.locator('.selected-specialties');
  await expect(selectedSpecialties).toContainText(/radiology/);
  await expect(selectedSpecialties).toContainText(/dentistry/);
  await expect(selectedSpecialties).toContainText(/new specialty/);
  await expect(selectedSpecialties).not.toContainText(/surgery/);
  await page.getByRole('button', { name: 'Save Vet', exact: true }).click();
});
