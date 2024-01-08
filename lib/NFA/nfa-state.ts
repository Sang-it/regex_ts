import { State } from '../state';
import { EPSILON } from '../constants';

export class NFAState extends State {
    number: number;
    private _epsilonClosure: Set<NFAState>;

    matches(string: string, visited = new Set<State>()): boolean {
        if (visited.has(this)) {
            return false;
        }

        visited.add(this);

        if (string.length === 0) {
            return this.accepting || this.epsilonTransitionMatches('', visited);
        }

        const [symbol, rest] = [string[0], string.slice(1)];

        return this.symbolTransitionMatches(symbol, rest) || this.epsilonTransitionMatches(string, visited);
    }

    private epsilonTransitionMatches(string: string, visited: Set<State>): boolean {
        for (const nextState of this.getTransitionsOnSymbol(EPSILON)) {
            if ((nextState as NFAState).matches(string, visited)) {
                return true;
            }
        }
        return false;
    }

    private symbolTransitionMatches(symbol: string, rest: string): boolean {
        const symbolTransitions = this.getTransitionsOnSymbol(symbol);
        for (const nextState of symbolTransitions) {
            if ((nextState as NFAState).matches(rest)) {
                return true;
            }
        }
        return false;
    }

    getEpsilonClosure(): Set<NFAState> {
        if (!this._epsilonClosure) {
            const epsilonTransitions = this.getTransitionsOnSymbol(EPSILON);

            const closure = this._epsilonClosure = new Set();
            closure.add(this);

            for (const nextState of epsilonTransitions) {
                if (!closure.has(nextState as NFAState)) {
                    closure.add(nextState as NFAState);
                    const nextClosure = (nextState as NFAState).getEpsilonClosure();
                    nextClosure.forEach(state => closure.add(state));
                }
            }
        }

        return this._epsilonClosure;
    }
}
