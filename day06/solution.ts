import * as fs from "fs";
import * as path from "path";

const input = fs.readFileSync(path.join(__dirname, "input.txt"), "utf-8");

function getBlocks(data: string): string[][] {
  const lines = data.split(/\r?\n/);
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  if (lines.length === 0) return [];

  const maxLength = lines[0].length;
  const paddedLines = lines.map((l) => l.padEnd(maxLength, " "));
  const height = paddedLines.length;

  const blocks: string[][] = [];

  const isColEmpty = (col: number) => {
    for (let r = 0; r < height; r++) {
      if (paddedLines[r][col] !== " ") return false;
    }
    return true;
  };

  let col = 0;
  while (col < maxLength) {
    if (isColEmpty(col)) {
      col++;
      continue;
    }

    const start = col;
    while (col < maxLength && !isColEmpty(col)) {
      col++;
    }
    const end = col;

    const blockCols: string[] = [];
    for (let r = 0; r < height; r++) {
      blockCols.push(paddedLines[r].substring(start, end));
    }
    blocks.push(blockCols);
  }
  return blocks;
}

function solveBlockPart1(block: string[]): number {
  const nums: number[] = [];
  let op = "+";

  for (const line of block) {
    const trimmed = line.trim();
    if (trimmed === "+" || trimmed === "*") {
      op = trimmed;
    } else if (trimmed !== "") {
      const val = parseInt(trimmed, 10);
      if (!isNaN(val)) nums.push(val);
    }
  }

  if (op === "+") return nums.reduce((a, b) => a + b, 0);
  if (op === "*") return nums.reduce((a, b) => a * b, 1);
  return 0;
}

function solveBlockPart2(block: string[]): number {
  let opRowIdx = -1;
  let op = "";

  for (let r = block.length - 1; r >= 0; r--) {
    const trimmed = block[r].trim();
    if (trimmed === "+" || trimmed === "*") {
      op = trimmed;
      opRowIdx = r;
      break;
    }
  }

  if (opRowIdx === -1) return 0;

  const nums: number[] = [];
  const width = block[0].length;

  // Iterate columns to find numbers (Right-to-Left or Left-to-Right doesn't matter for sum/product)
  for (let c = 0; c < width; c++) {
    let numStr = "";
    // Iterate rows excluding operator row
    for (let r = 0; r < block.length; r++) {
      if (r === opRowIdx) continue;
      // Include spaces? No, spaces are part of the number column but valid digits are non-space
      // If the column has a space, it's just not a digit.
      numStr += block[r][c];
    }

    const trimmed = numStr.trim();
    if (trimmed) {
      const val = parseInt(trimmed, 10);
      if (!isNaN(val)) nums.push(val);
    }
  }

  if (op === "+") return nums.reduce((a, b) => a + b, 0);
  if (op === "*") return nums.reduce((a, b) => a * b, 1);
  return 0;
}

function part1(data: string): number {
  const blocks = getBlocks(data);
  return blocks.reduce((sum, b) => sum + solveBlockPart1(b), 0);
}

function part2(data: string): number {
  const blocks = getBlocks(data);
  return blocks.reduce((sum, b) => sum + solveBlockPart2(b), 0);
}

console.log("Part 1:", part1(input));
console.log("Part 2:", part2(input));
