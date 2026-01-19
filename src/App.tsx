import { useState } from 'react';
import { PlayerSelection } from './components/PlayerSelection';
import { AnimalSelection } from './components/AnimalSelection';
import { RaceGame } from './components/RaceGame';

export type Animal = '쥐' | '소' | '호랑이' | '토끼' | '용' | '뱀' | '말' | '양' | '원숭이' | '닭' | '개' | '돼지';

export type GameState = 'player-selection' | 'animal-selection' | 'racing';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('player-selection');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [selectedAnimals, setSelectedAnimals] = useState<Animal[]>([]);

  const handlePlayerSelect = (count: number) => {
    setPlayerCount(count);
    setGameState('animal-selection');
  };

  const handleAnimalsSelect = (animals: Animal[]) => {
    setSelectedAnimals(animals);
    setGameState('racing');
  };

  const handleRestart = () => {
    setGameState('player-selection');
    setPlayerCount(2);
    setSelectedAnimals([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {gameState === 'player-selection' && (
        <PlayerSelection onSelect={handlePlayerSelect} />
      )}
      {gameState === 'animal-selection' && (
        <AnimalSelection 
          playerCount={playerCount} 
          onSelect={handleAnimalsSelect}
          onBack={() => setGameState('player-selection')}
        />
      )}
      {gameState === 'racing' && (
        <RaceGame 
          animals={selectedAnimals} 
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
