import React, { useState, useEffect } from 'react';

export default function PuzzleBoard({ puzzle, puzzleId, showSolution = false }) {
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

    // Save state when guesses or revealed change
    useEffect(() => {
        if (puzzleId) {
            localStorage.setItem(`cryptosum-${puzzleId}`, JSON.stringify({
                guesses,
                revealed: Array.from(revealed)
            }));
        }
    }, [guesses, revealed, puzzleId]);

    const handleGuessChange = (symbol, value) => {
        if (revealed.has(symbol)) return; // Cannot change revealed symbols
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
                    <button onClick={handleRandomHint} disabled={revealed.size === symbols.length}>Random Hint</button>
                    <button onClick={handlePickHint} className={isPickingHint ? 'active' : ''} disabled={revealed.size === symbols.length}>
                        {isPickingHint ? 'Cancel Pick' : 'Pick Hint'}
                    </button>
                    <button onClick={handleRevealAll} disabled={revealed.size === symbols.length}>Reveal All</button>
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
                                    readOnly={revealed.has(sym)}
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
        </div>
    );
}
