export class State {
    _transitions: Map<string, Set<State>>;
    accepting: boolean;

    constructor({ accepting } = { accepting: false }) {
        this._transitions = new Map();
        this.accepting = accepting;
    }

    getTransitions() {
        return this._transitions;
    }

    addTransition(symbol: string, toState: State) {
        this.getTransitionsOnSymbol(symbol).add(toState);
        return this;
    }

    getTransitionsOnSymbol(symbol: string): Set<State> {
        let transitions = this._transitions.get(symbol) ?? new Set();
        this._transitions.set(symbol, transitions);

        return transitions;
    }
}

