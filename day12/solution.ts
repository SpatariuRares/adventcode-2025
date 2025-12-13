import * as fs from 'fs';
import * as path from 'path';

type Grid = bigint[];
type Shape = { r: number; c: number }[];
interface BitmaskShape {
    rows: bigint[];
    height: number;
    width: number;
    minCol: number;
    maxCol: number;
    area: number;
}
interface Region {
    id: number;
    width: number;
    height: number;
    counts: number[];
    totalArea: number;
}

const normalizeShape = (points: Shape): Shape => {
    if (!points.length) return [];
    const minRow = Math.min(...points.map((p) => p.r)),
        minCol = Math.min(...points.map((p) => p.c));
    return points
        .map((p) => ({ r: p.r - minRow, c: p.c - minCol }))
        .sort((a, b) => a.r - b.r || a.c - b.c);
};

const generateTransforms = (shape: Shape): Shape[] => {
    const results: Shape[] = [],
        seenHashes = new Set<string>();
    let currentShape = shape;
    for (let i = 0; i < 4; i++) {
        [currentShape, currentShape.map((p) => ({ r: p.r, c: -p.c }))].forEach((variant) => {
            const normalized = normalizeShape(variant),
                hash = JSON.stringify(normalized);
            if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                results.push(normalized);
            }
        });
        currentShape = normalizeShape(currentShape.map((p) => ({ r: p.c, c: -p.r })));
    }
    return results;
};

const generateAnchoredVariants = (baseShape: Shape): BitmaskShape[] => {
    const anchoredShapes: BitmaskShape[] = [],
        seenHashes = new Set<string>();
    generateTransforms(baseShape).forEach((symmetry) => {
        symmetry.forEach((anchorPoint) => {
            const shiftedShape = symmetry
                .map((p) => ({ r: p.r - anchorPoint.r, c: p.c - anchorPoint.c }))
                .sort((a, b) => a.r - b.r || a.c - b.c);
            if (!shiftedShape.some((p) => p.r < 0 || (p.r === 0 && p.c < 0))) {
                const hashKey = JSON.stringify(shiftedShape);
                if (!seenHashes.has(hashKey)) {
                    seenHashes.add(hashKey);
                    let maxRow = 0,
                        maxCol = -Infinity,
                        minCol = Infinity;
                    shiftedShape.forEach((p) => {
                        maxRow = Math.max(maxRow, p.r);
                        maxCol = Math.max(maxCol, p.c);
                        minCol = Math.min(minCol, p.c);
                    });
                    const rows = new Array(maxRow + 1).fill(0n);
                    shiftedShape.forEach((p) => (rows[p.r] |= 1n << BigInt(p.c - minCol)));
                    anchoredShapes.push({
                        rows,
                        height: maxRow + 1,
                        width: maxCol - minCol + 1,
                        minCol,
                        maxCol,
                        area: shiftedShape.length,
                    });
                }
            }
        });
    });
    return anchoredShapes;
};

const backtrack = (
    grid: Grid,
    counts: number[],
    width: number,
    height: number,
    shapeVariants: BitmaskShape[][],
    shapeOrder: number[],
    emptyCells: number,
): boolean => {
    let targetRow = -1,
        targetCol = -1;
    for (let r = 0; r < height; r++) {
        if ((grid[r] & ((1n << BigInt(width)) - 1n)) === (1n << BigInt(width)) - 1n) continue;
        for (let c = 0; c < width; c++)
            if (!((grid[r] >> BigInt(c)) & 1n)) {
                targetRow = r;
                targetCol = c;
                break;
            }
        if (targetRow !== -1) break;
    }

    if (targetRow === -1) return counts.every((c) => c === 0);
    if (!counts.some((c) => c > 0)) return true;

    for (const shapeId of shapeOrder) {
        if (counts[shapeId] > 0) {
            for (const shape of shapeVariants[shapeId]) {
                if (
                    targetRow + shape.height > height ||
                    targetCol + shape.minCol < 0 ||
                    targetCol + shape.maxCol >= width
                )
                    continue;

                let collision = false;
                const shiftAmount = BigInt(targetCol + shape.minCol);
                for (let r = 0; r < shape.height; r++) {
                    if ((grid[targetRow + r] & (shape.rows[r] << shiftAmount)) !== 0n) {
                        collision = true;
                        break;
                    }
                }

                if (!collision) {
                    const newGrid = [...grid];
                    for (let r = 0; r < shape.height; r++) {
                        newGrid[targetRow + r] |= shape.rows[r] << shiftAmount;
                    }

                    counts[shapeId]--;
                    if (backtrack(newGrid, counts, width, height, shapeVariants, shapeOrder, emptyCells))
                        return true;
                    counts[shapeId]++;
                }
            }
        }
    }

    if (emptyCells > 0) {
        const newGrid = [...grid];
        newGrid[targetRow] |= 1n << BigInt(targetCol);
        return backtrack(newGrid, counts, width, height, shapeVariants, shapeOrder, emptyCells - 1);
    }
    return false;
};

const main = () => {
    const inputContent = fs.readFileSync(
        path.join(__dirname, process.argv[2] || 'input.txt'),
        'utf-8',
    );
    const shapes: Shape[] = [],
        regions: Region[] = [];
    const chunks = inputContent.trim().split(/\n\s*\n/);

    chunks.forEach((chunk) => {
        const lines = chunk.trim().split('\n'),
            header = lines[0].trim();
        if (header.match(/^\d+x\d+:/))
            lines.forEach((line) => {
                if (!line.trim()) return;
                const [dimensions, countsPart] = line.split(':'),
                    [w, h] = dimensions.split('x').map(Number);
                regions.push({
                    id: regions.length,
                    width: w,
                    height: h,
                    counts: countsPart.trim().split(/\s+/).map(Number),
                    totalArea: 0,
                });
            });
        else if (header.match(/^\d+:/)) {
            const points: Shape = [];
            lines
                .slice(1)
                .forEach((line, r) =>
                    line.split('').forEach((char, c) => char === '#' && points.push({ r, c })),
                );
            shapes[parseInt(header)] = normalizeShape(points);
        }
    });

    const allShapeVariants = shapes.map(generateAnchoredVariants),
        shapeAreas = shapes.map((s) => s.length);
    regions.forEach(
        (r) => (r.totalArea = r.counts.reduce((acc, count, i) => acc + count * shapeAreas[i], 0)),
    );

    let solvedCount = 0;
    for (const region of regions) {
        if (region.totalArea <= region.width * region.height) {
            const shapeOrder = region.counts
                .map((_, i) => i)
                .filter((i) => region.counts[i] > 0)
                .sort((a, b) => allShapeVariants[b][0].area - allShapeVariants[a][0].area);
            const emptySpace = region.width * region.height - region.totalArea;

            if (
                backtrack(
                    new Array(region.height).fill(0n),
                    region.counts,
                    region.width,
                    region.height,
                    allShapeVariants,
                    shapeOrder,
                    emptySpace,
                )
            ) {
                solvedCount++;
            }
        }
    }
    console.log(`Total regions that can fit all presents: ${solvedCount}`);
};

main();
