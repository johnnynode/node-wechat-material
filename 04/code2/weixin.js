'use strict';

var config = require('./config');
var Wechat = require('./wx/wechat');
var wechatApi = new Wechat(config.wechat);

exports.reply = function*(next) {
    var msg = this.weixin;

    // 所有事件类型
    if (msg.MsgType === 'event') {
        // 订阅关注公众号
        if (msg.Event === 'subscribe') {
            // 扫二维码关注，二维码参数值
            if (msg.EventKey) {
                console.log('扫二维码: ' + msg.EventKey + ' ' + msg.ticket);
            }
            this.body = '哈哈，订阅成功';
        } else if (msg.Event === 'unsubscribe') {
            // 取消关注公众号
            console.log('取消关注成功!');
            this.body = '';
        } else if (msg.Event === 'LOCATION') {
            // 上报地理位置
            this.body = '您上报的位置是：' + msg.Latitude + '/' + msg.Longitude + '-' + msg.Precision;
        } else if (msg.Event === 'CLICK') {
            // 上报地理位置
            this.body = '您点击了菜单：' + msg.EventKey;
        } else if (msg.Event === 'SCAN') {
            console.log('扫二维码' + msg.EventKey + ' ' + msg.Ticket);
            this.body = '你扫码了';
        } else if (msg.Event === 'VIEW') {
            // 点击了菜单
            console.log('扫二维码' + msg.EventKey + ' ' + msg.Ticket);
            // EventKey 是菜单中的url地址 注意，点击菜单中弹出的子菜单不会上报
            this.body = '您点击了菜单中的链接：' + msg.EventKey;
        }
    } else if (msg.MsgType === 'text') {
        // 文本消息回复
        var content = msg.Content;
        var reply = '你说的 ' + msg.Content + ' 没听懂...'

        // 定义一些预置的回复
        if (content === '1') {
            reply = '您输入了1';
        } else if (content === '2') {
            reply = '您输入了1';
        } else if (content === '3') {
            reply = '您输入了1';
        } else if (content === '4') {
            reply = [{
                title: '标题党',
                description: '描述',
                picUrl: "这里填入一个图片地址",
                url: "这里填写要跳转的地址"
            }, {
                title: '标题党2',
                description: '描述2',
                picUrl: "这里填入一个图片地址2",
                url: "这里填写要跳转的地址"
            }]
        } else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/x.jpg');
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', __dirname + '/x.mp4');
            reply = {
                type: 'video',
                title: '回复视频内容',
                description: '哈哈',
                mediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('voice', __dirname + '/x.mp3');
            reply = {
                type: 'voice',
                title: '回复视频内容',
                description: '哈哈',
                musicUrl: '',
                thumbMediaId: data.media_id
            }
            console.log(reply);
        }
        this.body = reply;
    }

}