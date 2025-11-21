import React, { useState, useEffect } from 'react';

export default function PuzzleBoard({ puzzle, puzzleId, showSolution = false, date, difficulty }) {
    const { grid, rowSums, colSums, symbols, symbolMap } = puzzle;

    // Initialize state from localStorage if available
    const [guesses, setGuesses] = useState(() => {
        if (!puzzleId) return {};
        const saved = localStorage.getItem(`cryptosum-${puzzleId}`);
        return saved ? JSON.parse(saved).guesses : {};
    });

    const [revealed, setRevealed] = useState(() => {
        if (!puzzleId) return new Set();
        const saved = localStorage.getItem(`cryptosum-${puzzleId}`);
        return saved ? new Set(JSON.parse(saved).revealed) : new Set();
    });

    const [isPickingHint, setIsPickingHint] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const [secondsElapsed, setSecondsElapsed] = useState(() => {
        if (!puzzleId) return 0;
        const saved = localStorage.getItem(`cryptosum-timer-${puzzleId}`);
        return saved ? parseInt(saved, 10) : 0;
    });

    // Save state when guesses or revealed change
    useEffect(() => {
        if (puzzleId) {
            localStorage.setItem(`cryptosum-${puzzleId}`, JSON.stringify({
                guesses,
                revealed: Array.from(revealed)
            }));
        }
    }, [guesses, revealed, puzzleId]);

    // Timer Logic
    useEffect(() => {
        if (!puzzleId || isComplete || showSolution) return;

        const timerId = setInterval(() => {
            setSecondsElapsed(prev => {
                const newVal = prev + 1;
                localStorage.setItem(`cryptosum-timer-${puzzleId}`, newVal);
                return newVal;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [puzzleId, isComplete, showSolution]);

    // Check for completion
    useEffect(() => {
        if (showSolution || isComplete) return;

        const allSymbolsGuessed = symbols.every(s => guesses[s] !== undefined && guesses[s] !== '');
        if (allSymbolsGuessed) {
            const allCorrect = symbols.every(s => parseInt(guesses[s]) === symbolMap[s]);
            if (allCorrect) {
                setIsComplete(true);
                setShowCompletionModal(true);
            }
        }
    }, [guesses, symbols, symbolMap, showSolution, isComplete]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleGuessChange = (symbol, value) => {
        if (revealed.has(symbol) || isComplete) return; // Cannot change revealed symbols or if complete
        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 9)) {
            setGuesses(prev => ({ ...prev, [symbol]: value }));
        }
    };

    const revealSymbol = (symbol) => {
        const val = symbolMap[symbol];
        setGuesses(prev => ({ ...prev, [symbol]: val }));
        setRevealed(prev => new Set(prev).add(symbol));
        setIsPickingHint(false);
    };

    const handleRandomHint = () => {
        const unrevealed = symbols.filter(s => !revealed.has(s));
        if (unrevealed.length === 0) return;
        const randomSym = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        revealSymbol(randomSym);
    };

    const handlePickHint = () => {
        setIsPickingHint(!isPickingHint);
    };

    const handleRevealAll = () => {
        const allGuesses = {};
        symbols.forEach(s => allGuesses[s] = symbolMap[s]);
        setGuesses(allGuesses);
        setRevealed(new Set(symbols));
        setIsPickingHint(false);
    };

    const onSymbolClick = (symbol) => {
        if (isPickingHint && !revealed.has(symbol)) {
            revealSymbol(symbol);
        }
    };

    // Calculate current sums based on guesses
    const calculateRowSum = (rowIndex) => {
        return grid[rowIndex].reduce((sum, sym) => {
            const val = parseInt(guesses[sym]) || 0;
            return sum + val;
        }, 0);
    };

    const calculateColSum = (colIndex) => {
        let sum = 0;
        for (let r = 0; r < grid.length; r++) {
            const sym = grid[r][colIndex];
            const val = parseInt(guesses[sym]) || 0;
            sum += val;
        }
        return sum;
    };

    return (
        <div className="puzzle-board">
            <div className={`grid-container ${isPickingHint ? 'picking-hint' : ''}`} style={{ '--grid-size': grid.length }}>
                {/* Column Sums Header (Empty top-left) */}
                <div className="cell empty"></div>
                {colSums.map((sum, i) => (
                    <div key={`col-sum-${i}`} className={`cell header col-header ${calculateColSum(i) === sum ? 'correct' : ''}`}>
                        {sum}
                    </div>
                ))}

                {/* Grid Rows */}
                {grid.map((row, rIndex) => (
                    <React.Fragment key={`row-${rIndex}`}>
                        {/* Row Sum Header */}
                        <div className={`cell header row-header ${calculateRowSum(rIndex) === rowSums[rIndex] ? 'correct' : ''}`}>
                            {rowSums[rIndex]}
                        </div>
                        {/* Cells */}
                        {row.map((symbol, cIndex) => (
                            <div
                                key={`cell-${rIndex}-${cIndex}`}
                                className={`cell symbol-cell ${revealed.has(symbol) ? 'revealed' : ''} ${isPickingHint && !revealed.has(symbol) ? 'clickable' : ''}`}
                                onClick={() => onSymbolClick(symbol)}
                            >
                                <span className="symbol">{symbol}</span>
                                {showSolution ? (
                                    <span className="solution-value">{symbolMap[symbol]}</span>
                                ) : (
                                    <span className="cell-guess">{guesses[symbol] || ''}</span>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>

            {/* Hint Controls */}
            {!showSolution && (
                <div className="hint-controls">
                    <div className="timer-display">{formatTime(secondsElapsed)}</div>
                    <button onClick={handleRandomHint} disabled={revealed.size === symbols.length || isComplete}>Random Hint</button>
                    <button onClick={handlePickHint} className={isPickingHint ? 'active' : ''} disabled={revealed.size === symbols.length || isComplete}>
                        {isPickingHint ? 'Cancel Pick' : 'Pick Hint'}
                    </button>
                    <button onClick={handleRevealAll} disabled={revealed.size === symbols.length || isComplete}>Reveal All</button>
                </div>
            )}

            {/* Legend / Input Area */}
            {!showSolution && (
                <div className="legend">
                    <h3>Decipher the Symbols</h3>
                    <div className="legend-grid">
                        {symbols.map(sym => (
                            <div key={`legend-${sym}`} className={`legend-item ${revealed.has(sym) ? 'revealed-item' : ''}`}>
                                <span className="symbol">{sym}</span>
                                <span>=</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="9"
                                    value={guesses[sym] || ''}
                                    onChange={(e) => handleGuessChange(sym, e.target.value)}
                                    placeholder="?"
                                    readOnly={revealed.has(sym) || isComplete}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Print Legend (Side Column) */}
            <div className="print-legend">
                {symbols.map(sym => (
                    <div key={`print-legend-${sym}`} className="print-legend-item">
                        <span className="symbol">{sym}</span>
                        <span className="equals">=</span>
                        <span className="underscore">___</span>
                    </div>
                ))}
            </div>

            {/* Completion Modal */}
            {showCompletionModal && (
                <div className="completion-modal-overlay">
                    <div className="completion-modal">
                        <h2>Puzzle Completed!</h2>
                        <p>Great job! You've deciphered all the symbols.</p>
                        <div className="completion-details">
                            <p><strong>Date:</strong> {date}</p>
                            <p><strong>Difficulty:</strong> {difficulty}</p>
                            <p><strong>Time:</strong> {formatTime(secondsElapsed)}</p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => {
                                const text = `Daily Cryptosum ${date}\nDifficulty: ${difficulty}\nTime: ${formatTime(secondsElapsed)}\nhttps://cryptosum.bvoo.xyz`;
                                navigator.clipboard.writeText(text);
                                alert('Copied to clipboard!');
                            }} className="btn-share">Share</button>
                            <button onClick={() => setShowCompletionModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
