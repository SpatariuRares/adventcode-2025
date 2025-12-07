import * as fs from "fs";
import * as path from "path";

function parseInput(filePath: string): string[] {
  const absolutePath = path.resolve(__dirname, filePath);
  const fileContent = fs.readFileSync(absolutePath, "utf-8");
  return fileContent.trim().split(/\r?\n/);
}

function findStart(lines: string[]): { row: number; col: number } | null {
  for (let row = 0; row < lines.length; row++) {
    const idx = lines[row].indexOf("S");
    if (idx !== -1) return { row: row, col: idx };
  }
  return null;
}

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
  private memo = new Map<string, number>();
  private lines: string[];
  private Height: number;
  private Width: number;

  constructor(lines: string[]) {
    this.lines = lines;
    this.Height = lines.length;
    this.Width = lines[0].length;
  }

  public countTimelines(row: number, col: number): number {
    if (col < 0 || col >= this.Width) return 1;

    if (row >= this.Height) return 1;

    const key = `${row},${col}`;
    if (this.memo.has(key)) return this.memo.get(key)!;

    const char = this.lines[row][col];
    let result = 0;

    if (char === "^") {
      result =
        this.countTimelines(row + 1, col - 1) +
        this.countTimelines(row + 1, col + 1);
    } else {
      result = this.countTimelines(row + 1, col);
    }

    this.memo.set(key, result);
    return result;
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

function solve() {
  const inputPath = process.argv[2] || "input.txt";
  const lines = parseInput(inputPath);

  solvePart1Bitwise(lines);
  solvePart2Recursive(lines);
}

solve();
