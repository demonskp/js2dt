const { functionDeclaration } = require('./traverse/functionDeclaration');
const { classDeclaration } = require('./traverse/classDeclaration');
const { variableDeclaration } = require('./traverse/variableDeclaration');
const { expressionStatement } = require('./traverse/expressionStatement');
const config = require('./config');
const { namespaceDeclaration } = require('./traverse/namespaceDeclaration');

module.exports = function (babel) {
  console.log('....');
  console.log(babel);
  return {
    visitor: {
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
      Program: {
        exit: (path) => {
          const namespaceList = namespaceDeclaration(config.nameSpaceMap);
          namespaceList.forEach((namespace) => {
            path.node.body.push(namespace);
          });
        },
      },
    },
  };
};
