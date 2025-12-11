import * as fs from "fs";
import * as path from "path";

const input = fs
  .readFileSync(path.join(__dirname, "input.txt"), "utf-8")
  .trim();

type Graph = Map<string, string[]>;
type Memo = Map<string, number>;

function parseInput(data: string): Graph {
  const graph: Graph = new Map();
  const lines = data.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    const [node, destinationsStr] = line.split(":");

    if (!node || !destinationsStr) {
      continue;
    }

    const destinations = destinationsStr.trim().split(/\s+/);
    graph.set(node.trim(), destinations);
  }
  return graph;
}

function countPaths(
  current: string,
  target: string,
  graph: Graph,
  memo: Memo
): number {
  if (memo.has(current)) {
    return memo.get(current)!;
  }

  if (current === target) {
    return 1;
  }

  const neighbors = graph.get(current);
  if (!neighbors) {
    return 0;
  }

  let paths = 0;
  for (const neighbor of neighbors) {
    paths += countPaths(neighbor, target, graph, memo);
  }

  memo.set(current, paths);
  return paths;
}

function part1(data: string): number {
  const graph = parseInput(data);
  const memo: Memo = new Map();

  const START_NODE = "you";
  const TARGET_NODE = "out";

  return countPaths(START_NODE, TARGET_NODE, graph, memo);
}

function countPathSequence(graph: Graph, nodes: string[]): number {
  let totalPaths = 1;
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];

    const segmentPaths = countPaths(from, to, graph, new Map());

    if (segmentPaths === 0) return 0;
    totalPaths *= segmentPaths;
  }
  return totalPaths;
}

function part2(data: string): number {
  const graph = parseInput(data);

  const START = "svr";
  const END = "out";
  const VIA_1 = "dac";
  const VIA_2 = "fft";

  return (
    countPathSequence(graph, [START, VIA_1, VIA_2, END]) +
    countPathSequence(graph, [START, VIA_2, VIA_1, END])
  );
}

console.log("Part 1:", part1(input));
console.log("Part 2:", part2(input));
