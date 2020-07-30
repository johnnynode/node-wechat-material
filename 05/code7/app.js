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
                        'translateVoice',
                        'onMenuShareAppMessage',
                        'previewImage'
                    ] // 必填，需要使用的JS接口列表
                });

                wx.ready(function() {
                    wx.checkJsApi({
                        jsApiList: ['onVoiceRecordEnd'],
                        succerss: function(res) {
                            console.log(res);
                        }
                    });

                    // 分享给朋友
                    var shareContent = {};
                    wx.onMenuShareAppMessage(shareCotent);

                    // 初始化预览图片对象
                    var slides = {};
                    $('#poster').on('tap', function() {
                        wx.previewImage(slides);
                    })

                    var isRecording = false;
                    $('h1').on('tap', function() {
                        if(!isRecording) {
                            isRecording = true;
                            wx.startRecord({
                                cancel: function() {
                                    window.alert('取消录音权限了！');
                                }
                            });
                            return;
                        }
                        isRecording = false;
                        // 再点一次暂停录音
                        wx.stopRecord({
                            success: (res) => {
                                var localId = res.localId;
                                wx.translateVoice({
                                    localId: localId, // 需要识别的音频的本地Id, 由录音相关接口获得
                                    isShowProgressTips: 1, // 默认为1，显示进度提示
                                    success: (res) => {
                                        var result = res.translateResult;
                                        // window.alert(res.translateResult); // 语义识别的结果
                                        $.ajax({
                                            type: 'get',
                                            url: 'https://api.douban.com/v2/movie/search?q=' + result,
                                            dataType: 'jsonp',
                                            jsonp: 'callback',
                                            success: function(data) {
                                                console.log(data);
                                                var subject = data.subjects[0];
                                                console.log(subject);

                                                $('#title').html(subject.title);
                                                $('#year').html(subject.year);
                                                $('#director').html(subject.directors[0].name);
                                                $('#poster').html('<img src="' + subject.images.large + '" />);

                                                // 更新分享功能的数据
                                                shareContent = {
                                                    title: '', // 分享标题
                                                    desc: '', // 分享描述
                                                    link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                                                    imgUrl: '', // 分享图标
                                                    type: '', // 分享类型,music、video或link，不填默认为link
                                                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                                                    success: function () {
                                                        // 用户点击了分享后执行的回调函数
                                                    }
                                                }
                                                wx.onMenuShareAppMessage(shareCotent);

                                                slides = {
                                                    current: subject.images.large,
                                                    urls: [subject.images.large]
                                                };

                                                data.subjects.forEach(function(item) {
                                                    slides.urls.push(item.images.large)
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        
                    });
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
        var url = this.href; // 注意不能有端口哦，默认80
        var params = sign(ticket, url);
        this.body = ejs.render(tpl, params);
        return next;
    }
    yield next;
})

app.use(G(config.wechat, reply));

app.listen(1234);