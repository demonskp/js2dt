# js2dt

[github](https://github.com/demonskp/js2dt)  |  [npm](https://www.npmjs.com/package/js2dt)

通过AST语法树和jsdoc注释解析将JavaScript代码转换成对应的Typescript的Type文件，也就是.js转.d.ts文件。由于js和ts的语法区别，并不保证可以完美转换。

## 状态

status：Alpha

## 安装

通过npm全局安装：

```
npm install -g js2dt
```

作为babel插件本地安装：

```
npm install --save-dev js2dt
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

配置babel插件：

```
// babel.config.json

"plugins": [
    ["./node_modules/js2dt", {
      "overwrite": true
    }]
  ]
```

配合webpack使用：

```
// webpack.config.js

rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ["./node_modules/js2dt", {
                "overwrite": true,
                "outdir": 'dist/type',
                "publicdir": ''
              }]
            ]
          }
        }
      }
    ]

```

命令配置项：

配置项|简写|作用|备注
---|---|---|---
--src [path]|-s|生成指定path路径的js文件的类型文件|-
--deep | \ | 对文件引用的文件也生成类型文件 | 会排除引用的库
--overwrite| -o | 生成时覆盖已存在的类型文件 | -

插件配置项：

配置项|类型|作用|备注
---|---|---|---
"overwrite"| boolean | 是否覆盖已存在的d.ts文件 | -
"outdir"| string | 输出d.ts文件的目录 | 不写则会默认在当前目录
"publicdir" | string| 源文件的公共路径 | 会去除原路径前的公共路径

## 注意项：

1. 必须指定文件路径。
2. d.ts文件会生成在js文件相同目录下
3. 对部分js语法解析可能会有问题。

## 更新计划

1. 对导出语句增加支持 √
2. 对相对路径导入语句增加支持 √
3. 增加类型推断能力，不完全依赖于jsdoc

## 无法解析的语法

1. ES5中类的写法
2. 声明类后为类添加属性