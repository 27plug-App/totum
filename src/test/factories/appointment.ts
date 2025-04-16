import { faker } from '@faker-js/faker';

interface Appointment {
  id: string;
  client_id: string;
  provider_id: string;
  start_time: string;
  end_time: string;
  type: 'Initial Assessment' | 'Follow-up' | 'Therapy Session';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export function createAppointment(overrides: Partial<Appointment> = {}): Appointment {
  const startTime = faker.date.future();
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

  return {
    id: faker.string.uuid(),
    client_id: faker.string.uuid(),
    provider_id: faker.string.uuid(),
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    type: faker.helpers.arrayElement(['Initial Assessment', 'Follow-up', 'Therapy Session']),
    status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
    notes: faker.lorem.paragraph(),
    location: faker.location.streetAddress(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}