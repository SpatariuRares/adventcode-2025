---
description: Prima di scrivere codice, crea un file solution.md con l'analisi del problema e la strategia in Italiano
---

# Workflow: Pianificazione Soluzione (Design First)

Questo workflow serve a ragionare sul problema prima di scrivere il codice TypeScript. Segui rigorosamente questi passaggi:

1.  **Acquisizione Contesto**:

    - Identifica la cartella di lavoro corrente (es. `day13`).
    - Leggi il file `README.md` (se esiste) o chiedi all'utente la descrizione del problema.
    - Analizza l'input (`input.txt` o `example.txt`) per capire il formato dei dati.

2.  **Elaborazione Strategia**:

    - Non scrivere codice TypeScript in questa fase.
    - Pensa a quali strutture dati sono necessarie (Set, Map, Graph, Array 2D, ecc.).
    - Valuta la complessità algoritmica (Big O) per evitare soluzioni troppo lente.

3.  **Creazione Documento**:

    - Crea un file chiamato `solution.md` nella cartella corrente.
    - Il contenuto DEVE essere in **Italiano**.
    - Usa questa struttura:

      ```markdown
      # Analisi del Problema

      [Descrizione sintetica del problema e dei vincoli]

      # Note sull'Input

      [Osservazioni sul formato dati e casi limite]

      # Proposta di Soluzione

      1. [Passo 1 dell'algoritmo]
      2. [Passo 2...]
      3. ...

      # Strutture Dati & Complessità

      - Strutture: [es. PriorityQueue, HashMap]
      - Complessità: O(...)
      ```

4.  **Verifica**:
    - Conferma all'utente: "Ho creato `solution.md` con la strategia proposta. Leggilo e dimmi se procedere con l'implementazione TypeScript."
