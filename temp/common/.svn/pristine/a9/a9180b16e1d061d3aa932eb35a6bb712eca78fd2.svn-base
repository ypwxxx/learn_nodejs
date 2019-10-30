const CCGlobal = require('CCGlobal');
const PLATFORM = {
    WEIXIN: 1,
    QQPLAY: 2,
    QZONE: 3,
    FACEBOOK: 4,
    OPPO: 5,
    VIVO: 6,
    QQ: 7,
    TT: 8,
    BAIDU: 9,
    HUAWEI: 10,
    XIAOMI: 11,
    QTT: 12
};

let Ads
if (window.GameConfig && window.GameConfig.info.showAd == "false") {
    Ads = null
} else if (CCGlobal.platform == PLATFORM.WEIXIN) {
    Ads = require("WXAdsFunc");
} else if (CCGlobal.platform == PLATFORM.OPPO) {
    Ads = require("OPPOAdsFunc");
} else if (CCGlobal.platform == PLATFORM.VIVO) {
    Ads = require("VIVOAdsFunc");
} else if (CCGlobal.platform == PLATFORM.TT) {
    Ads = require("TTAdsFunc");
} else if (CCGlobal.platform == PLATFORM.BAIDU) {
    Ads = require("BDAdsFunc");
} else if (CCGlobal.platform == PLATFORM.QQ) {
    Ads = require("QQAdsFunc");
} else if (CCGlobal.platform == PLATFORM.QTT) {
    Ads = require("QTTAdsFunc");
}

var AdsFunc = {
    //引用的源对象
    sourceFunc: Ads,
    /**----在游戏开始场景中进行初始化
     * @param {*} obj {appId:appId,bannerId:横幅广告id,videoId: 视频id,insertId:插屏id,filename:配置文件名,success:成功回调,fail:失败回调}
     */
    initAd: () => {
        if (!Ads) return;
        if (CCGlobal.platform == PLATFORM.WEIXIN) {
            Ads.initData();
        } else {
            let data = window.GameConfig.adConfig;
            Ads.initAd(data);
        }
    },
    /**-创建广告
     * @param {*} obj { model:可选参数 {key:  玩法对应key,pos: 广告位},flag: 可选参数;宽度比例,isHide:可选参数 是否隐藏}
     */
    createBanner: (obj) => {
        if (!Ads) return;
        let isHide = (obj && obj.isHide) ? obj.isHide : undefined
        if (CCGlobal.platform == PLATFORM.WEIXIN) {
            Ads.createNewBanner(obj.model, obj.flag, isHide);
        } else if (CCGlobal.platform == PLATFORM.BAIDU) {
            let scale = (obj && obj.scale) ? obj.scale : undefined;
            let showScene = (obj && obj.showScene) ? obj.showScene : undefined;
            Ads.createBanner(scale,showScene);
        } else {
            Ads.createBanner(isHide);
        }
    },
    initBannerNode: (obj) => {
        if (!Ads) return;
        if (CCGlobal.platform == PLATFORM.WEIXIN || CCGlobal.platform == PLATFORM.QQ || CCGlobal.platform == PLATFORM.BAIDU) {
            Ads.initBannerNode(obj);
        }
    },
    showBanner: () => {
        if (!Ads) return;
        Ads.showBanner();
    },
    hideBanner: () => {
        if (!Ads) return;
        Ads.hideBanner();
    },
    destroyBanner: () => {
        if (!Ads) return;
        if (CCGlobal.platform == PLATFORM.WEIXIN) {
            Ads.removeBanner();
        } else {
            Ads.destroyBanner();
        }
    },
    /**-创建视频广告
     * @param {*} obj { model: 可选参数{key:  玩法对应key,pos: 广告位}}
     */
    createVideoAd: (obj) => {
        if (!Ads) return;
        let param = (obj && obj.model) ? obj.model : "";
        Ads.createNewVideoAd(param);
    },
    /**-拉取视频
     * @param {*} callbacks 必填{suCallback:成功回调,failCallback:失败回调,errCallback:错误回调}
     * errCallback会给一个错误对象 {code:Number,msg:""} code为-1是无网络状况,-2是其他错误
     */
    loadVideoAd: (callbacks) => {
        if (!Ads) return;
        Ads.loadVideoAd(callbacks);
    },
    /**-创建插屏
     * @param {*} obj {scene: 可选参数 []不显示插屏的场景,loadCallback:可选参数  加载成功后的回调,showCallback:可选参数  展示成功后的回调,closeCallback:可选参数 用户点击关闭后的回调,errCallback,可选参数 错误回调}
     */
    createInsertAd: (obj) => {
        if (!Ads) return;
        if (CCGlobal.platform == PLATFORM.WEIXIN || CCGlobal.platform == PLATFORM.OPPO || CCGlobal.platform == PLATFORM.VIVO) {
            Ads.createInsertAd(obj);
        }
    },
    /*
    * 设置插屏是否显示 bool:布尔值 必填
    *
    * */
    setInsertAdVisible: (bool) => {
        if (!Ads) return;
        if (CCGlobal.platform == PLATFORM.WEIXIN || CCGlobal.platform == PLATFORM.OPPO || CCGlobal.platform == PLATFORM.VIVO) {
            Ads.setInsertAdVisible(bool)
        }
    },
}

module.exports = AdsFunc;
AdsFunc.initAd();