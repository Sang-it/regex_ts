import { NFA } from './nfa';
import { NFAState } from './nfa-state';
import { EPSILON } from '../constants';

export function char(c: string) {
    const inState = new NFAState();
    const outState = new NFAState({
        accepting: true,
    });

    return new NFA(inState.addTransition(c, outState), outState);
}

export function e() {
    return char(EPSILON);
}

export function altPair(first: NFA, second: NFA) {
    first.out.accepting = false;
    second.out.accepting = true;

    first.out.addTransition(EPSILON, second.in);

    return new NFA(first.in, second.out);
}

export function alt(first: NFA, ...fragments: NFA[]) {
    for (let fragment of fragments) {
        first = altPair(first, fragment);
    }
    return first;
}

export function orPair(first: NFA, second: NFA) {
    const inState = new NFAState();
    const outState = new NFAState();

    inState.addTransition(EPSILON, first.in);
    inState.addTransition(EPSILON, second.in);

    outState.accepting = true;
    first.out.accepting = false;
    second.out.accepting = false;

    first.out.addTransition(EPSILON, outState);
    second.out.addTransition(EPSILON, outState);

    return new NFA(inState, outState);
}

export function or(first: NFA, ...fragments: NFA[]) {
    for (let fragment of fragments) {
        first = orPair(first, fragment);
    }
    return first;
}

export function repExplicit(fragment: NFA) {
    const inState = new NFAState();
    const outState = new NFAState({
        accepting: true,
    });

    inState.addTransition(EPSILON, fragment.in);
    inState.addTransition(EPSILON, outState);

    fragment.out.accepting = false;
    fragment.out.addTransition(EPSILON, outState);
    outState.addTransition(EPSILON, fragment.in);

    return new NFA(inState, outState);
}

export function rep(fragment: NFA) {
    fragment.in.addTransition(EPSILON, fragment.out);
    fragment.out.addTransition(EPSILON, fragment.in);
    return fragment;
}

export function plusRep(fragment: NFA) {
    fragment.out.addTransition(EPSILON, fragment.in);
    return fragment;
}

export function questionRep(fragment: NFA) {
    fragment.in.addTransition(EPSILON, fragment.out);
    return fragment;
}

