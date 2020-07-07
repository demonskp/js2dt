const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const fs = require('fs');
const { resolve } = require('path');

const code = fs.readFileSync(resolve(__dirname, './test.d.ts'));
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
// console.log(JSON.stringify(ast.program.body));

const stringIdentifier = types.identifier('param');
const typeAnnotation = types.tsTypeAnnotation(types.tsStringKeyword());
stringIdentifier.typeAnnotation = typeAnnotation;
const result = types.tsDeclareFunction(types.identifier('name'), null, [stringIdentifier], types.tsTypeAnnotation(types.tsAnyKeyword()));
result.declare = true;
result.async = false;
console.log(JSON.stringify(result));
ast.program.body[0] = result;

const output = generate(ast, code);
console.log(output.code);
