const Test = require('./modules/test/testModule.js');
const http = require('http');
const events = require('events');

let printTest = function(test){
    console.log('_name = ' + test.getName());
    console.log('_age = ' + test.getAge());
    console.log('name = ' + test.name);
    console.log('age = ' + test.age + '\n');
};
let test = new Test('ypw', 25);
printTest(test);
test.setName('lss');
test.setAge(24);
printTest(test);
test.name = 'abc';
test.age = 10;
printTest(test);

// let server = http.createServer();

// server.on('request', function(req, res){
//     if(req.url !== '/favicon.ico'){
//         console.log('get client request');
//     }
    
//     res.end();
// });

// server.on('request', function(req, res){
//     if(req.url !== '/favicon.ico'){
//         console.log(req.url);
//     }
//     res.end();
// });

// server.on('request', function(req, res){
//     if(req.url !== '/favicon.ico'){
//         console.log('send request over');
//     }
//     res.end();
// });

// server.on('customEvent', function(arg1, arg2, arg3){
//     console.log('customEvent has been touch');
//     console.log(arg1);
//     console.log(arg2);
//     console.log(arg3);
// });
// server.emit('customEvent', 'custom arg one', 'custom arg two', 'custom arg three');
// server.listen(1337, '127.0.0.1');
// console.log(server.listeners('request'));
// console.log(events.EventEmitter.listenerCount(server, 'request'));

// testModule();

// console.log('__filename = ' + __filename);
// console.log('__drname = ' + __dirname);

// console.dir(require.cache[require.resolve('./modules/test/testModule.js')]);

