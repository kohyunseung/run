import { useState } from 'react';
import { Animal } from '../App';
import { ChevronLeft } from 'lucide-react';

interface AnimalSelectionProps {
  playerCount: number;
  onSelect: (animals: Animal[]) => void;
  onBack: () => void;
}

const ANIMALS: { name: Animal; emoji: string }[] = [
  { name: '쥐', emoji: '🐭' },
  { name: '소', emoji: '🐮' },
  { name: '호랑이', emoji: '🐯' },
  { name: '토끼', emoji: '🐰' },
  { name: '용', emoji: '🐉' },
  { name: '뱀', emoji: '🐍' },
  { name: '말', emoji: '🐴' },
  { name: '양', emoji: '🐑' },
  { name: '원숭이', emoji: '🐵' },
  { name: '닭', emoji: '🐔' },
  { name: '개', emoji: '🐶' },
  { name: '돼지', emoji: '🐷' },
];

export function AnimalSelection({ playerCount, onSelect, onBack }: AnimalSelectionProps) {
  const [selected, setSelected] = useState<Animal[]>([]);

  const toggleAnimal = (animal: Animal) => {
    if (selected.includes(animal)) {
      setSelected(selected.filter(a => a !== animal));
    } else {
      if (selected.length < playerCount) {
        setSelected([...selected, animal]);
      }
    }
  };

  const handleStart = () => {
    if (selected.length === playerCount) {
      onSelect(selected);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-gray-700 active:opacity-60"
        >
          <ChevronLeft size={24} />
          <span>뒤로</span>
        </button>
      </div>

      <div className="flex-1">
        <div className="mb-8">
          <h2 className="text-2xl mb-2">동물을 선택하세요</h2>
          <p className="text-gray-600">
            {selected.length}/{playerCount}명 선택됨
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {ANIMALS.map((animal) => {
            const isSelected = selected.includes(animal.name);
            const isDisabled = !isSelected && selected.length >= playerCount;

            return (
              <button
                key={animal.name}
                onClick={() => toggleAnimal(animal.name)}
                disabled={isDisabled}
                className={`
                  h-24 rounded-2xl border-2 transition-all duration-200 active:scale-95
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : isDisabled
                    ? 'border-gray-200 bg-gray-100 opacity-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl">{animal.emoji}</span>
                  <span className="text-sm">{animal.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-6">
        <button
          onClick={handleStart}
          disabled={selected.length !== playerCount}
          className={`
            w-full h-14 rounded-xl text-lg transition-all duration-200
            ${selected.length === playerCount
              ? 'bg-blue-500 text-white active:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          게임 시작
        </button>
      </div>
    </div>
  );
}
