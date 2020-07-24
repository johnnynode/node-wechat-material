'use strict'

var Koa = require('koa');
var sha1 = require('sha1');

// 不能暴露外网
var config = {
    wechat: {
        appId: "",
        appSecret: "",
        token: ""
    }
}

var app = new Koa();

app.use(function*(next) {
    console.log(this.query);

    var token = config.wechat.token;
    var signature = this.query.signature;
    var nonce = this.query.nonce;
    var timestamp = this.query.timestamp;
    var echostr = this.query.echostr;

    // 进行字典排序
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);
    if (sha == signature) {
        this.body = echostr + ''; // 原样返回给微信
    } else {
        this.body = 'no!'; // wrong
    }
});

app.listen(1234);
console.log('listening: 1234');