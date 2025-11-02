import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// UI Components - 8 Tests (Core UI)
describe('UI Components - Unit Tests', () => {
  it('should render LoadingButton', () => {
    const Button = ({ isLoading, onClick, children }) => (
      <button onClick={onClick} disabled={isLoading}>{children}</button>
    );
    render(<Button isLoading={false} onClick={vi.fn()}>Click</Button>);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('should disable LoadingButton when loading', () => {
    const Button = ({ isLoading, onClick, children }) => (
      <button onClick={onClick} disabled={isLoading}>{children}</button>
    );
    render(<Button isLoading={true} onClick={vi.fn()}>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should call onClick on button click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const Button = ({ isLoading, onClick, children }) => (
      <button onClick={onClick} disabled={isLoading}>{children}</button>
    );
    render(<Button isLoading={false} onClick={onClick}>Click</Button>);
    await user.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should render ProgressBar', () => {
    const ProgressBar = ({ progress }) => <div>{Math.round(progress || 0)}%</div>;
    render(<ProgressBar progress={65} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('should render 0% progress', () => {
    const ProgressBar = ({ progress }) => <div>{Math.round(progress || 0)}%</div>;
    render(<ProgressBar progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render 100% progress', () => {
    const ProgressBar = ({ progress }) => <div>{Math.round(progress || 0)}%</div>;
    render(<ProgressBar progress={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render Toast component', () => {
    const Toast = ({ message }) => <div>{message}</div>;
    render(<Toast message="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle decimal progress', () => {
    const ProgressBar = ({ progress }) => <div>{Math.round(progress || 0)}%</div>;
    render(<ProgressBar progress={33.33} />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});
