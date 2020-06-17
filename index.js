const parser = require("@babel/parser");
const fs = require('fs');
const path = require('path');
const { visit } = require("ast-types");
const funcTypeScriptCreate = require("./src/funcTypeScriptCreate");

function transformCode2Ast(code) {
  return parser.parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      "asyncGenerators",
      "bigInt",
      "classProperties",
      "classPrivateProperties",
      "classPrivateMethods",
      ["decorators", { decoratorsBeforeExport: false }],
      "doExpressions",
      "dynamicImport",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "functionBind",
      "functionSent",
      "importMeta",
      "logicalAssignment",
      "nullishCoalescingOperator",
      "numericSeparator",
      "objectRestSpread",
      "optionalCatchBinding",
      "optionalChaining",
      ["pipelineOperator", { proposal: "minimal" }],
      "throwExpressions",
      "topLevelAwait",
      "estree",
    ],
  });
}

fs.readFile(path.resolve(__dirname,'./test.js'),(err,data)=>{

  const ast = transformCode2Ast(data.toString());
  console.log(funcTypeScriptCreate(ast.program.body[0]));
})