const { TYPES } = require('./utils');
const { variableStr } = require('./variable/variableStr');
const { classStr } = require('./class/classStr');
const { functionDeclarationStr } = require('./func/funcStr');

function getDtsString(ast) {
  const { body } = ast.program;
  const result = [];
  body.forEach((node) => {
    switch (node.type) {
      case TYPES.VariableDeclaration:
        result.push(variableStr(node));
        break;
      case TYPES.ClassDeclaration:
        result.push(classStr(node));
        break;
      case TYPES.FunctionDeclaration:
        result.push(functionDeclarationStr(node));
        break;
      case TYPES.ExpressionStatement:
        break;
      default:
        break;
    }
  });
  return `${result.join('\n')}`;
}

module.exports = {
  getDtsString,
};
