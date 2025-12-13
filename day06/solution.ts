import * as fs from 'fs';
import * as path from 'path';

const inputContent = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

function extractProblemBlocks(rawData: string): string[][] {
  const rawLines = rawData.split(/\r?\n/);

  const gridWidth = rawLines[0].length;
  const gridLines = rawLines.map((l) => l.padEnd(gridWidth, ' '));
  const gridHeight = gridLines.length;

  const blocks: string[][] = [];
  let currentColumn = 0;
  while (currentColumn < gridWidth) {
    let isCurrentColumnEmpty = true;
    for (let row = 0; row < gridHeight; row++) {
      if (gridLines[row][currentColumn] !== ' ') {
        isCurrentColumnEmpty = false;
        break;
      }
    }

    if (isCurrentColumnEmpty) {
      currentColumn++;
      continue;
    }

    const startColumn = currentColumn;
    while (currentColumn < gridWidth) {
      let isColEmpty = true;
      for (let row = 0; row < gridHeight; row++) {
        if (gridLines[row][currentColumn] !== ' ') {
          isColEmpty = false;
          break;
        }
      }
      if (isColEmpty) break;
      currentColumn++;
    }
    const endColumn = currentColumn;

    const blockLines: string[] = [];
    for (let row = 0; row < gridHeight; row++) {
      blockLines.push(gridLines[row].substring(startColumn, endColumn));
    }
    blocks.push(blockLines);
  }

  return blocks;
}

function solveProblemBlock(blockLines: string[]): {
  part1: number;
  part2: number;
} {
  const height = blockLines.length;
  const width = blockLines[0].length;

  let operatorRowIndex = height - 1;
  let operatorSymbol = blockLines[operatorRowIndex].trim();

  const rowNumbers: number[] = [];
  for (let row = 0; row < height; row++) {
    if (row === operatorRowIndex) continue;

    const rowContent = blockLines[row].trim();
    if (rowContent !== '') {
      const val = parseInt(rowContent, 10);
      if (!isNaN(val)) rowNumbers.push(val);
    }
  }

  const colNumbers: number[] = [];
  for (let col = 0; col < width; col++) {
    let colString = '';
    for (let row = 0; row < height; row++) {
      if (row === operatorRowIndex) continue;
      colString += blockLines[row][col];
    }

    const trimmedCol = colString.trim();
    if (trimmedCol !== '') {
      const val = parseInt(trimmedCol, 10);
      if (!isNaN(val)) colNumbers.push(val);
    }
  }

  const calculate = (nums: number[], op: string) => {
    if (op === '+') return nums.reduce((sum, n) => sum + n, 0);
    if (op === '*') return nums.reduce((prod, n) => prod * n, 1);
    return 0;
  };

  return {
    part1: calculate(rowNumbers, operatorSymbol),
    part2: calculate(colNumbers, operatorSymbol),
  };
}

const allBlocks = extractProblemBlocks(inputContent);
let totalPart1 = 0;
let totalPart2 = 0;

for (const block of allBlocks) {
  const result = solveProblemBlock(block);
  totalPart1 += result.part1;
  totalPart2 += result.part2;
}

console.log('Part 1:', totalPart1);
console.log('Part 2:', totalPart2);
