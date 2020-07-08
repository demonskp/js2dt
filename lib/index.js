const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const fs = require('fs');
const { resolve } = require('path');
const classProperty = require('./traverse/classProperty');
const { functionDeclaration } = require('./traverse/functionDeclaration');

// const code = fs.readFileSync(resolve(__dirname, '../test.d.ts'));
const code = fs.readFileSync(resolve(__dirname, '../test.js'));

// 将源代码转换为AST
const ast = parser.parse(code.toString(), {
  sourceType: 'module',
  plugins: [
    'jsx',
    'typescript',
    'asyncGenerators',
    'bigInt',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
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
    // 'estree',
  ],
});
// console.log(JSON.stringify(ast.program.body[0]));

traverse(ast, {
  ClassProperty: (path) => {
    classProperty(path);
  },
  FunctionDeclaration: (path) => {
    functionDeclaration(path);
  },
});

console.log(generate(ast, code).code);
