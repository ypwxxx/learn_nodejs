
/**
 * 功能介绍：1：banner  2：视频广告 3：信息流广告 4：统计相关   5：审核状态获取 6：平台检测
 *  
 * 1：banner->(showBanner,hideBanner)
 * 2: 视频广告->(showVido)
 * 3: 信息流->(showFeedAd,removeFeedAd)（用于有需求的 结束界面、弹窗界面）
 * 4: 统计
 *          Stat_GameStartTime，Stat_GameStopTime（游戏开始和结束时间）
 *          Stat_GameStartTimes，Stat_GameOverTimes（游戏开始和结束次数）
 *          Stat_GameLevelStartTimes，Stat_GameLevelOverTimes（关卡开始和结束次数）
 *          Stat_GameItemUseTimes （道具使用次数）
 *          Stat_GameUnlockVideoTimes （视频解锁(关卡、道具等)次数）
 *          Stat_GameRewardVideoTimes  (视频获取奖励（金币，道具等）次数)
 * 
 * 5：审核状态获取->（getShenHe）
 * 6：平台检测 
 *          主要用于前端调试 控制使用 
 *          注意事项： 如果网页调试出现 一些关卡字段undefined ，  checkPlatformSupport方法第一行 打开注释即可   
 */

let AppFunc = {
    //显示好评对话框  playTimes 多少次游戏弹一次好评, showReputationTimes 总共弹好评次数
    //好评 评价弹框
    //逻辑：调用此接口playTimes次 弹出弹框 总共能弹showReputationTimes次 弹出返回true 没弹出返回false
    //举例：假如需求是玩三关后弹评价 总共弹三次，那么直接调用此接口 传入3 3即可
    //注意此接口界面会和信息流广告界面冲突，如果同一个界面既有评价也有信息流，则优先弹评价 如果评价返回false，才可以调用信息流接口
    showReputationDialog : function(playTimes = 3, showReputationTimes = 3) {
        if (this.checkPlatformSupport()) {
            if(!PubBaseHelper) return;
            return PubBaseHelper.showReputationDialog(playTimes, showReputationTimes);
        }
    },

    /**
     * 获取设备信息{
     * version :系统版本 
     * screenWidth:屏幕宽（点）   
     * screenHeight:屏幕高（点） 
     * screenScale：屏幕像素与点的换算比（一个点代表多少个像素） 
     * pixelWidth ： 屏幕宽（像素） 
     * pixelHeight：屏幕高（像素） 
     * notchHeight:刘海高（点） 
     * bottomSafeAreaHeight：底部安全区域高（点）
     * }
     */
    getDeviceInfo : function() {
        if (!this.checkPlatformSupport()) return;
        let j = PubBaseHelper.getDeviceInfo()
        return JSON.parse(j)
    },

    /*-------------------------------------banner----------------------------------*/
    /**
     * 显示banner
     * @param {banner显示位置} pos 可使用参数（1、2）对应（底部、顶部）
     * @param {过滤高内存广告，游戏根据自身玩法来传值} filterHighMemorySDK （true、false） 
     */
    showBanner: function(pos = 1, filterHighMemorySDK = false){
        if (this.checkPlatformSupport()) {
            if(!PdragonAd) return;
            PdragonAd.showBanner(pos, filterHighMemorySDK);
        }
    },
    hideBanner: function(){
        if (this.checkPlatformSupport()) {
            if(!PdragonAd) return;
            PdragonAd.hideBanner();
        }
    },
    /*-------------------------------------banner----------------------------------*/


    /**
	 * 展示插屏广告
	 * game:游戏名称    "GameName,SubGameName" 使用逗号分隔
	 */
    showInsertAd : function(game) {
        if (!this.checkPlatformSupport()) return;
        if(!PdragonAd) return;
        PdragonAd.showInterstitialExc(game)
    },


    /*-------------------------------------视频广告----------------------------------*/
    /**
     * 显示视频广告
     * @param {key（类型：number）} key  例如：101，102，999，888等（不同的视频点，最好做个区分）
     * @param {成功} success 注意：success回调中 判定参数flag是否和key值相同
     * @param {失败} fail 
     */
    showVideo: function(key,success,fail){
        if(!PdragonAd) return;
        PdragonAd.showVideoAd({
            videoFlag : key,
            reward : (flag) => {
              if (success) success(flag)
            },
            fail : () => {
              if (fail) fail();
            }
		})
    },
    /**
     * 返回值 (0: 视频功能未开启  1：无视频播放  2：有视频播放)
     * 0状态已废弃，所有平台都是视频开启状态，可用 1   2判断视频是否预加载成功，如果不需要判断预加载也可以直接showVideo
     */
    getVideoStatus: function(){
        if (!this.checkPlatformSupport()) return 0;
        return PdragonAd.getVideoStatus();
    },

     /*-------------------------------------视频广告----------------------------------*/


    /*-------------------------------------信息流广告----------------------------------*/
    /* 参数说明：
    *        ----------------------------------------          ---------------------------------------- 
    *       |   ----------------------------------   |        |   ----------------------------------   |
    *       |  |                                  |  |        |  |                                  |  |
    *       |  |                                  |  |        |  |                                  |  |
    *       |  |  Ads Picture or Default picture  |  |        |  |  Ads Picture or Default picture  |  |
    *       |  |                                  |  |        |  |                                  |  |
    *       |  |                                  |  |        |  |                                  |  |
    *       |   ----------------------------------   |        |   ----------------------------------   |
    *       |   ------   Game Title      ----------  |        |   ----------------------------------   |
    *       |  | icon |                 | dwonload | |        |  |      Default Cover Image         |  |
    *       |   ------   Game Content    ----------  |        |   ----------------------------------   |
    *        ----------------------------------------  
    */
    /**
     * 显示信息流 广告 信息流按 562*436大小适配界面 即node大小562*436
     * @param {信息流广告对应位置的假节点，注意：这个节点的样式按显示默认的信息流图布局，即icon_bg加icon_message，到时候把icon_bg传入即可（因为和评价一起用时，需要显示默认信息流）} node 
     * @param {信息流广告图资源路径 一个游戏可能含有多玩法，每个玩法的信息流图资源都不一样，此参数用来区分不同游戏资源路径，传空使用默认路径} resKey 游戏资源目录名，一般取名游戏名的缩写
     * @param {各种颜色} colors
     * tips:（不同游戏 可能默认图不同，找策划和美术提供） 注意文件命名和文件后缀
     */
    showFeedAd: function(node, colors = {
        titleColor : new cc.Color(255,255,255),
        actionBackgroundColor : new cc.Color(40,207,235),
        actionColor : new cc.Color(255,255,255)},
        resKey = undefined) {
        if (!this.checkPlatformSupport()) return;
        if(!cc.isValid(node)) return;
        let pos = node.convertToWorldSpaceAR(cc.v2(0,0));
        // node.active = false;
        if(!PdragonAd) return;
        let path_default = cc.url.raw("resources/res/icon_message.png");
        let path_bg = cc.url.raw("resources/res/icon_bg.png");
        let path_title = cc.url.raw("resources/res/icon_desc.png");
        let path_cover = cc.url.raw("resources/res/icon_cover.png");
        if (resKey) {
            path_default = cc.url.raw(`resources/${gameKey}/res/icon_message.png`);
            path_bg =      cc.url.raw(`resources/${gameKey}/res/icon_bg.png`);
            path_title =   cc.url.raw(`resources/${gameKey}/res/icon_desc.png`);
            path_cover =   cc.url.raw(`resources/${gameKey}/res/icon_cover.png`);
        }
        PdragonAd.showFeedAd({
            pDefaultImage: path_default,//没广告时的默认图
            sBgPicPath: path_bg,//信息流的整个背景图
            sAdsTitlePath : path_title,//广告之后更精彩提示语，广告没有大图时，放在Ads Picture位置
            sCoverPicPath: path_cover,//title content icon download所在操作栏的背景图
            pos: pos,
            iZorder : 3,
            titleColor : colors.titleColor,
            actionBackgroundColor : colors.actionBackgroundColor,
            actionColor : colors.actionColor
        });
    },
    removeFeedAd: function(){
        if (!this.checkPlatformSupport()) return;
        if(!PdragonAd) return;
        PdragonAd.removeFeedAd()
    },
    /*-------------------------------------信息流广告----------------------------------*/
    
    //是否显示隐私政策和用户协议
    isShowPolicy : function() {
        if (!this.checkPlatformSupport()) return false;
        if(!PubBaseHelper) return false;
        return PubBaseHelper.PUB_isShowPolicy()
    },

    //跳转用户协议
    gotoTermsService : function() {
        if (!this.checkPlatformSupport()) return;
        if(!PubBaseHelper) return;
        PubBaseHelper.PUB_gotoTermsService()
    },
    
     //跳转隐私政策
    gotoPrivacyPolicy : function() {
        if (!this.checkPlatformSupport()) return;
        if(!PubBaseHelper) return;
        PubBaseHelper.PUB_gotoPrivacyPolicy()
    },



    /*---------------------------------------------------统计相关---------------------------------------------------*/
    /*
    游戏：Game,里面有3个玩法：Game1,Game2,Game3,Game2里有2个模式：Mode1，Mode2,Game1为关卡游戏
    例如 一个游戏可能有两个模式 无尽模式 和 关卡模式
    */

    ////自定义时长统计
    //例如统计游戏(pGameName) 的哪个模式(pSubGameName) 的关卡时长(label)
    //pGameName 游戏     pSubGameName 模式     label自定义
   Stat_StartTime : function(gamekey, label, mode = null, interval = 60.0) {
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_StartTime(gamekey, label, mode, interval);
   },
   Stat_StopTime : function(gamekey, label, mode = null) {
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_StopTime(gamekey, label, mode);
   },



    /**
     * 统计：游戏开始时间
     * @param {游戏玩法key} gamekey 
     */
    Stat_GameStartTime: function(gamekey, mode = null, interval = 60.0){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameStartTime(gamekey, mode, interval);
    },
    /**
     * 统计：游戏结束时间
     * @param {游戏玩法key} gamekey 
     */
    Stat_GameStopTime: function(gamekey,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameStopTime(gamekey,mode);
    },
    
    /**
     * 统计：游戏开始次数
     * @param {游戏玩法key} gamekey 
     */
    Stat_GameStartTimes: function(gamekey,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameStartTimes(gamekey,mode);
    },
    /**
     * 统计：游戏结束次数
     * @param {游戏玩法key} gamekey 
     */
    Stat_GameOverTimes: function(gamekey,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameOverTimes(gamekey,mode);
    },
    /**
     * 统计：关卡开始次数
     * @param {游戏玩法key} gamekey 
     * @param {pLevelInfo} label (例如：“Level_1”)) 也可以找策划 确定他们想要的label 
     */
    Stat_GameLevelStartTimes: function(gamekey,pLevelInfo,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameLevelStartTimes(gamekey,pLevelInfo,mode);
    },
    /**
     * 统计：关卡结束次数
     * @param {游戏玩法key} gamekey 
     * @param {pLevelInfo} label (例如：“Level_1”))
     */
    ////游戏关卡模式开始结束次数统计: bFirstPass为是否第一次过本关
    Stat_GameLevelOverTimes: function(gamekey,pLevelInfo,bFirstPass = false,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameLevelOverTimes(gamekey,pLevelInfo,bFirstPass,mode);
    },        
    Stat_GameLevelFailTimes: function(gamekey, pLevelInfo, mode = null) {
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameLevelFailTimes(gamekey,pLevelInfo,mode);
    },
    //首页看视频统计,奖励和玩法解锁共用
    Stat_GameStartVideoTimes : function(gamekey) {
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameStartVideoTimes(gamekey);
    },
    //看视频复活
    Stat_GameAliveVideoTimes : function(gamekey, mode = null) {
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameAliveVideoTimes(gamekey,mode);
    },
    /**
     * 统计：视频获得奖励（金币，道具等）次数
     * @param {游戏玩法key} gamekey 
     */
    Stat_GameRewardVideoTimes: function(gamekey,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameRewardVideoTimes(gamekey,mode);
    },
    /**
     * 统计：视频解锁（关卡，道具等）次数
     * @param {游戏玩法key} gamekey 
     */
    Stat_GameUnlockVideoTimes: function(gamekey,mode = null){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameUnlockVideoTimes(gamekey,mode);
    },
    

    /**
     * 统计：道具使用次数
     * @param {道具} label 
     */
    Stat_GameItemUseTimes: function(label){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameItemUseTimes(label);
    },

    // 用户自定义统计Key和Content,用户扩展的统计全用这个接口
    Stat_GameCustom : function(pKey, pContent){
        if(!this.checkPlatformSupport()) return;
        StatisUtil.Stat_GameCustom(pKey, pContent);
    },


    /*---------------------------------------------------统计相关---------------------------------------------------*/
    
    /*-----------------------------------------分享-----------------------------------------------*/
    /**
     * 简单的分享
     * @param {标题} title 
     */
    shareApp: function(title){
        if(!this.checkPlatformSupport()) return;
        BaseHelper.shareApp(title);
    },
    /**
     * 系统分享
     * @param {标题} title 
     * @param {内容} content 
     * @param {exp:下载链接} url 
     * @param {成功回调} callback 
     */
    shareAppBySys: function(title,content,url,callback){
        if(!this.checkPlatformSupport()) return;
        BaseHelper.shareAppBySys(title, content, url, (a, b, c, d) => {
            if(callback) callback();
        })
    },
    /*-----------------------------------------分享-----------------------------------------------*/

    /*-----------------------------------------反馈-----------------------------------------------*/
    showFeedback: function(){
        if(!this.checkPlatformSupport()) return;
        BaseHelper.showFeedback();
    },
    
    /*-----------------------------------------反馈-----------------------------------------------*/

    //主玩法 onLoad中调用
    //用于移除游戏的启动页，可以不主动调用，在模块下面已经做了调用
    //此方法必须调用一次
    PUB_startGame: function(){
        if(!this.checkPlatformSupport()) return false;
        PubBaseHelper.PUB_startGame();
    },
    
    //获取审核状态 
    getShenHe: function(){
        if(!this.checkPlatformSupport()) return false;
        return BaseHelper.isShenhe() ? true : false;
    },

    //震动  调用系统震动，milliseconds:震动时间（毫秒）, shakeLevel：震动强弱 0：低强度(默认), 1：中等强度, 2：高强度
    playVibrate : function(milliseconds = 500, shakeLevel = 1) {
        if(!this.checkPlatformSupport()) return false;
        PubBaseHelper.PUB_vibrate(milliseconds, shakeLevel)
    },
    //平台检测
    checkPlatformSupport: function(){
        // return false;
        if(cc.sys.isNative && window.jsb) return true;
        return false;
    },
};
if(AppFunc.checkPlatformSupport()) {
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,() => {
        if (!AppFunc._startGame) {
            console.log("--app--进入游戏----")
            PubBaseHelper.PUB_startGame();
            AppFunc._startGame = true
        }
    })
}

module.exports = AppFunc;