const { NodePath } = require('@babel/traverse');
const types = require('@babel/types');
const config = require('../config/index');
const { deepObjectMerge } = require('../utils');

/**
 * 分配语句节点转换命名空间预备节点
 * @param {import('@babel/types').AssignmentExpression} expression 分配语句节点
 */
function expression2namespace(expression) {
  if (expression.operator !== '=') return '';
  const { left, right, leadingComments } = expression;
  const list = [];
  let propFlag = true;
  let target = left;
  while (propFlag) {
    if (target.property) {
      list.push(target.property.name);
      target = target.object;
    }

    if (!target.property) {
      propFlag = false;
      list.push(target.name);
    }
  }

  list.reverse();

  const map = {};
  let last = map;
  list.forEach((property, index) => {
    last[property] = {};
    if (index === list.length - 1) {
      last[property] = { __js2dt__not_namespace: true, leadingComments, ...right };
    }
    last = last[property];
  });

  return map;
}

/**
 * 分配语句转化成命名空间处理
 * @param {import('@babel/types').AssignmentExpression} assignmentExpression 分配语句节点
 */
function namespaceDeal(assignmentExpression) {
  const namespaceNode = expression2namespace(assignmentExpression);
  deepObjectMerge(config.nameSpaceMap, namespaceNode);
}

/**
 * 声明语句处理
 * @param {NodePath} path 声明语句
 */
function expressionStatement(path) {
  const { node } = path;
  if (types.isExpressionStatement(node)) {
    if (types.isAssignmentExpression(node.expression)) {
      if (types.isMemberExpression(node.expression.left)) {
        node.expression.leadingComments = node.leadingComments;
        namespaceDeal(node.expression);
      }
    }
  }
  path.remove();
}

module.exports = { expressionStatement };
