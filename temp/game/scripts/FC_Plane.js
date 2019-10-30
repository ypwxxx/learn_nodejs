// let obj = {};
// obj.Order = order;
// obj.PlayerType = type1;
// obj.HeadType = type2;
// obj.ActiveType = CST.ActiveType.unActive;
// obj.Ori_idx = idx;
// obj.Current_idx = 0;
// obj.Start_idx = this.getStartOut_idx(type1);
// obj.Dest_idx = this.getDestOut_idx(type1);;
// obj.StepNumber = 0;
// obj.FlyLineType = CST.FlyLineType.Line_Out;
// obj.FlyPosArr = [];

//FlyPosArr结构 修改


let CST = require("FC_Constant");
let CF = require("FC_CommFun");
let FC_Msg = require("FC_Msg");
cc.Class({
    extends: cc.Component,
    properties: {
        planeArray  :[cc.SpriteFrame],
        
        interactable: {
            get: function(){
                return this._interactable;
            },
            set: function(value){
                this._interactable = value;
                if(this.node) this.node.getComponent(cc.Button).interactable = value;
            },
        },
        icon: {
            get: function(){
                return this._icon;
            },
            set: function(value){
                this._icon = value;
                if(this.node) {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.planeArray[value];
                    if(this._icon == 4){
                        this.node.rotation = 0;
                    }
                }
            },
        },
        direction:{
            get: function(){
                return this._direction;
            },
            set: function(value){
                this._direction = value;
                // console.log("direction icon: ",this._icon,value);
                if(this._icon == 4){
                    if(this.node) this.node.getComponent(cc.Sprite).spriteFrame = this.planeArray[this._icon];
                }else{
                    // if(this.node) this.node.getComponent(cc.Sprite).spriteFrame = this["direction_" + this.node.data.PlayerType][value];
                    //设置旋转角度
                    if(this.node) this.node.rotation = this._direction * 90;
                }
            },
        },
    },
    
    onLoad () {
        this.interactable = false;//默认不可点击
		this.icon = this.planeArray[0];
    },
    update (dt) {
    },
    touchPlane: function(){
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(G_FC.OpenIdxArr[G_FC.StockOrder] != CST.OpenType.player) return;
        }else{
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            let cur_color = FC_Msg.playerColor[userSeat];
            if(FC_Msg.cur_color != cur_color) return;
        }
        console.log("touchPlane: ",CF.isWaitCommand);
        //如果走ai的情况下 不能点击棋子
        if(!CF.isWaitCommand){
            return;
        }
        CF.isWaitCommand = false;
        CF.stopAllPlaneAction();
        if(!this.node) return;
        if(!this.node.data) return;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(this.node.data.ActiveType == CST.ActiveType.unActive){//激活
                CF.activePlane(this.node.data.Order);
            }else if(this.node.data.ActiveType == CST.ActiveType.Stand){ //已激活 直接移动
                CF.FlyStandPlane(this.node.data.Order);
            }
        }else{
            if(this.node.data.ActiveType == CST.ActiveType.unActive){//激活
                CF.sendRunAction(this.node.data.Order,0); //通知服务器
            }else if(this.node.data.ActiveType == CST.ActiveType.Stand){ //已激活 直接移动
                CF.sendRunAction(this.node.data.Order,1);//通知服务器
            }
        }
        
    },
});
