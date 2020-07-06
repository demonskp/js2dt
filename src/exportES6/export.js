const { TYPES } = require('../utils');
const { classStr } = require('../class/classStr');
const { functionDeclarationStr } = require('../func/funcStr');

function exportStr(node, isDefault) {
  if (!node) return '';
  let result = '';
  const exportNode = node.declaration;
  exportNode.leadingComments = node.leadingComments;
  switch (exportNode.type) {
    case TYPES.ClassDeclaration:
      result = classStr(exportNode, true, isDefault);
      break;
    case TYPES.FunctionDeclaration:
      result = functionDeclarationStr(exportNode, true, isDefault);
      break;
    case TYPES.Identifier:
      result = `export ${isDefault ? 'default ' : ''}${exportNode.name}`;
      break;
    case TYPES.ArrowFunctionExpression:
      result = functionDeclarationStr(exportNode, true, isDefault);
      break;
    default:
      break;
  }

  return result;
}

module.exports = { exportStr };
