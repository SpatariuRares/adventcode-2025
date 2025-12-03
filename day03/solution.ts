import * as fs from 'fs'; 
import * as path from 'path'; 


/**
 * Costruisce una Sparse Table per Range Maximum Query (RMQ).
 * Ogni cella st[i][j] memorizza un valore codificato che rappresenta
 * sia la cifra massima che la sua posizione (preferendo la prima occorrenza).
 * 
 * Codifica: digit * multiplier + (n - index)
 * Questo permette di confrontare direttamente i valori per trovare:
 * 1. La cifra più alta
 * 2. A parità di cifra, l'indice più basso (poiché n - index sarà più alto)
 */
function buildSparseTable(inputString: string): number[][] {
    const length = inputString.length;
    const maxLog = Math.floor(Math.log2(length)) + 1;
    const sparseTable: number[][] = Array.from({ length: length }, () => new Array(maxLog));
    const encodingMultiplier = length + 1;

    for (let i = 0; i < length; i++) {
        const digit = inputString.charCodeAt(i) - 48; // Più veloce di parseInt
        // Codifica: cifra alta > cifra bassa. Indice basso > indice alto (quindi length - i)
        sparseTable[i][0] = digit * encodingMultiplier + (length - i);
    }

    for (let j = 1; j < maxLog; j++) {
        const len = 1 << (j - 1);
        for (let i = 0; i + (1 << j) <= length; i++) {
            // Prendi il massimo tra i due intervalli
            sparseTable[i][j] = Math.max(sparseTable[i][j - 1], sparseTable[i + len][j - 1]);
        }
    }
    return sparseTable;
}

/**
 * Esegue una query sulla Sparse Table per trovare il valore massimo nell'intervallo [L, R].
 * Decodifica il risultato per restituire la cifra e l'indice.
 */
function queryMax(sparseTable: number[][], rangeStart: number, rangeEnd: number, length: number): { digit: number, index: number } {
    const logRange = Math.floor(Math.log2(rangeEnd - rangeStart + 1));
    const maxEncoded = Math.max(sparseTable[rangeStart][logRange], sparseTable[rangeEnd - (1 << logRange) + 1][logRange]);
    
    const encodingMultiplier = length + 1;
    const digit = Math.floor(maxEncoded / encodingMultiplier);
    const index = length - (maxEncoded % encodingMultiplier);
    return { digit, index };
}

/**
 * Trova la sottosequenza di lunghezza 'k' che forma il numero più grande possibile.
 * Utilizza RMQ su Sparse Table per trovare la cifra massima in O(1).
 */
function findMaxSubsequence(sparseTable: number[][], length: number, subsequenceLength: number): number {
    let lastIndex = -1; 
    let result = ""; 

    for (let digitsNeeded = subsequenceLength; digitsNeeded > 0; digitsNeeded--) {
        const rangeStart = lastIndex + 1; 
        const rangeEnd = length - digitsNeeded; 
        
        if (rangeStart >= length || rangeEnd < rangeStart) break;

        // Trova la cifra massima nell'intervallo valido [rangeStart, rangeEnd]
        // La query restituisce la cifra più alta e la sua prima posizione in O(1)
        const { digit, index } = queryMax(sparseTable, rangeStart, rangeEnd, length);
        
        result += digit.toString();
        lastIndex = index;
    }

    return result === "" ? 0 : parseInt(result, 10); 
}

/**
 * Risolve il problema per l'input dato.
 * Divide l'input in righe e calcola la somma delle sottosequenze massime per ogni riga.
 * 
 * @param input L'intero contenuto del file di input.
 * @returns Un oggetto con i risultati per Parte 1 e Parte 2.
 */
function solve(input: string): { part1: number, part2: number } {
    const lines = input.trim().split('\n'); 
    let totalPart1 = 0; 
    let totalPart2 = 0;

    for (const line of lines) {
        const trimmedLine = line.trim(); 
        if (!trimmedLine) continue;

        // Costruisci la Sparse Table una sola volta per riga
        const sparseTable = buildSparseTable(trimmedLine);
        const lineLength = trimmedLine.length;

        // Parte 1: Trova la sottosequenza massima di lunghezza 2
        totalPart1 += findMaxSubsequence(sparseTable, lineLength, 2); 
        // Parte 2: Trova la sottosequenza massima di lunghezza 12
        totalPart2 += findMaxSubsequence(sparseTable, lineLength, 12); 
    }

    return { part1: totalPart1, part2: totalPart2 }; 
}

const inputPath = path.join(__dirname, 'input.txt');
const realInput = fs.readFileSync(inputPath, 'utf-8'); 
const result = solve(realInput); 
console.log(`Part 1 Result: ${result.part1}`); 
console.log(`Part 2 Result: ${result.part2}`);
