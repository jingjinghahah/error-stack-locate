# error-stack README

根据错误堆栈字符串、源码位置、sourceMap文件位置定位错误位置

## 使用方式

1. 安装 error-stack 扩展
2. 打开需要定位错误的项目
3. 在项目根目录下新增文件 error-config.json 
* `errorStack`: 错误堆栈字符串，以 `\n` 分割
* `sourceMapPath`: `sourceMap` 文件的相对路径
* `sourcePath`: 源代码相对路径

```json
{
    "errorStack": "exception: (run [/test.js] failed) Uncaught TypeError: Cannot convert object to primitive value\nat sr (/test.js:16:243776) \nat /test.js:16:246038\nat /test.js:16:246058\nat r (/test.js:9:164184) \nat /test.js:16:142779\nat r (/test.js:9:164184) \nat /test.js:16:135969\nat r (/test.js:9:164184) \nat /test.js:9:164986\nat /test.js:9:164996\nat r (/test.js:1:143) \nat /test.js:9:163596\nat r (/test.js:1:143) \nat /test.js:9:111962\nat r (/test.js:1:143) \nat s (/test.js:1:157139) \nat /test.js:1:157756\nat /test.js:1:158427\nat r (/test.js:1:143) \nat /test.js:1:935",
    "sourceMapPath": "./dist",
    "sourcePath":"./"
}
```
4. 在 vscode 左侧菜单中打开 Error stack 侧边栏
根据错误堆栈解析出了错误位置信息生成了左侧树结构。错误信息解析得到：文件路径、行数、列数、代码信息，点击可打开错误代码所在文件。

说明：
1. 父节点（错误信息）若没有可展开的子节点（文件路径、行数、列数、代码），则代表根据错误字符串没有找到对应的文件
2. 若未生成左侧树，可点击刷新按钮重新生成

**Enjoy!**
