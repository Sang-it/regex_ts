import { NFA } from './nfa';
import parser from '../parser';
import { alt, char, or, rep, plusRep, questionRep } from './builders';

interface RegExpNode {
    type: string;
    flags: string;
    kind: string;
    body: RegExpNode;
    value: string;
    expressions: RegExpNode[];
    left: RegExpNode;
    right: RegExpNode;
    quantifier: {
        kind: string;
    };
    expression: RegExpNode;
}

function generateNFA(node: RegExpNode): NFA {
    switch (node.type) {
        case 'RegExp':
            return generateNFA(node.body);
        case 'Alternative':
            return generateAlternativeNFA(node);
        case 'Disjunction':
            return generateDisjunctionNFA(node);
        case 'Repetition':
            return generateRepetitionNFA(node);
        case 'Char':
            return generateCharNFA(node);
        case 'Group':
            return generateGroupNFA(node);
        default:
            throw new Error(`Unknown node type: ${node.type}.`);
    }
}

function generateAlternativeNFA(node: RegExpNode): NFA {
    const fragments = (node.expressions || []).map(generateNFA);
    return alt(fragments);
}

function generateDisjunctionNFA(node: RegExpNode): NFA {
    return or(generateNFA(node.left), generateNFA(node.right));
}

function generateRepetitionNFA(node: RegExpNode): NFA {
    switch (node.quantifier.kind) {
        case '*':
            return rep(generateNFA(node.expression));
        case '+':
            return plusRep(generateNFA(node.expression));
        case '?':
            return questionRep(generateNFA(node.expression));
        default:
            throw new Error(`Unknown repetition: ${node.quantifier.kind}.`);
    }
}

function generateCharNFA(node: RegExpNode): NFA {
    if (node.kind !== 'simple') {
        throw new Error(`Only simple chars are supported.`);
    }

    return char(node.value);
}

function generateGroupNFA(node: RegExpNode): NFA {
    return generateNFA(node.expression);
}

export function build(regexp: string): NFA {
    let ast: RegExpNode;

    if (regexp as any instanceof RegExp) {
        regexp = `${regexp}`;
    }

    if (typeof regexp === 'string') {
        ast = parser.parse(regexp, {
            captureLocations: true,
        });

        return generateNFA(ast);
    }

    throw new Error(`Invalid regexp: ${regexp}.`);
}

