import { NFAState } from './nfa-state';
import { EPSILON, EPSILON_CLOSURE } from '../constants';

export type NFATransitionTable = Record<string, Record<string, number[]>>;

export class NFA {
    in: NFAState;
    out: NFAState;
    private _alphabet: Set<string>;
    private _acceptingStates: Set<NFAState>;
    private _acceptingStateNumbers: Set<number>;
    private _transitionTable: NFATransitionTable;

    constructor(inState: NFAState, outState: NFAState) {
        this.in = inState;
        this.out = outState;
    }

    matches(string: string) {
        return this.in.matches(string);
    }

    getAlphabet() {
        if (!this._alphabet) {
            this._alphabet = new Set(Object.keys(this.getTransitionTable())
                .flatMap(state => Object.keys(this.getTransitionTable()[state])
                    .filter(symbol => symbol !== EPSILON_CLOSURE)));
        }

        return this._alphabet;
    }

    getAcceptingStates() {
        if (!this._acceptingStates) {
            this.getTransitionTable();
        }
        return this._acceptingStates;
    }

    getAcceptingStateNumbers() {
        if (!this._acceptingStateNumbers) {
            this._acceptingStateNumbers = new Set(
                [...this.getAcceptingStates()]
                    .map((state: NFAState) => state.number)
            );
        }

        return this._acceptingStateNumbers;
    }

    getTransitionTable(): NFATransitionTable {
        if (!this._transitionTable) {
            this.buildTransitionTable();
        }

        return this._transitionTable!;
    }

    private buildTransitionTable() {
        if (this._transitionTable) {
            return this._transitionTable;
        }

        this._transitionTable = {};
        this._acceptingStates = new Set();

        const visited = new Set<NFAState>();
        const symbols = new Set<string>();

        const visitState = (state: NFAState) => {
            if (visited.has(state)) {
                return;
            }

            visited.add(state);
            state.number = visited.size;

            this._transitionTable[state.number] = {};

            if (state.accepting) {
                this._acceptingStates.add(state);
            }

            const transitions = state.getTransitions();

            for (const [symbol, symbolTransitions] of transitions) {
                symbols.add(symbol);

                const combinedState = [...symbolTransitions].map((nextState) => {
                    visitState(nextState as NFAState);
                    return (nextState as NFAState).number;
                });

                this._transitionTable[state.number][symbol] = combinedState;
            }
        };

        visitState(this.in);

        visited.forEach((state) => {
            delete this._transitionTable[state.number][EPSILON];
            this._transitionTable[state.number][EPSILON_CLOSURE] = [
                ...state.getEpsilonClosure(),
            ].map((s) => s.number);
        });

        return this._transitionTable;
    }

}
