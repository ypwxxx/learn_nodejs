/**
 * facebook通用广告组件 version 1.0.4
 * 
 * @version 1.0.4 update explanation
 * 1.修改了广告拉取的逻辑
 * 
 * @version 1.0.3 update explanation
 * 1.添加广告显示失败后,重新拉取预加载的逻辑
 * 
 * @version 1.0.2 update explanation
 * 1.添加了bindVideoEvent方法,用于绑定视频广告播放完成以后需要进行的操作.也可在调用show方法的时候将要进行的操作直接传进去,两个方法以绑定方法为准
 * 
 * @version 1.0.1 update explanation
 * 1.添加了getVideoState方法和getInterAdState方法,用于获取广告预加载状态
 * 2.删除了组件调试用的代码,精简代码大小
 * 3.添加版本说明
 * 
 * @version 1.0.0 explanation
 * 1.使用时请先进行初始化--initVideo/initAd
 * 2.初始化尽量放在游戏主场景的onload阶段,方便在网络不好的时候能有较多的时间初始化广告
 * 3.需要显示的时候,直接调用show方法即可
 */

var FBAdManager = {
    canPlayVideo: null,         //标记是否可以播放视频广告
    canPlayAd: null,            //标记是否可以播放插屏广告
    videoHandler: null,         //记录视频广告
    adHandler: null,            //记录插屏广告
    videoID: null,              //记录视频广告ID
    AdID: null,                 //记录插屏广告ID
    videoEvent: null,

    /**
     * 初始化视频广告
     * @param {string} ID FB游戏的视频广告ID
     */
    initVideo: function(ID){
        if(typeof FBInstant === 'undefined') return;
        let platform = FBInstant.getPlatform();
        console.log('游戏环境:', platform);
        if(platform != 'IOS' && platform != 'ANDROID') return;    //非手机环境不创建广告
        
        // if(!!this.videoHandler){
        //     console.log('广告已经初始化,进行预加载');
        //     this._preloadVideo();
        // }else{
            console.log('初始化视频广告');
            if(!this.videoID){
                this.videoID = ID;
            }
            this.canPlayVideo = false;
            FBInstant.getRewardedVideoAsync(ID).then(
                rewardVideo => {
                    this.videoHandler = rewardVideo;
                    this._preloadVideo();
                    this._showLog('初始化视频广告成功');
                }
            ).catch(
                err => {
                    this._showLog('初始化视频广告失败,错误: ',err.message);
                }
            )
        // }
    },

    //预加载视频广告
    _preloadVideo: function(){
        if(typeof FBInstant === 'undefined') return;
        if(this.videoHandler){
            this.canPlayVideo = false;
            this.videoHandler.loadAsync().then(() => {
                this.canPlayVideo = true;
                this._showLog('预加载视频广告成功');
            }).catch(
                err => {
                    this.canPlayVideo = false;
                    this._showLog('预加载视频广告失败,错误: ',err.message);
                }
            )
        }else{
            this._showLog('videoHandler为null');
        }
    },

    /**
     * 显示视频广告
     * @param {function} task 需要在播放完视频广告后执行的任务(函数)
     */
    showVideo: function(task){
        if(typeof FBInstant === 'undefined') return;
        if(this.videoEvent && typeof this.videoEvent == 'function'){
            task = this.videoEvent;
        }
        if(this.canPlayVideo){
            this.canPlayVideo = false;
            if(this.videoHandler){
                this.videoHandler.showAsync().then(() => {
                    this._showLog('显示视频广告成功');
                    if(task && typeof task == 'function'){
                        task();
                    }
                    this.initVideo(this.videoID);
                }).catch(
                    err => {
                        this.initVideo('显示视频广告失败,错误: ',err.message);
                        this._preloadVideo();
                    }
                )
            }else{
                this.initVideo(this.videoID);
                this._showLog('videoHandler为null');
            }
        }
    },

    /**
     * 获取视频广告状态
     * @return {boolean}} 返回视频广告能否播放的状态
     */
    getVideoState: function(){
        this._showLog('视频广告状态:',this.canPlayVideo);
        return this.canPlayVideo;
    },

    /**
     * 绑定奖励视频之后的执行事件
     * @param {function} event 需要执行的操作
     */
    bindVideoEvent: function(event){
        if(event && typeof event == 'function'){
            this.videoEvent = event;
        }
    },

    /**
     * 初始化插屏广告
     * @param {string} ID FB游戏的插屏广告ID
     */
    initAd: function(ID){
        if(typeof FBInstant === 'undefined') return;
        let platform = FBInstant.getPlatform();
        console.log('游戏环境:', platform);
        if(platform != 'IOS' && platform != 'ANDROID') return;    //非手机环境不创建广告
        // if(!!this.adHandler){
        //     console.log('广告已经初始化,进行预加载');
        //     this._preloadAd();
        // }else{
            console.log('初始化插屏广告');
            if(!this.AdID){
                this.AdID = ID;
            }
            FBInstant.getInterstitialAdAsync(ID).then(
                interAd => {
                    this.adHandler = interAd;
                    this._preloadAd();
                    this._showLog('初始化插屏广告成功');
                }
            ).catch(
                err => {
                    this._showLog('初始化插屏广告失败,错误: ', err.message);
                }
            );
        // }
    },

    //预加载插屏广告
    _preloadAd: function(){
        if(typeof FBInstant === 'undefined') return;
        if(this.adHandler){
            this.canPlayAd = false;
            this.adHandler.loadAsync().then(() => {
                this.canPlayAd = true;
                this._showLog('预加载插屏广告成功');
            }).catch(
                err => {
                    this.canPlayAd = false;
                    this._showLog('预加载插屏广告失败,错误: ', err.message);
                }
            )
        }else{
            this._showLog('adHandler为null');
        }
    },

    /**
     * 显示插屏广告
     * @param {function} task 需要在播放完插屏广告后执行的任务(函数)
     */
    showAd: function(task){
        if(typeof FBInstant === 'undefined') return;
        if(this.canPlayAd){
            this.canPlayAd = false;
            if(this.adHandler){
                this.adHandler.showAsync().then(() => {
                    this._showLog('显示插屏广告成功');
                    if(task && typeof task == 'function'){
                        task();
                    }
                    this.initAd(this.AdID);
                }).catch(
                    err => {
                        this._showLog('显示插屏广告失败,错误: ', err.message);
                        this.initAd();
                    }
                )
            }else{
                this.initAd(this.AdID);
                this._showLog('adHandler为null');
            }
        }
    },

    /**
     * 获取插屏广告状态
     * @return {boolean} 返回插屏广告能否播放的状态
     */
    getInterAdState: function(){
        this._showLog('插屏广告状态:', this.canPlayAd);
        return this.canPlayAd;
    },

    //打印出log信息
    _showLog:function(info, msg){
        msg = msg != 'undefined' ? msg : 'end';
        if(info && typeof info == 'string'){
            console.log(info, msg);
        }
    },
}

module.exports = FBAdManager;