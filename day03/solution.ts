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
function buildSparseTable(line: string): number[][] {
    const n = line.length;
    const k = Math.floor(Math.log2(n)) + 1;
    const st: number[][] = Array.from({ length: n }, () => new Array(k));
    const multiplier = n + 1;

    for (let i = 0; i < n; i++) {
        const digit = line.charCodeAt(i) - 48; // Più veloce di parseInt
        // Codifica: cifra alta > cifra bassa. Indice basso > indice alto (quindi n - i)
        st[i][0] = digit * multiplier + (n - i);
    }

    for (let j = 1; j < k; j++) {
        const len = 1 << (j - 1);
        for (let i = 0; i + (1 << j) <= n; i++) {
            // Prendi il massimo tra i due intervalli
            st[i][j] = Math.max(st[i][j - 1], st[i + len][j - 1]);
        }
    }
    return st;
}

/**
 * Esegue una query sulla Sparse Table per trovare il valore massimo nell'intervallo [L, R].
 * Decodifica il risultato per restituire la cifra e l'indice.
 */
function queryMax(st: number[][], L: number, R: number, n: number): { digit: number, index: number } {
    const j = Math.floor(Math.log2(R - L + 1));
    const maxEncoded = Math.max(st[L][j], st[R - (1 << j) + 1][j]);
    
    const multiplier = n + 1;
    const digit = Math.floor(maxEncoded / multiplier);
    const index = n - (maxEncoded % multiplier);
    return { digit, index };
}

/**
 * Trova la sottosequenza di lunghezza 'k' che forma il numero più grande possibile.
 * Utilizza RMQ su Sparse Table per trovare la cifra massima in O(1).
 */
function findMaxSubsequence(st: number[][], n: number, k: number): number {
    let currentIdx = -1; 
    let result = ""; 

    for (let remaining = k; remaining > 0; remaining--) {
        const searchStart = currentIdx + 1; 
        const searchEnd = n - remaining; 
        
        if (searchStart >= n || searchEnd < searchStart) break;

        // Trova la cifra massima nell'intervallo valido [searchStart, searchEnd]
        // La query restituisce la cifra più alta e la sua prima posizione in O(1)
        const { digit, index } = queryMax(st, searchStart, searchEnd, n);
        
        result += digit.toString();
        currentIdx = index;
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
        const st = buildSparseTable(trimmedLine);
        const n = trimmedLine.length;

        // Parte 1: Trova la sottosequenza massima di lunghezza 2
        totalPart1 += findMaxSubsequence(st, n, 2); 
        // Parte 2: Trova la sottosequenza massima di lunghezza 12
        totalPart2 += findMaxSubsequence(st, n, 12); 
    }

    return { part1: totalPart1, part2: totalPart2 }; 
}

const inputPath = path.join(__dirname, 'input.txt');
const realInput = fs.readFileSync(inputPath, 'utf-8'); 
const result = solve(realInput); 
console.log(`Part 1 Result: ${result.part1}`); 
console.log(`Part 2 Result: ${result.part2}`);
