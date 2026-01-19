import { useState, useEffect } from 'react';
import { Animal } from '../App';
import { ResultDialog } from './ResultDialog';

interface RaceGameProps {
  animals: Animal[];
  onRestart: () => void;
}

const ANIMAL_EMOJIS: Record<Animal, string> = {
  '쥐': '🐭',
  '소': '🐮',
  '호랑이': '🐯',
  '토끼': '🐰',
  '용': '🐉',
  '뱀': '🐍',
  '말': '🐴',
  '양': '🐑',
  '원숭이': '🐵',
  '닭': '🐔',
  '개': '🐶',
  '돼지': '🐷',
};

interface RaceResult {
  animal: Animal;
  position: number;
  progress: number;
}

export function RaceGame({ animals, onRestart }: RaceGameProps) {
  const [raceStarted, setRaceStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [results, setResults] = useState<RaceResult[]>(
    animals.map(animal => ({ animal, position: 0, progress: 0 }))
  );
  const [finished, setFinished] = useState(false);
  const [loser, setLoser] = useState<Animal | null>(null);

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !raceStarted) {
      setRaceStarted(true);
    }
  }, [countdown, raceStarted]);

  // Race simulation
  useEffect(() => {
    if (!raceStarted || finished) return;

    const interval = setInterval(() => {
      setResults(prevResults => {
        const newResults = prevResults.map(result => {
          if (result.progress >= 100) return result;
          
          // Random speed between 1.5 and 4
          const speed = Math.random() * 2.5 + 1.5;
          const newProgress = Math.min(result.progress + speed, 100);
          
          return {
            ...result,
            progress: newProgress,
          };
        });

        // Check if all finished
        const allFinished = newResults.every(r => r.progress >= 100);
        
        if (allFinished) {
          // Assign positions
          const sorted = [...newResults].sort((a, b) => {
            // Animals that finished first (reached 100 earlier) should have lower positions
            return b.progress - a.progress;
          });
          
          const withPositions = newResults.map(result => {
            const index = sorted.findIndex(s => s.animal === result.animal);
            return { ...result, position: sorted.length - index };
          });

          // Find the loser (highest position number = last place)
          const lastPlace = withPositions.reduce((max, curr) => 
            curr.position > max.position ? curr : max
          );
          
          setLoser(lastPlace.animal);
          setFinished(true);
          
          return withPositions;
        }

        return newResults;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [raceStarted, finished]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white text-8xl animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      <div className="px-5 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl mb-1">🏁 100m 달리기</h2>
          <p className="text-gray-600">누가 꼴찌를 할까요?</p>
        </div>

        {/* Race track */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={result.animal} className="relative">
              {/* Track */}
              <div className="h-16 bg-white rounded-xl border-2 border-gray-200 overflow-hidden relative">
                {/* Progress background */}
                <div 
                  className="absolute inset-y-0 left-0 bg-blue-100 transition-all duration-100"
                  style={{ width: `${result.progress}%` }}
                />
                
                {/* Animal */}
                <div 
                  className="absolute inset-y-0 flex items-center transition-all duration-100"
                  style={{ left: `${Math.min(result.progress, 95)}%` }}
                >
                  <span className="text-3xl transform -translate-x-1/2">
                    {ANIMAL_EMOJIS[result.animal]}
                  </span>
                </div>

                {/* Finish line */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500" />
              </div>

              {/* Animal name */}
              <div className="mt-1 text-sm text-gray-600 text-center">
                {result.animal}
                {result.progress >= 100 && result.position > 0 && (
                  <span className="ml-2 text-blue-500">#{result.position}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Race status */}
        {raceStarted && !finished && (
          <div className="mt-8 text-center">
            <div className="inline-block px-6 py-3 bg-blue-500 text-white rounded-full">
              경주 진행중...
            </div>
          </div>
        )}
      </div>

      {/* Result Dialog */}
      {finished && loser && (
        <ResultDialog 
          loser={loser} 
          emoji={ANIMAL_EMOJIS[loser]}
          onRestart={onRestart}
        />
      )}
    </div>
  );
}
