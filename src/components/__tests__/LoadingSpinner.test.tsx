import { render } from '../../test/utils';
import LoadingSpinner from '../LoadingSpinner';
import { vi } from 'vitest';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('applies size classes correctly', () => {
    const { container: smallContainer } = render(<LoadingSpinner size="small" />);
    const { container: largeContainer } = render(<LoadingSpinner size="large" />);

    expect(smallContainer.querySelector('svg')).toHaveClass('h-4', 'w-4');
    expect(largeContainer.querySelector('svg')).toHaveClass('h-12', 'w-12');
  });

  it('displays message when provided', () => {
    const message = 'Loading data...';
    const { getByText } = render(<LoadingSpinner message={message} />);
    expect(getByText(message)).toBeInTheDocument();
  });

  it('shows progress bar when progress is provided', () => {
    const { container } = render(<LoadingSpinner progress={50} />);
    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('applies custom color class', () => {
    const { container } = render(<LoadingSpinner color="text-red-600" />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).not.toBeNull();
    expect(svgElement).toHaveClass('text-red-600');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});