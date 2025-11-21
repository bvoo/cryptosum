import React, { useState, useEffect } from 'react';
import PuzzleBoard from './components/PuzzleBoard';
import PrintLayout from './components/PrintLayout';
import { generatePuzzle, getDailySeed, DIFFICULTIES } from './logic/generator';

function App() {
  const [date, setDate] = useState(getDailySeed());
  const [difficulty, setDifficulty] = useState('Easy');
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    setPuzzle(generatePuzzle(date, difficulty));
  }, [date, difficulty]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <div className="screen-only">
        <header className="app-header">
          <h1>Daily Cryptosum</h1>
          <div className="controls">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="date-picker"
            />
            <button onClick={handlePrint} className="btn-primary">Print Daily Puzzles</button>
          </div>
        </header>

        <main className="main-content">
          <div className="difficulty-tabs">
            {Object.keys(DIFFICULTIES).map(diff => (
              <button
                key={diff}
                className={`tab-btn ${difficulty === diff ? 'active' : ''}`}
                onClick={() => setDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>

          {puzzle && (
            <div className="puzzle-wrapper">
              <PuzzleBoard
                key={`${date}-${difficulty}`}
                puzzle={puzzle}
                puzzleId={`${date}-${difficulty}`}
                date={date}
                difficulty={difficulty}
              />
            </div>
          )}
        </main>
      </div>

      <PrintLayout seed={date} />
    </div>
  );
}

export default App;
