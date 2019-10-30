

let CST = require("FC_Constant");
let FC_Msg = require("FC_Msg");
let CF = require("FC_CommFun");
cc.Class({
    extends: cc.Component,

    properties: {
        stockArray : [cc.SpriteFrame],
        progressArray: [cc.SpriteFrame],
        icon: {
            get: function(){
                return this._icon;
            },
            set: function(value){
                this._icon = value;
                if(this.node) this.node.getComponent(cc.Sprite).spriteFrame = this.stockArray[value - 1];
            },
        }
    },

    onLoad () {
        
        //默认不带框
        if(!this.node) return;
        let progress = this.node.getChildByName("progress");
        if(!progress) return;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            progress.opacity = 0;
        }else{
            progress.opacity = 255;
        }
    },

    onEnable: function(){
        // console.log("stock onEnable...");
        this.clear();
        if(!this.node) return;
        let progress = this.node.getChildByName("progress");
        if(!progress) return;
        progress.opacity = 0;


        // console.log("progress..",progress);
        if(FC_Msg.gameType == CST.GAMETYPE.pvp){
            //15s  0.12 ~ 1
            let progressCom = progress.getComponent(cc.Sprite);
            progressCom.fillStart = 0.12;
            progressCom.fillRange = 1;
            progress.opacity = 255;
            let startRange = 0.1;
            let curRange = 1;

            let time = 0;

            progressCom.spriteFrame = this.progressArray[0];
            this.inter = setInterval(function(){
                curRange -= 0.006;
                if(curRange < 0) curRange = 0;
                progressCom.fillRange = curRange;
                if(curRange < 0.6) progressCom.spriteFrame = this.progressArray[1];
                time += 0.1;
                //超时处理
                if(curRange < 0){ //Number(time) > 15
                    progressCom.fillRange = 0;
                    let userSeat = FC_Msg.playerInfo["deskSeatID"];
                    let cur_color = FC_Msg.playerColor[userSeat];
                    // if(FC_Msg.cur_color == cur_color){
                    //     FC_Msg.timeOutTimes[userSeat] += 1 * 1;
                    //     //刷新界面显示
                    //     let parent = cc.find("FC_Game");
                    //     console.log("inter over...");
                    //     if(parent) parent.getComponent("FC_Game").showTimeCount(true,userSeat,true);
                    // }
                    this.clear();
                    return;
                }

                if(Number(curRange) <= 0){
                    progress.opacity = 0;
                    this.clear();

                }
            }.bind(this),100);
        }
    },
    onDisable: function(){
        // console.log("stock onDisable");
        this.clear();
    },
    onDestroy: function(){
        console.log("stock onDestroy");
        this.clear();
    },

    begainStock: function(){
        console.log("begainStock");

        if(CF.stockTimes == 0) return;

        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(G_FC.OpenIdxArr[G_FC.StockOrder] != CST.OpenType.player) return;
            if(G_FC.Update_Command == CST.Update_Command.Stock) return;
            G_FC.Update_Command = CST.Update_Command.Stock;
            CF.stockTimes = 0;
        }else{
            //玩家只能点击自己的 筛子
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            let cur_color = FC_Msg.playerColor[userSeat];
            if(FC_Msg.cur_color != cur_color) return;
            //开始摇筛子
            let message = {
                cmdType: "0x9029",
                data: {
                    data_head: {
                        iRoomID: FC_Msg.roomId,
                        iDeskID: FC_Msg.playerInfo["deskID"],
                        iUserID: FC_Msg.userInfo["userID"],
                    },
                    data_main: {}
                }
            };
            FC_Msg.send(message); 
            this.startEffect(userSeat,FC_Msg.cur_count);
        }
    },

    startEffect: function(idx,count){
        console.log("startEffect..",idx,count);
        if(!this.node) return;
        this.node.getComponent(cc.Animation).play("stockClip");
        return;

        CF.stockTimes = 0;
        let common_order;
        if(idx == undefined){
            common_order = G_FC.StockOrder;
        }else{
            common_order = idx;
        }
        let that = this;
        let num = 0;
        let seq = cc.sequence(
            cc.callFunc(function(){
                num += 1 * 1;
                that.icon = 1;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                that.icon = 2;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                that.icon = 3;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                that.icon = 4;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                that.icon = 5;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                that.icon = 6;
            }),
            cc.callFunc(function(){
                if(Number(num) >= 2){
                    clearTimeout(that.startTime);
                    that.startTime = setTimeout(function(){
                        let userSeat = FC_Msg.playerInfo["deskSeatID"];
                        let cur_color = FC_Msg.playerColor[userSeat];
                        if(FC_Msg.cur_color == cur_color){
                            that.icon = FC_Msg.cur_count;
                            setTimeout(function(){
                                that.stopEffect(FC_Msg.cur_count);
                            },100);
                        }else{
                            that.icon = FC_Msg.cur_count;
                            setTimeout(function(){
                                that.stopEffect(FC_Msg.cur_count);
                                FC_Msg.runNextMsg();
                            },100);
                        }
                    },100);
                }
            }),
        );
        let rep = cc.repeat(seq,2);
        this.node.stopAllActions();
        this.node.runAction(rep);
    },

    stockRunOver: function(){
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let cur_color = FC_Msg.playerColor[userSeat];
        let that = this;
        if(FC_Msg.cur_color == cur_color){
            that.icon = FC_Msg.cur_count;
            setTimeout(function(){
                that.stopEffect(FC_Msg.cur_count);
            },100);
        }else{
            that.icon = FC_Msg.cur_count;
            setTimeout(function(){
                that.stopEffect(FC_Msg.cur_count);
                FC_Msg.runNextMsg();
            },100);
        }
    },


    stopEffect: function(count){
        console.log("stopEffect______________",count);
        if(!this.node) return;
        this.node.stopAllActions();
        if(count != undefined){
            G_FC.Stock_num = FC_Msg.cur_count;
        }
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let cur_color = FC_Msg.playerColor[userSeat];
        if(FC_Msg.cur_color == cur_color){
            this.stopTime = setTimeout(function(){
                let parent = cc.find("FC_Game");
                if(parent){
                    parent.getComponent("FC_Game").ai_player(FC_Msg.cur_count);
                }
            },200);
        }
    },

    clear: function(){
        // console.log("stock clear");
        if(this.inter){
            clearInterval(this.inter);
            this.inter = null;
        }
        if(this.startTime) clearTimeout(this.startTime);
        if(this.stopTime) clearTimeout(this.stopTime);
    },
});
