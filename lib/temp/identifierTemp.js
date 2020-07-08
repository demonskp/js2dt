const types = require('@babel/types');

function identifierCreate(name, type) {
  const identifier = types.identifier(name);
  identifier.typeAnnotation = types.tsTypeAnnotation(type);
  return identifier;
}

function anyIdentifier(name) {
  return identifierCreate(name, types.tsAnyKeyword());
}

function stringIdentifier(name) {
  return identifierCreate(name, types.tsStringKeyword());
}

function numberIdentifier(name) {
  return identifierCreate(name, types.tsNumberKeyword());
}

function booleanIdentifier(name) {
  return identifierCreate(name, types.tsBooleanKeyword());
}

function voidIdentifier(name) {
  return identifierCreate(name, types.tsVoidKeyword());
}

function arrayIdentifier(name, type) {
  return identifierCreate(name, types.tsArrayType(type));
}

module.exports = {
  identifierCreate,
  anyIdentifier,
  stringIdentifier,
  numberIdentifier,
  booleanIdentifier,
  voidIdentifier,
  arrayIdentifier,
};
