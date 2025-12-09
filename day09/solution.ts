import * as fs from "fs";
import * as path from "path";

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
    .readFileSync(path.join(__dirname, filename), "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [x, y] = l.split(",").map(Number);
      return { x, y };
    });

const isBetween = (val: number, a: number, b: number) =>
  val >= Math.min(a, b) && val <= Math.max(a, b);

// Correctly handle unordered input for segment overlap
const segmentsOverlap = (a1: number, a2: number, b1: number, b2: number) => {
  return (
    Math.max(Math.min(a1, a2), Math.min(b1, b2)) <
    Math.min(Math.max(a1, a2), Math.max(b1, b2))
  );
};

function isPointInPolygon(p: Point, poly: Point[]): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [p1, p2] = [poly[i], poly[j]];
    // On segment check
    if (
      isBetween(p.x, p1.x, p2.x) &&
      isBetween(p.y, p1.y, p2.y) &&
      ((p1.x === p2.x && p.x === p1.x) || (p1.y === p2.y && p.y === p1.y))
    )
      return true;

    // Ray casting
    if (
      p1.y > p.y !== p2.y > p.y &&
      p.x < ((p2.x - p1.x) * (p.y - p1.y)) / (p2.y - p1.y) + p1.x
    )
      inside = !inside;
  }
  return inside;
}

function intersects(rect: Rect, poly: Point[]): boolean {
  const { minX, maxX, minY, maxY } = rect;
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const [p1, p2] = [poly[i], poly[(i + 1) % n]];
    // Vertical check: edgeX within (minX, maxX) AND edgeY overlaps (minY, maxY)
    if (
      p1.x === p2.x &&
      p1.x > minX &&
      p1.x < maxX &&
      segmentsOverlap(p1.y, p2.y, minY, maxY)
    )
      return true;
    // Horizontal check: edgeY within (minY, maxY) AND edgeX overlaps (minX, maxX)
    if (
      p1.y === p2.y &&
      p1.y > minY &&
      p1.y < maxY &&
      segmentsOverlap(p1.x, p2.x, minX, maxX)
    )
      return true;
  }
  return false;
}

function solve() {
  const points = readInput("input.txt");

  const solveFor = (partName: string, isValid: (r: Rect) => boolean) => {
    console.time(partName);
    let maxArea = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const [p1, p2] = [points[i], points[j]];
        const width = Math.abs(p1.x - p2.x) + 1;
        const height = Math.abs(p1.y - p2.y) + 1;
        const area = width * height;

        if (area <= maxArea) continue;

        // Create rect definition
        const rect = {
          minX: Math.min(p1.x, p2.x),
          maxX: Math.max(p1.x, p2.x),
          minY: Math.min(p1.y, p2.y),
          maxY: Math.max(p1.y, p2.y),
        };

        if (isValid(rect)) maxArea = area;
      }
    }
    console.log(`${partName} Max Area: ${maxArea}`);
    console.timeEnd(partName);
  };

  solveFor("Part 1", () => true);
  solveFor("Part 2", (r) => {
    const corners = [
      { x: r.minX, y: r.minY },
      { x: r.maxX, y: r.minY },
      { x: r.maxX, y: r.maxY },
      { x: r.minX, y: r.maxY },
    ];
    return (
      corners.every((c) => isPointInPolygon(c, points)) &&
      !intersects(r, points)
    );
  });
}

solve();
