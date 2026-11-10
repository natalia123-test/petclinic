import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

function validName(value: string): string {
  return value.length >= 2 ? value : faker.string.alpha({ length: 6 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Owners', exact: true }).click();

  await page.getByRole('link', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Owners', exact: true })).toBeVisible();
});

test('searches for owners by last name', async ({ page }) => {
  const lastNameField = page.getByText('Last name', { exact: true })
    .locator('..')
    .getByRole('textbox');
  await lastNameField.fill('Davis');
  await page.getByRole('button', { name: 'Find Owner', exact: true }).click();

  await expect(page.getByRole('row').filter({ hasText: 'Davis' })).toHaveCount(2);
});

test('creates and finds an owner', async ({ page }) => {
  const firstName = validName(faker.person.firstName());
  const lastName = validName(faker.person.lastName());
  const fullName = `${firstName} ${lastName}`;

  await page.getByRole('button', { name: 'Owners', exact: true }).click();

  await page.getByRole('link', { name: 'Add New', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'New Owner', exact: true })).toBeVisible();

  const fields = {
    'First Name': firstName,
    'Last Name': lastName,
    Address: faker.location.streetAddress(),
    City: faker.location.city(),
    Telephone: faker.string.numeric(10),
  };

  for (const [label, value] of Object.entries(fields)) {
    const field = page.getByText(label, { exact: true }).locator('..').getByRole('textbox');
    await field.fill(value);
  }

  await page.getByRole('button', { name: 'Add Owner', exact: true }).click();
  await expect(page.getByText(fullName, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Owners', exact: true }).click();
  await page.getByRole('link', { name: 'Search', exact: true }).click();
  const lastNameField = page.getByText('Last name', { exact: true })
    .locator('..')
    .getByRole('textbox');
  await lastNameField.fill(lastName);
  await page.getByRole('button', { name: 'Find Owner', exact: true }).click();

  await expect(page.getByRole('row').filter({ hasText: fullName })).toHaveCount(1);
});

test('adds a pet for the last owner in the list', async ({ page }) => {
  const petName = faker.animal.petName();
  const formattedBirthDate = faker.date.past().toISOString().slice(0, 10);

  const lastOwnerRow = page.getByRole('row').filter({ has: page.getByRole('link') }).last();
  await lastOwnerRow.getByRole('link').click();

  await page.getByRole('button', { name: 'Add New Pet', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add Pet', exact: true })).toBeVisible();

  await page.locator('input[name="name"]').fill(petName);
  await page.locator('input[name="birthDate"]').fill(formattedBirthDate);
  await page.getByRole('combobox', { name: 'Type' }).selectOption({ label: 'cat' });
  await page.getByRole('button', { name: 'Save Pet', exact: true }).click();

  await expect(page.locator('dd').filter({ hasText: petName }).locator('..'))
    .toContainText(new RegExp(`${petName}.*${formattedBirthDate}.*cat`, 's'));
});

test('adds a future visit for an owner with a pet', async ({ page }) => {
  await page.getByRole('button', { name: 'Find Owner', exact: true }).click();

  const ownersTable = page.getByRole('table')
    .filter({ has: page.getByRole('columnheader', { name: 'Pets', exact: true }) });
  // Pet names are shown as nested rows in the last column of each owner row.
  const ownersWithPets = ownersTable.getByRole('row')
    .filter({ has: page.getByRole('link') })
    .filter({ has: page.locator('td:last-child tr') });

  const ownerRow = ownersWithPets.first();
  await expect(ownerRow, 'At least one owner should have a pet').toBeVisible();
  await ownerRow.getByRole('link').click();

  await page.getByRole('button', { name: 'Add Visit', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'New Visit' })).toBeVisible();

  const visitDate = new Date();
  visitDate.setDate(visitDate.getDate() + faker.number.int({ min: 1, max: 365 }));
  const formattedVisitDate = [
    visitDate.getFullYear(),
    String(visitDate.getMonth() + 1).padStart(2, '0'),
    String(visitDate.getDate()).padStart(2, '0'),
  ].join('-');
  await page.locator('input[name="date"]').fill(formattedVisitDate);
  await page.locator('[name="description"]').fill('Disease');
  await page.getByRole('button', { name: 'Add Visit', exact: true }).click();

  await expect(page.getByRole('row', {
    name: new RegExp(`^${formattedVisitDate}\\b`),
  }).last()).toBeVisible();
});
