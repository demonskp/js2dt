function expressionStr(expressionNode) {
  const { expression } = expressionNode;
  if (expression.operator !== '=') return '';
  const { left, right } = expression;
  const list = [];
  let propFlag = true;
  let target = left;
  while (propFlag) {
    list.push(target.property.name);
    target = target.object;

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
      last[property] = { __js2dt__not_namespace: true, leadingComments: expressionNode.leadingComments, ...right };
    }
    last = last[property];
  });

  return map;
}

module.exports = { expressionStr };
