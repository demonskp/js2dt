const { TYPES, generateDescription, getType } = require('../utils');
const { expressionStr } = require('../expression/expressionStr');
const { deepObjectMerge } = require('../utils');
const funcComment2FuncInfo = require('../func/funcComment2FuncInfo');
const { deelFunctionParamsType, deelAsyncReturnType } = require('../func/funcStr');

/**
 * 命名空间的方法转字符串
 * @param {Object} node 命名空间对象
 * @param {String} name 方法名
 * @param {Array} leadingComments 注释
 */
function namespaceFunctionStr(node, name, leadingComments) {
  if (!node) return '';
  const {
    params,
  } = node;
  const { params: paramsType, return: returnType } = funcComment2FuncInfo(leadingComments ? leadingComments[0] : undefined);

  const paramsStr = deelFunctionParamsType(params, paramsType);

  const returnTypeReal = deelAsyncReturnType(node.async, returnType);

  return `
${generateDescription(node.leadingComments)}
 function ${name}(${paramsStr.join(', ')}): ${returnTypeReal};`;
}

/**
 * 等于复杂对象的从句
 * @param {Object} node
 * @param {String} name
 */
function namespaceIdentifierStr(node, name) {
  if (!node) return '';

  return `
  const ${name}: any;`;
}

/**
 * 简单类型的从句
 * @param {Object} node
 * @param {String} name
 */
function namespaceLiteralStr(node, name) {
  if (!node) return '';

  return `
  const ${name}: ${getType(node.value)};`;
}

/**
 * 命名空间对象单个转字符串
 * @param {Object} namespaceNode 命名空间对象
 * @param {String} namespaceName 指定的命名空间名
 */
function namespace2Str(namespaceNode, namespaceName) {
  if (!namespaceNode) return '';

  const result = [];
  Object.keys(namespaceNode).forEach((key) => {
    // TODO 暂不处理对外导出
    if (key === 'module') return;
    const node = namespaceNode[key];
    // eslint-disable-next-line no-underscore-dangle
    if (!node.__js2dt__not_namespace) { // 是命名空间
      result.push(namespace2Str(node, key));
      return;
    }
    switch (node.type) {
      case TYPES.FunctionExpression:
      case TYPES.ArrowFunctionExpression:
        result.push(namespaceFunctionStr(node, key, node.leadingComments));
        break;
      case TYPES.Identifier:
        result.push(namespaceIdentifierStr(node, key));
        break;
      case TYPES.Literal:
        result.push(namespaceLiteralStr(node, key));
        break;

      default:
        break;
    }
  });

  return `namespace ${namespaceName} {
  ${result.join('\n')}
}`;
}

/**
 * 命名空间对象转字符串
 * @param {Object} namespaceNode 命名空间对象
 */
function namespaceNode2Str(namespaceNode) {
  if (!namespaceNode) return '';

  const result = [];
  Object.keys(namespaceNode).forEach((key) => {
    // TODO 暂不处理对外导出
    if (key === 'module') return;
    if (key === 'exports') return;
    const node = namespaceNode[key];
    // eslint-disable-next-line no-underscore-dangle
    if (!node.__js2dt__not_namespace) { // 是命名空间
      result.push(`declare ${namespace2Str(node, key)}`);
    }
  });

  return `${result.join('\n')}`;
}

/**
 * 从AST中解析出命名空间信息
 * @param {Object} ast AST对象
 */
function namespaceParse(ast) {
  const { body } = ast.program;
  const expressList = body.filter((node) => node.type === TYPES.ExpressionStatement);
  const namespace = {};
  expressList.forEach((node) => {
    const expressObj = expressionStr(node);
    deepObjectMerge(namespace, expressObj);
  });

  return namespace;
}

function namespaceStr(ast) {
  const namespace = namespaceParse(ast);
  const result = namespaceNode2Str(namespace);
  return result;
}

module.exports = { namespaceStr };
