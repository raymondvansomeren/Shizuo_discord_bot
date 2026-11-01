import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
    { ignores: ['node_modules/', 'old/'] },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        plugins: { '@stylistic': stylistic },
        rules: {
            'curly': ['error', 'multi-line', 'consistent'],
            'no-empty-function': 'error',
            'no-lonely-if': 'error',
            'no-shadow': ['error', { allow: ['err', 'resolve', 'reject'] }],
            'no-unused-vars': ['error', { args: 'none' }],
            'no-var': 'error',
            'prefer-const': 'error',
            'yoda': 'error',

            '@stylistic/brace-style': ['error', 'allman', { allowSingleLine: true }],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/comma-spacing': 'error',
            '@stylistic/comma-style': 'error',
            '@stylistic/dot-location': ['error', 'property'],
            '@stylistic/indent': ['error', 4, { SwitchCase: 0 }],
            '@stylistic/max-statements-per-line': ['error', { max: 2 }],
            '@stylistic/no-floating-decimal': 'error',
            '@stylistic/no-multi-spaces': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
            '@stylistic/space-in-parens': 'error',
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/space-unary-ops': 'error',
            '@stylistic/spaced-comment': 'error',
        },
    },
];
