/**
 * 开始菜单排行榜
 */

const CCConst = require('CCConst')
const CCGlobal = require('CCGlobal')
var CWXRanking = require('WXRanking')
cc.Class({
    extends: cc.Component,

    properties: {
        rankingDisplay: cc.Node,
        rankingBgFull: cc.Node,
        rankingBgGroup: cc.Node,
    },

    onLoad() {
        this.rankingDisplay.getComponent(cc.WXSubContextView).enabled=false;
        //this.startUpdate = false;
        this.fullHideHandler = null;
        this.groupHideHandler = null;  //隐藏群排行时要执行的动作
        this.WXRanking = CWXRanking.getInstance();
        // if (sharedCanvas) {
        //     sharedCanvas.width = cc.game.canvas.width * 2;
        //     sharedCanvas.height = cc.game.canvas.height * 2;
        // } 
    },

    /**
     * 
     * @param [Object] games 游戏玩法列表 [{key:'', showStyle: 1, sortType:},{key:'', showStyle: 2, sortType:}] showStyle:1-数字 2-分秒 sortType:1-倒序 2-顺序，showStyle不填默认1，sortType不填默认1
     * @param {string} mainKey 游戏主玩法的key
     */
    initRankingUI(games, mainKey) {
        this.WXRanking.init(games, mainKey);
    },

    /**
     * 
     * @param {Object} options 
     * {
     *  {string} key:玩法的key
     *  {function} onHide: 关闭时执行的function
     * }
     */
    showFullList(options) {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {

            if (!options || !options.key) {
                console.error('玩法key为空')
            }

            if (this.rankingBgFull) {
                this.rankingBgFull.x = 0;
            }else{
                console.error("this.rankingBgFull未定义");
                return;
            }

            if (this.rankingBgGroup) {
                this.rankingBgGroup.x = 1000;
            }else{
                console.error("this.rankingBgGroup未定义");
                return;
            }

            if (options.onHide && typeof options.onHide === "function")
                this.fullHideHandler = options.onHide;
            
            //群分享按钮
            let groupRankingNode = this.rankingBgFull.getChildByName('groupRanking');
            groupRankingNode.off(cc.Node.EventType.TOUCH_END);
            groupRankingNode.on(cc.Node.EventType.TOUCH_END, function (event) {
                self.WXRanking.groupShare(options.key)
                // let obj = {
                //     title: options.groupShareTitle ? options.groupShareTitle : null,
                //     imageUrl: options.groupShareImage ? options.groupShareImage : null,
                //     query:"showGroupRanking=1&gameKey=" + options.key,
                //     success: function (res) {
                //         console.log('群排行分享 成功');
                //         console.log(res);
                //
                //     },
                //     fail: function (res) {
                //         console.log('群排行分享 失败');
                //         console.log(res);
                //     }
                // };
                // wx.shareAppMessage(obj);
            })

            this.WXRanking.showFriendList(options.key);

            var self = this;
            setTimeout(function () {
                self.startUpdate = true;
                if (!self || !self.rankingDisplay) return;
                self.rankingDisplay.x = 0;
                self.rankingDisplay.getComponent(cc.WXSubContextView).update();
            }, 100);
            setTimeout(()=>{
                if (!self || !self.rankingDisplay) return;
                if(this.rankingDisplay && this.rankingDisplay.getComponent(cc.WXSubContextView)){
                    this.rankingDisplay.getComponent(cc.WXSubContextView).update();
                }
            },1000)
            setTimeout(()=>{
                if (!self || !self.rankingDisplay) return;
                if(this.rankingDisplay && this.rankingDisplay.getComponent(cc.WXSubContextView)){
                    this.rankingDisplay.getComponent(cc.WXSubContextView).update();
                }
            },6000)

        }

    },
    
    /**
     * 
     * @param {Object} options 
     * {
     *  {string} key:玩法的key
     *  {function} onHide: 关闭时执行的function
     *  {function} onGoPlayToo:我也来玩一局执行的方法
     *  {string} groupShareTitle：分享查看其他群排行的的标题
     *  {string} groupShareImage：分享查看其他群排行的的图片
     * }
     */
    showGroupList(options) {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
            if (!options || !options.key) {
                console.error('玩法key为空')
                return;
            }

            if (this.rankingBgFull) {
                this.rankingBgFull.x = -1000;
            }else{
                console.error("this.rankingBgFull未定义");
                return;
            }

            if (this.rankingBgGroup) {
                this.rankingBgGroup.x = 0;
            }else{
                console.error("this.rankingBgGroup未定义");
                return;
            }

            if (options.onHide && typeof options.onHide === "function")
                this.groupHideHandler = options.onHide;
            
            //我也来玩一局
            if(options.onGoPlayToo && typeof options.onGoPlayToo === "function")
                var goPlayToo = this.rankingBgGroup.getChildByName("goPlayToo");
                goPlayToo.off(cc.Node.EventType.TOUCH_END);
                goPlayToo.on(cc.Node.EventType.TOUCH_END, function (event) {
                    options.onGoPlayToo();
                });

            var self = this;
            var otherGroup = this.rankingBgGroup.getChildByName("otherGroup");
            otherGroup.off(cc.Node.EventType.TOUCH_END);
            otherGroup.on(cc.Node.EventType.TOUCH_END, function (event) {
                self.WXRanking.groupShare(options.key)
            });

            this.WXRanking.showGroupList(options.key, options.shareTicket);

            var self = this;
            setTimeout(function () {
                self.startUpdate = true;
                if (!self || !self.rankingDisplay) return;
                self.rankingDisplay.x = 0;
                self.rankingDisplay.getComponent(cc.WXSubContextView).update();
            }, 100);
            setTimeout(()=>{
                if (!self || !self.rankingDisplay) return;
                if(this.rankingDisplay.getComponent(cc.WXSubContextView)){
                    this.rankingDisplay.getComponent(cc.WXSubContextView).update();
                }
            },1000)
            setTimeout(()=>{
                if (!self || !self.rankingDisplay) return;
                if(this.rankingDisplay.getComponent(cc.WXSubContextView)){
                    this.rankingDisplay.getComponent(cc.WXSubContextView).update();
                }
            },6000)
        }

    },

    /**
     * 显示下一页
     */
    nextPage(){
        this.WXRanking.nextPage();
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },100);
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },200);
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },300);
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },400);
    },
    /**
     * 显示上一页
     */
    lastPage(){
        this.WXRanking.lastPage();
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },100);
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },200);
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },300);
        setTimeout(()=>{
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        },400);
    },
    /**
     * 关闭排行榜
     */
    hideRankingUI() {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {

            //this._isShow = !this._isShow;
            // 发消息给子域
            if (this.rankingBgFull) {
                this.rankingBgFull.x = 1000;
            }
            if (this.rankingBgGroup) {
                this.rankingBgGroup.x = -1000;
            }
            this.rankingDisplay.x = -1000;

            this.WXRanking.hide();

            if (this.fullHideHandler) {
                this.fullHideHandler();
                this.fullHideHandler = null;
            }
            if (this.groupHideHandler) {
                this.groupHideHandler();
                this.groupHideHandler = null;
            }

            let self = this;
            setTimeout(function () {
                self.startUpdate = false;
            }, 100)
        }
    },

    onReceiveGroupRankingEvent(callback){
        if(callback && typeof callback === 'function'){
            cc.director.getScene().off("CUSTOM_EVENT_SHOW_GROUP_RANKING");
            cc.director.getScene().on("CUSTOM_EVENT_SHOW_GROUP_RANKING",callback);
        }
    },

    _updaetSubDomainCanvas() {
        // if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
        //     if (this.startUpdate) {
        //         this.tex.initWithElement(sharedCanvas);
        //         this.tex.handleLoadedTexture();
        //         this.rankingDisplay.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        //     }
        // }
    },

    update() {
        // if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
        //     this._updaetSubDomainCanvas();
        // }
    },

    start() {
        // if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
        //     this.tex = new cc.Texture2D();
        // }
    },

    // update (dt) {},
});
