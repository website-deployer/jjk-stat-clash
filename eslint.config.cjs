module.exports = [
  { ignores: ['node_modules/**', 'dist/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: {
        meta: {
          name: '@typescript-eslint/parser',
          version: require('@typescript-eslint/parser/package.json').version,
        },
        parse(code, options) {
          return require('@typescript-eslint/parser').parse(code, options);
        },
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react')
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
];
