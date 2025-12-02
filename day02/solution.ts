import * as fs from 'fs';
import * as path from 'path';

function solve(input: string): { part1: number, part2: number } {
    const ranges = input.trim().split(',');
    const parsedRanges: { start: number, end: number }[] = [];
    let maxVal = 0;

    for (const range of ranges) {
        if (!range) continue;
        const [startStr, endStr] = range.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        parsedRanges.push({ start, end });
        if (end > maxVal) maxVal = end;
    }

    const invalidPart2 = new Set<number>();
    const maxDigits = maxVal.toString().length;
    
    for (let len = 1; len <= maxDigits / 2; len++) {
        for (let k = 2; k * len <= maxDigits; k++) {
            const startBase = Math.pow(10, len - 1);
            const endBase = Math.pow(10, len) - 1;
            
            for (let base = startBase; base <= endBase; base++) {
                const baseStr = base.toString();
                const repeatedStr = baseStr.repeat(k);
                const val = parseInt(repeatedStr, 10);
                
                if (val <= maxVal) {
                    invalidPart2.add(val);
                }
            }
        }
    }

    let totalSumPart1 = 0;
    let totalSumPart2 = 0;

    for (const val of invalidPart2) {
        let inRange = false;
        for (const range of parsedRanges) {
            if (val >= range.start && val <= range.end) {
                inRange = true;
                break;
            }
        }

        if (inRange) {
            totalSumPart2 += val;
            
            const s = val.toString();
            if (s.length % 2 === 0) {
                const mid = s.length / 2;
                if (s.substring(0, mid) === s.substring(mid)) {
                    totalSumPart1 += val;
                }
            }
        }
    }

    return { part1: totalSumPart1, part2: totalSumPart2 };
}

const inputPath = path.join(__dirname, 'input.txt');
const realInput = fs.readFileSync(inputPath, 'utf-8');
const result = solve(realInput);
console.log(`Part 1 Result: ${result.part1}`);
console.log(`Part 2 Result: ${result.part2}`);
