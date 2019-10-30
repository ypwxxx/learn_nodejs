var QTTAds = {
    bannerAd: null,
    videoAd: null,
    insertAd: null,
    netState: true,
   
    bannerId: null,         //横幅广告id
    videoId: null,          //视频id
    insertId: null,          //插屏id
    isHideBanner: false,
    //初始化广告id
    /**----在游戏开始场景中进行初始化
     * @param {*} obj {bannerId:横幅广告idid,videoId: 视频id，insertId：插屏}---必传
     */
    initAd: function (obj) {
        obj.bannerId && (this.bannerId = obj.bannerId);
        obj.videoId && (this.videoId = obj.videoId);
        obj.insertId && (this.insertId = obj.insertId);
    },

    //创建广告  ---大部分人会直接调用此方法来显示广告，而趣头条不提供创建广告的接口 
    createBanner: function () {
        //显示
        qttGame.showBanner();
    },

    //显示广告
    showBanner: function () {
        qttGame.showBanner();
    },

    //隐藏广告
    hideBanner: function () {
        qttGame.hideBanner();
    },

    //销毁广告
    destroyBanner: function () {
       console.log('趣头条未提供销毁广告的接口')
    },

    createNewVideoAd() {
        console.log('趣头条未提供创建视频的接口')
    },
    /**
     * @param {*} callbacks
     * suCallback,---视频看完的处理方法
     * failCallback,视频未看完的处理方法
     * errCallback，没拉取到视频的处理方法
     */
    //拉取广告
    loadVideoAd: function (callbacks) {
        var options ={};      //为互动广告
        options.rewardtype = 1;
        options.data = {};
        if(callbacks.text) options.data.title =callbacks.text;//互动抽中奖后的道具提示文字
        console.log(callbacks.text)
        options.data.url ="";//互动抽中奖后的道具图标(可选)

        options.callback = (res) => {
            //回调函数
            if (res == 1) {
                //播放完成，发放奖励
                callbacks.suCallback && callbacks.suCallback();
            } else {
                //res = 0    填充不足
                let errMsg = { code: -1, msg: "填充不足" };
                callbacks.errCallback && callbacks.errCallback(errMsg);
            }
        };
        qttGame.showVideo((res) => {
            if (res == 1) {
                //播放完成，发放奖励
                callbacks.suCallback && callbacks.suCallback();
            } else {
                //res = 0    填充不足                
                //res = 2    提前关闭
                if(res == 0){
                    let errMsg = { code: -2, msg: "提前关闭" };
                    callbacks.errCallback && callbacks.errCallback(errMsg);
                }else if(res == 2){
                    callbacks.failCallback && callbacks.failCallback();
                }
            }
        }, options);
        
    },
    
}


module.exports = QTTAds;

