'use strict'

var Koa = require('koa');
var G = require('./wx/g'); // 中间件
var config = require('./config');
var weixin = require('./weixin');

var app = new Koa();
app.use(G(config.wechat, weixin.reply));

app.listen(1234);