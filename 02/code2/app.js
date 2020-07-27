'use strict'

var Koa = require('koa');
var path = require('path');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var util = require('./libs/util');
var G = require('./wx/g'); // 中间件

// 不能暴露外网
var config = {
    wechat: {
        appId: "",
        appSecret: "",
        token: "",
        getAccessToken: () => {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: (data) => {
            return util.writeFileAsync(wechat_file, data);
        }
    }
}

var app = new Koa();
app.use(G(config.wechat));