import * as fs from 'fs';
import * as path from 'path';

interface Point {
  x: number;
  y: number;
}
interface Rect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const readInput = (filename: string): Point[] =>
  fs
    .readFileSync(path.join(__dirname, filename), 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [x, y] = l.split(',').map(Number);
      return { x, y };
    });

function solve() {
  const points = readInput('input.txt');

  console.time('Part 1');
  let maxAreaP1 = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const width = Math.abs(points[i].x - points[j].x) + 1;
      const height = Math.abs(points[i].y - points[j].y) + 1;
      const area = width * height;
      if (area > maxAreaP1) maxAreaP1 = area;
    }
  }
  console.log(`Part 1 Max Area: ${maxAreaP1}`);
  console.timeEnd('Part 1');

  console.time('Part 2');

  const xs = Array.from(new Set(points.map((p) => p.x))).sort((a, b) => a - b);
  const ys = Array.from(new Set(points.map((p) => p.y))).sort((a, b) => a - b);
  const xMap = new Map(xs.map((val, i) => [val, i]));
  const yMap = new Map(ys.map((val, i) => [val, i]));

  const H = ys.length - 1;
  const W = xs.length - 1;
  const grid = new Int8Array(H * W);

  interface VEdge {
    x: number;
    minY: number;
    maxY: number;
  }
  const vEdges: VEdge[] = [];
  const n = points.length;
  for (let k = 0; k < n; k++) {
    const p1 = points[k];
    const p2 = points[(k + 1) % n];
    if (p1.x === p2.x) {
      vEdges.push({
        x: p1.x,
        minY: Math.min(p1.y, p2.y),
        maxY: Math.max(p1.y, p2.y),
      });
    }
  }

  for (let r = 0; r < H; r++) {
    const midY = (ys[r] + ys[r + 1]) / 2;

    const activeEdges = vEdges
      .filter((e) => e.minY <= midY && e.maxY >= midY)
      .map((e) => e.x)
      .sort((a, b) => a - b);

    for (let k = 0; k < activeEdges.length; k += 2) {
      for (let k = 0; k < activeEdges.length; k += 2) {
        const startX = activeEdges[k];
        const endX = activeEdges[k + 1];

        const cStart = xMap.get(startX)!;
        const cEnd = xMap.get(endX)!;

        for (let c = cStart; c < cEnd; c++) {
          grid[r * W + c] = 1;
        }
      }
    }

    const sums = new Int32Array((H + 1) * (W + 1));
    const getSum = (r: number, c: number) => sums[r * (W + 1) + c];
    const setSum = (r: number, c: number, val: number) => (sums[r * (W + 1) + c] = val);

    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const val = grid[r * W + c];
        const top = getSum(r, c + 1);
        const left = getSum(r + 1, c);
        const topLeft = getSum(r, c);
        setSum(r + 1, c + 1, val + top + left - topLeft);
      }
    }

    let maxAreaP2 = 0;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];

        const w = Math.abs(p1.x - p2.x) + 1;
        const h = Math.abs(p1.y - p2.y) + 1;
        const area = w * h;

        if (area <= maxAreaP2) continue;

        const x1 = xMap.get(Math.min(p1.x, p2.x))!;
        const x2 = xMap.get(Math.max(p1.x, p2.x))!;
        const y1 = yMap.get(Math.min(p1.y, p2.y))!;
        const y2 = yMap.get(Math.max(p1.y, p2.y))!;

        const numCells = (y2 - y1) * (x2 - x1);

        const total = getSum(y2, x2) - getSum(y1, x2) - getSum(y2, x1) + getSum(y1, x1);

        if (total === numCells) {
          maxAreaP2 = area;
        }
      }
    }

    console.log(`Part 2 Max Area: ${maxAreaP2}`);
    console.timeEnd('Part 2');
  }
}

solve();
