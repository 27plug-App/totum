import { faker } from '@faker-js/faker';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  parent_id: string;
  created_at: string;
  updated_at: string;
}

export function createClient(overrides: Partial<Client> = {}): Client {
  return {
    id: faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    status: 'active',
    parent_id: faker.string.uuid(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}