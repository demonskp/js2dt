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
        type: JSON.stringify(paramsObj[att]),
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
  paramsType.forEach((types) => {
    const {
      name,
      type,
    } = types;
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

module.exports = paramsTypeFlat;
