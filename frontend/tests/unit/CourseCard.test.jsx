import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseCard from '../../src/components/CourseCard';

// CourseCard - 10 Tests (Core functionality)
describe('CourseCard - Unit Tests', () => {
  const mockProps = {
    id: 'data-structures',
    title: 'Data Structures',
    tagline: 'Master DSA',
    description: 'Learn fundamental data structures',
    stats: [
      { label: 'Topics', value: '8' },
      { label: 'Quizzes', value: '8' },
    ],
    topics: ['Arrays', 'Linked Lists'],
  };

  it('should render course card with information', () => {
    render(<CourseCard {...mockProps} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('Data Structures')).toBeInTheDocument();
  });

  it('should display stats', () => {
    render(<CourseCard {...mockProps} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('Topics')).toBeInTheDocument();
  });

  it('should display topics', () => {
    render(<CourseCard {...mockProps} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('Arrays')).toBeInTheDocument();
  });

  it('should show enroll button', () => {
    render(<CourseCard {...mockProps} enrolled={false} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('Enroll Now')).toBeInTheDocument();
  });

  it('should call onEnroll when clicked', async () => {
    const onEnroll = vi.fn();
    const user = userEvent.setup();
    render(<CourseCard {...mockProps} enrolled={false} onEnroll={onEnroll} onStart={vi.fn()} />);
    await user.click(screen.getByText('Enroll Now'));
    expect(onEnroll).toHaveBeenCalledWith('data-structures');
  });

  it('should show progress when enrolled', () => {
    render(<CourseCard {...mockProps} enrolled={true} progress={50} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should show completed status', () => {
    render(<CourseCard {...mockProps} enrolled={true} completed={true} progress={100} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
  });

  it('should call onStart', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<CourseCard {...mockProps} enrolled={true} progress={50} onEnroll={vi.fn()} onStart={onStart} />);
    await user.click(screen.getByText('🚀 Continue Journey'));
    expect(onStart).toHaveBeenCalledWith('data-structures');
  });

  it('should handle missing topics', () => {
    const props = { ...mockProps, topics: [] };
    render(<CourseCard {...props} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('Data Structures')).toBeInTheDocument();
  });

  it('should handle 100% progress', () => {
    render(<CourseCard {...mockProps} enrolled={true} progress={100} onEnroll={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
