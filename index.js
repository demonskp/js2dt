const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');
const { getDtsString } = require('./src');

function transformCode2Ast(code) {
  return parser.parse(code, {
    sourceType: 'module',
  });
}

fs.readFile(path.resolve(__dirname, './test.js'), (err, data) => {
  const ast = transformCode2Ast(data.toString());
  // const classParseNode = classParser(ast.program.body[0]);
  // console.log(JSON.stringify(ast.program.body[6]));
  console.log(getDtsString(ast));
});
