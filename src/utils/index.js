const parser = require('@babel/parser');

/**
 * 代码转AST树
 * @param {String} code JS代码字符串
 */
function transformCode2Ast(code) {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      'asyncGenerators',
      'bigInt',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      ['decorators', {
        decoratorsBeforeExport: false,
      }],
      'doExpressions',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'functionSent',
      'importMeta',
      'logicalAssignment',
      'nullishCoalescingOperator',
      'numericSeparator',
      'objectRestSpread',
      'optionalCatchBinding',
      'optionalChaining',
      ['pipelineOperator', {
        proposal: 'minimal',
      }],
      'throwExpressions',
      'topLevelAwait',
      'estree',
    ],
  });
}

function getType(obj) {
  if (Array.isArray(obj)) {
    return 'Array';
  }
  if (obj === null) {
    return 'any';
  }

  return typeof obj;
}

function generateDescription(leadingComments) {
  if (!leadingComments) return '';
  const commentlines = leadingComments[0].value.split('\n');
  if (commentlines.length > 1) {
    return `/*${leadingComments[0].value}*/`;
  }
  return `//${leadingComments[0].value}`;
}

const TYPES = {
  MethodDefinition: 'MethodDefinition',
  ClassProperty: 'ClassProperty',
  Identifier: 'Identifier',
  Literal: 'Literal',
  ArrowFunctionExpression: 'ArrowFunctionExpression',
  VariableDeclaration: 'VariableDeclaration',
  FunctionDeclaration: 'FunctionDeclaration',
  ExpressionStatement: 'ExpressionStatement',
  ClassDeclaration: 'ClassDeclaration',
  ObjectPattern: 'ObjectPattern',
};

module.exports = {
  transformCode2Ast,
  getType,
  generateDescription,
  TYPES,
};
