'use strict'

var sha1 = require('../../../04/code1/wx/node_modules/sha1');
var Promise = require('../../../04/code1/wx/node_modules/bluebird');
var request = Promise.promisify(require('request'));
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential'
}

// 用于生成实例 并 初始化工作 我们假设票据存储在文件中
// 用于管理和微信交互的接口，票据的更新,存储,调用等
function Wechat(opts) {
    this.appId = opts.appId;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    // 票据的读写
    this.getAccessToken()
        .then((data) => {
            // 解析本地token, 如果没有，那么直接获取
            try {
                data = JSON.parse(data);
            } catch (e) {
                return this.updateAccessToken();
            }

            // 合法则使用，不合法则更新
            if (this.isValidAccessToken(data)) {
                Promise.resolve(data);
            } else {
                return this.updateAccessToken();
            }
        })
        .then((data) => {
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
        });
}

Wechat.prototype.isValidAccessToken = (data) => {
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }

    var expires_in = data.expires_in;
    var now = new Date().getTime();

    return now < expires_in;
}

Wechat.prototype.updateAccessToken = () => {
    var appId = this.appId;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appId + '&secret=' + appSecret;

    return new Promise((resolve, reject) => {
        request({ url: url, json: true })
            .then((response) => {
                var data = response[1];
                var now = new Date().getTime();
                var expires_in = now + (data.expires_in - 20) * 1000; // -20 为了提前更新token，给请求，响应留有余量
                data.expires_in = expires_in;
                resolve(data);
            });
    });
}

module.exports = function(opts) {
    new Wechat(opts); // 初始化实例

    // 这个中间件用于处理事件推送数据的验证，用于返回信息的
    return function*(next) {
        // console.log(this.query);

        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        // 进行字典排序
        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);
        // 成功，则原样返回给微信
        this.body = sha == signature ? echostr + '' : 'no!';
    };
}