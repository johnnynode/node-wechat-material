'use strict';

var fs = require('fs');
var Promise = require('bluebird');

exports.readFileAsync = (fpath, encoding) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fpath, encoding, (err, content) => {
            err ? reject(err) : resolve(content);
        });
    });
}

exports.writeFileAsync = (fpath, content) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fpath, content, (err) => {
            err ? reject(err) : resolve();
        });
    });
}