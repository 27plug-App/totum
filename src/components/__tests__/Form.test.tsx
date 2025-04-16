import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { Form } from '../common/Form';
import { z } from 'zod';
import { vi } from 'vitest';

describe('Form', () => {
  const mockSubmit = vi.fn();
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
  });

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
    },
  ];

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders all fields correctly', () => {
    render(
      <Form
        fields={fields}
        schema={schema}
        onSubmit={mockSubmit}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows validation errors on blur', async () => {
    render(
      <Form
        fields={fields}
        schema={schema}
        onSubmit={mockSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'a' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(
      <Form
        fields={fields}
        schema={schema}
        onSubmit={mockSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });
});