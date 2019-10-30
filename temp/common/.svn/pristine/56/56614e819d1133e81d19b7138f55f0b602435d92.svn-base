const CCGlobal = require('CCGlobal');
const WXGameClub = require('WXGameClub');
const CCComFun = require('CCComFun');
const CCConst = require('CCConst')
const Stat = require("Statistics")
const WXExamin = require('Examin')

var WXMoreGameBanner = {
    moreGameList: [],   //九宫格的数据
    GYLGameList: null, //猜你喜欢和点击试玩的数据
    event: null,
    statLabel: null,   //小游戏跳转的label
    gameName: null,
    isSkipSuccess: false,
    isTouch: false,
    triangleCtrl(obj) {
        if (CCGlobal.platform != CCConst.PLATFORM.WEIXIN || CCGlobal.apiVer < '2.2.0') return;
        WXExamin.getAreaExamin().then(isShow => {
            console.log("WXExamin", isShow)
            if (!isShow) return;
            let triangleBtn = obj.node;
            triangleBtn.active = true;
            triangleBtn.on('touchend', (e) => {
                if (this.moreGameList && this.moreGameList.length == 0) {
                    CCComFun.getWxServConfig({
                        appId: 'common',
                        success: res => {
                            if (res.cfg != undefined) {
                                let msg = JSON.parse(res.cfg["MGData2"]);    //转换成对象
                                // console.log("grid--msg:",msg);
                                let moreGameData = msg.moreGame;
                                // for (let i = 0; i < msg.GYLData.length; i++) {
                                //     if (msg.GYLData[i].appId == CCGlobal.appInfo.appId) {
                                //         this.GYLGameList = msg.GYLData[i];
                                //         let GYLShowList = this.GYLGameList.guessYouLike;
                                //         for (let j = 0; j < GYLShowList.length; j++) {
                                //             let delData = moreGameData.find((element) => (element.appId == GYLShowList[j].appId));
                                //             if (delData) {
                                //                 let ind = moreGameData.indexOf(delData);
                                //                 moreGameData.splice(ind, 1);
                                //             }
                                //         }

                                //         let delData2 = moreGameData.find((element) => (element.appId == CCGlobal.appInfo.appId));
                                //         if (delData2) {
                                //             let ind2 = moreGameData.indexOf(delData2);
                                //             moreGameData.splice(ind2, 1);
                                //         }
                                //         this.moreGameList = moreGameData;
                                //         this.showTriangle(obj);
                                //     }
                                // }
                                if(this.GYLGameList == null){//跟猜你喜欢的数据去重
                                    CCComFun.getWxServConfig({
                                        appId: CCGlobal.appInfo.appId,   
                                        success: res => {
                                            if (res.cfg != undefined) {                    
                                                let msg = JSON.parse(res.cfg["MGData2"]);    //转换成对象
                                                this.GYLGameList = msg;  //猜你喜欢和点击试玩的数据

                                                let GYLShowList = this.GYLGameList.guessYouLike;  //猜你喜欢的数据
                                                for (let j = 0; j < GYLShowList.length; j++) {
                                                    let delData = moreGameData.find((element) => (element.appId == GYLShowList[j].appId));
                                                    if (delData) {
                                                        let ind = moreGameData.indexOf(delData);
                                                        moreGameData.splice(ind, 1);  //去掉和猜你喜欢一样的数据
                                                    }
                                                }

                                                let delData2 = moreGameData.find((element) => (element.appId == CCGlobal.appInfo.appId));
                                                if (delData2) {
                                                    let ind2 = moreGameData.indexOf(delData2);
                                                    moreGameData.splice(ind2, 1);  //去掉本身
                                                }
                                                this.moreGameList = moreGameData;
                                                this.showTriangle(obj);
                                            }
                                        },
                                        fail: res => {
                                            console.log('后台配置错误');
                                        }
                                    });
                                }else{
                                    let GYLShowList = this.GYLGameList.guessYouLike;  //猜你喜欢的数据
                                    for (let j = 0; j < GYLShowList.length; j++) {
                                        let delData = moreGameData.find((element) => (element.appId == GYLShowList[j].appId));
                                        if (delData) {
                                            let ind = moreGameData.indexOf(delData);
                                            moreGameData.splice(ind, 1);  //去掉和猜你喜欢一样的数据
                                        }
                                    }

                                    let delData2 = moreGameData.find((element) => (element.appId == CCGlobal.appInfo.appId));
                                    if (delData2) {
                                        let ind2 = moreGameData.indexOf(delData2);
                                        moreGameData.splice(ind2, 1);  //去掉本身
                                    }
                                    this.moreGameList = moreGameData;
                                    this.showTriangle(obj);
                                }
                            }
                        },
                        fail: res => {
                            console.log('后台配置错误');
                        }
                    });
                } else {
                    this.showTriangle(obj)
                }
            })

        }).catch(e => {
            console.log(e)
        })
    },
    showTriangle(obj) {
        if (obj.haveGameClub) {
            WXGameClub.hideGameClubButton();
        }
        let triangleBtn = obj.node;
        triangleBtn.active = false;
        let canvas = cc.find('Canvas')
        if (!canvas.hasAddTriangle) {
            let newMoreGame = cc.instantiate(obj.newMoreGame);
            newMoreGame.x = 1200;
            newMoreGame.y = 0;
            // newMoreGame.opacity = 255;
            canvas.addChild(newMoreGame);
            let contentBox = newMoreGame.getChildByName('contentBox');
            contentBox.x = 0;
            let gameMsg = this.moreGameList;
            // 取前九个
            for (let i = 0; i < 9; i++) {
                // 列
                let col = i % 3;
                // 行0,1,2
                let row = Math.floor(i / 3);
                let iconOption = cc.instantiate(obj.iconOption);
                cc.loader.load(gameMsg[i].icon, function (err, texture) {
                    iconOption.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

                });
                iconOption.appId = gameMsg[i].appId;
                iconOption.x = col * 180 - 142;
                iconOption.y = 175 - 180 * row;
                iconOption.skipType = gameMsg[i].skipType;
                if (gameMsg[i].skipType == 1) {
                    iconOption.codeImg = gameMsg[i].imgUrl;
                }
                contentBox.addChild(iconOption)
            }
            canvas.hasAddTriangle = true;
            newMoreGame.getComponent(cc.Animation).play('openMoreGame');
            newMoreGame.on("touchend", (e) => {
                if (obj.haveGameClub) {
                    WXGameClub.showGameClubButton();
                }
                newMoreGame.getComponent(cc.Animation).play('closeMoreGame');
                triangleBtn.active = true;
            })
        } else {
            let newMoreGame = canvas.getChildByName('Grid');
            newMoreGame.getComponent(cc.Animation).play('openMoreGame');
        }
    },

    // 获取猜你喜欢以及点击试玩的数据
    GYLDataCtrl(obj) {
        if (CCGlobal.platform != CCConst.PLATFORM.WEIXIN || CCGlobal.apiVer < '2.2.0') return;
        WXExamin.getAreaExamin().then(isShow => {
            if (!isShow) return;
            if (this.GYLGameList == null) {
                CCComFun.getWxServConfig({
                    appId: CCGlobal.appInfo.appId,   //'common'
                    success: res => {
                        if (res.cfg != undefined) {
                            if (!obj || !obj.node || !obj.node.parent) return;
                            // let msg = JSON.parse(res.cfg["MGData2"]);    //转换成对象 
                            // let moreGameData = msg.moreGame;

                            let msg = JSON.parse(res.cfg["MGData2"]);    //转换成对象
                            // console.log("msg:",msg, typeof msg) 
                            obj.node.parent.active = true;                            
                            this.GYLGameList = msg;
                            wx.setStorage({key: "GYLGameList", data: JSON.stringify(this.GYLGameList)})                         
                            this.showGYL(obj);
                           
                            // for (let i = 0; i < msg.GYLData.length; i++) {
                            //     if (msg.GYLData[i].appId == CCGlobal.appInfo.appId) {
                            //         this.GYLGameList = msg.GYLData[i];
                            //         wx.setStorage({key: "GYLGameList", data: JSON.stringify(this.GYLGameList)})
                            //         let GYLShowList = this.GYLGameList.guessYouLike;
                            //         for (let j = 0; j < GYLShowList.length; j++) {
                            //             let delData = moreGameData.find((element) => (element.appId == GYLShowList[j].appId));
                            //             if (delData) {
                            //                 let ind = moreGameData.indexOf(delData);
                            //                 moreGameData.splice(ind, 1);
                            //             }
                            //         }
                            //         let delData2 = moreGameData.find((element) => (element.appId == CCGlobal.appInfo.appId));
                            //         if (delData2) {
                            //             let ind2 = moreGameData.indexOf(delData2);
                            //             moreGameData.splice(ind2, 1);
                            //         }
                            //         this.moreGameList = moreGameData;
                            //         this.showGYL(obj);
                            //     }
                            // }
                        }
                    },
                    fail: res => {
                        console.log('后台配置错误');
                        let data = cc.sys.localStorage.getItem("GYLGameList");   //2019.08.08-ddq
                        if (data) {
                            this.GYLGameList = JSON.parse(data);
                            if (this.GYLGameList) {
                                this.showGYL(obj)
                            }
                        }
                    }
                });
            } else {
                if (!obj || !obj.node || !obj.node.parent) return;
                obj.node.parent.active = true;
                this.showGYL(obj)
            }
        }).catch(e => {
            console.log(e)
        })
    },
    showGYL(obj) {
        let self = this;
        self.registerSkipStatEvent();
        let GYLNode = obj.node;
        let showData = null;
        let interfaceId = obj.interface ? obj.interface : "index";
        // if (interfaceId !== "index") {
        //     let k = "guessYouLike_" + interfaceId;
        //     showData = this.GYLGameList[k];
        // } else {
        //     showData = this.GYLGameList.guessYouLike;            
        // }

        showData = this.GYLGameList.guessYouLike;   //新版本。所有界面都只用一套数据
        if (!showData || showData.length == 0) {
            if (!obj || !obj.node || !obj.node.parent) return;
            obj.node.parent.active = false;
            return;
        }
        //showData = showData.concat(showData)

        let cicleNum = showData.length;
        let space
        if (cicleNum <= 4) {
            GYLNode.width = 720;
            space = (720 - 140 * cicleNum) / (cicleNum + 1)
        } else {
            GYLNode.width = 140 * cicleNum + 15 * (cicleNum + 1);
            space = 15
        }
        for (let i = 0; i < cicleNum; i++) {
            let name1 = "spNode" + i;      //图片节点name  //2019.08.08-ddq
            let name2 = "labelNode" + i;    //文字节点name    
            let node = null;
            let sp = null;
            let labelNode = null;
            let label = null;
            let cn1 = GYLNode.getChildByName(name1);
            if (cn1) {
                node = cn1;
                labelNode = node.getChildByName(name2);
                sp = node.getComponent(cc.Sprite);
                label = labelNode.getComponent(cc.Label);
            } else {
                node = new cc.Node('Sprite');
                labelNode = new cc.Node();
                sp = node.addComponent(cc.Sprite);
                label = labelNode.addComponent(cc.Label);
            }

            node.name = name1;
            labelNode.name = name2;
            label.string = showData[i].name;
            label.fontSize = 26;
            label.lineHeight = 30;
            label.color = new cc.color(255, 0, 0);
            node.x = space + 70 + (140 + space) * i;
            node.parent = GYLNode;
            node.y = 15;
            labelNode.x = 0;
            labelNode.y = -95;
            labelNode.parent = node;
            cc.loader.load(showData[i].icon, function (err, texture) {
                if (node.parent) {
                    sp.spriteFrame = new cc.SpriteFrame(texture);
                    node.width = 140;
                    node.height = 140;
                }
            });
            node.on('touchend', (e) => {
                if (self.isTouch) return;
                self.isTouch = true;
                let skipBuff = showData[i].appId;
                let pathUrl = showData[i].path;  //  ?scene=duobite
                let statLabel = "guess_" + interfaceId + "_" + showData[i].pinyin;
                self.statLabel = statLabel;
                self.gameName = showData[i].pinyin
                Stat.reportEvent("clickIcon", statLabel, "count");
                let st = "clickIcon" + self.gameName;
                let firstClick = cc.sys.localStorage.getItem(st);
                if (!firstClick) {
                    wx.setStorage({key: st, data: "true"});
                    Stat.reportEvent("firstClick", self.gameName, "count");

                }
                wx.navigateToMiniProgram({
                    appId: skipBuff,
                    path: pathUrl,
                    success: function (res) {
                        self.isSkipSuccess = true;
                    },
                    fail: function (err) {
                        Stat.reportEvent("fail", statLabel, "count")
                    },
                    complete: function () {
                        self.isTouch = false;
                    }
                })
            })
        }
    },

    //注册成功跳转游戏的数据上报
    registerSkipStatEvent: function () {
        if (!this.event) this.event = new cc.EventTarget();
        this.event.off("skipSuccess");
        this.event.on("skipSuccess", this.skipSuccess, this);
    },
    skipSuccess: function () {
        if (WXMoreGameBanner.isSkipSuccess) {
            WXMoreGameBanner.isSkipSuccess = false;
            let event = [WXMoreGameBanner.statLabel, WXMoreGameBanner.gameName];
            for (let i = 0; i <= 1; i++) {
                if (event[i]) {
                    let firstClick = cc.sys.localStorage.getItem(event[i]);
                    if (!firstClick) {
                        wx.setStorage({key: event[i], data: "true"});
                        Stat.reportEventNow("success", event[i]);
                    }
                }
            }
        }
    },
}

module.exports = WXMoreGameBanner;