/**
 * ESLint rules to prevent Antd deprecation warnings
 * Add to your main .eslintrc.js or extend this config
 */

module.exports = {
  rules: {
    // Warn about using deprecated Modal visible prop
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'JSXAttribute[name.name="visible"][parent.name.name="Modal"]',
        message: 'Modal "visible" prop is deprecated. Use "open" instead.'
      },
      {
        selector: 'Property[key.name="visible"][parent.key.name="Modal"]',
        message: 'Modal "visible" prop is deprecated. Use "open" instead.'
      }
    ],
    // Warn about using deprecated Tabs.TabPane
    'no-restricted-imports': [
      'warn',
      {
        patterns: ['*TabPane*']
      }
    ]
  }
};

