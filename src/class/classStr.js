const funcComment2FuncInfo = require('../func/funcComment2FuncInfo');
const { getType, generateDescription, TYPES } = require('../utils');
const { deelFunctionParamsType, deelAsyncReturnType } = require('../func/funcStr');

/**
 * 类属性对象方法属性解析
 * @param {Object} node 类属性对象
 */
function propertyFunctionStr(node) {
  if (!node) return '';
  const {
    params,
  } = node.value;

  const { params: paramsType, return: returnType } = funcComment2FuncInfo(node.leadingComments ? node.leadingComments[node.leadingComments.length - 1] : undefined);

  const paramsStr = deelFunctionParamsType(params, paramsType);

  const returnTypeReal = deelAsyncReturnType(node.value.async, returnType);

  if (node.key.name === 'constructor') {
    return `
  ${generateDescription(node.leadingComments)}
  ${node.key.name}(${paramsStr.join(', ')});`;
  }

  return `
  ${generateDescription(node.leadingComments)}
  ${node.value.static ? 'static ' : ''}${node.key.name}: (${paramsStr.join(', ')}) => ${returnTypeReal};`;
}

/**
 * 类属性对象字面属性解析{a=1}
 * @param {Object} node 类属性对象
 */
function propertyLiteralStr(node) {
  if (!node) return '';

  return `
  ${node.key.name}: ${getType(node.value.value)};`;
}

/**
 * 类方法对象转换
 * @param {Object} node 类方法对象
 */
function classMethodDefStr(node) {
  return propertyFunctionStr(node);
}

/**
 * 类属性对象分类解析
 * @param {Object} node 类属性对象
 */
function propertyStr(node) {
  let result = '';
  switch (node.value.type) {
    case TYPES.Literal:
      result = propertyLiteralStr(node);
      break;
    case TYPES.ArrowFunctionExpression:
      result = propertyFunctionStr(node);
      break;

    default:
      break;
  }
  return result;
}

function classStr(classNode, isExport, isDefault) {
  if (!classNode) return '';

  const propertyList = [];
  classNode.body.body.forEach((node) => {
    switch (node.type) {
      case TYPES.MethodDefinition:
        propertyList.push(classMethodDefStr(node));
        break;
      case TYPES.ClassProperty:
        propertyList.push(propertyStr(node));
        break;

      default:
        break;
    }
  });

  let superClass = '';
  if (classNode.superClass) {
    superClass = ` extends ${classNode.superClass.name}`;
  }

  let exportDefaultDeclare = 'declare';
  if (isExport) {
    exportDefaultDeclare = 'export';
    if (isDefault) {
      exportDefaultDeclare = 'export default';
    }
  }

  return `
${generateDescription(classNode.leadingComments)}
${exportDefaultDeclare} class ${classNode.id.name}${superClass} {
  ${propertyList.join('\n')}

}`;
}

module.exports = {
  propertyFunctionStr, propertyLiteralStr, classMethodDefStr, classStr,
};
