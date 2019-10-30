const CCGlobal = require('CCGlobal');

var OPPOLogin = {
    appId:null,
    httpHost: 'https://minigame.weplaybubble.com//MiniGameServer',   //访问的服务器地址
    userInfo: null,
    token: null,
    userType: 4,          //4：表示oppo平台
    isLogin: false,      //是否登录
    openId: -1,          //用户的唯一标识
    nickname: null,      //用户的昵称
    avatarUrl: null,     //用户头像的url
    msgArr: [],   //消息队列
    isSuRequestData: false,    //是否成功拉取到数据


    /**
* 上传
* @param {[type]}  key    [description]
* @param {[type]}  val    [description]
* @param {Boolean} isInit [description],true:存到本地，false，存到服务器
*/
    _set: function (key, val, isInit) {
        let that = this;
        that[key] = val;
        cc.sys.localStorage.setItem(key, val)
        if (!isInit) {
            let obj = {
                "appId": that.appId,
                "token": that.token,
                "key": key,
                "value": val
            };
            if (!that.token || that.token == undefined || that.token == "") {
                return;
            }

            that.addRequest(obj);           
            if (that.msgArr.length == 1) {
                console.log('msgArr:', JSON.stringify(that.msgArr[0]))
                let url = that.httpHost + '/minigame/upData.do';
                // let openParams = 'appId=' + that.appId + "&token=" + that.token + '&key=' + key + '&value=' + val;
                let openParams = 'appId=' + that.msgArr[0].appId + "&token=" + that.msgArr[0].token + '&key=' + that.msgArr[0].key + '&value=' + that.msgArr[0].value;
                that.request(url, openParams, 0)
            }
        }
    },

    _get: function (key) {
        let that = this;
        return that[key];
    },

    //将服务器的请求加入消息队列，一个执行完，再执行另一个，以免数据混乱
    addRequest: function (msg) {
        let that = this;
        that.msgArr.push(msg);
    },



    //oppo-登录
    /**
     * 
     * @param {*} obj
     * appId,游戏的appid
     * success, 拉取到数据之后需要做的处理
     * fail, 没有拉取到数据需要做的处理
     */
    oppo_login: function (obj) {
        let that = this;
        if (!that.isLogin) {
            qg.login({
                success: function (res) {
                    var resData = JSON.stringify(res.data);
                    console.log("login_data:", resData, " token:", res.data.token, " uid:", res.data.uid);
                    that.isLogin = true;
                    that.appId=obj.appId;
                    that.openId = res.data.uid;     //用户唯一标识
                    that.nickname = res.data.nickName;
                    that.avatarUrl = res.data.avatar;
                    that.token = res.data.token;

                    let url = that.httpHost + "/minigame/login.do";
                    let openParams = 'appId=' + that.appId + '&userType=' + that.userType + '&openId=' + that.openId;
                    that.request(url, openParams, 0, obj);
                },
                fail: function (res) {
                    obj.fail&&obj.fail(res);
                }
            });
        }
    },



    //登录服务器
    request: function (url, openParams, type, obj) {
        let that = this;
        if (!url) return;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 ) {
                let res = xhr.response;    //服务器返回的数据
                if(xhr.status == 200){
                    console.log("xhr-status" + xhr.status, " xhr-msg:", res, typeof res)
                    that.receiveData(res, obj);
                }else{
                    obj.fail&&obj.fail(res);
                }
            }
        }
        xhr.open('POST', url + '?' + openParams, true);  //true表示 异步请求  
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send();
    },

    //接受服务器返回的数据
    receiveData: function (res, obj) {
        let that = this;
        let gettoken;
        let KVDataList;    //某个用户所有存放的数据
        if (res) {
            let o1 = JSON.parse(res)
            gettoken = o1.token;
            KVDataList = o1.KVDataList;    //某个游戏 某个用户 的游戏数据
            let code = o1.code;
            console.log('KVDataList:', KVDataList, " gettoken:", gettoken, " code:", code, typeof code)
            if (gettoken != "" && gettoken != undefined) {
                that.token = gettoken;
            }
            if (KVDataList) {
                that.isSuRequestData = true;
                if (KVDataList.length == 0) {     //没有数据，就判断本地有没有数据，将本地数据上传至服务器                             
                    console.log('KVDataList1111:', KVDataList)
                    // that.getSto();     //将本地数据上传至服务器
                    if (obj && obj.fail){
                        obj.fail();
                    }

                } else {//从服务器拉取到了用户的游戏数据
                    console.log('KVDataList22222:', JSON.stringify(KVDataList))
                    for (var i in KVDataList) {
                        if (!KVDataList[i]) continue;
                        if (KVDataList[i].value == undefined) continue;
                        that._set(KVDataList[i].key, KVDataList[i].value, true);
                    }
                    
                    if (obj && obj.success && that.isSuRequestData) {
                        obj.success();
                    }
                }
            } else {
                console.log('没有数据')
            }

            that._set('openId', that.openId, true);
            that.runNextRequest();
        } else {
            console.log('没有数据返回')
        }

    },

    runNextRequest: function () {
        console.log("runNextRequest");
        let that = this;
        that.shiftMsg();
        let msg = that.popMsg();
        if (!msg) return;       
        
        console.log('runNextRequest:',JSON.stringify(msg))
        let url = that.httpHost + '/minigame/upData.do';       
        let openParams = 'appId=' + msg.appId + "&token=" + msg.token + '&key=' + msg.key + '&value=' + msg.value;
        that.request(url, openParams, 0)
    },
    popMsg: function () {
        let that = this;
        if (that.msgArr.length == 0) return null;
        return that.msgArr[0];
    },

    shiftMsg: function () {
        console.log("shiftMsg");
        let that = this;
        if (that.msgArr.length >= 1) {
            let newArr = [];
            for (let i = 0; i < that.msgArr.length; i++) {
                if (i == 0) continue;
                newArr.push(that.msgArr[i]);
            }
            that.msgArr = [];
            that.msgArr = newArr;
        }
    },


   
}

module.exports = OPPOLogin;