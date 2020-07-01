/**
 * 方法注释转方法类型描述
 * @param {Object} comment 注释
 * @param {String} comment.type 类型
 */
function funcComment2FuncInfo(comment) {
  if (!comment) {
    return {
      type: '',
      start: 0,
      end: 0,
      description: '',
      params: [],
      return: 'any',
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
      const paramsInfo = (/\@param {(?<type>.+)} (?<name>\S+)/g).exec(annotationLine);
      if (!paramsInfo) return;
      const params = {
        name: paramsInfo.groups.name,
        type: typeTranslate(paramsInfo.groups.type),
      };
      funcInfo.params.push(params);
      return;
    }
    if (annotationLine.search('\\* @return') >= 0) {
      const returnInfo = (/\@(returns|return) {(?<return>.+)}.*/).exec(annotationLine);
      if (!returnInfo) return;
      funcInfo.return = typeTranslate(returnInfo.groups.return);
      return;
    }
    const funcDesc = (/\* (?<desc>.+)/g).exec(annotationLine);
    if (!funcDesc) return;
    funcInfo.description = funcDesc.groups.desc;
  });
  funcInfo.params = paramsTypeFlat(funcInfo.params);
  return funcInfo;
}

module.exports = funcComment2FuncInfo;
