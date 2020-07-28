### 微信交互流程

- 验证开发者身份
    * 在微信后台配置好URL,token等参数
    * 微信服务器给你一个get请求，带有时间戳,随机数等一堆参数
    * 我们自己服务器上的一个服务程序接收到这些参数, 按照要求处理后, 再返回参数串
    * 身份验证完毕
- 用户和微信互动(发送消息或事件)
    * 看着是在和我们自己的服务器互动，其实一直都是和微信服务器互动(微信服务器在中间做了一个信息加工处理的工厂)
    * 点击或发送(如：关注公众号，发送消息信息)会触发事件机制或消息机制，这些行为都会同步到微信服务器
    * 微信服务器加工好之后将数据转化为XML格式, 之后Post到我们的主机
    * 我们的主机经过一系列业务逻辑的处理, 最终将返回数据以xml的格式返回给微信服务器
    * 微信服务器在内部继续做一些事情，最后将结果推送回复到我们的手机或电脑上的微信客户端
    * 这个交互流程大致是这样，其中有一个重要的一环没有说，就是全局票据的获取和更新
        * 自动回复用不到票据，但是其他很多接口都需要票据
        * 这个自动更新token票据的机制，需要在我们自己的主机中来完成

### 开发中的一些技术点

1 ) **Promise的使用**

之前回调方式处理异步

```js
var fs = require('fs');

function writeFileAsync(fpath, data, cb) {
    fs.writeFile(fpath, data, (err) => {
        cb(err);
    });
}
```

- 容易书写，但难以维护，很容易遗漏掉错误处理
- 无法使用return语句返回值

现在Promise的写法

```js
var fs = require('fs');
var Promise = require('bluebird');

function writeFileAsync(fpath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fpath, data, (err) => {
            err ? reject(err) : resolve();
        })
    });
}
```

- Promise可以理解为一种规范或语法糖
- 一个Promise代表的就是一个异步操作的最终结果
- 让异步处理变得易于维护, 职责更趋于单一
- 通过then函数向下逐层传递数据保证执行顺序

2 ) **Promise 改造回调函数示例**

回调嵌套

```js
request(url, (err, res, body) => {
    err && handleError(err);
    fs.writeFile('1.txt', body, (err)=>{
        err && handleError(err);
        request(url2, (err, res, body) => {
            err && handleError(err);
        });
    });
})
```

Promise写法

```js
request(url)
    .then((result) => {
        return writeFileAsync('1.txt', result);
    })
    .then((result) => {
        return request(url2);
    })
    .catch((e) => {
        handleError(e);
    });
```

3 ) **关于Generator的使用**

- 当在执行函数的时候，可以在某一个点，暂停函数的执行，做一些其他的工作，再返回到函数中继续执行
- 创建genertor函数：在function后面加入*号
- 在内部，迭代器执行next的时候总是返回一个对象：里面有两个属性，一个是value(当前值)，一个是done(是否迭代完毕的状态)
- 整个过程就像是打断点一样来控制函数的进度，这样解决异步就非常容易，不再需要回调，甚至是Promise的then方法
- 通过同步的代码拿到异步执行的结果

```js
var gen = function* (n) {
    for(var i = 0; i < 3; i ++) {
        n++;
        yield n;
    }
}
var gObj = gen(0);

console.log(gObj.next()); // {value: 1, done: false}
console.log(gObj.next()); // {value: 2, done: false}
console.log(gObj.next()); // {value: 3, done: false}
console.log(gObj.next()); // {value: undefined, done: true}
```

之前回调和promise的写法改写，将会非常简单的实现

```js
var result = yield request(url);
yield writeFileAsync('1.txt', result);
yield request(url2);
```

### 关于中间件

- 中间件就像是从request到reponse之间每一个流水线上的加工房间，每个房间职责单一
- express的中间件通过next往下执行；koa的中间件通过yield next向下执行
- express内部的中间件是如何串联起来的
    * 每个中间件都是一个回调函数，通过回调函数保证执行顺序
    * 在回调函数里面有一个next方法，用于调用下一个中间件
- 具体可以看express和koa的源码