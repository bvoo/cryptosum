import seedrandom from 'seedrandom';

const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const SHAPES = ['●', '■', '▲', '★', '◆', '▼', '✚', '⬟', '☾'];

export const DIFFICULTIES = {
  Easy: { size: 3, distinct: 3, minVal: 1, maxVal: 9 },
  Medium: { size: 4, distinct: 4, minVal: 1, maxVal: 9 },
  Hard: { size: 5, distinct: 6, minVal: 1, maxVal: 9 },
};

export function getDailySeed() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function generatePuzzle(seed, difficultyKey = 'Easy') {
  const rng = seedrandom(seed + difficultyKey);
  const config = DIFFICULTIES[difficultyKey];
  const { size, distinct, minVal, maxVal } = config;

  // 1. Select 'distinct' random values from range [minVal, maxVal]
  const availableValues = [];
  for (let i = minVal; i <= maxVal; i++) availableValues.push(i);

  // Shuffle available values
  for (let i = availableValues.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [availableValues[i], availableValues[j]] = [availableValues[j], availableValues[i]];
  }

  const selectedValues = availableValues.slice(0, distinct);

  // Map values to symbols
  const symbolMap = {};
  selectedValues.forEach((val, idx) => {
    symbolMap[SHAPES[idx]] = val; // Using SHAPES by default
  });
  const symbols = Object.keys(symbolMap);

  // 2. Fill grid
  const grid = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const randomSymbolIndex = Math.floor(rng() * distinct);
      row.push(symbols[randomSymbolIndex]);
    }
    grid.push(row);
  }

  // 3. Calculate sums
  const rowSums = grid.map(row => row.reduce((sum, sym) => sum + symbolMap[sym], 0));
  const colSums = [];
  for (let c = 0; c < size; c++) {
    let sum = 0;
    for (let r = 0; r < size; r++) {
      sum += symbolMap[grid[r][c]];
    }
    colSums.push(sum);
  }

  // Filter symbols to only those present in the grid
  const usedSymbolsSet = new Set();
  grid.forEach(row => row.forEach(sym => usedSymbolsSet.add(sym)));
  const usedSymbols = symbols.filter(s => usedSymbolsSet.has(s));

  return {
    grid,
    rowSums,
    colSums,
    symbolMap, // Solution
    symbols: usedSymbols,   // Available symbols to show in legend (filtered)
    difficulty: difficultyKey
  };
}
