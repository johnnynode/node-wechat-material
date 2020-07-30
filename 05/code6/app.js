'use strict'

var Koa = require('koa');
var crypto = require('crypto');
var G = require('./wx/g'); // 中间件
var config = require('./config');
var reply = require('./weixin/reply');

var app = new Koa();

var ejs = require('ejs');
var heredoc = require('heredoc');
const Wechat = require('./wx/wechat');
var tpl = heredoc(() => {
    /*
        <head>
            <meta name='viewport' content='initial-scale=1, maximum-scale=1, minimum-scale=1'></meta>
        </head>
        <body>
            <h1>点击开始录音</h1>
            <p id='title'></p>
            <div id='poster'></div>
            <script src="//zeptojs.com/zepto-docs.min.js"></script>
            <script src="//res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
            <script>
                wx.config({
                    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: '', // 必填，公众号的唯一标识
                    timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
                    nonceStr: '<%= nonceStr %>', // 必填，生成签名的随机串
                    signature: '<%= signature %>',// 必填，签名
                    jsApiList: [
                        'startRecord',
                        'stopRecord',
                        'onVoiceRecordEnd',
                        'translateVoice'
                    ] // 必填，需要使用的JS接口列表
                });
            </script>
        </body>
    */
})

// 生成随机数
var createNonce = () => {
    return Math.random().toString(36).substr(2, 15);
}

// 获取时间戳
var createTimestamp = () => {
    return parseInt(new Date().getTime() / 1000, 10) + '';
}

// 实现签名算法
function _sign(noncestr, ticket, timestamp, url) {
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ];
    var str = params.sort().join('&');
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

// 签名
function sign(ticket, url) {
    var noncestr = createNonce();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr, ticket, timestamp, url);

    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}

// 简单处理路由和网页
app.use(function*(next) {
    if (this.url.indexOf('/move') > -1) {
        var wechatApi = new Wechat(config.wechat);
        var data = yield wechatApi.fetchAccessToken()
        var access_token = data.access_token;
        var ticketData = yield wechatApi.fetchTicket(access_token);
        var ticket = ticketData.ticket;
        var url = this.href;
        var params = sign(ticket, url);
        this.body = ejs.render(tpl, params);
        return next;
    }
    yield next;
})

app.use(G(config.wechat, reply));

app.listen(1234);