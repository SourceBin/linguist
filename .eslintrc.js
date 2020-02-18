module.exports = {
  extends: '@syntek/syntek/node',
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
