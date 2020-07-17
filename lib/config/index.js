const config = {
  deep: false, // 是否扫描被引入的文件
  overwrite: false, // 是否复写已存在的类型文件
  rootPath: '', // 根目录
  scanMap: {}, // 扫描到的被引入的文件
  nameSpaceMap: {}, // 命名空间保存
  moduleName: 'unnamed', // 模块名
  isModuleIn: false, // 是否是模块的入口文件
};

module.exports = config;
