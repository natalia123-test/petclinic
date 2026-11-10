import { faker } from '@faker-js/faker';
import type { APIRequestContext } from '@playwright/test';
import { test, expect } from './fixtures';
import ownerTestData from './test-data/owner.json';


type Pet = {
  id: number;
  name: string;
  birthDate: string;
  type: { id: number; name: string };
  ownerId: number;
  visits: Visit[];
};

type Visit = {
  id: number;
  date: string;
  description: string;
  petId: number | null;
};

type Owner = {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  pets: Pet[];
};

async function getOwners(apiRequest: APIRequestContext) {
  const response = await apiRequest.get('owners');
  expect(response.status()).toBe(200);
  return (await response.json()) as Owner[];
}

function createOwnerData() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName().replace(/[^a-z]/gi, ''),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    telephone: faker.string.numeric(10),
  };
}

async function createOwner(
  apiRequest: APIRequestContext,
  ownerData: Omit<Owner, 'id' | 'pets'>,
) {
  const response = await apiRequest.post('owners', { data: ownerData });
  expect(response.status()).toBe(201);
  return (await response.json()) as Owner;
}

test('finds owners by last name', async ({ apiRequest }) => {
  const response = await apiRequest.get('owners', {
    params: { lastName: 'davis' },
  });
  expect(response.status()).toBe(200);
  expect(response.url()).toContain('/owners?lastName=davis');

  const owners = (await response.json()) as Owner[];
  expect(owners.length).toBeGreaterThan(0);
  expect(owners.every((owner) => owner.lastName === 'Davis')).toBe(true);

  owners.forEach(({ id, firstName, lastName }) => {
    expect(id).toEqual(expect.any(Number));
    console.log(`id: ${id}, name: ${firstName} ${lastName}`);
  });
});

test.describe('owner API tests', () => {
  let owners: Owner[];

  test.beforeEach(async ({ apiRequest }) => {
    owners = await getOwners(apiRequest);
    expect(owners.length).toBeGreaterThan(0);
  });

  test('gets an existing owner by id', async ({ apiRequest }) => {
    const response = await apiRequest.get(`owners/${ownerTestData.id}`);

    expect(response.status()).toBe(200);
    const owner = (await response.json()) as Owner;
    expect(owner).toMatchObject({
      id: ownerTestData.id,
      firstName: ownerTestData.firstName,
      lastName: ownerTestData.lastName,
      address: ownerTestData.address,
      city: ownerTestData.city,
      telephone: ownerTestData.telephone,
      pets: ownerTestData.pets.map(({ id, name, birthDate, type }) => ({
        id,
        name,
        birthDate,
        type,
      })),
    });
    console.log(`Verified owner ${owner.id}: ${owner.firstName} ${owner.lastName}`);
  });

  test('creates an owner and retrieves it by id', async ({ apiRequest }) => {
    const highestOwnerId = Math.max(...owners.map((owner) => owner.id));
    const ownerData = createOwnerData();
    const createdOwner = await createOwner(apiRequest, ownerData);
    expect(createdOwner.id).toBeGreaterThan(highestOwnerId);

    const getResponse = await apiRequest.get(`owners/${createdOwner.id}`);
    expect(getResponse.status()).toBe(200);
    const retrievedOwner = (await getResponse.json()) as Owner;
    expect(retrievedOwner).toMatchObject({ ...ownerData, id: createdOwner.id });
    console.log(`Created and verified owner ${retrievedOwner.id}: ${retrievedOwner.firstName} ${retrievedOwner.lastName}`);
  });

  test('creates and deletes an owner', async ({ apiRequest }) => {
    const createdOwner = await createOwner(apiRequest, createOwnerData());

    const deleteResponse = await apiRequest.delete(`owners/${createdOwner.id}`);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await apiRequest.get(`owners/${createdOwner.id}`);
    expect(getResponse.status()).toBe(404);
  });
});

test('updates a pet birth date without changing its id or name', async ({ apiRequest }) => {
  const owners = await getOwners(apiRequest);
  const owner = owners[0];
  const pet = owner.pets[0];
  const newBirthDate = faker.date.birthdate({ min: 1, max: 20, mode: 'age' })
    .toISOString()
    .slice(0, 10);
  console.log('Pet before update:', JSON.stringify({
    name: pet.name,
    birthDate: pet.birthDate,
    type: pet.type,
  }, null, 2));

  const updateResponse = await apiRequest.put(`pets/${pet.id}`, {
    data: { ...pet, birthDate: newBirthDate },
  });
  const getPetResponse = await apiRequest.get(`pets/${pet.id}`);
  const updatedPet = (await getPetResponse.json()) as Pet;
  console.log('Pet after update:', JSON.stringify({
    name: updatedPet.name,
    birthDate: updatedPet.birthDate,
    type: updatedPet.type,
  }, null, 2));

  const restoreResponse = await apiRequest.put(`pets/${pet.id}`, { data: pet });

  expect(updateResponse.status()).toBe(204);
  expect(getPetResponse.status()).toBe(200);
  expect(updatedPet).toMatchObject({
    id: pet.id,
    name: pet.name,
    birthDate: newBirthDate,
  });
  expect(restoreResponse.status()).toBe(204);
});
