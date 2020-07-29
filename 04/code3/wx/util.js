'use strict';

var xml2js = require('xml2js');
var Promise = require('bluebird');
var tpl = require('./tpl')

exports.parseXMLAsync = (xml) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, { trim: true }, (err, content) => {
            err ? reject(err) : resolve(content);
        });
    });
};

function formatMessage(result) {
    var message = {};

    if (typeof result === 'object') {
        var keys = Object.keys(result);
        for (var i = 0; i < keys.length; i++) {
            var item = result[keys[i]];
            var key = keys[i];

            if (!(item instanceof Array) || !item.length) {
                continue;
            }

            if (item.length) {
                var val = item[0];

                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = typeof val === 'object' ? formatMessage(val) : (val || '').trim();
                }

            } else {
                message[key] = [];
                for (var j = 0, k = item.length; j < k; j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }
}

exports.formatMessage = (xml) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, { trim: true }, (err, content) => {
            err ? reject(err) : resolve(content);
        });
    });
};

exports.tpl = (content, message) => {
    var info = {};
    var type = 'text';
    var fromUserName = message.FromUserName;
    var toUserName = message.ToUserName;

    Array.isArray(content) && (type = 'news');
    type = content.type || type;

    info.content = content;
    info.createTime = new Date().getTime();
    info.msgType = type;
    info.toUsername = fromUsername;
    info.fromUsername = toUsername;

    return tpl.compiled(info)
}