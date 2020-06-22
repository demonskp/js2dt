const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');
const funcComment2FuncInfo = require('./src/func/funcComment2FuncInfo');
const { propertyLiteralStr, classMethodDefStr, classStr } = require('./src/class/classStr');
const { functionDeclarationStr } = require('./src/func/funcStr');
const { variableStr } = require('./src/variable/variableStr');
const { getDtsString } = require('./src');

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

fs.readFile(path.resolve(__dirname, './test.js'), (err, data) => {
  const ast = transformCode2Ast(data.toString());
  // const classParseNode = classParser(ast.program.body[0]);
  console.log(ast.program.body[2].params);
  // console.log(getDtsString(ast));
});
