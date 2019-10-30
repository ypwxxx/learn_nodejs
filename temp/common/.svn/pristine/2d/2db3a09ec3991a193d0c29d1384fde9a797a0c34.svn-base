const WxMoreGame = require('ClickDemoCore');
const CCGlobal = require('CCGlobal');
const CCComFun = require('CCComFun');
const Stat = require("Statistics");
const WXExamin = require('Examin');

const {ccclass, property} = cc._decorator;


@ccclass
export default class ClickToDemo extends cc.Component {

    @property
    interface: string = "";
    @property
    _config: any = {
        interfaceId: null,
        QRCodesList: null,
        currentData: null,
        currentNum: -1,
        appId: null,
        pathUrl: null,
        pinyin: null,
        iconUrl: null,
        QRUrl: null,
    };
    @property
    _state: any = {
        statLabel: null,
        gameName: null,
        isSkipSuccess: false,
        timeID: null,
        count: 0,
        touchDemoGame: false,
        countTime: 20
    };

    public start() {
        this.ClickToDemo();
        cc.game.on(cc.game.EVENT_SHOW, this.skipEmit, this)
    };

    public skipEmit() {
        if (this._state && this._state.isSkipSuccess) {
            this._state.isSkipSuccess = false;
            let eventArr = [this._state.statLabel, this._state.gameName];
            WxMoreGame.event && WxMoreGame.event.emit("skipSuccess_demo", eventArr);
        }
    };

    public onDestroy() {
        if (this._state.timeID) {
            this._clearTimeID();
        }
        cc.game.off(cc.game.EVENT_SHOW, this.skipEmit, this)
    };

    public ClickToDemo() {
        this.CreatDemoBtn({
            node: this.node,
            interface: (this.interface ? this.interface : 0)
        })
    };

    private CreatDemoBtn(options) {
        WXExamin.getAreaExamin().then(isShow => {
            if (!isShow) return;
            if (CCGlobal.apiVer > '2.0.2') {
                let url = 'icon';
                if (options && options.node) {
                    options.node.off('touchend', this.clickToDemoGame, this);
                    options.node.on('touchend', this.clickToDemoGame, this);
                } else {
                    console.error('creatDemoBtn中node未定义');
                }
                if (options.interface) {
                    this._config.interfaceId = options.interface;
                } else {
                    this._config.interfaceId = "";
                }

                this._init();
                this._creatCountDown();
            }
        }).catch(e => {
            console.log(e)
        })
    };

    private _init() {
        if (this._config.QRCodesList == null) {//this.iconList.length === 0
            CCComFun.getWxServConfig({
                appId: CCGlobal.appInfo.appId,
                success: res => {
                    if (res.cfg != undefined && res.cfg.MGData2 != undefined) {                        
                        let msg = JSON.parse(res.cfg.MGData2);//转换成对象                        
                        if (!this || !this._config) return;
                        this._config.QRCodesList = msg.clickDemo_game;    
                        // console.log('点击试玩：', this._config.QRCodesList)
                        this.initInterfaceData();
                        this._changeMoreGameBtnIcon();
                    }
                },
                fail: res => {
                    console.log('后台配置错误');
                }
            });
        } else {
            this.initInterfaceData();
            this._changeMoreGameBtnIcon();
        }
    };

    private initInterfaceData() {
        if (this._config.interfaceId) {
            let key = "clickDemo_" + this._config.interfaceId;
            // this._config.currentData = this._config.QRCodesList[key]
            this._config.currentData = this._config.QRCodesList;   //新版本的数据配置，所有页面使用同一个配置
            WxMoreGame.registerSkipStatEvent();
        }
    };

    //改变更多游戏按钮的图标的索引
    private _changeMoreGameBtnIcon() {
        if (!this || !this._config.currentData || !this._config.currentData.length) return;
        if (this._config.currentNum == -1) {
            this._config.currentNum = Math.round(Math.random() * (this._config.currentData.length - 1));
        } else {
            this._config.currentNum = (Math.round(Math.random() * Math.ceil(this._config.currentData.length / 2)) + this._config.currentNum + 1) % this._config.currentData.length;
        }
        this._config.appId = this._config.currentData[this._config.currentNum].appId;
        this._config.pathUrl = this._config.currentData[this._config.currentNum].path;
        this._config.pinyin = this._config.currentData[this._config.currentNum].pinyin;
        this._config.iconUrl = this._config.currentData[this._config.currentNum].iconUrl;
        this._config.QRUrl = this._config.currentData[this._config.currentNum].url;
        this._changeIcon();
    };

    //更换图标
    private _changeIcon() {
        if (this.node && this.node.name != "") {
            var remoteUrl = this._config.iconUrl;
            cc.loader.load(remoteUrl, (err, texture) => {
                if (!this || !cc.isValid(this.node)) return;
                this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    };

    private clickToDemoGame(event) {
        event.stopPropagation();          //事件不允许向上传递
        if (this._state.touchDemoGame) return;
        this._state.touchDemoGame = true;
        this._state.count = 0;
        //清除计时器,重新开始计时
        this._creatCountDown();
        var self = this;
        //拿APP的配置
        if (CCGlobal.apiVer >= '2.2.0') {
            let QRUrl = this._config.QRUrl;
            let interfaceId = this._config.interfaceId ? this._config.interfaceId : "";
            let statLabel = "clickDemo_" + interfaceId + "_" + this._config.pinyin;
            this._state.statLabel = statLabel;
            this._state.gameName = this._config.pinyin;
            Stat.reportEvent("clickIcon", statLabel, "count")
            let st = "clickIcon" + self._state.gameName;
            let firstClick = cc.sys.localStorage.getItem(st);
            if (!firstClick) {
                wx.setStorage({key: st, data: "true"});
                Stat.reportEvent("firstClick", self._state.gameName, "count");

            }
            if (QRUrl != "" || QRUrl) {
                setTimeout(() => {
                    this.showQRCodes();
                }, 550)
            } else {
                wx.navigateToMiniProgram({
                    appId: this._config.appId,
                    path: this._config.pathUrl,
                    extraData: {},
                    success: function () {
                        self._state.isSkipSuccess = true;
                        self._changeMoreGameBtnIcon();
                    },
                    fail: function (err) {
                        self._changeMoreGameBtnIcon();
                    },
                })
            }

        }

        let time = setTimeout(() => {
            this._state.touchDemoGame = false;
            clearTimeout(time);
        }, 500);
    };

    private showQRCodes() {
        let self = this;
        var imglist = [];
        imglist.push(this._config.QRUrl);
        if (this._state.count == 1 && imglist.length > 0) {
            wx.previewImage({
                current: imglist[0],
                urls: imglist
            })
            this._state.count = 0;
            self._changeMoreGameBtnIcon();
        }
    };

    //创建计时器
    private _creatCountDown() {
        if (!this._state) return;
        if (this._state.timeID) {
            this._clearTimeID();
        }
        this._state.timeID = setTimeout(this._countDown.bind(this), this._state.countTime * 1000);
    };

    private _countDown() {
        if (this.node && this.node.name != "") {
            this._changeMoreGameBtnIcon();
            this._clearTimeID();
            this._creatCountDown();
        } else if (this._state.timeID) {
            this._clearTimeID();
        }
    };

    private _clearTimeID() {
        clearTimeout(this._state.timeID);
        this._state.timeID = null;
    };
}
