const CCConst = require('CCConst');
const CCGlobal = require('CCGlobal');
const CryptoJS = require('crypto-js');
const api = CCGlobal.api;
const key = CryptoJS.enc.Utf8.parse("2018we0312dobest");
const iv = CryptoJS.enc.Utf8.parse('0000000000000000');

//平台相关脚本
const OPPOLogin = require('OPPOLogin');
const HWLogin = require('HWLogin');


var ComFuns = {
    /**
     * 获取服务端参数配置
     * @param {Object} obj {appId:应用ID, success:成功时调用, fail:失败时调用}
     *
     */
    data: {},
    getWxServConfig(obj) {
        return this.getServCfg(obj);
    },

    /**
     * 获取服务端参数配置
     * @param {Object} obj {appId:应用ID, success:成功时调用, fail:失败时调用}
     * repeat 默认为false, 拉取到一次数据后不会再拉取,ture反之
     *
     */
    getServCfg(obj, repeat) {
        var ret = {};
        if (!obj.appId || obj.appId.length < 6) {
            if (obj.fail) {
                ret.code = "-1";
                ret.msg = "appId不能为空";
                obj.fail(ret)
            }
            return -1;
        }
        try {
            if (this.data[obj.appId] && !repeat) {
                if (obj.success) {
                    obj.success(this.data[obj.appId]);
                }
                return;
            }
        } catch (e) {
        }
        if (api && CCGlobal.platform != CCConst.PLATFORM.OPPO) {
            api.request({
                url: CCConst.CONFIG_SERV_URL + "/minigame/getServCfg.do",
                data: {
                    appId: obj.appId
                },
                dataType: "json",
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                method: "POST",
                success: res => {
                    //console.log("获取参数配置返回:" + JSON.stringify(res));
                    if (res.data.code == "0") {
                        this.data[obj.appId] = res.data
                        if (obj.success) {
                            obj.success(res.data);
                        }
                    } else {
                        if (obj.fail) {
                            obj.fail(res.data)
                        }
                    }
                },
                fail: res => {
                    var ret = {};
                    ret.code = "-1";
                    ret.msg = "请求失败:" + JSON.stringify(res);
                    if (obj.fail)
                        obj.fail(ret)
                }
            });
        } else {
            var xmlHttp = new XMLHttpRequest();
            var callback = () => {
                if (xmlHttp.readyState == 4) {
                    let res=JSON.parse(xmlHttp.responseText)
                    if (xmlHttp.status == 200) {
                        if (res.code == "0") {
                            this.data[obj.appId] = res
                            if (obj.success) {
                                obj.success(res);
                            }
                        } else {
                            if (obj.fail) {
                                obj.fail(res)
                            }
                        }
                    } else {
                        var ret = {};
                        ret.code = "-1";
                        ret.msg = "请求失败:" + JSON.stringify(res);
                        if (obj.fail)
                            obj.fail(ret)
                    }
                }
            }

            let method = 'post';
            let url = CCConst.CONFIG_SERV_URL + "/minigame/getServCfg.do";
            xmlHttp.open(method, url);
            xmlHttp.onreadystatechange = callback;
            xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlHttp.send(`appId=${obj.appId}`);
        }
    },
    /**
     * MD5加密
     * @param message:string 需要加密的字符串
     */
    MD5Encrypt: function (message) {
        var ciphertext = CryptoJS.MD5(message);
        return ciphertext
    },
    HmacSHA1Encrypt:function(message){
        var ciphertext = CryptoJS.HmacSHA1(message,key);
        return ciphertext.toString();
    },
    /**
     * aes加密
     * @param message:string 需要加密的字符串
     */
    aesEncrypt: function (message) {
        let ciphertext = CryptoJS.AES.encrypt(message, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return ciphertext
    },
    /**
     * aes解密
     * @param message:string 需要解密的字符串
     */
    aesDecrypt: function (ciphertext) {
        var decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    },
    /**
     * 执行登录
     * @param {Object} obj { success:成功时调用, fail:失败时调用,ownServer:是否登陆公司服务器 默认为是}
     *
     */
    //成功返回信息：{ code: 0, msg: "登录成功", userInfo:{} }
    //失败返回信息：code:-1表示微信侧失败，code:-2表示服务端失败, code:-3表示用户信息未授权, code: -4表示用户信息获取失败
    login: function (obj) {
        // 微信登录
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
            console.log("login:" + CCConst.CONFIG_SERV_URL);
            wx.login({
                success: res => {
                    console.log("微信登录得到code:" + res.code);
                    if (res.code) {
                        //获取用户信息
                        wx.getUserInfo({
                            success: userRes => {
                                //服务端登录
                                var userInfo = userRes.userInfo;
                                console.log(userInfo)
                                if (obj.ownServer == undefined || obj.ownServer) {
                                    wx.request({
                                        url: CCConst.CONFIG_SERV_URL + "minigame/login.do",
                                        data: {
                                            code: res.code,
                                            appId: obj.appId,
                                            userType: 1,  //微信小游戏用户
                                            nickName: userInfo.nickName,
                                            avatarUrl: userInfo.avatarUrl,
                                            gender: userInfo.gender,
                                            city: userInfo.city,
                                            province: userInfo.province,
                                            country: userInfo.country,
                                            language: userInfo.language
                                        },
                                        dataType: "json",
                                        header: {
                                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                                        },
                                        method: "POST",
                                        success(res) {
                                            if (res.statusCode == 200) {
                                                var data = res.data;
                                                if (data.code == "0") {
                                                    console.log("服务端登录成功:" + JSON.stringify(data))
                                                    userInfo.token = res.data.token;
                                                    userInfo.openId = res.data.openId;
                                                    if (obj && obj.success) {
                                                        var res2 = {"code": "0", "msg": "登录成功", "userInfo": userInfo}
                                                        obj.success(res2);
                                                    }
                                                }
                                                else {
                                                    console.log("服务端登录失败：" + JSON.stringify(data));
                                                    if (obj && obj.fail) {
                                                        var res2 = {
                                                            "code": "-2",
                                                            "msg": "服务端登录失败" + JSON.stringify(data)
                                                        }
                                                        obj.fail(res2);
                                                    }
                                                }
                                            }
                                            else {
                                                console.log("服务端登录失败：" + res.statusCode);
                                                if (obj && obj.fail) {
                                                    var res2 = {"code": "-2", "msg": "服务端登录失败" + res.statusCode}
                                                    obj.fail(res2);
                                                }
                                            }
                                        },
                                        fail(res) {
                                            console.log("服务端登录失败" + JSON.stringify(res));
                                            if (obj && obj.fail) {
                                                var res2 = {"code": "-2", "msg": "服务端登录失败" + JSON.stringify(res)}
                                                obj.fail(res2);
                                            }
                                        }
                                    })
                                } else {
                                    if (obj && obj.success) {
                                        var res2 = {"code": "0", "msg": "登录成功", "userInfo": userInfo}
                                        obj.success(res2);
                                    }
                                }
                            },
                            fail: userRes => {
                                console.log("用户信息获取失败" + JSON.stringify(userRes));
                                if (obj && obj.fail) {
                                    if (userRes.errMsg.indexOf("auth deny") > 0) {
                                        var ret = {"code": "-3", "msg": "用户信息获取失败" + JSON.stringify(res)}
                                        obj.fail(ret);
                                    }
                                    else {
                                        var ret = {"code": "-4", "msg": "用户信息获取失败" + JSON.stringify(res)}
                                        obj.fail(ret);
                                    }
                                }
                            }
                        })
                    }
                    else {
                        console.log('获取用户登录态失败！' + res.errMsg)
                        if (obj && obj.fail) {
                            var res2 = {"code": "-1", "msg": "微信登录失败"}
                            obj.fail(res2);
                        }
                    }

                },
                fail: res => {
                    console.log("微信登录失败" + JSON.stringify(res));
                    if (obj && obj.fail) {
                        var res2 = {"code": "-1", "msg": "微信登录失败"}
                        obj.fail(res2);
                    }
                }
            })
        } else if (CCGlobal.platform == CCConst.PLATFORM.VIVO) {
            let aesToken = cc.sys.localStorage.getItem("vivoToken")
            if (aesToken) {
                let token = this.aesDecrypt(aesToken)
                qg.getProfile({
                    token: token,
                    success: (res) => {
                        let openId=this.aesEncrypt(res.openid)
                        cc.sys.localStorage.setItem("vivoOpenId",openId)
                        if (obj.ownServer == undefined || obj.ownServer) {

                        } else {
                            obj.success && obj.success(res)
                        }
                    },
                    fail: (error, code) => {
                        qg.authorize({
                            type: "token",
                            success: (res) => {
                                let ciphertext = this.aesEncrypt(res.accessToken)
                                cc.sys.localStorage.setItem("vivoToken", ciphertext)
                                qg.getProfile({
                                    token: res.accessToken,
                                    success: (res) => {
                                        if (obj.ownServer == undefined || obj.ownServer) {

                                        } else {
                                            obj.success && obj.success(res)
                                        }
                                    },
                                    fail: (error, code) => {
                                        let ret = {"code": "-1", "msg": "用户信息获取失败" + JSON.stringify(error)}
                                        if (obj && obj.fail) {
                                            obj.fail(ret)
                                        }
                                    }
                                })
                            },
                            fail: (error, code) => {
                                let ret = {"code": "-2", "msg": "用户信息获取失败" + JSON.stringify(error)}
                                if (obj && obj.fail) {
                                    obj.fail(ret)
                                }
                            }
                        })
                    },
                })
            } else {
                qg.authorize({
                    type: "token",
                    success: (res) => {
                        let ciphertext = this.aesEncrypt(res.accessToken)
                        cc.sys.localStorage.setItem("vivoToken", ciphertext)
                        qg.getProfile({
                            token: res.accessToken,
                            success: (res) => {
                                let openId=this.aesEncrypt(res.openid)
                                cc.sys.localStorage.setItem("vivoOpenId",openId)
                                if (obj.ownServer == undefined || obj.ownServer) {

                                } else {
                                    if (obj && obj.success) {
                                        obj.success(res)
                                    }
                                }
                            },
                            fail: (error, code) => {
                                let ret = {"code": "-3", "msg": "用户信息获取失败" + JSON.stringify(error)}
                                if (obj && obj.fail) {
                                    obj.fail(ret)
                                }
                            }
                        })
                    },
                    fail: (error, code) => {
                        let ret = {"code": "-4", "msg": "用户信息获取失败" + JSON.stringify(error)}
                        if (obj && obj.fail) {
                            obj.fail(ret)
                        }
                    }
                })
            }
        }else if(CCGlobal.platform == CCConst.PLATFORM.OPPO){
            OPPOLogin.oppo_login({appId:obj.appId,success:obj.success,fail:obj.fail})
        }else if(CCGlobal.platform == CCConst.PLATFORM.HUAWEI){
            HWLogin.loginAndFloatingWin({appId:obj.appId,success:obj.success,fail:obj.fail})
        }else if(CCGlobal.platform == CCConst.PLATFORM.XIAOMI){
            qg.login({
                success:(res)=> {
                    var xmlHttp = new XMLHttpRequest();
                    let method = 'post';
                    let url = "https://mis.migc.xiaomi.com/api/biz/service/loginvalidate";
                    xmlHttp.open(method, url);
                    xmlHttp.onreadystatechange =  () => {
                        if (xmlHttp.readyState == 4) {
                            if (xmlHttp.status == 200) {
                                if (obj && obj.success) {
                                    obj.success(res)
                                }
                            } else {
                                if (obj && obj.fail) {
                                    obj.fail(res)
                                }
                            }
                        }
                    };
                    let signature=this.HmacSHA1Encrypt(`appId=${window.GameConfig.info.appId}&session=${res.session}&uid=${res.appAccountId}`)
                    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xmlHttp.send(`appId=${window.GameConfig.info.appId}&session=${res.session}&uid=${res.appAccountId}&signature=${signature}`);
                },
                fail: (res)=>{
                    if (obj && obj.fail) {
                        obj.fail(res)
                    }
                }
            });
        }
    }
}

module.exports = ComFuns