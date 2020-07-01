/**
 * 数学对象
 */
class Math {
  name='aaa';

  /**
   * 减法
   * @param {number} a 被减数
   * @param {number} b 减数
   */
  reduce = (a, b) => a - b;

  /**
   * 加法
   * @param {number} a 加数
   * @param {number} b 加数
   */
  async add(a, b) {
    return a + b;
  }
}

module.exports = Math;
