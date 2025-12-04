import * as fs from 'fs';
import * as path from 'path';

function solve() {
    // Determine input file path: use command line argument if provided, otherwise default to 'input.txt'
    const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'input.txt');
    
    // Read and parse the input file into a 2D grid
    const input = fs.readFileSync(inputPath, 'utf-8').trim();
    const grid = input.split('\n').map(line => line.split(''));
    const rows = grid.length;
    const cols = grid[0].length;

    // Define the 8 possible directions (horizontal, vertical, diagonal) to check for neighbors
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    let totalRemoved = 0;
    let part1Answer: number | null = null;

    // Iteratively remove accessible rolls until no more can be removed
    while (true) {
        const rollsToRemove: [number, number][] = [];

        // Iterate through the entire grid to find accessible rolls
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let colIndex = 0; colIndex < cols; colIndex++) {
                // Check if the current cell contains a paper roll ('@')
                if (grid[rowIndex][colIndex] === '@') {
                    let neighborCount = 0;
                    
                    // Count adjacent paper rolls in all 8 directions
                    for (const [deltaRow, deltaCol] of directions) {
                        if(neighborCount >= 4){
                            break;
                        }
                        const neighborRowIndex = rowIndex + deltaRow;
                        const neighborColIndex = colIndex + deltaCol;
                        
                        // Check boundaries and if the neighbor is a paper roll
                        if (neighborRowIndex >= 0 && neighborRowIndex < rows && 
                            neighborColIndex >= 0 && neighborColIndex < cols && 
                            grid[neighborRowIndex][neighborColIndex] === '@') {
                            neighborCount++;
                        }
                    }

                    // A roll is accessible if it has fewer than 4 neighbors
                    if (neighborCount < 4) {
                        rollsToRemove.push([rowIndex, colIndex]);
                    }
                }
            }
        }

        // The result of the first iteration is the answer to Part 1
        if (part1Answer === null) {
            part1Answer = rollsToRemove.length;
        }

        // If no rolls are accessible, stop the process
        if (rollsToRemove.length === 0) {
            break;
        }

        // Update the total count of removed rolls
        totalRemoved += rollsToRemove.length;

        // Remove the identified rolls from the grid (mark them as '.')
        for (const [rowIndex, colIndex] of rollsToRemove) {
            grid[rowIndex][colIndex] = '.'; 
        }
    }

    // Print the results for both parts
    console.log(`Part 1 - Accessible rolls: ${part1Answer}`);
    console.log(`Part 2 - Total removed rolls: ${totalRemoved}`);
}

solve();
