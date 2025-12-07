import * as fs from "fs";
import * as path from "path";

function parseInput(filePath: string): string[] {
  const absolutePath = path.resolve(__dirname, filePath);
  const fileContent = fs.readFileSync(absolutePath, "utf-8");
  return fileContent.trim().split(/\r?\n/);
}

function solvePart1(lines: string[]) {
  const Height = lines.length;
  const Width = lines[0].length;

  let startCol = -1;
  let startRow = -1;

  // Find S
  for (let row = 0; row < Height; row++) {
    const idx = lines[row].indexOf("S");
    if (idx !== -1) {
      startRow = row;
      startCol = idx;
      break;
    }
  }

  if (startRow === -1) {
    console.error("Start point 'S' not found.");
    return;
  }

  let currentBeams = new Set<number>();
  currentBeams.add(startCol);

  let totalSplits = 0;

  for (let row = startRow + 1; row < Height; row++) {
    if (currentBeams.size === 0) break;

    const nextBeams = new Set<number>();
    const rowStr = lines[row];

    for (const col of currentBeams) {
      const char = rowStr[col];

      if (char === "^") {
        totalSplits++;
        if (col - 1 >= 0) nextBeams.add(col - 1);
        if (col + 1 < Width) nextBeams.add(col + 1);
      } else {
        nextBeams.add(col);
      }
    }
    currentBeams = nextBeams;
  }

  console.log(`Part 1 - Total splits: ${totalSplits}`);
}

function solvePart2(lines: string[]) {
  const Height = lines.length;
  const Width = lines[0].length;

  let startCol = -1;
  let startRow = -1;

  // Find S
  for (let row = 0; row < Height; row++) {
    const idx = lines[row].indexOf("S");
    if (idx !== -1) {
      startRow = row;
      startCol = idx;
      break;
    }
  }

  if (startRow === -1) {
    console.error("Start point 'S' not found.");
    return;
  }

  let currentBeams = new Map<number, number>();
  currentBeams.set(startCol, 1);

  let completedTimelines = 0;

  for (let row = startRow + 1; row < Height; row++) {
    const nextBeams = new Map<number, number>();
    const rowStr = lines[row];

    for (const [col, count] of currentBeams.entries()) {
      const char = rowStr[col];

      if (char === "^") {
        const left = col - 1;
        const right = col + 1;

        if (left >= 0) {
          nextBeams.set(left, (nextBeams.get(left) || 0) + count);
        } else {
          completedTimelines += count;
        }

        if (right < Width) {
          nextBeams.set(right, (nextBeams.get(right) || 0) + count);
        } else {
          completedTimelines += count;
        }
      } else {
        nextBeams.set(col, (nextBeams.get(col) || 0) + count);
      }
    }
    currentBeams = nextBeams;
    if (currentBeams.size === 0) break;
  }

  for (const count of currentBeams.values()) {
    completedTimelines += count;
  }

  console.log(`Part 2 - Total timelines: ${completedTimelines}`);
}

function solve() {
  const inputPath = process.argv[2] || "input.txt";
  const lines = parseInput(inputPath);

  solvePart1(lines);
  solvePart2(lines);
}

solve();
