function getType(obj) {
  if (Array.isArray(obj)) {
    return 'Array';
  }
  if (obj === null) {
    return 'any';
  }

  return typeof obj;
}

function generateDescription(leadingComments) {
  if (!leadingComments) return '';
  const commentlines = leadingComments[0].value.split('\n');
  if (commentlines.length > 1) {
    return `/*${leadingComments[0].value}*/`;
  }
  return `//${leadingComments[0].value}`;
}

module.exports = {
  getType,
  generateDescription,
};
