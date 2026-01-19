import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimalSelection } from './AnimalSelection';

describe('AnimalSelection', () => {
  const defaultProps = {
    playerCount: 3,
    onSelect: vi.fn(),
    onBack: vi.fn(),
  };

  it('renders title and selection count', () => {
    render(<AnimalSelection {...defaultProps} />);
    
    expect(screen.getByText('동물을 선택하세요')).toBeInTheDocument();
    expect(screen.getByText('0/3명 선택됨')).toBeInTheDocument();
  });

  it('renders all 12 zodiac animals', () => {
    render(<AnimalSelection {...defaultProps} />);
    
    const animals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
    
    animals.forEach(animal => {
      expect(screen.getByText(animal)).toBeInTheDocument();
    });
  });

  it('updates selection count when animals are selected', async () => {
    const user = userEvent.setup();
    render(<AnimalSelection {...defaultProps} />);
    
    await user.click(screen.getByText('쥐'));
    expect(screen.getByText('1/3명 선택됨')).toBeInTheDocument();
    
    await user.click(screen.getByText('소'));
    expect(screen.getByText('2/3명 선택됨')).toBeInTheDocument();
  });

  it('deselects animal when clicked again', async () => {
    const user = userEvent.setup();
    render(<AnimalSelection {...defaultProps} />);
    
    await user.click(screen.getByText('쥐'));
    expect(screen.getByText('1/3명 선택됨')).toBeInTheDocument();
    
    await user.click(screen.getByText('쥐'));
    expect(screen.getByText('0/3명 선택됨')).toBeInTheDocument();
  });

  it('disables start button until correct number selected', async () => {
    const user = userEvent.setup();
    render(<AnimalSelection {...defaultProps} />);
    
    const startButton = screen.getByText('게임 시작');
    expect(startButton).toBeDisabled();
    
    await user.click(screen.getByText('쥐'));
    await user.click(screen.getByText('소'));
    expect(startButton).toBeDisabled();
    
    await user.click(screen.getByText('호랑이'));
    expect(startButton).not.toBeDisabled();
  });

  it('calls onSelect with selected animals when start clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    
    render(<AnimalSelection {...defaultProps} onSelect={handleSelect} />);
    
    await user.click(screen.getByText('쥐'));
    await user.click(screen.getByText('소'));
    await user.click(screen.getByText('호랑이'));
    await user.click(screen.getByText('게임 시작'));
    
    expect(handleSelect).toHaveBeenCalledWith(['쥐', '소', '호랑이']);
  });

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();
    
    render(<AnimalSelection {...defaultProps} onBack={handleBack} />);
    
    await user.click(screen.getByText('뒤로'));
    
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('prevents selecting more than playerCount animals', async () => {
    const user = userEvent.setup();
    render(<AnimalSelection {...defaultProps} playerCount={2} />);
    
    await user.click(screen.getByText('쥐'));
    await user.click(screen.getByText('소'));
    await user.click(screen.getByText('호랑이'));
    
    expect(screen.getByText('2/2명 선택됨')).toBeInTheDocument();
  });
});
