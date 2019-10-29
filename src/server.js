"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require("express");
// const app = express();
// app.get('/', function(req: any, res: { send: (arg0: any) => void;}){
//     res.send('hello world!');
// });
// const server = app.listen(3001, function(){
//     console.log('Listen on port 3001');
// });
const http = require('http');
const event = require('events');
class Test {
    constructor() {
    }
    ;
    static getInstance() {
        return this.instance ? this.instance : new Test();
    }
    ;
    run() {
        let server = http.createServer();
        server.once('request', function (req, res) {
            if (req.url !== "/favicon.ico") {
                console.log('接收到客户端请求');
            }
        });
        server.on('request', function (req, res) {
            if (req.url !== "/favicon.ico") {
                console.log(req.url);
            }
        });
        server.once('request', function (req, res) {
            if (req.url !== "/favicon.ico") {
                console.log('发送响应完毕.');
            }
        });
        server.on('customEvent', function (arg1, arg2, arg3) {
            console.log('自定义事件被触发');
            console.log(arg1);
            console.log(arg2);
            console.log(arg3);
        });
        server.emit('customEvent', 'custom1', { custom: 2 }, ['custom', 1]);
        server.listen(1337, "127.0.0.1");
        console.log(event.EventEmitter.listenerCount(server, 'request'));
    }
    ;
}
Test.instance = null;
;
exports.default = Test.getInstance();
//# sourceMappingURL=server.js.map