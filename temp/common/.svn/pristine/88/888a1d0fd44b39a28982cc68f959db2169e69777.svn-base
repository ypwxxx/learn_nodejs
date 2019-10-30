const CCGlobal = require("CCGlobal");


let HWLogin = {
    isSupport: false,
    isLogin: false,//登录状态
    appId:null,
    loginInfo: null,
    /**
     * 登录和创建浮标
     * @param  {appId success fail} callBackObjc
     */
    loginAndFloatingWin: function (callBackObjc) {
        if (this.isSupport == false) {
            return;
        }
        let self = this;
        this.appId = CCGlobal.appInfo.appId;
        this.gameLogin({
            success: function (res) {
                self.showFloatingWin({
                    success: function () {
                        if (callBackObjc && callBackObjc.success) {
                            callBackObjc.success(res)
                        }
                    },
                    fail: function (data, code) {
                        if (callBackObjc && callBackObjc.fail) {
                            callBackObjc.fail(data, code);
                        }
                    }
                });
            },
            fail: function (data, code) {
                if (callBackObjc && callBackObjc.fail) {
                    callBackObjc.fail(data, code);
                }
            }
        })

    },

    /**
     * 华为登录，里面已经做了平台判断
     * @param  {success fail complete} callBackObjc 三个状态回调
     */
    gameLogin: function (callBackObjc) {
        if (this.isSupport == false) {
            return;
        }
        if (this.isLogin == true) {
            console.log("-----------------------已经登录");
            if (callBackObjc && callBackObjc.success) {
                callBackObjc.success(this.loginInfo);
            }
            return
        }
        let self = this;
        hbs.gameLogin({
            forceLogin: 1, //强制登录，未登录时会弹出登录对话框
            appid: self.appId, //appid需要与华为开发者联盟后台配置一致
            success: function (res) {
                console.log("game login: success", JSON.stringify(res));
                self.isLogin = true;
                self.loginInfo = res;
                if (callBackObjc && callBackObjc.success) {
                    callBackObjc.success(res)
                }
            },
            fail(data, code) {
                self.isLogin = false;
                console.log("on gameLogin fail: " + data + "," + code);
                if (callBackObjc && callBackObjc.fail) {
                    callBackObjc.fail(data, code);
                }
            },
            complete() {
                console.log("on gameLogin: complete");
                if (callBackObjc && callBackObjc.complete) {
                    callBackObjc.complete();
                }
            }
        });
    },

    /**
     * 显示浮标
     * @param  {success fail} callBackObjc
     */
    showFloatingWin: function (callBackObjc) {
        if (this.isSupport == false) {
            return;
        }
        if (this.isLogin == false) {
            if (callBackObjc && callBackObjc.fail) {
                callBackObjc.fail("请先登录", 1010);
            }
            return;
        }
        let self = this;
        // console.log("调取展示浮标");
        hbs.showFloatWindow({
            appid: self.appId, //appid需要与华为开发者联盟后台配置一致
            success: function () {
                console.log("show float window success.");
                if (callBackObjc && callBackObjc.success) {
                    callBackObjc.success()
                }
            },
            fail: function (data, code) {
                console.log("show float window fail:" + data + ", code:" + code);
                if (callBackObjc && callBackObjc.fail) {
                    callBackObjc.fail(data, code);
                }
            }
        });
    },

    /**
     *  隐藏浮标窗口
     * @param  {success fail} callBackObjc
     */
    hideFloatingWin(callBackObjc) {
        if (this.isSupport == false) {
            return;
        }
        if (this.isLogin == false) {
            if (callBackObjc && callBackObjc.fail) {
                callBackObjc.fail("请先登录", 1010);
            }
            return;
        }
        let self = this;
        hbs.hideFloatWindow({
            appid: self.appId,
            success: function () {
                console.log("hide float window success");
                if (callBackObjc && callBackObjc.success) {
                    callBackObjc.success()
                }
            },
            fail: function (data, code) {
                console.log("hide float window fail:" + data + ", code:" + code);
                if (callBackObjc && callBackObjc.fail) {
                    callBackObjc.fail(data, code);
                }
            }
        });
    }
};

let isHW = typeof hbs == "undefined" ? false : true;
HWLogin.isSupport = isHW;
if (HWLogin.isSupport) {
    let cbShow = function () {
        // 如果登录成功显示浮标
        HWLogin.showFloatingWin();
    };

    let cbHide = function () {
        HWLogin.hideFloatingWin();
    };
    // 注册onShow/onHide回调，用于隐藏和显示浮标
    hbs.onShow(cbShow);
    hbs.onHide(cbHide)
}

module.exports = HWLogin;







































