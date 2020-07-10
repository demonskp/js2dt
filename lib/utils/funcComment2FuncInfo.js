const types = require('@babel/types');

/**
 * 将参数对象转化为包含每个属性的数组
 * @param {Object} paramsObj 参数对象
 */
function object2arr(paramsObj) {
  if (!paramsObj) return [];
  const result = [];
  if (paramsObj) {
    Object.keys(paramsObj).forEach((att) => {
      const type = {
        name: att,
        type: JSON.stringify(paramsObj[att]).replace(/"/g, ''),
      };
      result.push(type);
    });
  }

  return result;
}

/**
 * 对类型信息对象进行扁平化处理
 * @param {Array} paramsType 参数类型信息
 */
function paramsTypeFlat(paramsType) {
  const typeCach = {};
  paramsType.forEach((docTypes) => {
    const {
      name,
      type,
    } = docTypes;
    const isObject = (type === 'object' || type === 'Object');
    const hasDot = name.includes('.');
    // {name:"b",type:"string"}
    if (!isObject && !hasDot) {
      typeCach[name] = type;
    }
    // {name:"a",type:"Object"}
    if (isObject && !hasDot) {
      typeCach[name] = {};
    }
    // {name:"a.age",type:"number"}
    if (!isObject && hasDot) {
      const attrArr = name.split('.');
      let attrCach = typeCach;
      attrArr.forEach((attr, index) => {
        if (index === attrArr.length - 1) {
          attrCach[attr] = type;
          return;
        }
        attrCach[attr] = attrCach[attr] ? attrCach[attr] : {};
        attrCach = attrCach[attr];
      });
    }
    // {name:"a.leader",type:"Object"}
    if (isObject && hasDot) {
      const attrArr = name.split('.');
      let attrCach = typeCach;
      attrArr.forEach((attr, index) => {
        if (index === attrArr.length - 1) {
          attrCach[attr] = type;
          return;
        }
        attrCach[attr] = attrCach[attr] ? attrCach[attr] : {};
        attrCach = attrCach[attr];
      });
    }
  });
  return object2arr(typeCach);
}

/**
 * 转换jsdoc类型写法
 * @param {String} type 类型
 */
function typeTranslate(type) {
  let result = type.trim().toLowerCase();
  switch (result) {
    case '':
    case 'any':
    case '*':
      result = types.anyTypeAnnotation();
      break;
    case 'number':
      result = types.numberTypeAnnotation();
      break;
    case 'string':
      result = types.stringTypeAnnotation();
      break;
    case 'bool':
    case 'boolean':
    case 'true':
    case 'false':
      result = types.booleanTypeAnnotation();
      break;
    case '{}':
    case 'object':
      result = types.objectTypeAnnotation([]);
      break;
    case '[]':
    case 'array':
    case '...any':
      result = types.arrayTypeAnnotation(types.anyTypeAnnotation());
      break;
    default:
      if (/^\.\.\./.test(result)) {
        result = types.arrayTypeAnnotation(typeTranslate(result.replace(/^\.\.\./, '')));
      } else {
        result = types.genericTypeAnnotation(types.identifier(type));
      }
      break;
  }
  return result;
}

/**
 * 方法注释转方法类型描述
 * @param {Object} comment 注释
 */
function funcComment2FuncInfo(comment) {
  if (!comment) {
    return {
      type: '',
      start: 0,
      end: 0,
      description: '',
      params: [],
      return: types.anyTypeAnnotation(),
    };
  }
  const funcInfo = {
    type: comment.type,
    start: comment.start,
    end: comment.end,
    description: '',
    params: [],
    return: 'any',
  };
  let annotationLines = comment.value.split('\n');
  annotationLines = annotationLines.splice(1, annotationLines.length - 2);
  annotationLines.forEach((annotationLine) => {
    if (annotationLine.search('\\* @param') >= 0) {
      const paramsInfo = (/\@param *{(?<type>.+)} *(?<name>\S+)/g).exec(annotationLine);
      if (!paramsInfo) return;
      const params = {
        name: paramsInfo.groups.name,
        type: paramsInfo.groups.type,
      };
      funcInfo.params.push(params);
      return;
    }
    if (annotationLine.search('\\* @return') >= 0) {
      const returnInfo = (/\@(returns|return) *{(?<return>.+)}.*/).exec(annotationLine);
      if (!returnInfo) return;
      funcInfo.return = returnInfo.groups.return;
      return;
    }
    const funcDesc = (/\* (?<desc>.+)/g).exec(annotationLine);
    if (!funcDesc) return;
    funcInfo.description = funcDesc.groups.desc;
  });
  funcInfo.params = paramsTypeFlat(funcInfo.params).map((param) => ({
    name: param.name,
    type: typeTranslate(param.type),
  }));
  funcInfo.return = typeTranslate(funcInfo.return);
  return funcInfo;
}

module.exports = funcComment2FuncInfo;
