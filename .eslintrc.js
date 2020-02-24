// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': 0,
    'no-extra-boolean-cast': 0,
    'no-useless-escape': 0,
    'no-unused-vars': 0,
    'no-undef': 0,
    'vue/return-in-computed-property': 0, // 设置计算属性是否有返回值[2, {'treatUndefinedAsUnspecified': true}]
    'no-unneeded-ternary': 0
  }
}
