// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const CCGlobal = require('CCGlobal');
const CCConst = require('CCConst');
var Baidu = {
    isSupport: false,
    bannerAd: null,
    videoAd: null,
    netConnected: true,
    bannerNode: null,
    system: 0,              //ios:1,android:0
    apiVer: null,           //API版本号
    version: null,          //客户端版本号
    addMiniProgram: null,   //添加到小程序
    bannerID: null,         //横幅广告id
    appSid: null,           //后台广告id
    videoID: null,          //视频id

    //初始化广告id
    /**----在游戏开始场景中进行初始化
     * @param {*} obj {bannerID:横幅广告id，appSid：后台广告id,videoID: 视频id}---必传
     */
    initAd: function (obj) {
        if (!Baidu.isSupport) return;
        if (!obj) return;
        this.bannerID = obj.bannerId;
        this.appSid = window.GameConfig.info.appSId;
        this.videoID = obj.videoId;
    },

    initBannerNode: function (node) {
        if (!node) return;
        this.bannerNode = node;
    },
    /**
     * 
     * @param {*} node 广告node---必传
     * @param {*} scale 广告缩放比---可传可不传--不传时，广告默认缩放比为1
     * @param {*} showScene 场景名-防止广告带到某些不需要广告的场景---可传可不传
     */
    createBanner(scale, showScene) {
        if (!Baidu.isSupport) return;
        let isCreatAd = false;
        if (!scale) {
            scale = 1;
        }
        //this.bannerNode = node;
        let date1 = Date.now();
        // console.log('date1:',date1)
        let baidu_adTime = cc.sys.localStorage.getItem('Baidu_adTime');
        // console.log('缓存-baidu_adTime:',baidu_adTime)
        if (baidu_adTime) {
            let baidu_disTime = Number(date1) - Number(baidu_adTime);
            console.log('时间差：',baidu_disTime)
            if (baidu_disTime >= 45 * 1000) {//超过45s就可以创建新的广告，否则就展示旧的广告
                isCreatAd = true;
                cc.sys.localStorage.setItem('Baidu_adTime', date1);
            } else {
                isCreatAd = false;
            }
        } else {
            isCreatAd = true;
            cc.sys.localStorage.setItem('Baidu_adTime', date1);
        }

        let style = this.calcBannerStyle(scale);
        if (isCreatAd || !this.bannerAd) {
            console.log('展示新广告。。。') 
            this.destroyBanner();
            cc.log(this.bannerID)
            let banner = swan.createBannerAd({
                adUnitId: this.bannerID,
                appSid: this.appSid,
                style: style
            })
            // console.log('创建新的广告');
            this.bannerAd = banner;
            banner.onLoad(() => {
                banner.show()
                    .then(() => {
                        if (showScene && cc.director.getScene().name !== showScene) {
                            this.hideBanner();
                            return;
                        }
                    })
                    .catch(err => console.log(err))
            });
            banner.onError(function(err){
                console.log('ad error: ', JSON.stringify(err));
            });
            banner.onResize(() => {
                console.log(' banner 广告位宽度变化');
            });
        } else {
            console.log('展示旧广告。。。=',showScene)
            this.bannerAd.style.top = style.top;
            this.showBanner();
            if (showScene && cc.director.getScene().name !== showScene) {
                this.hideBanner();
                console.log('展示旧的广告----hideBanner');
                return;
            }
        }
    },

    calcBannerStyle(scale){
        if(!cc.isValid(this.bannerNode)) return {};

        let systemInfo = swan.getSystemInfoSync();
        let sysH = systemInfo.screenHeight;
        let sysW = systemInfo.screenWidth;
        let total = cc.view.getVisibleSize();
        let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
        let h = (1 - (pos.y / total.height)) * sysH;
        let w = sysW * scale;
        let left = (sysW - w) / 2;

        return {
            left: left,
            top: h,
            width: w
        };
    },

    destroyBanner() {
        // if (CCGlobal.platform != CCConst.PLATFORM.BAIDU) return;
        if (!Baidu.isSupport) return;
        if (this.bannerAd) {
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    },

    hideBanner() {
        // if (CCGlobal.platform != CCConst.PLATFORM.BAIDU) return;
        if (!Baidu.isSupport) return;
        if (this.bannerAd) {
            console.log('广告隐藏。。。。。。。。。。')
            this.bannerAd.hide();
        }
    },

    showBanner() {
        // if (CCGlobal.platform != CCConst.PLATFORM.BAIDU) return;
        if (!Baidu.isSupport) return;
        if (this.bannerAd) {    
            // console.log('展示旧的广告');
            this.bannerAd.show()
        }
    },

    /**
     * 
     * @param {*} callbacks
     * suCallback,---视频看完的处理方法
     * failCallback,视频未看完的处理方法
     * errCallback，没拉取到视频的处理方法
     */
    createNewVideoAd(callbacks) {
        if (!Baidu.isSupport) return;
        if (!this.videoAd) {
            let videoAd = swan.createRewardedVideoAd({ adUnitId: this.videoID, appSid: this.appSid })
            this.videoAd = videoAd;
        }
        // console.log('创建视频：—video：', this.videoAd, " --:", Baidu.videoAd)
        // this.loadvideoAd(callbacks);
    },

    //拉取广告
    loadVideoAd: function (callbacks) {
        if (!Baidu.isSupport) return;
        if (Baidu.netConnected) {
            if (Baidu.videoAd) {
                // console.log('有网，拉取视频:', Baidu.videoAd)
                Baidu.videoAd.load()
                    .then(() => Baidu.videoAd.show())
                    .catch(err => {
                        console.log(err);
                        // swan.showToast({
                        //     title: '视频正在赶来的路上，请稍后',
                        //     icon: "none",
                        //     duration: 2000,
                        // });
                        if (callbacks.errCallback) {
                            callbacks.errCallback();
                        }
                    })

                // Baidu.videoAd.onError(err => {
                //     console.log(err)
                //     // console.log('视频拉取错误')
                //     swan.showToast({
                //         title: '视频正在赶来的路上，请稍后',
                //         icon:"none",
                //         duration: 2000,
                //     });
                //     if (callbacks.errCallback) {
                //         callbacks.errCallback();
                //     }
                // })
            }
        } else {
            // console.log('无网，没拉取视频')
            swan.showToast({
                title: '网络状况不好，请调试后继续',
                icon: "none",
                duration: 1000,
            });
            if (callbacks.errCallback) {
                callbacks.errCallback();
            }
        }
        this.closeVideo(callbacks);
    },

    closeVideo: function (callbacks) {
        if (!Baidu.isSupport) return;
        if (this.closeAdListen) {
            Baidu.videoAd.offClose(this.closeAdListen);
        }
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
        Baidu.videoAd.onClose(this.closeAdListen);
    },

    //添加到我的小程序
    showAddMiniProgram_Baidu: function (node, prefab, isShow) {
        if (!Baidu.isSupport) return;
        if (!isShow) {//true:就不判断ios还是安卓，false:判断安卓和ios，ios才显示
            if (Baidu.system == 0) {
                return;
            }
        }
        if (this.addMiniProgram) {
            this.addMiniProgram.destroy();
        }
        this.addMiniProgram = cc.instantiate(prefab);
        node.addChild(this.addMiniProgram);
        this.addMiniProgram.setPosition(0, 0);
        this.addMiniProgram.zIndex = 100;

        let sp_add = this.addMiniProgram.getChildByName('add');
        let sp_height = sp_add.height;
        sp_add.y = 1560 / 2 - (sp_height / 2);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.view.getVisibleSize();

        let h = sp_add.y / 1560 * winSize.height - (sp_height / 2);
        let w = 0;
        if (frameSize.width == 375 && frameSize.height == 812) {// iphone x
            h = sp_add.y / 1560 * winSize.height - 90;
        }
        sp_add.position = cc.p(w, h);

        // console.log('添加到我的小程序:',this.addMiniProgram)
        //动画
        let move1 = cc.moveBy(0.5, cc.v2(20, 0));
        let move2 = cc.moveBy(0.5, cc.v2(-20, 0));
        let action = cc.repeatForever(cc.sequence(move1, move2))
        this.addMiniProgram.stopAllActions();
        this.addMiniProgram.runAction(action);
    },

    destroyAddMiniProgram: function () {
        if (!Baidu.isSupport) return;
        if (this.addMiniProgram) {
            this.addMiniProgram.destroy();
        }
    },

    hideAddMiniProgram: function () {
        if (!Baidu.isSupport) return;
        if (this.addMiniProgram) {
            this.addMiniProgram.active = false;
        }
    },

    showAddMiniProgram: function () {
        if (!Baidu.isSupport) return;
        if (this.addMiniProgram) {
            this.addMiniProgram.active = true;
        }
    },




};

Baidu.isSupport = typeof swan == "undefined" ? false : true;

//判断有没有网络
function netWorkMonitor() {
    if (!Baidu.isSupport) return;
    swan.onNetworkStatusChange(res => {
        Baidu.netConnected = res.isConnected;
        // console.log("有没有网络:", Baidu.netConnected)
    });
}

//判断是ios还是安卓
function iosOrAndroid() {
    if (!Baidu.isSupport) return;
    let systemInfo = swan.getSystemInfoSync();
    // console.log('systemInfo:---',systemInfo)
    // API版本号
    Baidu.apiVer = systemInfo.SDKVersion;
    // 系统类型
    if (systemInfo.system.indexOf("iOS") !== -1) {
        Baidu.system = 1;//ios
    } else {
        Baidu.system = 0;//安卓
    }
    //客户端版本号
    Baidu.version = systemInfo.version;
}
iosOrAndroid();
netWorkMonitor();
module.exports = Baidu;
