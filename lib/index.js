const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const { resolve } = require('path');
const { functionDeclaration } = require('./traverse/functionDeclaration');
const { classDeclaration } = require('./traverse/classDeclaration');
const { variableDeclaration } = require('./traverse/variableDeclaration');
const { expressionStatement } = require('./traverse/expressionStatement');
const config = require('./config');
const { namespaceDeclaration } = require('./traverse/namespaceDeclaration');

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
  ClassDeclaration: (path) => {
    classDeclaration(path);
  },
  FunctionDeclaration: (path) => {
    functionDeclaration(path);
  },
  VariableDeclaration: (path) => {
    variableDeclaration(path);
  },
  ExpressionStatement: (path) => {
    expressionStatement(path);
  },
});

ast.program.body = ast.program.body.concat(namespaceDeclaration(config.nameSpaceMap));

// eslint-disable-next-line no-console
console.log(generate(ast, code).code);
