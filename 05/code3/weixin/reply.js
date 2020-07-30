'use strict';

var path = require('path');
var config = require('../config');
var Wechat = require('../wx/wechat');
var wechatApi = new Wechat(config.wechat);
var menu = require('./menu');

// 服务重启后的菜单初始化
wechatApi.deleteMenu()
    .then(() => {
        return wechatApi.createMenu(menu);
    })
    .then((msg) => {
        console.log(msg);
    })

// 回复功能
exports = function*(next) {
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
        } else if (msg.Event === 'scancode_push') {
            console.log(msg.ScanCodeInfo.ScanType);
            console.log(msg.ScanResult.ScanResult);
            this.body = 'scancode_push：' + msg.EventKey;
        } else if (msg.Event === 'scancode_waitmsg') {
            console.log(msg.ScanCodeInfo.ScanType);
            console.log(msg.ScanResult.ScanResult);
            this.body = 'scancode_waitmsg: ' + msg.EventKey;
        } else if (msg.Event === 'pic_sysphoto') {
            console.log(msg.SendPicsInfo.PicList);
            console.log(msg.SendPicsInfo.Count);
            this.body = 'scancode_waitmsg: ' + msg.EventKey;
        } else if (msg.Event === 'pic_sysphoto_or_album') {
            console.log(msg.SendPicsInfo.PicList);
            console.log(msg.SendPicsInfo.Count);
            this.body = 'scancode_waitmsg: ' + msg.EventKey;
        } else if (msg.Event === 'pic_weixin') {
            console.log(msg.SendPicsInfo.PicList);
            console.log(msg.SendPicsInfo.Count);
            this.body = 'scancode_waitmsg: ' + msg.EventKey;
        } else if (msg.Event === 'location_select') {
            console.log(msg.SendLocationInfo.Location_X);
            console.log(msg.SendLocationInfo.Location_Y);
            console.log(msg.SendLocationInfo.Scale);
            console.log(msg.SendLocationInfo.Label);
            console.log(msg.SendLocationInfo.Poiname);
            this.body = 'scancode_waitmsg: ' + msg.EventKey;
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
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '../x.jpg'));
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname + '../x.mp4'));
            reply = {
                type: 'video',
                title: '回复视频内容',
                description: '哈哈',
                mediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('voice', path.join(__dirname + '../x.mp3'));
            reply = {
                type: 'voice',
                title: '回复视频内容',
                description: '哈哈',
                musicUrl: '',
                thumbMediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '8') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname + '../x.jpg', { type: 'image' }));
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname + '../x.mp4'), {
                type: 'video',
                description: '{"title":"hi, ...", "itroduction": "it, .."}'
            });
            reply = {
                type: 'video',
                title: '回复视频内容',
                description: '哈哈',
                mediaId: data.media_id
            }
            console.log(reply);
        } else if (content === '10') {
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname + '../2.jpg'), {});
            var media = {
                articles: [{
                    title: 'yyyyy',
                    thumb_media_id: 1,
                    author: 'Joh',
                    digest: 'xxx',
                    show_cover_pic: 1,
                    content: 'yyyy',
                    content_source_url: 'https://www.baidu.com'
                }]
            }

            data = yield wechatApi.uploadMaterial('news', media, {});
            data = yield wechatApi.fetchMaterial(data.media_id);
            console.log(data);
            var items = data.news_item;
            var news = [];

            items.forEach((item) => {
                news.push({
                    title: item.title,
                    description: item.digest,
                    picUrl: picData.url,
                    url: item.url
                })
            });
            reply = news;
        } else if (content === '11') {
            var counts = yield wechatApi.countMaterial();
            console.log(JSON.stringify(counts));

            var results = yield [
                wechatApi.batchMaterial({
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'news',
                    offset: 0,
                    count: 10
                })
            ];

            console.log(results);

            reply = '11';
        } else if (content === '12') {
            var group = yield wechatApi.createGroup('wechat');
            console.log(group);
            var groups = yield wechatApi.fetchGroups();
            console.log(groups);

            var group2 = yield wechatApi.checkGroup(msg.FromUserName);
            console.log(group2);

            // 将自己移动到分组id为1的分组
            var result = yield wechatApi.moveGroup(msg.FromUserName, 1);
            console.log('移动到新分组 1');
            console.log(result);
            var groups2 = yield wechatApi.fetchGroups();
            console.log(groups2);

            // 批量移动测试
            var result2 = yield wechatApi.moveGroup([msg.FromUserName], 2);
            console.log('移动到新分组 2');
            console.log(result2);
            var groups3 = yield wechatApi.fetchGroups();
            console.log(groups3);

            // 修改分组名称测试
            var result3 = yield wechatApi.updateGroup(2, 'wechat2');
            console.log(result3);
            var groups4 = yield wechatApi.fetchGroups();
            console.log(groups4);

            // 删除分组测试
            var result4 = yield wechatApi.deleteGroup(3);
            console.log(result4);
            var groups5 = yield wechatApi.fetchGroups();
            console.log(groups5);

            reply = '12';
        } else if (content === '13') {
            var openid = msg.FromUserName;
            // 测试获取单个用户
            var user = yield wechatApi.fetchUsers(openid, 'en');
            console.log(user);

            // 测试批量获取用户
            var openid_list = [{
                openid: openid,
                lang: 'en'
            }];
            var users = yield wechatApi.fetchUsers(openid_list, 'en');
            console.log(users);

            reply = '13';
        } else if (content === '14') {
            // 测试获取单个用户
            var userlist = yield wechatApi.listUsers();
            console.log(userlist);

            reply = '14';
        } else if (content === '15') {
            // 发送图文消息测试
            var mpnews = {
                media_id: '这里填入一个mediaid'
            }
            var msgData = yield wechatApi.sendByGroup('mpnews', mpnews, 1);
            console.log(msgData);

            // 发送文字测试
            var text = {
                "content": "Hello"
            }
            var msgData2 = yield wechatApi.sendByGroup('text', text, 1);
            console.log(msgData2);

            reply = '15';
        } else if (content === '16') {
            // 发送图文消息测试
            var mpnews = {
                media_id: '这里填入一个mediaid'
            }
            var msgData = yield wechatApi.previewMass('mpnews', mpnews, 1);
            console.log(msgData);

            // 发送文字测试
            var text = {
                "content": "Hello"
            }
            var msgData2 = yield wechatApi.previewMass('text', text, 1);
            console.log(msgData2);

            reply = '16';
        } else if (content === '17') {
            var msgData = yield wechatApi.checkMass('这填入一个messageId');
            console.log(msgData);

            reply = '17';
        }
        this.body = reply;
    }
}