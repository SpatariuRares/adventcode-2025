import * as fs from 'fs';
import * as path from 'path';

function solve() {
    // Determine input file path
    const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'input.txt');
    
    // Read and parse the input file into a 2D grid
    const input = fs.readFileSync(inputPath, 'utf-8').trim();
    const grid = input.split('\n').map(line => line.split(''));
    const rows = grid.length;
    const cols = grid[0].length;

    // Define the 8 possible directions
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    // Store neighbor counts for each cell to avoid re-scanning
    const neighborCounts: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
    const queue: [number, number][] = [];

    // Initialization phase: calculate initial neighbor counts and populate queue
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            if (grid[rowIndex][colIndex] === '@') {
                let count = 0;
                for (const [deltaRow, deltaCol] of directions) {
                    const neighborRowIndex = rowIndex + deltaRow;
                    const neighborColIndex = colIndex + deltaCol;
                    if (neighborRowIndex >= 0 &&
                        neighborRowIndex < rows &&
                        neighborColIndex >= 0 &&
                        neighborColIndex < cols &&
                        grid[neighborRowIndex][neighborColIndex] === '@') {
                        count++;
                    }
                }
                neighborCounts[rowIndex][colIndex] = count;
                
                // If accessible (neighbors < 4), add to queue
                if (count < 4) {
                    queue.push([rowIndex, colIndex]);
                }
            }
        }
    }
    const part1Answer = queue.length;
    let totalRemoved = 0;

    // Process the queue in batches
    while (queue.length > 0) {
        // Create a batch from the current queue
        const currentBatch = queue.splice(0, queue.length);
        totalRemoved += currentBatch.length;
        // Phase 1: Mark all items in the batch as removed
        for (const [rowIndex, colIndex] of currentBatch) {
            grid[rowIndex][colIndex] = '.';
        }

        // Phase 2: Update neighbors for all items in the batch
        for (const [rowIndex, colIndex] of currentBatch) {
            for (const [deltaRow, deltaCol] of directions) {
                const neighborRowIndex = rowIndex + deltaRow;
                const neighborColIndex = colIndex + deltaCol;
                
                // Check if neighbor is valid and is a paper roll ('@')
                // Note: Since we already marked current batch as '.', neighbors that are also in the batch won't be processed here.
                if (neighborRowIndex >= 0 &&
                    neighborRowIndex < rows &&
                    neighborColIndex >= 0 &&
                    neighborColIndex < cols &&
                    grid[neighborRowIndex][neighborColIndex] === '@') {
                    neighborCounts[neighborRowIndex][neighborColIndex]--;
                    
                    // If neighbor count drops to 3, it becomes accessible for the first time
                    if (neighborCounts[neighborRowIndex][neighborColIndex] === 3) {
                        queue.push([neighborRowIndex, neighborColIndex]);
                    }
                }
            }
        }
    }

    console.log(`Part 1 - Accessible rolls: ${part1Answer}`);
    console.log(`Part 2 - Total removed rolls: ${totalRemoved}`);
}

solve();
