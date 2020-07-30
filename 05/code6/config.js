'use strict';

var path = require('path');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt');
var util = require('./libs/util');

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
        },
        getTicket: () => {
            return util.readFileAsync(wechat_ticket_file);
        },
        saveTicket: (data) => {
            return util.writeFileAsync(wechat_ticket_file, data);
        }
    }
}

module.exports = config;