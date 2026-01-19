import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerSelection } from './PlayerSelection';

describe('PlayerSelection', () => {
  it('renders title and description', () => {
    render(<PlayerSelection onSelect={vi.fn()} />);
    
    expect(screen.getByText('달리기')).toBeInTheDocument();
    expect(screen.getByText('몇 명이서 게임할까요?')).toBeInTheDocument();
  });

  it('renders player count buttons from 2 to 12', () => {
    render(<PlayerSelection onSelect={vi.fn()} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(11);
    
    expect(screen.getByText('2명')).toBeInTheDocument();
    expect(screen.getByText('12명')).toBeInTheDocument();
  });

  it('calls onSelect with correct count when button is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    
    render(<PlayerSelection onSelect={handleSelect} />);
    
    await user.click(screen.getByText('4명'));
    
    expect(handleSelect).toHaveBeenCalledWith(4);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect with 2 when first button clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    
    render(<PlayerSelection onSelect={handleSelect} />);
    
    await user.click(screen.getByText('2명'));
    
    expect(handleSelect).toHaveBeenCalledWith(2);
  });
});
