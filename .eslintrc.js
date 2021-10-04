module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'eslint-config-oliup',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 11,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	rules: {
		'radix': 0,
		'one-var-declaration-per-line': 0,
		'no-mixed-spaces-and-tabs': 0,
		'no-bitwise': 0,
		'no-console': 0,
		'no-unused-vars': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/interface-name': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/no-this-alias': 0,
	},
};
