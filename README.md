# js2dt

通过AST语法树和jsdoc注释解析将JavaScript代码转换成对应的Typescript的Type文件，也就是.js转.d.ts文件。由于js和ts的语法区别，并不保证可以完美转换。

## 状态

status：未发布

## 安装

通过npm安装：

```
npm install -g js2dt
```

下载项目后在根目录执行安装：

```
npm install . -g
```

安装完成功查看版本确定是否安装成功：

```
js2dt -v
```

## 使用

一般使用：

```
js2dt --src ./test.js
```

同时生成多文件：

```
js2dt --src ./test.js,./index.js
```

配置项：

配置项|简写|作用|备注
---|---|---|---
--src [path]|-s|生成指定path路径的js文件的类型文件|-

## 注意项：

1. 必须指定文件路径。
2. d.ts文件会生成在js文件相同目录下
3. 对部分js语法解析可能会有问题。

## 更新计划

1. 对导出语句增加支持
2. 对相对路径导入语句增加支持
3. 增加类型推断能力，不完全依赖于jsdoc