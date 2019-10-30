/**
 * 游戏界面排行榜
 */

const CCConst = require('CCConst')
const CCGlobal = require('CCGlobal')
var CWXRanking = require('WXRanking')
var WXGameClub = require('WXGameClub')
const AdsFunc = require('WXAdsFunc')

cc.Class({
    extends: cc.Component,

    properties: {
        rankingDisplay: cc.Node,
        rankingBgFull: cc.Node,
        rankingBgSimp: cc.Node,
        click: cc.Node,
    },
    onLoad() {
        this.rankingDisplay.getComponent(cc.WXSubContextView).enabled = false;
        //this.startUpdate = false;
        this.simpHideHandler = null;
        this.WXRanking = CWXRanking.getInstance();
        // if (sharedCanvas) {
        //     sharedCanvas.width = cc.game.canvas.width * 2;
        //     sharedCanvas.height = cc.game.canvas.height * 2;
        // }
    },

    /**
     *
     * @param {string} key 玩法的key
     * @param {int} record 新记录，如果是分秒的形式，这里传的是秒
     */
    updateNewRecord(key, record) {
        if (!key) {
            console.error('玩法key未传入')
            return;
        }
        if (record == undefined) {
            console.error('分数record未传入')
            return;
        }

        this.WXRanking.updateNewRecord(key, record);
    },

    /**
     * 显示三人排行界面
     * @param {Object} options
     * {
     *  {function} onHide: 关闭时执行的function
     *  {int} newScore: 本次得分
     *  {function} onShare:点击分享
     *  {function} onChallenge:点击发起挑战
     *  {function} onReplay:点击重玩
     *  {function} onReturnMain:点击返回首页
     *  {string} key:玩法key
     * }
     */
    showSimpList(options) {
        this.click.active = true;
        if (!options || !options.key) {
            console.error('玩法key未传入');
            return;
        }

        if (this.rankingBgFull) {
            this.rankingBgFull.x = 1000;
        } else {
            console.error("this.rankingBgFull未定义");
            return;
        }

        if (this.rankingBgSimp) {
            this.rankingBgSimp.x = 0;
        } else {
            console.error("this.rankingBgSimp未定义");
            return;
        }

        //游戏圈按钮
        if (CCGlobal.apiVer > "2.0.2") {
            if (cc.find('rankingBgSimp/gameClubPos', this.node)) {
                this.gameClubPos = cc.find('rankingBgSimp/gameClubPos', this.node);
                let gameClubWorldPos = this.gameClubPos.parent.convertToWorldSpaceAR(this.gameClubPos.position);
                let totalHight = cc.view.getVisibleSize().height;
                let totalwidth = cc.view.getVisibleSize().width;
                let offsetY = (1560 - totalHight) / 2
                let posLeft = gameClubWorldPos.x;
                let posTop = totalHight - gameClubWorldPos.y;
                let widthRate = G.screenWidth / totalwidth;
                let heightRate = G.screenHeight / totalHight;
                var nodeWidth = 117;
                var nodeHeight = 123;
                WXGameClub.createGameClubButton({
                    type: "image",
                    icon: "white",
                    style: {
                        left: (posLeft - nodeWidth / 2) * widthRate,
                        top: (posTop - nodeHeight / 2) * heightRate,
                        width: nodeWidth * widthRate,
                        height: nodeHeight * heightRate
                    }
                });
            }
            else {
                let replayBtn = this.rankingBgSimp.getChildByName("challengeBtn").getChildByName("replayBtn")
                let worldPosition = replayBtn.parent.convertToWorldSpaceAR(replayBtn)
                let totalHight = cc.view.getVisibleSize().height
                let h = (1 - (worldPosition.y / totalHight)) * wx.getSystemInfoSync().windowHeight - 22.5;
                let w = 0.25 * wx.getSystemInfoSync().windowWidth - 45;

                WXGameClub.createGameClubButton({
                    icon: 'white',
                    style: {
                        left: w,
                        top: h,
                        width: 45,
                        height: 45
                    }
                })
                WXGameClub.showGameClubButton();
            }

        }
        if (CCGlobal.version >= '6.7.1') {
            let tipBtn = this.rankingBgSimp.getChildByName("addToIOS")
            let shareBtn = this.rankingBgSimp.getChildByName("shareBtn");
            let h = wx.getSystemInfoSync().windowHeight;
            let w = wx.getSystemInfoSync().windowWidth;
            let Action = cc.repeatForever(
                cc.sequence(cc.moveBy(1, cc.p(20, 0)), cc.moveBy(1, cc.p(-20, 0)))
            )
            tipBtn.runAction(Action)
            if (w == 375 && h == 812) {
                tipBtn.y = h / 10 * 8 / (h / 1560) / 2 + 40
            } else if (h >= 780 && h <= 790) {
                tipBtn.y = shareBtn.y + 10
            } else if (h == 667) {
                tipBtn.y = shareBtn.y + 60
            } else if (w == 360 && h == 760) {
                tipBtn.y = h / 10 * 8 / (h / 1560) / 2 + 30
            } else if (h == 896) {
                tipBtn.y = shareBtn.y
            } else {
                tipBtn.y = shareBtn.y + 70
            }
        } else {
            let tipBtn = this.rankingBgSimp.getChildByName("addToIOS")
            tipBtn.active = false
        }

        let self = this;

        if (options && options.onHide && typeof options.onHide === "function")
            this.simpHideHandler = options.onHide;

        //排行榜背景的分数显示出来
        if (options && options.newScore) {
            this.rankingBgSimp.getChildByName("score").getComponent(cc.Label).string = options.newScore;
        }

        if (options && options.onShare && typeof options.onShare === "function") {
            let shareBtn = this.rankingBgSimp.getChildByName("shareBtn");
            shareBtn.off(cc.Node.EventType.TOUCH_END);
            // shareBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            //     options.onShare();
            // }, this);
        }

        let challengBtn = this.rankingBgSimp.getChildByName("challengeBtn");
        if (options && options.onChallenge && typeof options.onChallenge === "function") {
            challengBtn.off(cc.Node.EventType.TOUCH_END);
            challengBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                options.onChallenge();
            }, this);
        }

        challengBtn.getChildByName("groupRanking").off(cc.Node.EventType.TOUCH_END);
        challengBtn.getChildByName("groupRanking").on(cc.Node.EventType.TOUCH_END, function (event) {
            wx.shareAppMessage({
                title: options.groupShareTitle ? options.groupShareTitle : null,
                imageUrl: options.groupShareImage ? options.groupShareImage : null,
                query: "showGroupRanking=1&gameKey=" + options.key,
                success: function (res) {
                    console.log('群排行分享 成功');
                    console.log(res);
                },
                fail: function (res) {
                    console.log('群排行分享 失败');
                    console.log(res);
                }
            });
            event.stopPropagation(); //事件不能往上传递
        }, this);

        if (options && options.onReplay && typeof options.onReplay === "function") {

            challengBtn.getChildByName("replayBtn").off(cc.Node.EventType.TOUCH_END);
            challengBtn.getChildByName("replayBtn").on(cc.Node.EventType.TOUCH_END, function (event) {
                AdsFunc.hideBanner();
                self.hideRankingUI();
                options.onReplay();
                event.stopPropagation();
            }, this);
        }

        if (options && options.onReturnMain && typeof options.onReturnMain === "function") {

            this.rankingBgSimp.getChildByName("mainBtn").off(cc.Node.EventType.TOUCH_END);
            this.rankingBgSimp.getChildByName("mainBtn").on(cc.Node.EventType.TOUCH_END, function (event) {
                AdsFunc.hideBanner();
                self.hideRankingUI();
                options.onReturnMain();
                event.stopPropagation();
            }, this);
        }

        //更多游戏按钮

        this.WXRanking.showSimpList(options.key);
        setTimeout(function () {
            if (!self || !self.rankingDisplay) return;
            self.startUpdate = true;
            self.rankingDisplay.x = 0;
            self.rankingDisplay.getComponent(cc.WXSubContextView).update();
            let model = {
                key: options.key,
                pos: 'banner4'
            }
            //AdsFunc.createNewBanner(model,1,false);
            AdsFunc.showBanner();
        }, 100);
        setTimeout(() => {
            if (!self || !self.rankingDisplay) return;
            if (self.rankingDisplay.getComponent(cc.WXSubContextView)) {
                self.rankingDisplay.getComponent(cc.WXSubContextView).update();
            }
        }, 1000)

    },
    /**
     * 从三人排行点到到全排行
     *
     */
    showFullListFromSimp() {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
            //移除广告
            AdsFunc.hideBanner();
            if (this.rankingBgSimp) {
                this.rankingBgSimp.x = -1000;
            }
            if (this.rankingBgFull) {
                this.rankingBgFull.x = 0;
            }

            this.WXRanking.showFriendListFromSimp();
            WXGameClub.hideGameClubButton();
        }
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 100);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            if (this.rankingDisplay.getComponent(cc.WXSubContextView)) {
                this.rankingDisplay.getComponent(cc.WXSubContextView).update();
            }
        }, 1000)

    },

    /**
     *
     * 从结束界面的全体排行返回到三人排行界面
     */
    showSimpListBackFromFull() {
        //游戏圈按钮
        WXGameClub.showGameClubButton();
        //添加广告
        AdsFunc.showBanner();
        let self = this;

        if (this.rankingBgFull) {
            this.rankingBgFull.x = 1000;
        }
        if (this.rankingBgSimp) {
            this.rankingBgSimp.x = 0;
        }
        this.WXRanking.showSimpListBackFromFriend();
        setTimeout(() => {
            if (!self || !self.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 100);
        setTimeout(() => {
            if (!self || !self.rankingDisplay) return;
            if (this.rankingDisplay.getComponent(cc.WXSubContextView)) {
                this.rankingDisplay.getComponent(cc.WXSubContextView).update();
            }
        }, 1000)

    },


    /**
     * 显示即将超越下一个人
     * @param {string} key 玩法key
     * @param {number} score 当前得分
     * @param {number} posY 展示的 Y坐标位置，默认为0
     */
    showPassNext(key, score, posY) {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
            if (!key) {
                console.error('玩法key未传入');
                return;
            }
            if (score == undefined) {
                console.error('玩法key未传入');
                return;
            }

            if (this.rankingBgSimp) {
                this.rankingBgSimp.x = -1000;
            }
            if (this.rankingBgFull) {
                this.rankingBgFull.x = 1000;
            }
            this.WXRanking.showPassNext(key, score, posY);
            var self = this;
            setTimeout(function () {
                self.startUpdate = true;
                if (!self || !self.rankingDisplay) return;
                self.rankingDisplay.x = 0;
                self.rankingDisplay.getComponent(cc.WXSubContextView).update();
            }, 100);
            setTimeout(() => {
                if (!self || !self.rankingDisplay) return;
                if (this.rankingDisplay.getComponent(cc.WXSubContextView)) {
                    this.rankingDisplay.getComponent(cc.WXSubContextView).update();
                }
            }, 1000)
        }

    },
    /**
     * 显示下一页
     */
    nextPage() {

        this.WXRanking.nextPage();
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 100);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 200);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 300);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 400);

    },
    /**
     * 显示上一页
     */
    lastPage() {
        this.WXRanking.lastPage();
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 100);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 200);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 300);
        setTimeout(() => {
            if (!this || !this.rankingDisplay) return;
            this.rankingDisplay.getComponent(cc.WXSubContextView).update();
        }, 400);
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
            if (this.rankingBgSimp) {
                this.rankingBgSimp.x = -1000;
            }
            this.rankingDisplay.x = -1000;

            this.WXRanking.hide();

            if (this.simpHideHandler) {
                this.simpHideHandler();
                this.simpHideHandler = null;
            }

            let self = this;
            setTimeout(function () {
                self.startUpdate = false;
            }, 100)
            WXGameClub.hideGameClubButton();
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
