const { transformCode2Ast } = require('../src/utils');
const { getDtsString } = require('../src');

test('测试', () => {
  const result = `const path = require('path');
  const fs = require('fs');
  const { tsObjectPattern } = require('../temp/objectTemp');
  const { getTsFunctionTypeAnnotation } = require('./functionDeclaration');
  const config = require('../config');

  // =====================

  const a = 1;
  const b = '2';
  const c = function test(a, b) {
    return a + b;
  };
  const d = (a, b) => a + b;
  const e = {
    a: 1,
    b: '',
  };
  const name = null;

  //= ===========

  class test extends father {
    a=1;

    b='2';

    c=function (a, b) {
      return a + b;
    };

    d=(a, b) => a + b;

    e={
      a: 1,
      b: '',
    };
  }

  //= ======

  function funcTest({ a, b }, ...rest) {
    return '测试';
  }

  //= =========

  funcTest.a = 1;
  funcTest.b = '2';
  funcTest.c = function test(a, b) {
    return a + b;
  };
  funcTest.d = (a, b) => a + b;
  funcTest.e = {
    a: 1,
    b: '',
  };
  funcTest.name = null;

  //= =============

  module.exports = {
    funcTest, a, b,
  };
  `;

  const ast = transformCode2Ast(result);
  expect(getDtsString(ast)).toMatch('declare namespace funcTest {');
});
