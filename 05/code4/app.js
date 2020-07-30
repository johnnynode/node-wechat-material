'use strict'

var Koa = require('koa');
var G = require('./wx/g'); // 中间件
var config = require('./config');
var reply = require('./weixin/reply');

var app = new Koa();
app.use(G(config.wechat, reply));

app.listen(1234);