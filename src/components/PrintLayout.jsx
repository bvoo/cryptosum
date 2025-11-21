import React from 'react';
import PuzzleBoard from './PuzzleBoard';
import { generatePuzzle, DIFFICULTIES } from '../logic/generator';

export default function PrintLayout({ seed }) {
    const easyPuzzle = generatePuzzle(seed, 'Easy');
    const mediumPuzzle = generatePuzzle(seed, 'Medium');
    const hardPuzzle = generatePuzzle(seed, 'Hard');

    return (
        <div className="print-layout">
            <header className="print-header">
                <h1>Daily Cryptosum</h1>
                <p>Date: {seed} | cryptosum.bvoo.xyz</p>
            </header>

            <div className="print-puzzles">
                <div className="print-section">
                    <h2>Easy</h2>
                    <PuzzleBoard puzzle={easyPuzzle} />
                </div>
                <div className="print-section">
                    <h2>Medium</h2>
                    <PuzzleBoard puzzle={mediumPuzzle} />
                </div>
                <div className="print-section">
                    <h2>Hard</h2>
                    <PuzzleBoard puzzle={hardPuzzle} />
                </div>
            </div>

            <footer className="print-footer">
                <p>Instructions: Each symbol represents a unique number (1-9). Row and column sums are given. Deduce the value of each symbol.</p>
            </footer>
        </div>
    );
}
