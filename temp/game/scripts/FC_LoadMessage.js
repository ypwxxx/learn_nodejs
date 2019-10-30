let CST = require("FC_Constant");
let CCComFun = require("CCComFun");
let CF = require("FC_CommFun");
let FC_UtilFunc = require("FC_UtilFunc");
let WXGameClub = require("WXGameClub");
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    onLoad () {
        this.isShow = WXGameClub.isShow;
        CF.hideGameClubButton();
    },

    onEnable: function(){
        console.log("loadmessage onEnable..");
        this.totalTimes = 0;
        this.showBtn(false);
        this.showContent();
        this.startAction();
    },

    onDisable: function(){
        if(this.loadInter) clearTimeout(this.loadInter);
        //游戏圈问题
        if(this.isShow){
            CF.showGameClubButton();
        }
    },

    showContent: function(){
        if(!this.node) return;
        let des = this.node.getChildByName("des");
        if(!des) return;
        des.opacity = 255;
        if(!FC_UtilFunc.tips || FC_UtilFunc.tips == "") des.opacity = 0;
        let str_tip = CST.Command_Tips["" + FC_UtilFunc.tips];
        let root_des = des.getComponent(cc.Label);
        if(!root_des) return;
        root_des.string = str_tip;
    },
    startAction: function(){
        if(!this.node) return;
        CF.addNodeListener(this.node);
        var action = cc.repeatForever(cc.rotateBy(1,360));
        let sp = this.node.getChildByName("sp");
        if(!sp) return;
        this.stopAction();
        sp.runAction(action);
        this.loadInter = setInterval(function(){
            if(!FC_UtilFunc.tips || FC_UtilFunc.tips == "" || FC_UtilFunc.tips == "15"){
                this.stopAction();
                console.log("destroy node");
                if(this.node) this.node.destroy();
                this.clear();
            }else{
                this.totalTimes += 5;
                if(Number(this.totalTimes) >= 30){
                    this.totalTimes = 0;
                    this.showBtn(true);
                }
            }
        }.bind(this),5000);

    },
    stopAction: function(){
        if(!this.node) return;
        let sp = this.node.getChildByName("sp");
        if(!sp) return;
        sp.stopAllActions();
    },
    start () {

    },
    btn_connect: function(){
        this.showBtn(false);
    },

    btn_close: function(){
        cc.director.loadScene("FC_Menu");
    },

    showBtn: function(isBool){
        let reconnect = this.node.getChildByName("reconnect");
        let close = this.node.getChildByName("close");
        reconnect.active = isBool;
        close.active = isBool;
    },

    clear: function(){
        if(this.loadInter) clearInterval(this.loadInter);
    },
    

});
