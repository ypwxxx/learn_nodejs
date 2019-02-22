let _name = 'test module';
let _age = 10;

let test = function(name, age){
    _name = name;
    _age = age;
};

test.prototype.getName = function(){
    return _name;
};
test.prototype.setName = function(name){
    _name = name;
};
test.prototype.getAge = function(){
    return _age;
};
test.prototype.setAge = function(age){
    _age = age;
};
test.prototype.name = _name;
test.prototype.age = _age;
// let testFunc = function(name){
//     name = name || _name;
//     console.log('this is testModule ' + name);

//     console.log('__filename = ' + __filename);
//     console.log('__drname = ' + __dirname);
// };
module.exports = test;