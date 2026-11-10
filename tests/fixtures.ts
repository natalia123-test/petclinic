import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  test as base,
  expect,
  request as apiRequestFactory,
  type APIRequestContext,
} from '@playwright/test';
import { PetTypesPage } from '../page-objects/pet-types.page';

type AppFixtures = {
  petTypesPage: PetTypesPage;
  apiRequest: APIRequestContext;
};

export const test = base.extend<AppFixtures>({
  petTypesPage: async ({ page }, use) => {
    await use(new PetTypesPage(page));
  },
  apiRequest: async ({}, use) => {
    const accessToken = (await readFile(resolve('.auth/access-token'), 'utf8')).trim();
    const context = await apiRequestFactory.newContext({
      baseURL: 'https://petclinic-api.bondaracademy.com/petclinic/api/',
      extraHTTPHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    try {
      await use(context);
    } finally {
      await context.dispose();
    }
  },
});

export { expect };
