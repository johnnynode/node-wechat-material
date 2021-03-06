'use strict'

var sha1 = require('sha1');
var Wechat = require('./wechat');
var getRawBody = require('raw-body');
var util = require('./util');

module.exports = function(opts) {
    var wechat = new Wechat(opts); // 初始化实例

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

        // 验证类型
        var method = this.method;
        if (method === 'GET') {
            // 成功，则原样返回给微信
            this.body = sha == signature ? echostr + '' : 'no!';
        } else if (method === 'POST') {
            // 处理用户点击事件或消息等POST数据
            if (sha == signature) {
                this.body = 'no';
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });

            var content = yield util.parseXMLAsync(data);
            console.log(content);
            var msg = util.formatMessage(content.xml);
            this.weixin = msg;
            yield handler.call(this, next);
            wechat.reply.call(this);
        }
    };
}