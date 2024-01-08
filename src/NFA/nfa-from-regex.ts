import { NFA } from './nfa';
import parser from '../parser';
import { alt, char, or, rep, plusRep, questionRep } from './builders';

type ASTNode = {
    type: string;
    flags: string;
    kind: string;
    body: ASTNode;
    value: string;
    expressions: ASTNode[];
    left: ASTNode;
    right: ASTNode;
    quantifier: {
        kind: string;
    };
    expression: ASTNode;
};

function gen(node: ASTNode) {
    switch (node.type) {
        case 'RegExp':
            return RegExp(node);
        case 'Alternative':
            return Alternative(node);
        case 'Disjunction':
            return Disjunction(node);
        case 'Repetition':
            return Repetition(node);
        case 'Char':
            return Char(node);
        case 'Group':
            return Group(node);
        default:
            throw new Error(`Unknown node type: ${node.type}.`);
    }
}

function RegExp(node: ASTNode): NFA {
    if (node.flags !== '') {
        throw new Error(`NFA/DFA: Flags are not supported yet.`);
    }

    return gen(node.body);
}

function Alternative(node: ASTNode): NFA {
    const fragments = (node.expressions || []).map(gen);
    return alt(fragments);
}

function Disjunction(node: ASTNode): NFA {
    return or(gen(node.left), gen(node.right));
}

function Repetition(node: ASTNode): NFA {
    switch (node.quantifier.kind) {
        case '*':
            return rep(gen(node.expression));
        case '+':
            return plusRep(gen(node.expression));
        case '?':
            return questionRep(gen(node.expression));
        default:
            throw new Error(`Unknown repeatition: ${node.quantifier.kind}.`);
    }
}

function Char(node: ASTNode): NFA {
    if (node.kind !== 'simple') {
        throw new Error(`NFA/DFA: Only simple chars are supported yet.`);
    }

    return char(node.value);
}

function Group(node: ASTNode): NFA {
    return gen(node.expression);
}

export function build(regexp: string): NFA {
    let ast = regexp;

    if (regexp as any instanceof RegExp) {
        regexp = `${regexp}`;
    }

    if (typeof regexp === 'string') {
        ast = parser.parse(regexp, {
            captureLocations: true,
        });
    }

    return gen(ast as unknown as ASTNode);
}
