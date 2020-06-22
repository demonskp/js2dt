const {
  getType,
  generateDescription,
} = require('../utils');
const {
  funcParse,
} = require('../func/funcParse');

/**
 * 类属性对象字面属性解析{a=1}
 * @param {Object} node 类属性对象
 */
function propertyLiteralParser(node) {
  if (!node) return {};
  const result = {
    type: node.value.type,
    key: node.key.name,
    valueType: getType(node.value.value),
  };
  return result;
}

function propertyFunctionParser(node) {
  if (!node) return {};
  return node;
}

/**
 * 类属性对象解析
 * @param {Object} node 类属性对象
 */
function propertyParser(node) {
  if (!node) return {};
  switch (node.value.type) {
    case 'Literal':
      return propertyLiteralParser(node);
    case 'ArrowFunctionExpression':
      return propertyFunctionParser(node);
    default:
      return null;
  }
}

/**
 * 类方法对象解析
 * @param {Object} node 类方法对象
 */
function methodParser(node) {
  if (!node) return {};
  node.value.leadingComments = node.leadingComments;
  const funcParseNode = funcParse(node.value);
  const result = {
    ...funcParseNode,
    funcName: node.key.name,
    static: node.static,
  };
  return result;
}

/**
 * 对象方法解析对象转换字符串
 * @param {Object} methodNode 方法解析对象
 */
function classMethodStr(methodNode) {
  if (!methodNode) return '';

  const {
    params, paramsType, async, returnType, static: staticFlag,
  } = methodNode;

  const paramsStr = [];
  for (let i = 0; i < params.length; i += 1) {
    let typeStr = ': any';
    if (paramsType[i]) {
      typeStr = `: ${paramsType[i].type}`;
    }
    paramsStr.push(params[i].name + typeStr);
  }

  return `
  ${generateDescription(methodNode.leadingComments)}
  ${async ? 'async ' : ''}${staticFlag ? 'static ' : ''}${methodNode.funcName}(${paramsStr.join(', ')}):${returnType};
  `;
}

/**
 * 类对象解析
 * @param {Object} classNode 类对象
 */
function classParser(classNode) {
  if (!classNode) return null;
  const result = {
    leadingComments: classNode.leadingComments,
    start: classNode.start,
    end: classNode.end,
    name: classNode.id.name,
    propertys: [],
    methods: [],
  };

  const classbodyList = classNode.body.body;

  classbodyList.forEach((node) => {
    switch (node.type) {
      case 'ClassProperty':
        result.propertys.push(propertyParser(node));
        break;
      case 'MethodDefinition':
        result.methods.push(methodParser(node));
        break;
      default:
        break;
    }
  });

  return result;
}

function classStr(classParseNode) {
  if (!classParseNode) return '';

  const propertyStrList = [];
  const methodStrList = [];

  classParseNode.propertys.forEach((property) => {
    propertyStrList.push(
      `${property.key}:${property.valueType},`,
    );
  });

  classParseNode.methods.forEach((method) => {
    methodStrList.push(classMethodStr(method));
  });

  return `
${generateDescription(classParseNode.leadingComments)}
declare class ${classParseNode.name} {

  ${propertyStrList.join('\n')}
  ${methodStrList.join('\n')}
}
  `;
}

module.exports = {
  classParser,
  classStr,
};
