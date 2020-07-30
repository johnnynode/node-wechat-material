'use strict'

var Promise = require('bluebird');
var _ = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    uploadMaterial: prefix + 'media/upload',
    temporary: {
        upload: prefix + 'media/upload',
        fetch: prefix + 'media/get', // 临时素材的获取(下载)
    },
    permanent: {
        upload: prefix + 'material/add_material',
        fetch: prefix + 'material/get_material',
        upoadNews: prefix + 'material/add_news',
        upoadNewsPic: prefix + 'media/uploadimg',
        del: prefix + 'material/del_material',
        update: prefix + 'material/update_news',
        count: prefix + 'material/get_materialcount',
        batch: prefix + 'material/batchget_material'
    },
    group: {
        create: prefix + 'groups/create',
        fetch: prefix + 'groups/get',
        check: prefix + 'groups/getid',
        update: prefix + 'groups/update',
        move: prefix + 'groups/members/update',
        batchupdate: prefix + '/groups/members/update',
        del: prefix + 'groups/delete',
    },
    user: {
        remark: prefix + 'user/info/updateremark', // 只针对服务号
        fetch: prefix + 'user/info',
        batchFetch: prefix + 'user/info/batchget',
        list: prefix + 'user/get',
    },
    mass: {
        group: prefix + 'message/mass/sendall',
        openId: prefix + 'message/mass/send',
        delete: prefix + 'message/mass/delete',
        preview: prefix + 'message/mass/preview',
        check: prefix + 'message/mass/get'
    }
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
                return Promise.resolve(data);
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
    var url = api.accessToken + '?appid=' + appId + '&secret=' + appSecret;
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

// 通用的获取token的接口
Wechat.prototype.fetchAccessToken = () => {
    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }

    // 票据的读写
    return this.getAccessToken()
        .then((data) => {
            // 解析本地token, 如果没有，那么直接获取
            try {
                data = JSON.parse(data);
            } catch (e) {
                return this.updateAccessToken();
            }

            // 合法则使用，不合法则更新
            if (this.isValidAccessToken(data)) {
                return Promise.resolve(data);
            } else {
                return this.updateAccessToken();
            }
        })
        .then((data) => {
            this.access_token = data.access_token;
            this.expires_in = data.expires_in;

            this.saveAccessToken(data);
            return Promise.resolve(data);
        });
}

// 回复程序封装
Wechat.prototype.reply = () => {
    var content = this.body;
    var msg = this.weixin;
    var xml = util.tpl(content, msg);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
}

// 上传素材 默认临时素材 material:如果是图文传递的是数组,如果是图片或视频传递的是字符串的路径
Wechat.prototype.uploadMaterial = (type, material, permanent) => {
    var form = {};
    var uploadUrl = api.temporary.upload;
    // 永久素材的判断
    if (permanent) {
        uploadUrl = api.permanent.upload
            // from能够兼容所有上传类型，包括图文消息
        _.extend(form, permanent);
    }
    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic
    }
    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    } else {
        // 文件路径
        form.media = fs.createReadStream(material);
    }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = uploadUrl + '?access_token=' + data.access_token;
                if (!permanent) {
                    url += '&type=' + type
                } else {
                    form.access_token = data.access_token;
                }

                var opts = {
                    method: 'POST',
                    url: url,
                    json: true,
                }

                if (type === 'news') {
                    opts.body = form;
                } else {
                    opts.formData = form;
                }
                // 微信认证的订阅号并不支持永久素材上传, 测试的公众号也不稳定
                request(opts)
                    .then((response) => {
                        var _data = response[1];
                        _data ? resolve(data) : reject('upload material error!');
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
    });
}

// 下载素材
Wechat.prototype.fetchMaterial = (mediaId, type, permanent) => {
    var fetchUrl = api.temporary.fetch;
    // 永久素材的判断
    if (permanent) {
        fetchUrl = api.permanent.fetch;
    }
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = fetchUrl + '?access_token=' + data.access_token + '&media_id=' + mediaId;
                var opts = { method: 'POST', url: url, body: form, json: true };
                var form = {};

                // 永久素材的判断
                if (permanent) {
                    form.media_id = mediaId;
                    form.access_token = data.access_token;
                    opts.body = form;
                } else {
                    if (type === 'video') {
                        url = url.replace('https', 'http');
                    }
                    url += '&media_id=' + mediaId
                }

                if (type === 'news' || type === 'video') {
                    request(opts)
                        .then((response) => {
                            var data = response[1];
                            data ? resolve(data) : reject(err);
                        });
                } else {
                    resolve(url);
                }

            })
    });
}

// 删除素材(永久)
Wechat.prototype.deleteMaterial = (mediaId) => {
    var form = {
        media_id: mediaId
    };

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.permanent.del + '?access_token=' + data.access_token + '&media_id=' + mediaId;
                request({ method: 'POST', url: url, body: form, json: true })
                    .then((response) => {
                        var data = response[1];
                        var now = new Date().getTime();
                        var expires_in = now + (data.expires_in - 20) * 1000; // -20 为了提前更新token，给请求，响应留有余量
                        data.expires_in = expires_in;
                        resolve(data);
                    });
            })
    });
}

// 更新素材(永久)
Wechat.prototype.updateMaterial = (mediaId, news) => {
    var form = {
        media_id: mediaId
    };

    _.extend(form, news);

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.permanent.update + '?access_token=' + data.access_token + '&media_id=' + mediaId;
                request({ method: 'POST', url: url, body: form, json: true })
                    .then((response) => {
                        var data = response[1];
                        var now = new Date().getTime();
                        var expires_in = now + (data.expires_in - 20) * 1000; // -20 为了提前更新token，给请求，响应留有余量
                        data.expires_in = expires_in;
                        resolve(data);
                    });
            })
    });
}

// 素材数量
Wechat.prototype.countMaterial = () => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.permanent.count + '?access_token=' + data.access_token;
                request({ method: 'GET', url: url, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 批量获取素材
Wechat.prototype.batchMaterial = (opts) => {
    opts.type = opts.type || 'image';
    opts.offset = opts.offset || 0;
    opts.count = opts.count || 1;

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.permanent.batch + '?access_token=' + data.access_token;
                request({ method: 'GET', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 用户分组
Wechat.prototype.createGroup = (name) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.group.create + '?access_token=' + data.access_token;
                var opts = {
                    group: { name: name }
                }
                request({ method: 'POST', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 获取分组
Wechat.prototype.fetchGroup = (name) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.group.fetch + '?access_token=' + data.access_token;

                request({ url: url, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 检查分组
Wechat.prototype.checkGroup = (openid) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.group.check + '?access_token=' + data.access_token;
                var opts = {
                    openid: openid
                }
                request({ method: 'POST', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 更新分组
Wechat.prototype.updateGroup = (id, name) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.group.update + '?access_token=' + data.access_token;
                var opts = {
                    group: {
                        id: id,
                        name: name
                    }
                }
                request({ method: 'POST', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 移动分组或批量移动分组
Wechat.prototype.moveGroup = (openid, to_groupid) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = '';
                var opts = {
                    to_groupid: to_groupid,
                };
                if (_.isArray(openid)) {
                    url = api.group.batchupdate + '?access_token=' + data.access_token;
                    opts.openid_list = openid;
                } else {
                    url = api.group.move + '?access_token=' + data.access_token;
                    opts.openid = openid;
                }
                request({ method: 'POST', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 删除分组
Wechat.prototype.deleteGroup = (id) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.group.del + '?access_token=' + data.access_token;
                var opts = {
                    group: {
                        id: id
                    }
                }
                request({ method: 'POST', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 备注用户
Wechat.prototype.remarkUser = (openid, remark) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.user.remark + '?access_token=' + data.access_token;
                var opts = {
                    openid: openid,
                    remark: remark
                };
                request({ method: 'POST', url: url, body: opts, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 获取用户信息或批量获取用户信息
Wechat.prototype.fetchUsers = (openid, lang) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = '';
                var opts = {
                    url: url,
                    json: true
                }
                lang = lang || 'zh_CN'; // 对参数添加默认值
                if (_.isArray(openid)) {
                    opts.url = api.user.batchFetch + '?access_token=' + data.access_token;
                    opts.body = {
                        user_list: openid
                    };
                    opts.method = 'POST'
                } else {
                    opts.url = api.user.fetch + '?access_token=' + data.access_token + '&openid=' + openid + '&lang=' + lang;
                }

                request(opts)
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 获取用户列表
Wechat.prototype.listUsers = (openid) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.user.list + '?access_token=' + data.access_token;
                if (openid) {
                    url += +'&next_openid=' + openid;
                }
                request({ url: url, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 群发消息
Wechat.prototype.sendByGroup = (type, message, groupid) => {
    var msg = {
        filter: {},
        msgtype: type
    };

    msg[type] = message;

    if (!groupid) {
        msg.filter.is_to_all = true;
    } else {
        msg.filter = {
            is_to_all: false,
            group_id: groupid
        }
    }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.mass.group + '?access_token=' + data.access_token;
                if (openid) {
                    url += +'&next_openid=' + openid;
                }
                request({ method: 'POST', url: url, body: msg, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 针对openId发消息，与上面群发消息分开放可以区分订阅号和服务号
Wechat.prototype.sendByOpenId = (type, message, openid) => {
    var msg = {
        msgtype: type,
        touser: openid
    };
    msg[type] = message;

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.mass.openId + '?access_token=' + data.access_token;
                request({ method: 'POST', url: url, body: msg, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 删除消息，注意删除消息的注意事项，查看官方文档
Wechat.prototype.deleteMass = (msgId) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.mass.delete + '?access_token=' + data.access_token;
                var form = {
                    msg_id: msgId
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 预览消息
Wechat.prototype.previewMass = (type, message, openid) => {
    var msg = {
        msgtype: type,
        touser: openid,
    }
    msg[type] = message;
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.mass.preview + '?access_token=' + data.access_token;

                request({ method: 'POST', url: url, body: msg, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

// 查询群发消息状态
Wechat.prototype.checkMass = (msgId) => {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then((data) => {
                var url = api.mass.check + '?access_token=' + data.access_token;
                var form = {
                    msg_id: msgId,
                };
                request({ method: 'POST', url: url, body: form, json: true })
                    .then((response) => {
                        var data = response[1];
                        data ? resolve(data) : reject(data);
                    });
            })
    });
}

module.exports = Wechat;