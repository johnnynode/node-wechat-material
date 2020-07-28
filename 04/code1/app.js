'use strict'

var Koa = require('koa');
var path = require('path');
var util = require('./libs/util');
var G = require('./wx/g'); // 中间件
var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = require('./config');

var app = new Koa();
app.use(G(config.wechat, weixin.reply));

app.listen(1234);