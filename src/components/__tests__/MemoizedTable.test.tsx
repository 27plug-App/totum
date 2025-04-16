import { render, screen, fireEvent } from '../../test/utils';
import { MemoizedTable } from '../common/MemoizedTable';
import { vi } from 'vitest';

describe('MemoizedTable', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
  ];

  it('renders table with correct data', () => {
    render(
      <MemoizedTable
        data={mockData}
        columns={columns}
        rowKey="id"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('handles sorting when clicking sortable columns', () => {
    const mockSort = vi.fn();
    render(
      <MemoizedTable
        data={mockData}
        columns={columns}
        rowKey="id"
        onSort={mockSort}
      />
    );

    fireEvent.click(screen.getByText('Name'));
    expect(mockSort).toHaveBeenCalledWith('name');
  });

  it('renders custom cell content using render prop', () => {
    const columnsWithRender = [
      ...columns,
      {
        key: 'name',
        header: 'Custom',
        render: (value: string) => <span>Custom: {value}</span>,
      },
    ];

    render(
      <MemoizedTable
        data={mockData}
        columns={columnsWithRender}
        rowKey="id"
      />
    );

    expect(screen.getByText('Custom: John Doe')).toBeInTheDocument();
  });
});