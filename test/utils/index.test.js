const { parseArgv, getType } = require('../../src/utils');

describe('工具类测试', () => {
  test('parseArgv', () => {
    const processArgs = ['node.exe', 'babel.js', '--src', './index.js', '-o'];
    const result = parseArgv(processArgs);
    expect(result).toStrictEqual({ '--src': './index.js', '-o': true });
  });

  test('getType', () => {
    expect(getType([])).toEqual('array');
    expect(getType({})).toEqual('object');
    expect(getType(1)).toEqual('number');
    expect(getType('1')).toEqual('string');
    expect(getType(false)).toEqual('boolean');
  });
});
