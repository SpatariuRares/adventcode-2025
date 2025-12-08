import * as fs from "fs";
import * as path from "path";

const input = fs
  .readFileSync(path.join(__dirname, "input.txt"), "utf-8")
  .trim();

interface Point3D {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface Connection {
  p1: Point3D;
  p2: Point3D;
  distance: number;
}

class UnionFind {
  private parent: number[];
  private size: number[];
  public numComponents: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = Array(n).fill(1);
    this.numComponents = n;
  }

  find(i: number): number {
    if (this.parent[i] !== i) {
      this.parent[i] = this.find(this.parent[i]);
    }
    return this.parent[i];
  }

  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI !== rootJ) {
      if (this.size[rootI] < this.size[rootJ]) {
        this.parent[rootI] = rootJ;
        this.size[rootJ] += this.size[rootI];
      } else {
        this.parent[rootJ] = rootI;
        this.size[rootI] += this.size[rootJ];
      }
      this.numComponents--;
      return true;
    }
    return false;
  }

  getComponentSizes(): number[] {
    const sizes: number[] = [];
    const processedRoots = new Set<number>();

    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      if (!processedRoots.has(root)) {
        processedRoots.add(root);
        sizes.push(this.size[root]);
      }
    }
    return sizes;
  }
}

function parseInput(data: string): Point3D[] {
  return data.split("\n").map((line, index) => {
    const [x, y, z] = line.trim().split(",").map(Number);
    return { id: index, x, y, z };
  });
}

function calculateDistance(p1: Point3D, p2: Point3D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getSortedConnections(points: Point3D[]): Connection[] {
  const connections: Connection[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      connections.push({
        p1: points[i],
        p2: points[j],
        distance: calculateDistance(points[i], points[j]),
      });
    }
  }
  connections.sort((a, b) => a.distance - b.distance);
  return connections;
}

function part1(points: Point3D[], connections: Connection[]): number {
  const connectionsToMake = Math.min(connections.length, 1000);
  const uf = new UnionFind(points.length);

  for (let i = 0; i < connectionsToMake; i++) {
    uf.union(connections[i].p1.id, connections[i].p2.id);
  }

  const sizes = uf.getComponentSizes();
  sizes.sort((a, b) => b - a); // Descending

  const top3 = sizes.slice(0, 3);
  return top3.reduce((acc, curr) => acc * curr, 1);
}

function part2(points: Point3D[], connections: Connection[]): number {
  const uf = new UnionFind(points.length);

  for (const conn of connections) {
    if (uf.union(conn.p1.id, conn.p2.id)) {
      if (uf.numComponents === 1) {
        return conn.p1.x * conn.p2.x;
      }
    }
  }
  return 0;
}

const points = parseInput(input);
const connections = getSortedConnections(points);

console.log("Part 1:", part1(points, connections));
console.log("Part 2:", part2(points, connections));
