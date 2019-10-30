let VIVOAds = {
    bannerId: null,
    insertId: null,
    videoId: null,
    isCanShow: true,
    netState: true,
    platVersion: null,
    showVideoAd: false,
    firstTime: true,
    bannerAdLoad: null,
    isShowInsert: true,

    initAd: function (obj) {
        if (obj) {
            obj.bannerId && (this.bannerId = obj.bannerId);
            obj.videoId && (this.videoId = obj.videoId);
            obj.insertId && (this.insertId = obj.insertId);
        }
        this.getPlatVersion();
        this.netWorkMonitor();
        this.createNewVideoAd()
        //this.listenInsert()
    },

    getPlatVersion() {
        this.platVersion = qg.getSystemInfoSync().platformVersionCode;
        if (this.platVersion >= 1041) {
            this.showVideoAd = true;
        }
    },

    createUpdateTime: function () {
        let self = this;
        self.timeInter = setInterval(function () {
            self.createBanner();
        }, 15 * 1000);
    },

    createBanner: function (isHide) {
        if (this.platVersion < 1031) return;
        if (!this.netState || !this.bannerId) return;
        this.isCanShow = true;
        if (this.bannerAd) {
            if (this.isCanShow && !isHide) {
                this.bannerAd.show();
            } else {
                this.bannerAd.hide();
            }
            return;
        }
        let bannerAd = qg.createBannerAd({
            posId: this.bannerId,
            style: {}
        });
        let bannerAdLoad = () => {
            this.bannerAd = bannerAd;
            if (!isHide) {
                this.isCanShow && this.bannerAd.show();
            } else {
                this.bannerAd.hide();
            }

        }
        bannerAd.onLoad(bannerAdLoad);
        bannerAd.onError(() => {
        });
        bannerAd.onClose(() => {
            if (this.bannerAd) {
                this.bannerAd = null;
            }
        });
    },
    hideBanner: function () {
        this.isCanShow = false;
        if (this.bannerAd) this.bannerAd.hide();
    },
    showBanner: function () {
        if (this.bannerAd) {
            this.bannerAd.show();
        } else {
            this.createBanner(true)
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
        if (!this.isShowInsert) return;
        let self = this;
        if (qg.getSystemInfoSync().platformVersionCode < 1031) return;
        if (!this.checkDisTime()) return;
        if (self.insertAd) {
            console.log('已有插屏广告。。')
            self.insertAd.show();
            return;
        }
        let insertAd = qg.createInterstitialAd({
            posId: this.insertId
        })
        var adshow = insertAd.show();
        // 调用then和catch之前需要对show的结果做下判空处理，防止出错（如果没有判空，在平台版本为1052以及以下的手机上将会出现错误）
        adshow && adshow.then(() => {
            if (obj && obj.showCallback) {
                obj.showCallback()
            }
            console.log("插屏广告展示成功");
        }).catch(err => {
            console.log("插屏广告展示失败", JSON.stringify(err));
        });
        insertAd.onLoad(() => {
            console.log('插屏加载=')
            self.insertAd = insertAd;
            if (obj && obj.loadCallback) {
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
            // insertAd.show();

        })
        insertAd.onError(function (err) {
            console.log('插屏错误=', JSON.stringify(err))
            if (obj && obj.scene) {
                let cur_scene = cc.director.getScene().name;
                for (let i = 0; i < obj.scene.length; i++) {
                    if (cur_scene == obj.scene[i]) {
                        return;
                    }
                }
            }
        })
        insertAd.onClose(function () {
            if (self.insertAd) {
                self.insertAd = null;
            }
        });
        // insertAd.load();
    },
    setInsertAdVisible: function (bool) {
        this.isShowInsert = bool;
    },
    listenInsert() {
        var showf = () => {
            this.createInsertAd();
        }
        qg.onShow(showf);
    },

    //视频广告
    createNewVideoAd: function () {
        if (qg.getSystemInfoSync().platformVersionCode < 1041) return;
        if (!this.netState || !this.videoId) return;
        if (this.videoAd) return;
        let videoAd = qg.createRewardedVideoAd({
            posId: this.videoId
            // posId:"9642a0c5985b4ab68aeaee6a90df5c54"
        })
        this.videoAd = videoAd;
        return videoAd;
    },

    removeVideoAd: function () {
        this.videoAd = null;
    },

    checkVideoDisTime: function () {
        let cur_time = cc.sys.localStorage.getItem("createVideoAdTime");
        let now_time = Date.parse(new Date());
        if (!cur_time) {
            cc.sys.localStorage.setItem("createVideoAdTime", now_time);
            return true;
        }
        let dis_time = now_time * 1 - cur_time;
        if (dis_time < 60 * 1000) {
            return false;
        } else {
            cc.sys.localStorage.setItem("createVideoAdTime", now_time);
        }
        return true;
    },

    //拉取广告
    loadVideoAd: function (callbacks) {
        if (!this.netState) {
            qg.showToast({
                message: '网络状况不好，请调试后继续',
            });
            let errMsg = {code: -1, msg: "没有网络"};
            console.log("激励视频广告显示失败", errMsg);
            if (callbacks && callbacks.errCallback) {
                callbacks.errCallback(errMsg);
            }
            return;
        }
        if (this.videoAd) {
            this.errListen && this.videoAd.offError()
            this.errListen = (err) => {
                qg.showToast({
                    message: "视频正在赶来的路上，请稍后"
                });
                let errMsg = {code: -2, msg: err};
                console.log("激励视频广告显示失败", errMsg);
                if (callbacks && callbacks.errCallback) {
                    callbacks.errCallback(errMsg);
                }
            }
            this.videoAd.onError(this.errListen);
            let checkTime = this.checkVideoDisTime();
            if (!checkTime) {
                qg.showToast({
                    message: '视频正在赶来的路上，请稍后',
                });
                let errMsg = {code: -2, msg: "创建过于频繁"};
                console.log("激励视频广告显示失败", errMsg);
                if (callbacks && callbacks.errCallback) {
                    callbacks.errCallback(errMsg);
                }
                return;
            }
            if (this.firstTime) {
                this.firstTime = false;
                let adshow = this.videoAd && this.videoAd.show()
                adshow && adshow.then(() => {
                    console.log("激励视频广告显示成功");
                }).catch(e => {
                    console.log(e);
                });
            } else {
                let adload = this.videoAd && this.videoAd.load()
                adload && adload.then(() => {
                    let adshow = this.videoAd && this.videoAd.show()
                    adshow && adshow.then(() => {
                        console.log("激励视频广告显示成功");
                    }).catch(e => {
                        console.log(e);
                    })
                }).catch(e => {
                    console.log(e);
                })
            }
            this.closeVideo(callbacks);
        }
    },

    closeVideo: function (callbacks) {
        if (this.closeAdListen) this.videoAd.offClose(this.closeAdListen);
        this.closeAdListen = (res) => {
            if (this.closeAdListen) this.videoAd.offClose(this.closeAdListen);
            if (res && res.isEnded || res === undefined) {
                if (callbacks && callbacks.suCallback) {
                    callbacks.suCallback();
                }
            } else {
                if (callbacks && callbacks.failCallback) {
                    callbacks.failCallback();
                }
            }
        }
        this.videoAd.onClose(this.closeAdListen);
    },
    netWorkMonitor: function () {
        qg.getNetworkType({
            success: (res) => {
                if (res.type != "none") {
                    this.netState = true
                } else {
                    this.netState = false
                }
            },
            fail: (res) => {
            }
        });
        qg.subscribeNetworkStatus((res) => {
            if (res.type != "none") {
                this.netState = true
            } else {
                this.netState = false
            }
        });
    }
}

module.exports = VIVOAds;