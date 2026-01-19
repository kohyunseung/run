interface PlayerSelectionProps {
  onSelect: (count: number) => void;
}

export function PlayerSelection({ onSelect }: PlayerSelectionProps) {
  const playerCounts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 pb-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl mb-3">🍚</h1>
          <h2 className="text-2xl mb-2">점심값 내기</h2>
          <p className="text-gray-600">몇 명이서 게임할까요?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {playerCounts.map((count) => (
            <button
              key={count}
              onClick={() => onSelect(count)}
              className="h-16 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 active:scale-95"
            >
              <span className="text-lg">{count}명</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
