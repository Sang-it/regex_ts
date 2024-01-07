import { State } from '../state';
import { EPSILON } from '../constants';

export class NFAState extends State {
    number: number;
    _epsilonClosure: Set<NFAState>;

    matches(string: string, visited = new Set()) {
        if (visited.has(this)) {
            return false;
        }

        visited.add(this);

        if (string.length === 0) {
            if (this.accepting) {
                return true;
            }

            for (const nextState of this.getTransitionsOnSymbol(EPSILON)) {
                if ((nextState as NFAState).matches('', visited)) {
                    return true;
                }
            }
            return false;
        }

        const symbol = string[0];
        const rest = string.slice(1);

        const symbolTransitions = this.getTransitionsOnSymbol(symbol);
        for (const nextState of symbolTransitions) {
            if ((nextState as NFAState).matches(rest)) {
                return true;
            }
        }

        for (const nextState of this.getTransitionsOnSymbol(EPSILON)) {
            if ((nextState as NFAState).matches(string, visited)) {
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
