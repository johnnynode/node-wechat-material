'use strict'

var Koa = require('koa');
var G = require('./wx/g'); // 中间件
var config = require('./config');

var app = new Koa();
app.use(G(config.wechat));

app.listen(1234);