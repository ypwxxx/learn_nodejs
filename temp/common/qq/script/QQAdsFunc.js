var AdsFunc = {
    bannerId: null,         //横幅广告id
    videoId: null,          //视频id
    insertId: null,          //插屏id
    bannerAd: null,
    videoAd: null,
    insertAd: null,
    netState: true,
    isInitNode: false,
    bannerNode: null,
    cur_bannerHeight: 0,
    isShowBanner: true,
    isChangeSize: false, //是否正在轮转
    isInCreateBanner: false, //是否正在创建
    isCenterBanner: false,
    //判断网络状态
    initAd: function (obj) {
        this.initParms();
        this.getNetworkStatusChange();
        obj.bannerId && (this.bannerId = obj.bannerId);
        obj.videoId && (this.videoId = obj.videoId);
        obj.insertId && (this.insertId = obj.insertId);
    },
    getNetworkStatusChange: function () {
        qq.getNetworkType({
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
        qq.onNetworkStatusChange(res => {
            console.log("net：" + res.isConnected);
            this.netState = res.isConnected;
        })
        return this.netState;
    },
    initParms: function () {
        this.systemInfo = qq.getSystemInfoSync();
        this.commonSize = cc.view.getFrameSize();
        this.totalSize = cc.view.getVisibleSize();
        //广告距离 游戏底部和设备底部的距离 iphoneX 50  其他20（暂时修改成 与iphonx的比例值）
        //默认dis_side = 30
        if (this.checkIphoneXDevice()) {
            this.dis_side = 30;
        } else {
            this.dis_side = 30 * (this.systemInfo.windowHeight / 812);
        }
    },

    //2分钟轮转
    changeBanner: function () {
        let cur_time = cc.sys.localStorage.getItem("QQ_bannerTime");
        let now_time = Date.parse(new Date());
        if (!cur_time) {
            cc.sys.localStorage.setItem("QQ_bannerTime", now_time);
            return true;
        }
        let dis_time = now_time * 1 - cur_time;
        if (dis_time < 120 * 1000) {
            return false;
        } else {
            cc.sys.localStorage.setItem("QQ_bannerTime", now_time);
        }
        return true;
    },

    createBanner: function (isHide) {
        if (!this.netState || !this.bannerId) return;
        isHide ? this.setShowBanner(false) : this.setShowBanner(true);
        this.commonSize = cc.view.getFrameSize();
        this.isShowBanner = true;
        let id = this.bannerId;  //"adunit-" +
        //固定创建广告宽度：300（最小）
        if (this.bannerAd && !this.changeBanner()) {
            if (this.isShowBanner) {
                let adshow = this.bannerAd && this.bannerAd.show();
                adshow && adshow.then().catch();
            } else {
                this.hideBanner();
            }
            this.onResize(this.bannerAd);
            return;
        }

        this.totalSize = cc.view.getVisibleSize();
        this.systemInfo = qq.getSystemInfoSync();
        // let nodeSize = this.bannerNode.getContentSize();
        // let ori_pos = this.bannerNode.position;
        // this.bannerNode.position = cc.v2(ori_pos.x, ori_pos.y - nodeSize.height / 2);
        let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
        // this.bannerNode.position = ori_pos;
        this.h = (pos.y / this.totalSize.height) * this.systemInfo.windowHeight;
        // console.log("11111--:"," commonSize:", this.commonSize, " windowHeight:",this.systemInfo.windowHeight," pos",pos,' h:', this.h,
        // " totalSize:", this.totalSize)
        this.destroyBanner();
        this.setShowBanner(true);
        let bannerAd = qq.createBannerAd({
            adUnitId: id,
            style: {
                left: (this.systemInfo.windowWidth - 300) / 2,  //(this.systemInfo.windowWidth - 300)/2
                top: this.commonSize.height - this.h,  //this.commonSize.height
                width: 300,
            }
        })

        this.loadFun = () => {
            console.log("banner显示成功");
            this.bannerAd = bannerAd;
            if (this.isShowBanner) {
                let adshow = bannerAd && bannerAd.show()
                adshow && adshow.then().catch()
            } else {
                this.hideBanner();
            }
            this.onResize(bannerAd);
        }
        if (bannerAd) {
            this.loadFun && bannerAd.offLoad(this.loadFun)
            bannerAd.onLoad(this.loadFun);
            bannerAd.onError(() => {
                console.log('banner-onError')
            });
        }
    },

    onResize: function (bannerAd) {
        bannerAd.onResize(res => {
            // this.totalSize = cc.view.getVisibleSize();
            // this.systemInfo = qq.getSystemInfoSync();
            // // let nodeSize = this.bannerNode.getContentSize();
            // // let ori_pos = this.bannerNode.position;
            // // this.bannerNode.position = cc.v2(ori_pos.x, ori_pos.y - nodeSize.height / 2);
            // let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
            // // this.bannerNode.position = ori_pos;
            // let h = (pos.y / this.totalSize.height) * this.systemInfo.windowHeight;
            bannerAd.style.top = this.commonSize.height - this.h;
            // console.log(" commonSize:", this.commonSize, " windowHeight:",this.systemInfo.windowHeight,' h:', this.h,
            //  " totalSize:", this.totalSize," adWith:",res.width)
            bannerAd.style.left = (this.systemInfo.windowWidth - res.width) / 2
        })
    },


    setShowBanner: function (isBool) {
        this.isShowBanner = isBool;
    },

    showBanner: function () {
        this.setShowBanner(true);
        if (!this.bannerAd) return;
        this.bannerAd.show();
    },
    hideBanner: function () {
        this.setShowBanner(false);
        if (!this.bannerAd) return;
        this.bannerAd.hide();
    },
    destroyBanner: function () {
        this.setShowBanner(false);
        if (!this.bannerAd) return;
        this.bannerAd.hide();
        this.bannerAd.destroy();
        this.bannerAd = null;
    },

    /**
     *
     * @param {node} node  如果有预留界面，在createNewBanner之前，更新bannerNode
     */
    initBannerNode: function (node) {
        if (!node) return;
        this.isInitNode = true;
        this.bannerNode = node;
    },
    /**
     *
     * @param clearBannerNode 清理广告位 节点
     */
    clearBannerNode: function () {
        this.isInitNode = false;
        this.bannerNode = null;
    },

    //创建并返回 视频广告
    createNewVideoAd: function () {
        if (!this.videoId) return;
        this.removeVideoAd();
        let id = this.videoId;  //"adunit-" +
        var videoAd = qq.createRewardedVideoAd({
            adUnitId: id
        });
        this.videoAd = videoAd;
    },
    //拉取广告
    loadVideoAd: function (callbacks) {
        if (!this.netState) {
            qq.showToast({
                title: '网络状况不好，请稍后再试',
                icon: "none",
                duration: 1000,
            });
            let errMsg = {code: -1, msg: "没有网络 广告创建失败"};
            console.log(errMsg);
            if (callbacks.errCallback) {
                callbacks.errCallback(errMsg);
            }
            return;
        }
        if (this.videoAd) {
            this.errListen && this.videoAd.offError();
            this.errListen = (err) => {
                qq.showToast({
                    title: '视频正在赶来的路上，请稍后',
                    icon: "none",
                    duration: 2000,
                });
                let errMsg = {code: -2, msg: err};
                console.log(errMsg);
                if (callbacks.errCallback) {
                    callbacks.errCallback(errMsg);
                }
            };
            this.videoAd.onError(this.errListen);
            let adLoad = this.videoAd && this.videoAd.load();
            adLoad && adLoad.then(() => this.videoAd.show()).catch(e => {
                console.log(e)
            });
            this.closeVideo(callbacks);
        } else {
            let errMsg = {code: -2, msg: ''};
            if (callbacks.errCallback) {
                callbacks.errCallback(errMsg);
            }
        }
    },
    closeVideo: function (callbacks) {
        if (this.closeAdListen) this.videoAd.offClose(this.closeAdListen);
        this.closeAdListen = (res) => {
            if (res && res.isEnded || res === undefined) {
                if (callbacks.suCallback) {
                    callbacks.suCallback();
                }
            } else {
                if (callbacks.failCallback) {
                    callbacks.failCallback();
                }
            }
        }
        this.videoAd.onClose(this.closeAdListen);
    },
    removeVideoAd: function () {
        this.videoAd = null;
    },
    //检测是否是iphoneX 相关机型
    checkIphoneXDevice: function () {
        if (this.systemInfo.model.toString().indexOf("iPhone X") == "-1") {
            return false;
        } else {
            return true;
        }
    },
    clear: function () {
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
        }
        this.videoAd = null;
    },

};
module.exports = AdsFunc;