let OPPOAds = {
    bannerAd: null,
    videoAd: null,
    insertAd: null,
    netState: true,
    isInit: false,
    isShowInsert:true,
    appId: "",
    bannerId: "",
    insertId: "",
    videoId: "",
    initAd: function (obj) {
        if (obj) {
            obj.bannerId && (this.bannerId = obj.bannerId);
            obj.videoId && (this.videoId = obj.videoId);
            obj.insertId && (this.insertId = obj.insertId);
            // obj.appId && (this.appId = obj.appId);
            this.appId =obj.appId?obj.appId:GameConfig.info.appId;
        }
        this.netWorkMonitor()
        if (this.isInit) return;
        qg.initAdService({
            appId: this.appId,
            isDebug: false,
            success: (res) => {
                console.log("initAdService success: ", JSON.stringify(res));
                if (res.code == 0) {
                    this.isInit = true;
                }

                if (obj) {
                    obj.success && obj.success(res);
                }
            },
            fail: function (res) {
                console.log("fail:" + res.code + res.msg);
                if (obj) {
                    obj.fail && obj.fail(res);
                }
            },
            complete: function (res) {
                console.log("initAdService complete");
            }
        });
    },
    createBanner: function () {
        if (!this.netState || !this.bannerId) return;
        this.initAd();
        let self = this;
        this.isCanShow = true;
        if (self.bannerAd == null) {
            self.bannerAd = qg.createBannerAd({
                posId: self.bannerId
            });
        }

        self.bannerAd.onShow(function () {//成功回调
            if (!self.isCanShow) {
                self.hideBanner();
                return;
            }
        });
        self.bannerAd.onHide(function () {//用户移除banner
        });
        self.bannerAd.onError(function (error) {//展示失败
            console.log("onError: ", JSON.stringify(error));
        });
        self.bannerAd.show();
    },

    hideBanner: function () {
        this.isCanShow = false;
        if (this.bannerAd) this.bannerAd.hide();
    },
    showBanner: function () {
        this.isCanShow = true;
        if (this.bannerAd) {
            this.bannerAd.show();
        } else {
            this.createBanner()
        }
    },
    destroyBanner: function () {
        if (this.bannerAd) this.bannerAd.destroy();
        this.bannerAd = null;
    },
    //插屏
    checkDisTime: function () {
        let cur_time = cc.sys.localStorage.getItem("createInsertAdTime");
        let now_time = Date.parse(new Date());
        if (!cur_time) {
            cc.sys.localStorage.setItem("createInsertAdTime", now_time);
            return true;
        }
        let dis_time = now_time * 1 - cur_time;
        if (dis_time < 30 * 1000) {
            return false;
        } else {
            cc.sys.localStorage.setItem("createInsertAdTime", now_time);
        }
        return true;
    },
    //插屏广告
    /*
       obj:{ scene:[] 场景名}
    */
    createInsertAd: function (obj) {
        if (!this.netState || !this.insertId) return;
        if(!this.isShowInsert) return;
        // console.log("展示插屏广告");
        // if (!this.checkDisTime()) return;
        // console.log("时间满足，展示");
        let self = this;
        if (self.insertAd == null) {
            var insertAd = qg.createInsertAd({
                posId: self.insertId
            })
            self.insertAd = insertAd;
        }
        console.log("广告id是",this.insertId);
        console.log(this.insertAd);
        if (!self.insertAd) return;
        self.insertAd.onLoad(() => {
            self.insertAd = insertAd;
            if(obj && obj.loadCallback){
                obj.loadCallback();
            }
            //屏蔽首页插屏
            if (obj && obj.scene) {
                let cur_scene = cc.director.getScene().name;
                for (let i = 0; i < obj.scene.length; i++) {
                    if (cur_scene == obj.scene[i]) {
                        return;
                    }
                }
            }
            console.log("广告onLoad");
            self.insertAd.show();
        })
        this.insertAd.onShow(() => {//成功回调
            obj.showCallback && obj.showCallback()
            console.log('插屏banner 广告显示')
        });
        this.errListen && this.insertAd.offError()
        this.errListen = (err) => {
            let errMsg = {code: -2, msg: err};
            console.log(JSON.stringify(err));
            console.log(errMsg);
            if(callbacks && callbacks.errCallback){
                callbacks.errCallback(errMsg);
            }
        };
        this.insertAd.onError(this.errListen);
        this.insertAd.load();
    },
    setInsertAdVisible:function(bool){
        this.isShowInsert=bool;
    },
    //视频
    createNewVideoAd: function () {
        if (!this.netState || !this.videoId) return;
        let self = this;
        console.log("进入广告脚本");
        let videoAd = qg.createRewardedVideoAd({
            posId: self.videoId
        })
        self.videoAd = videoAd;
        return videoAd;
    },
    loadVideoAd: function (callbacks) {
        if (!this.netState) {
            let errMsg = {code: -1, msg: "没有网络 广告创建失败"};
            console.log(errMsg);
            if(callbacks && callbacks.errCallback){
                callbacks.errCallback(errMsg);
            }
            return;
        }
        if (this.videoAd) {
            this.loadListen && this.videoAd.offLoad()
            this.loadListen = () => {
                console.log("激励视频加载成功");
                this.videoAd.show();
            }
            this.videoAd.onLoad(this.loadListen)
            this.errListen && this.videoAd.offError()
            this.errListen = (err) => {
                let errMsg = {code: -2, msg: err};
                console.log(errMsg);
                if(callbacks && callbacks.errCallback){
                    callbacks.errCallback(errMsg);
                }
            };
            this.videoAd.onError(this.errListen);
            this.videoAd.load();
            this.closeVideo(callbacks);
        }
    },
    closeVideo: function (callbacks) {
        if(this.videoAd.onClose){
            if (this.closeAdListen) this.videoAd.offClose(this.closeAdListen);
            this.closeAdListen = (res) => {
                if (res && res.isEnded || res === undefined) {
                    if (callbacks&&callbacks.suCallback) {
                        callbacks.suCallback();
                    }
                } else {
                    if (callbacks&&callbacks.failCallback) {
                        callbacks.failCallback();
                    }
                }
            }
            this.videoAd.onClose(this.closeAdListen);
        }else{
            if(this.reward) this.videoAd.offRewarded();
            this.reward = ()=>{
                if (callbacks&&callbacks.suCallback) {
                    callbacks.suCallback();
                }
            }
            this.videoAd.onRewarded(this.reward);
        }
    },

    removeVideoAd: function () {
        this.videoAd = null;
    },

    netWorkMonitor: function () {
        qg.getNetworkType({
            success: (res) => {
                if (res.networkType != "none") {
                    this.netState = true
                } else {
                    this.netState = false
                }
            },
            fail: (res) => {
            }
        });
        qg.onNetworkStatusChange((res) => {
            if (res.networkType != "none") {
                this.netState = true
            } else {
                this.netState = false
            }
        })
    }
}

module.exports = OPPOAds;