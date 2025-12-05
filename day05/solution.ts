import * as fs from 'fs';
import * as path from 'path';

const inputFile = process.argv[2] || 'input.txt';
const input = fs.readFileSync(path.join(__dirname, inputFile), 'utf-8').trim();

interface Range {
    start: number;
    end: number;
}

function parseInput(data: string): { ranges: Range[], ids: number[] } {
    const lines = data.split(/\r?\n/);
    const ranges: Range[] = [];
    const ids: number[] = [];
    let parsingRanges = true;

    for (const line of lines) {
        if (line.trim() === '') {
            parsingRanges = false;
            continue;
        }

        if (parsingRanges) {
            const [start, end] = line.split('-').map(Number);
            ranges.push({ start, end });
        } else {
            ids.push(Number(line));
        }
    }

    return { ranges, ids };
}

function mergeRanges(ranges: Range[]): Range[] {
    if (ranges.length === 0) return [];

    // Sort by start time
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
    const merged: Range[] = [sortedRanges[0]];

    for (let i = 1; i < sortedRanges.length; i++) {
        const current = sortedRanges[i];
        const lastMerged = merged[merged.length - 1];

        if (current.start <= lastMerged.end + 1) { 
            lastMerged.end = Math.max(lastMerged.end, current.end);
        } else {
            merged.push(current);
        }
    }

    return merged;
}

function isFreshBinary(id: number, ranges: Range[]): boolean {
    let left = 0;
    let right = ranges.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const range = ranges[mid];

        if (id >= range.start && id <= range.end) {
            return true;
        } else if (id < range.start) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return false;
}

function part1(mergedRanges: Range[], ids: number[]): number {
    
    let freshCount = 0;
    for (const id of ids) {
        if (isFreshBinary(id, mergedRanges)) {
            freshCount++;
        }
    }
    return freshCount;
}

function part2(mergedRanges: Range[]): number {
    
    let totalFresh = 0;
    for (const range of mergedRanges) {
        totalFresh += (range.end - range.start + 1);
    }
    return totalFresh;
}

const { ranges,ids } = parseInput(input);
const mergedRanges = mergeRanges(ranges);

console.log('Part 1:', part1(mergedRanges,ids));
console.log('Part 2:', part2(mergedRanges));
