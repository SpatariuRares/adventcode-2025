import * as fs from 'fs';
import * as path from 'path';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8').trim();

interface Instruction {
    direction: string;
    amount: number;
}

function parseInput(data: string): Instruction[] {
    return data.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => ({
            direction: line[0],
            amount: parseInt(line.substring(1), 10)
        }));
}

function solve(data: string, checkEveryStep: boolean): number {
    const instructions = parseInput(data);
    let pos = 50;
    let count = 0;

    for (const { direction, amount } of instructions) {
        if (checkEveryStep) {
            // Part 2 logic: check every step
            for (let i = 0; i < amount; i++) {
                if (direction === 'R') {
                    pos = (pos + 1) % 100;
                } else {
                    pos = (pos - 1 + 100) % 100;
                }

                if (pos === 0) count++;
            }
        } else {
            // Part 1 logic: check only at the end
            if (direction === 'R') {
                pos = (pos + amount) % 100;
            } else {
                pos = (pos - amount) % 100;
                if (pos < 0) pos += 100;
            }

            if (pos === 0) count++;
        }
    }
    return count;
}

function part1(data: string): number {
    return solve(data, false);
}

function part2(data: string): number {
    return solve(data, true);
}

console.log('Part 1:', part1(input));
console.log('Part 2:', part2(input));
