const WXGameClub = require('WXGameClub');
const WXFeedBack = require('WXFeedBack');
const CCGlobal = require('CCGlobal');
const CWXRanking = require('WXRanking')
const {ccclass, property} = cc._decorator;


@ccclass
export default class PublicAccount extends cc.Component {
    @property
    rank: boolean = true;
    @property
    ClubColor: string = "";
    @property
    ClubSize: number = 0;
    @property
    setClubHight: boolean = true;
    @property
    FeedBackSize: number = 0;
    @property
    setFeedBackHight: boolean = true;
    @property(cc.Prefab)
    rankingUIStart: cc.Prefab = null;
    @property(cc.Node)
    firstScreen: cc.Node = null;
    @property(cc.Label)
    information: cc.Label = null;
    @property(cc.Node)
    Club: cc.Node = null;
    @property(cc.Node)
    FeedBack: cc.Node = null;
    @property
    _gameData: any = null;
    @property
    _screenInfo: any = null;


    public onLoad() {
        //解决缓存异步问题
        cc.sys.localStorage.setItem = (key, value) => {
            wx.setStorage({key: key, data: value});
        };
        this.node.zIndex = 100;
        if (!window.First) {
            window.First = 1
        } else if (First == 2) {
            this.firstScreen.active = false
        }
        this.initMsg();
    };

    public initMsg() {
        this._gameData = CCGlobal.multiData
        this._screenInfo = CCGlobal.appInfo.screenInfo
        //初始化游戏圈
        this.GameClub();
        //初始化反馈
        this.GameFeedBack();
        //开屏信息
        this.information.string = this._screenInfo
        this.openScreen()
        //初始化排行榜
        if (this.rank && this.rankingUIStart) {
            let WXRanking = CWXRanking.getInstance();
            WXRanking.init(CCGlobal.multiKey, CCGlobal.mainKey.name);
            WXRanking.initShare(CCGlobal.multiData);
            let rankingNode = cc.instantiate(this.rankingUIStart);
            this.node.addChild(rankingNode);
            rankingNode.x = 0;
            rankingNode.y = 0;
            cc.director.getScene().off("CUSTOM_EVENT_SHOW_GROUP_RANKING");
            cc.director.getScene().on("CUSTOM_EVENT_SHOW_GROUP_RANKING", (event) => {
                let gameKey
                let groupShareTicket
                if (event.detail) {
                    gameKey = event.detail.gameKey;
                    groupShareTicket = event.detail.shareTicket;
                } else {
                    gameKey = event.gameKey;
                    groupShareTicket = event.shareTicket;
                }

                let gameOnGoPlayToo = null;
                setTimeout(() => {
                    for (let i = 0; i < this._gameData.length; i++) {
                        if (gameKey == this._gameData[i].name) {
                            gameOnGoPlayToo = () => {
                                cc.director.preloadScene(this._gameData[i].gameScene, () => {
                                    First = 2
                                    rankingNode.getComponent("RankingUIStart").hideRankingUI()
                                    WXGameClub.hideGameClubButton();
                                    WXFeedBack.hideFeedBackButton();
                                    setTimeout(() => {
                                        cc.director.loadScene(this._gameData[i].gameScene);
                                    }, 20);
                                });
                            }
                        }
                    }
                    WXGameClub.hideGameClubButton()
                    rankingNode.getComponent("RankingUIStart").showGroupList({
                        onHide: function () {
                            WXGameClub.showGameClubButton()
                            WXFeedBack.showFeedBackButton()
                        },
                        onGoPlayToo: gameOnGoPlayToo,
                        key: gameKey,
                        shareTicket: groupShareTicket
                    }, this);
                }, 2000);  //这个时长自己决定，主要是要给版号展示一定的时间
            });
        }
        ;
    };

    private openScreen() {
        if (First === 1) {
            WXGameClub.hideGameClubButton()
            WXFeedBack.hideFeedBackButton()
            this.firstScreen.active = true
            let callback = cc.callFunc(function () {
                this.firstScreen.active = false
                First = 2
            }, this)
            let show = cc.sequence(cc.fadeOut(0.5), callback)
            this.scheduleOnce(function () {
                this.firstScreen.runAction(show)
            }, 0.6);
            this.scheduleOnce(function () {
                WXGameClub.showGameClubButton()
                WXFeedBack.showFeedBackButton()
            }, 1.2);
        }
    };

    private GameClub() {
        let systemInfo = wx.getSystemInfoSync();
        let frameSize = cc.view.getFrameSize();
        var size = (this.ClubSize ? this.ClubSize : 70) * (systemInfo.windowWidth / cc.visibleRect.width);
        let pos = this.Club.parent.convertToWorldSpaceAR(this.Club.position);
        let total = cc.view.getVisibleSize().height;   //渲染高度
        var statusBarHeight = systemInfo.statusBarHeight ? systemInfo.statusBarHeight : (1 - (pos.y / total)) * systemInfo.windowHeight - size / 2;
        let h = (1 - ((pos.y) / total)) * systemInfo.windowHeight - size / 2;
        let left = (pos.x / cc.visibleRect.width) * systemInfo.windowWidth - size / 2;
        let obj = {
            icon: this.ClubColor ? this.ClubColor : "white",
            style: {
                left: left,
                top: this.setClubHight ? h : statusBarHeight,
                width: size,
                height: size,
            }
        };
        WXGameClub.createGameClubButton(obj)
    };

    private GameFeedBack() {
        let systemInfo = wx.getSystemInfoSync();
        let frameSize = cc.view.getFrameSize();
        var size = (this.FeedBackSize ? this.FeedBackSize : 70) * (systemInfo.windowWidth / cc.visibleRect.width);
        let pos = this.FeedBack.parent.convertToWorldSpaceAR(this.FeedBack.position);
        let total = cc.view.getVisibleSize().height;   //渲染高度
        var statusBarHeight = systemInfo.statusBarHeight ? systemInfo.statusBarHeight : (1 - (pos.y / total)) * systemInfo.windowHeight - size / 2;
        let h = (1 - ((pos.y) / total)) * systemInfo.windowHeight - size / 2;
        let left = (pos.x / cc.visibleRect.width) * systemInfo.windowWidth - size / 2;
        let obj = {
            type: "image",
            style: {
                left: left,
                top: this.setFeedBackHight ? h : statusBarHeight,
                width: size,
                height: size,
            }
        };
        WXFeedBack.createFeedBackButton(obj)
        WXFeedBack.initFeedBackNode(this.FeedBack)
        this.FeedBack.width = this.FeedBackSize ? this.FeedBackSize : 70;
        this.FeedBack.height = this.FeedBackSize ? this.FeedBackSize : 70;
        this.FeedBack.y = this.setFeedBackHight ? this.FeedBack.y : cc.visibleRect.height / 2 - statusBarHeight * cc.visibleRect.height / systemInfo.windowHeight - this.FeedBack.height / 2;


    };

}


