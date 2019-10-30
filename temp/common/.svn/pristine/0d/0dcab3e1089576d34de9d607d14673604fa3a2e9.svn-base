var TTAds = {
    bannerAd: null,
    videoAd: null,
    insertAd: null,
    netState: true,
    bannerNode: null,
    apiVer: null, // API版本号
    bannerId: null,         //横幅广告id
    videoId: null,          //视频id
    insertId: null,          //插屏id
    isHideBanner: false,
    closeAdListen: null,
    //初始化广告id
    /**----在游戏开始场景中进行初始化
     * @param {*} obj {bannerId:横幅广告idid,videoId: 视频id，insertId：插屏}---必传
     */
    initAd: function (obj) {
        obj.bannerId && (this.bannerId = obj.bannerId);
        obj.videoId && (this.videoId = obj.videoId);
        obj.insertId && (this.insertId = obj.insertId);
        this.netWorkMonitor();
    },

    //创建广告
    /**
     *
     * @param {*} isHide :是否创建后隐藏广告
     */
    createBanner: function (isHide) {
        if (!this.netState || !this.bannerId) return;
        if (!this.bannerAd) {
            const {
                windowWidth,
                windowHeight,
            } = tt.getSystemInfoSync();
            var targetBannerAdWidth = 200;
            let id = this.bannerId;
            this.isHideBanner = false;
            // 创建一个居于屏幕底部正中的广告
            let bannerAd = tt.createBannerAd({
                adUnitId: id,
                style: {
                    width: targetBannerAdWidth,
                    top: windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
                    left: (windowWidth - targetBannerAdWidth) / 2
                },
            });

            console.log('创建广告:', this.bannerAd)
            let bannerAdLoad = () => {
                this.bannerAd = bannerAd;
                this.isHideBanner ? this.isHideBanner = false : !isHide && this.bannerAd.show().then(() => {
                    console.log('广告显示成功111');
                }).catch(err => {
                    console.log('广告组件出现问题', err);
                });
            }
            bannerAd.onLoad(bannerAdLoad)
            bannerAd.onError((err) => {
                console.log(err)
                //拉不到的情况下展示上一个
                if (this.bannerAd) {
                    this.isHideBanner ? this.isHideBanner = false : this.bannerAd.show();
                }
            });
            bannerAd.onResize(size => {
                console.log('resize....')
                // console.log(size.width, size.height);
                // bannerAd.style.top = windowHeight - size.height;
                bannerAd.style.left = (windowWidth - size.width) / 2;
            });
        } else {
            !isHide && this.showBanner();
        }

    },

    //显示广告
    showBanner: function () {
        if (this.bannerAd) {
            this.bannerAd.show();
        } else {
            this.createBanner(false);
        }
    },

    //隐藏广告
    hideBanner: function () {
        if (this.bannerAd) {
            this.isHideBanner = true;
            this.bannerAd.hide();
        }
    },

    //销毁广告
    destroyBanner: function () {
        if (this.bannerAd) {
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    },

    createNewVideoAd() {
        if (!this.videoId) return;
        if (!this.netState) {
            console.log("没有网络 广告创建失败")
            return;
        }
        if (!this.videoAd) {
            let id = this.videoId;
            let videoAd = tt.createRewardedVideoAd({adUnitId: id})
            this.videoAd = videoAd;
        }
    },
    /**
     * @param {*} callbacks
     * suCallback,---视频看完的处理方法
     * failCallback,视频未看完的处理方法
     * errCallback，没拉取到视频的处理方法
     */
    //拉取广告
    loadVideoAd: function (callbacks) {
        if (!this.netState) {
            tt.showToast({
                title: '网络状况不好，请稍后再试',
                icon: "none",
                duration: 1000,
            });
            let errMsg = {code: -1, msg: "没有网络 广告创建失败"};
            console.log(errMsg);
            if(callbacks && callbacks.errCallback){
                callbacks.errCallback(errMsg);
            }
            return;
        }
        if (this.videoAd) {
            this.errListen && this.videoAd.offError(this.errListen)
            this.errListen = (err) => {
                tt.showToast({
                    title: '视频正在赶来的路上，请稍后',
                    icon: "none",
                    duration: 2000,
                });
                let errMsg = {code: -2, msg: err};
                console.log("激励视频广告显示失败", errMsg);
                if(callbacks && callbacks.errCallback){
                    callbacks.errCallback(errMsg);
                }
            };
            this.videoAd.onError(this.errListen);
            this.videoAd.load()
                .then(() => {
                    this.videoAd.show()
                        .catch(err => {
                            tt.showToast({
                                title: '视频正在赶来的路上，请稍后',
                                icon: "none",
                                duration: 2000,
                            });
                            let errMsg = {code: -2, msg: err};
                            console.log(errMsg);
                            if(callbacks && callbacks.errCallback){
                                callbacks.errCallback(errMsg);
                            }
                        })
                }).catch(e => {
                console.log(e)
            });
            this.closeVideo(callbacks);
        }

    },

    closeVideo: function (callbacks) {
        if (this.closeAdListen) {
            this.videoAd.offClose(this.closeAdListen);
        }
        this.closeAdListen = (res) => {
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

    //判断有没有网络
    netWorkMonitor: function () {
        tt.getNetworkType({
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
        tt.onNetworkStatusChange((res) => {
            if (res.networkType != "none") {
                this.netState = true
            } else {
                this.netState = false
            }
        });
    }

}


module.exports = TTAds;

