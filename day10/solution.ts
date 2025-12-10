import * as fs from "fs";
import * as path from "path";

interface Machine {
  buttons: number[][];
  targetGF2: number[];
  targetReal: number[];
}

function parseMachines(input: string): Machine[] {
  return input
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const matchGF2 = line.match(/^\[([\.#]+)\]/);
      const targetGF2 = matchGF2
        ? matchGF2[1].split("").map((c) => (c === "#" ? 1 : 0))
        : [];

      const matchReal = line.match(/\{([\d,]+)\}/);
      const targetReal = matchReal ? matchReal[1].split(",").map(Number) : [];

      const N = Math.max(targetGF2.length, targetReal.length);
      const buttons: number[][] = [];
      const parts = line.split(" ");

      for (const p of parts) {
        if (p.startsWith("(")) {
          const ind = p.slice(1, -1).split(",").map(Number);
          const col = new Array(N).fill(0);
          ind.forEach((i) => (col[i] = 1));
          buttons.push(col);
        }
      }

      return { buttons, targetGF2, targetReal };
    });
}

// --- Solvers ---

function solveGF2(machine: Machine): number | null {
  const { buttons, targetGF2 } = machine;
  const N = targetGF2.length;
  const M = buttons.length;
  if (N === 0) return 0;

  const A = Array.from({ length: N }, (_, r) => [
    ...buttons.map((col) => col[r]),
    targetGF2[r],
  ]);

  const { pivots, freeVars, reduced } = gaussianGF2(A, N, M);
  if (!checkConsistencyGF2(reduced, N, M)) return null;
  return findMinWeightGF2(reduced, pivots, freeVars, M);
}

function solveReal(machine: Machine): number | null {
  const { buttons, targetReal } = machine;
  const N = targetReal.length;
  const M = buttons.length;
  if (N === 0) return 0;

  const A = Array.from({ length: N }, (_, r) => [
    ...buttons.map((col) => col[r]),
    targetReal[r],
  ]);

  const { pivots, freeVars, reduced } = gaussianReal(A, N, M);
  if (!checkConsistencyReal(reduced, N, M)) return null;

  return findMinSumReal(reduced, pivots, freeVars, M, Math.max(...targetReal));
}

function gaussianGF2(mat: number[][], N: number, M: number) {
  let pivotRow = 0;
  const pivots: { r: number; c: number }[] = [];
  const pivotCols = new Set<number>();

  for (let c = 0; c < M && pivotRow < N; c++) {
    let sel = -1;
    for (let r = pivotRow; r < N; r++) {
      if (mat[r][c] === 1) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;

    [mat[pivotRow], mat[sel]] = [mat[sel], mat[pivotRow]];

    for (let r = 0; r < N; r++) {
      if (r !== pivotRow && mat[r][c] === 1) {
        for (let k = c; k <= M; k++) mat[r][k] ^= mat[pivotRow][k];
      }
    }
    pivots.push({ r: pivotRow, c });
    pivotCols.add(c);
    pivotRow++;
  }

  const freeVars = [];
  for (let c = 0; c < M; c++) if (!pivotCols.has(c)) freeVars.push(c);

  return { pivots, freeVars, reduced: mat };
}

function checkConsistencyGF2(mat: number[][], N: number, M: number): boolean {
  for (let r = 0; r < N; r++) {
    let allZero = true;
    for (let c = 0; c < M; c++)
      if (mat[r][c] !== 0) {
        allZero = false;
        break;
      }
    if (allZero && mat[r][M] === 1) return false;
  }
  return true;
}

function findMinWeightGF2(
  mat: number[][],
  pivots: { r: number; c: number }[],
  freeVars: number[],
  M: number
): number {
  // Base solution
  const sol = new Array(M).fill(0);
  pivots.forEach(({ r, c }) => (sol[c] = mat[r][M]));

  // Basis vectors
  const basis: number[][] = [];
  for (const f of freeVars) {
    const vec = new Array(M).fill(0);
    vec[f] = 1;
    pivots.forEach(({ r, c }) => {
      if (mat[r][f] === 1) vec[c] ^= 1;
    });
    basis.push(vec);
  }

  let minW = Infinity;
  const count = 1 << basis.length;
  for (let i = 0; i < count; i++) {
    const curr = [...sol];
    for (let b = 0; b < basis.length; b++) {
      if ((i >> b) & 1) {
        for (let k = 0; k < M; k++) curr[k] ^= basis[b][k];
      }
    }
    const w = curr.reduce((a, b) => a + b, 0);
    if (w < minW) minW = w;
  }
  return minW;
}

// --- Math Helpers: Real ---

function gaussianReal(mat: number[][], N: number, M: number) {
  let pivotRow = 0;
  const pivots: { r: number; c: number }[] = [];
  const pivotCols = new Set<number>();
  const EPS = 1e-9;

  for (let c = 0; c < M && pivotRow < N; c++) {
    let sel = -1;
    for (let r = pivotRow; r < N; r++) {
      if (Math.abs(mat[r][c]) > EPS) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;

    [mat[pivotRow], mat[sel]] = [mat[sel], mat[pivotRow]];

    // Normalize
    const factor = mat[pivotRow][c];
    for (let k = c; k <= M; k++) mat[pivotRow][k] /= factor;

    // Eliminate
    for (let r = 0; r < N; r++) {
      if (r !== pivotRow && Math.abs(mat[r][c]) > EPS) {
        const f = mat[r][c];
        for (let k = c; k <= M; k++) mat[r][k] -= f * mat[pivotRow][k];
      }
    }
    pivots.push({ r: pivotRow, c });
    pivotCols.add(c);
    pivotRow++;
  }

  const freeVars = [];
  for (let c = 0; c < M; c++) if (!pivotCols.has(c)) freeVars.push(c);

  return { pivots, freeVars, reduced: mat };
}

function checkConsistencyReal(mat: number[][], N: number, M: number): boolean {
  const EPS = 1e-9;
  for (let r = 0; r < N; r++) {
    let allZero = true;
    for (let c = 0; c < M; c++)
      if (Math.abs(mat[r][c]) > EPS) {
        allZero = false;
        break;
      }
    if (allZero && Math.abs(mat[r][M]) > EPS) return false;
  }
  return true;
}

function findMinSumReal(
  mat: number[][],
  pivots: { r: number; c: number }[],
  freeVars: number[],
  M: number,
  maxVal: number
): number | null {
  let minTotal = Infinity;
  const EPS = 1e-9;

  const search = (idx: number, currentFree: number[]) => {
    if (idx === freeVars.length) {
      let sum = currentFree.reduce((a, b) => a + b, 0);
      let valid = true;
      for (let i = pivots.length - 1; i >= 0; i--) {
        const { r, c } = pivots[i];
        let val = mat[r][M];
        for (let j = 0; j < freeVars.length; j++) {
          val -= mat[r][freeVars[j]] * currentFree[j];
        }

        if (val < -EPS || Math.abs(val - Math.round(val)) > EPS) {
          valid = false;
          break;
        }
        sum += Math.round(val);
      }
      if (valid && sum < minTotal) minTotal = sum;
      return;
    }

    for (let v = 0; v <= maxVal; v++) {
      currentFree.push(v);
      search(idx + 1, currentFree);
      currentFree.pop();
    }
  };

  search(0, []);
  return minTotal === Infinity ? null : minTotal;
}

try {
  const input = fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf-8")
    .trim();
  const machines = parseMachines(input);

  const part1 = machines.reduce((sum, m) => sum + (solveGF2(m) ?? 0), 0);
  console.log("Part 1:", part1);

  const part2 = machines.reduce((sum, m) => sum + (solveReal(m) ?? 0), 0);
  console.log("Part 2:", part2);
} catch (e) {
  console.error("Error:", e);
}
