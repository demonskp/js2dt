
/**
 * 数学对象
 */
declare class Math{
  
  name: string;

  /**
   * 减法
   * @param {number} a 被减数
   * @param {number} b 减数
   */
  reduce: (a: number, b: number) => any;

  /**
   * 加法
   * @param {number} a 加数
   * @param {number} b 加数
   */
  add: (a: number, b: number) => Promise<any>;

}
export default Math;