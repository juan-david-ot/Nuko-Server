import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['build', 'node_modules']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['./tsconfig.json']
            },
            ecmaVersion: 'latest',
            globals: globals.node
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            'quotes': ['error', 'single'],
            'semi': ['error', 'never'],
            'indent': ['error', 4],
            'brace-style': ['error', 'stroustrup'],
            'comma-dangle': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'keyword-spacing': ['error', { before: true, after: true }],
            'space-before-blocks': ['error', 'always'],
            'eol-last': ['error', 'always'],
            'no-trailing-spaces': 'error'
        }
    }
])
