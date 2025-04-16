import { faker } from '@faker-js/faker';
import { User } from '../../types/auth';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    role: 'employee',
    status: 'active',
    permissions: [],
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({ role: 'admin', ...overrides });
}

export function createParent(overrides: Partial<User> = {}): User {
  return createUser({ role: 'parent', ...overrides });
}