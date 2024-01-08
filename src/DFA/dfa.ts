import { NFA } from '../NFA';
import { EPSILON_CLOSURE } from '../constants';

type DFATransitionTable = Record<string, Record<string, string | number>>;

export class DFA {
    _nfa: NFA;
    _originalAcceptingStateNumbers: Set<string | number>;
    _acceptingStateNumbers: Set<string | number>;
    _originalTransitionTable: DFATransitionTable;
    _transitionTable: DFATransitionTable;

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

    setTransitionTable(table: DFATransitionTable) {
        this._transitionTable = table;
    }

    setAcceptingStateNumbers(stateNumbers: Set<string>) {
        this._acceptingStateNumbers = stateNumbers;
    }

    getTransitionTable() {
        if (this._transitionTable) {
            return this._transitionTable;
        }

        const nfaTable = this._nfa.getTransitionTable();
        const nfaStates = Object.keys(nfaTable);

        this._acceptingStateNumbers = new Set();

        const startState = nfaTable[nfaStates[0]][EPSILON_CLOSURE];

        const worklist = [startState];

        const alphabet = this.getAlphabet();
        const nfaAcceptingStates = this._nfa.getAcceptingStateNumbers();

        const dfaTable: DFATransitionTable = {};

        const updateAcceptingStates = (states: number[]) => {
            for (const nfaAcceptingState of nfaAcceptingStates) {
                if (states.indexOf(nfaAcceptingState) !== -1) {
                    this._acceptingStateNumbers.add(states.join(','));
                    break;
                }
            }
        };

        while (worklist.length > 0) {
            const states = worklist.shift();
            const dfaStateLabel = (states as number[]).join(',');

            dfaTable[dfaStateLabel] = {};

            for (const symbol of alphabet) {
                let onSymbol = [];

                // Determine whether the combined state is accepting.
                updateAcceptingStates(states as number[]);

                for (const state of states as number[]) {
                    const nfaStatesOnSymbol = nfaTable[state][symbol];

                    if (!nfaStatesOnSymbol) { continue; }

                    for (const nfaStateOnSymbol of nfaStatesOnSymbol) {
                        if (!nfaTable[nfaStateOnSymbol]) {
                            continue;
                        }
                        onSymbol.push(...nfaTable[nfaStateOnSymbol][EPSILON_CLOSURE]);
                    }
                }

                const dfaStatesOnSymbolSet = new Set(onSymbol);
                const dfaStatesOnSymbol = [...dfaStatesOnSymbolSet];

                if (dfaStatesOnSymbol.length > 0) {
                    const dfaOnSymbolStr = dfaStatesOnSymbol.join(',');
                    dfaTable[dfaStateLabel][symbol] = dfaOnSymbolStr;

                    if (!dfaTable.hasOwnProperty(dfaOnSymbolStr)) {
                        worklist.unshift(dfaStatesOnSymbol as number[]);
                    }
                }
            }
        }

        return (this._transitionTable = this._remapStateNumbers(dfaTable));
    }

    _remapStateNumbers(calculatedDFATable: DFATransitionTable) {
        const newStatesMap: Record<string, number> = {};
        this._originalTransitionTable = calculatedDFATable;

        const transitionTable: DFATransitionTable = {};

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

        this._originalAcceptingStateNumbers = this._acceptingStateNumbers;
        this._acceptingStateNumbers = new Set();

        for (const originalNumber of this._originalAcceptingStateNumbers) {
            this._acceptingStateNumbers.add(newStatesMap[originalNumber]);
        }

        return transitionTable;
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
            if (!state) {
                return false;
            }
        }

        if (!this.getAcceptingStateNumbers().has(state)) {
            return false;
        }

        return true;
    }
}
