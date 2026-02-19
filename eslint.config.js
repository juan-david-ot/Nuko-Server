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
			'@typescript-eslint/no-unused-vars': 'warn'
		}
	}
])
