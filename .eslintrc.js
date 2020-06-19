module.exports = {
  extends: [
    'airbnb',
  ],
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
  },
  rules: {
    'no-useless-escape': 'off',
    'no-async-promise-executor': 'error',
    'react/prop-types': 'warn',
    'require-atomic-updates': 'warn',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
};
