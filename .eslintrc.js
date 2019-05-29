/**
 * eslint rules 整理，基于 eslint v5.1.0，eslint-plugin-react v7.10.0，后续会持续升级的
 * "off" or 0 - turn the rule off
 * "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
 * "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)
 */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'semi': [0, 'always'], // 总是要求加上分号
    "no-unused-vars": [0, { "vars": "all", "args": "none" }],
    "arrow-parens": [0], // 对于箭头函数，需要添加括号，比如(a) => {}; 而不应该简写为 a => {};
    "prefer-destructuring": [2, {
      "array": false,
    }, {
        "enforceForRenamedProperties": false
      }], // 尽量使用解构表达式，比如 const [foo] = array; 或 const {bar: foo} = object;
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
