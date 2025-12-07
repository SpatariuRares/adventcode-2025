import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

async function parseInput(filePath: string): Promise<string[]> {
  const absolutePath = path.resolve(__dirname, filePath);
  const fileStream = fs.createReadStream(absolutePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const lines: string[] = [];
  for await (const line of rl) {
    if (line.trim()) {
      lines.push(line);
    }
  }
  return lines;
}

function findStart(lines: string[]): { row: number; col: number } | null {
  for (let row = 0; row < lines.length; row++) {
    const idx = lines[row].indexOf("S");
    if (idx !== -1) return { row: row, col: idx };
  }
  return null;
}

// ... existing code ...

async function solve() {
  const inputPath = process.argv[2] || "input.txt";
  const lines = await parseInput(inputPath);

  solvePart1Bitwise(lines);
  solvePart2Recursive(lines);
}

solve();

function solvePart1Bitwise(lines: string[]) {
  const Height = lines.length;
  const Width = lines[0].length;
  const start = findStart(lines);

  if (!start) {
    console.error("Start point 'S' not found.");
    return;
  }

  let currentBeams = 1n << BigInt(start.col);
  let totalSplits = 0;

  for (let row = start.row + 1; row < Height; row++) {
    if (currentBeams === 0n) break;

    const rowStr = lines[row];
    let splittersMask = 0n;

    for (let c = 0; c < Width; c++) {
      if (rowStr[c] === "^") {
        splittersMask |= 1n << BigInt(c);
      }
    }

    const hits = currentBeams & splittersMask;

    let tempHits = hits;
    while (tempHits > 0n) {
      if (tempHits & 1n) totalSplits++;
      tempHits >>= 1n;
    }

    const straight = currentBeams & ~splittersMask;
    const splitLeft = hits >> 1n;
    const splitRight = hits << 1n;

    currentBeams = straight | splitLeft | splitRight;
  }

  console.log(`Part 1 (Bitwise) - Total splits: ${totalSplits}`);
}

class Part2Solver {
  private lines: string[];
  private Height: number;
  private Width: number;

  constructor(lines: string[]) {
    this.lines = lines;
    this.Height = lines.length;
    this.Width = lines[0].length;
  }

  public countTimelines(startRow: number, startCol: number): bigint {
    // DP array representing the number of timelines for the "next" row
    // Initially represents row = Height, where all values are 1n (base case)
    let nextRowCounts = new Array(this.Width).fill(1n);

    // Iterate bottom-up from the last row to the start row
    for (let r = this.Height - 1; r >= startRow; r--) {
      const currentRowCounts = new Array(this.Width);
      const rowStr = this.lines[r];

      for (let c = 0; c < this.Width; c++) {
        // Optimization: We could restrict c to the relevant cone from startRow/startCol,
        // but iterating all columns is safer and simpler for now given Width ~8000.

        const char = rowStr[c];

        if (char === "^") {
          // Look at r+1, c-1 and r+1, c+1
          // If index is out of bounds, it returns 1n (base case: went off edge)
          const leftVal = c - 1 < 0 ? 1n : nextRowCounts[c - 1];
          const rightVal = c + 1 >= this.Width ? 1n : nextRowCounts[c + 1];
          currentRowCounts[c] = leftVal + rightVal;
        } else {
          // Look at r+1, c
          currentRowCounts[c] = nextRowCounts[c];
        }
      }
      nextRowCounts = currentRowCounts;
    }

    return nextRowCounts[startCol];
  }
}

function solvePart2Recursive(lines: string[]) {
  const start = findStart(lines);
  if (!start) {
    console.error("Start not found");
    return;
  }

  const solver = new Part2Solver(lines);
  const result = solver.countTimelines(start.row + 1, start.col);
  console.log(`Part 2 (Recursive) - Total timelines: ${result}`);
}

// End of file
