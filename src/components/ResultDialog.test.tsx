import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultDialog } from './ResultDialog';

describe('ResultDialog', () => {
  const defaultProps = {
    loser: '쥐' as const,
    emoji: '🐭',
    onRestart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loser information', () => {
    render(<ResultDialog {...defaultProps} />);
    
    expect(screen.getByText('꼴찌는...')).toBeInTheDocument();
    expect(screen.getByText('쥐')).toBeInTheDocument();
    expect(screen.getByText('🐭')).toBeInTheDocument();
    expect(screen.getByText(/점심값은 쥐님이 내세요/)).toBeInTheDocument();
  });

  it('renders watch ad button', () => {
    render(<ResultDialog {...defaultProps} />);
    
    expect(screen.getByText(/광고 보고 다시하기/)).toBeInTheDocument();
  });

  it('shows loading state when watching ad', async () => {
    const user = userEvent.setup();
    render(<ResultDialog {...defaultProps} />);
    
    const adButton = screen.getByText(/광고 보고 다시하기/);
    await user.click(adButton);
    
    await waitFor(() => {
      expect(screen.getByText(/광고 로딩 중/)).toBeInTheDocument();
    });
  });

  it('displays different loser animals correctly', () => {
    const { rerender } = render(<ResultDialog {...defaultProps} />);
    expect(screen.getByText('쥐')).toBeInTheDocument();
    
    rerender(<ResultDialog loser="용" emoji="🐉" onRestart={vi.fn()} />);
    expect(screen.getByText('용')).toBeInTheDocument();
    expect(screen.getByText('🐉')).toBeInTheDocument();
  });
});
