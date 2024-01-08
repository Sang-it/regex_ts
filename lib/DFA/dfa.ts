import { NFA } from '../NFA';
import { EPSILON_CLOSURE } from '../constants';

export type DFATransitionTableInitial = Record<string, Record<string, string | number>>;
export type DFATransitionTableFinal = Record<string, Record<string, number>>;

export class DFA {
    private _nfa: NFA;
    private _originalAcceptingStateNumbers: Set<string | number>;
    private _acceptingStateNumbers: Set<string | number>;
    private _originalTransitionTable: DFATransitionTableInitial;
    private _transitionTable: DFATransitionTableFinal;

    constructor(nfa: NFA) {
        this._nfa = nfa;
    }

    getAlphabet() {
        return this._nfa.getAlphabet();
    }

    getAcceptingStateNumbers() {
        if (!this._acceptingStateNumbers) {
            this.getTransitionTable();
        }

        return this._acceptingStateNumbers;
    }

    getOriginaAcceptingStateNumbers() {
        if (!this._originalAcceptingStateNumbers) {
            this.getTransitionTable();
        }

        return this._originalAcceptingStateNumbers;
    }

    setTransitionTable(table: DFATransitionTableFinal) {
        this._transitionTable = table;
    }

    setAcceptingStateNumbers(stateNumbers: Set<string>) {
        this._acceptingStateNumbers = stateNumbers;
    }

    getTransitionTable() {
        if (!this._transitionTable) {
            this.buildTransitionTable();
        }

        return this._transitionTable;
    }

    private buildTransitionTable(): DFATransitionTableFinal {
        if (this._transitionTable) {
            return this._transitionTable;
        }

        const nfaTable = this._nfa.getTransitionTable();
        const nfaStates = Object.keys(nfaTable);

        this._acceptingStateNumbers = new Set();

        const startState = nfaTable[nfaStates[0]][EPSILON_CLOSURE];

        const worklist: number[][] = [startState];
        const alphabet = this.getAlphabet();
        const nfaAcceptingStates = this._nfa.getAcceptingStateNumbers();
        const dfaTable: DFATransitionTableInitial = {};

        const updateAcceptingStates = (states: number[]) => {
            if (states.some(state => nfaAcceptingStates.has(state))) {
                this._acceptingStateNumbers.add(states.join(','));
            }
        };

        while (worklist.length > 0) {
            const states = worklist.shift()!;
            const dfaStateLabel = states.join(',');

            dfaTable[dfaStateLabel] = {};

            for (const symbol of alphabet) {
                let onSymbol: number[] = [];

                updateAcceptingStates(states);

                for (const state of states) {
                    const nfaStatesOnSymbol = nfaTable[state]?.[symbol];
                    if (nfaStatesOnSymbol) {
                        onSymbol.push(...nfaStatesOnSymbol.flatMap(nfaStateOnSymbol =>
                            nfaTable[nfaStateOnSymbol]?.[EPSILON_CLOSURE] || []
                        ));
                    }
                }

                const dfaStatesOnSymbolSet = new Set(onSymbol);
                const dfaStatesOnSymbol = [...dfaStatesOnSymbolSet];

                if (dfaStatesOnSymbol.length > 0) {
                    const dfaOnSymbolStr = dfaStatesOnSymbol.join(',');

                    dfaTable[dfaStateLabel][symbol] = dfaOnSymbolStr;

                    if (!dfaTable[dfaOnSymbolStr]) {
                        worklist.unshift(dfaStatesOnSymbol);
                    }
                }
            }
        }

        return (this._transitionTable = this._remapStateNumbers(dfaTable));
    }

    private _remapStateNumbers(calculatedDFATable: DFATransitionTableInitial) {
        const newStatesMap: Record<string, number> = {};
        const transitionTable: DFATransitionTableFinal = {};

        Object.keys(calculatedDFATable).forEach((originalNumber, newNumber) => {
            newStatesMap[originalNumber] = newNumber + 1;
        });

        for (const originalNumber in calculatedDFATable) {
            const originalRow = calculatedDFATable[originalNumber];
            const row: Record<string, number> = {};

            for (const symbol in originalRow) {
                row[symbol] = newStatesMap[originalRow[symbol]];
            }

            transitionTable[newStatesMap[originalNumber]] = row;
        }

        this._updateAcceptingStateNumbers(newStatesMap);

        return transitionTable;
    }

    private _updateAcceptingStateNumbers(newStatesMap: Record<string, number>): void {
        this._originalAcceptingStateNumbers = this._acceptingStateNumbers;
        this._acceptingStateNumbers = new Set();

        for (const originalNumber of this._originalAcceptingStateNumbers) {
            this._acceptingStateNumbers.add(newStatesMap[originalNumber]);
        }
    }

    getOriginalTransitionTable() {
        if (!this._originalTransitionTable) {
            this.getTransitionTable();
        }
        return this._originalTransitionTable;
    }

    matches(string: string) {
        let state = 1;
        let i = 0;
        const table = this.getTransitionTable();

        while (string[i]) {
            state = table[state][string[i++]] as number;
            if (!state) { return false; }
        }

        return this.getAcceptingStateNumbers().has(state);
    }
}
