let CF = require("FC_CommFun");
let CST = require("FC_Constant");
let FC_Msg = require("FC_Msg");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },


    showTip: function(id){
        // console.log("showTip: ",id);
        if(!this.node) return;
        let label_command = this.node.getChildByName("label_command");
        if(!label_command) {
            this.clear();
            return;
        }

        if(G_FC.Command_Tip_Id == undefined) {
            this.clear();
            return;
        }
        let str_cmd;
        //6/28  只保留两个提示字段
        if(id == undefined){
            if(G_FC.Command_Tip_Id == "6" || G_FC.Command_Tip_Id == "7") {
                str_cmd = CST.Command_Tips["" + G_FC.Command_Tip_Id];
            }
        }else{
            str_cmd = CST.Command_Tips["" + id];
        }
        if(str_cmd == undefined) {
            this.clear();
            return;
        }
        // str_cmd = CST.Command_Tips["" + G_FC.Command_Tip_Id];
        if(str_cmd.indexOf("#") != -1){
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                str_cmd = str_cmd.replace("#",CST.CommandName["" + G_FC.StockOrder]);
            }else{
                if(FC_Msg.cur_color != undefined){
                    str_cmd = str_cmd.replace("#",CST.CommandName["" + FC_Msg.cur_color]);
                }
            }
        }
        if(str_cmd.indexOf("*") != -1){
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            str_cmd = str_cmd.replace("*",FC_Msg.timeOutTimes[userSeat]);
        }
        if(str_cmd.indexOf("&") != -1){
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            str_cmd = str_cmd.replace("&",3 - FC_Msg.timeOutTimes[userSeat]);
        }
        
        let myLabel = label_command.getComponent(cc.Label); 
        myLabel.string = str_cmd;
        
        this.interval = setTimeout(function(){
            this.clear();
        }.bind(this),1000);
        
    },

    clear: function(){
        // console.log("FC_Tip clear........");
        if(this.interval) clearInterval(this.interval);
        if(!this.node) return;
        if(CF.tipsPool) CF.tipsPool.put(this.node);
    },

});
