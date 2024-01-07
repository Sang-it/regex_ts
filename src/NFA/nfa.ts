import { NFAState } from './nfa-state';
import { EPSILON, EPSILON_CLOSURE } from '../constants';

export class NFA {
    in: NFAState;
    out: NFAState;
    _alphabet: Set<string>;
    _acceptingStates: Set<NFAState>;
    _acceptingStateNumbers: Set<number>;
    _transitionTable: { [key: number]: { [key: string]: number[] } };

    constructor(inState: NFAState, outState: NFAState) {
        this.in = inState;
        this.out = outState;
    }

    matches(string: string) {
        return this.in.matches(string);
    }

    getAlphabet() {
        if (!this._alphabet) {
            this._alphabet = new Set();
            const table = this.getTransitionTable();
            for (const state in table) {
                const transitions = table[state];
                for (const symbol in transitions)
                    if (symbol !== EPSILON_CLOSURE) {
                        this._alphabet.add(symbol);
                    }
            }
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
            this._acceptingStateNumbers = new Set();
            for (const acceptingState of this.getAcceptingStates()) {
                this._acceptingStateNumbers.add(acceptingState.number);
            }
        }
        return this._acceptingStateNumbers;
    }

    getTransitionTable() {
        if (!this._transitionTable) {
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
                    let combinedState = [];
                    symbols.add(symbol);
                    for (const nextState of symbolTransitions) {
                        visitState(nextState as NFAState);
                        combinedState.push((nextState as NFAState).number);
                    }
                    this._transitionTable[state.number][symbol] = combinedState;
                }
            };

            visitState(this.in);

            visited.forEach((state) => {
                delete this._transitionTable[state.number][EPSILON];
                this._transitionTable[state.number][EPSILON_CLOSURE] = [
                    ...state.getEpsilonClosure(),
                ].map(s => s.number);
            });
        }

        return this._transitionTable;
    }
}
