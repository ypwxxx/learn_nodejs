
const CCGlobal = require('CCGlobal')
let CCComFun = require("CCComFun");
let WXGameClub = require("WXGameClub");
let CF = require("FC_CommFun");
cc.Class({
    extends: cc.Component,

    properties: {
        copy_pos: null,
        tip_pos: null,
    },

    onLoad () {
    },
    onEnable: function(){
        WXGameClub.hideGameClubButton();
        this.runSpAction();
    },
    start () {

    },

    runSpAction:function(){
        if(!this.node) return;
        let sp_copy = this.node.getChildByName("sp_copy");
        let sp_tip = this.node.getChildByName("sp_tip");
        if(!sp_copy || !sp_tip) return;
        //设置tips位置
        let size = cc.view.getFrameSize();
        let winSize = cc.view.getVisibleSize();
        // //期望坐标
        let copy_width= sp_copy.width;
        let tip_height = sp_tip.height;
        let pos_x = size.width / 10 * 7 - (copy_width / 2);
        let pos_y = size.height / 2 - 100 / (size.height / winSize.height);

        let pos = cc.v2(pos_x,pos_y);
        let pos_0 = this.node.convertToNodeSpace (pos);
        let p_y;
        if(size.width == 375 && size.height == 812){ //iphone x
            p_y = size.height / 10 * 7 / (size.height / winSize.height) / 2 - 10;
        }else{
            p_y = size.height / 10 * 7 / (size.height / winSize.height) / 2 + 10;
        }
        // //返回按钮适配
        sp_tip.x = pos_x;
        sp_tip.y = p_y;

        
        
        let copy_pos = sp_copy.position;
        let tip_pos = sp_tip.position;

        this.copy_pos = copy_pos;
        this.tip_pos = tip_pos;

        let pos_1 = cc.v2(Number(copy_pos.x) + (copy_width / 4),copy_pos.y);
        sp_copy.runAction(cc.repeatForever(
            cc.sequence(
                cc.moveTo(1,pos_1),
                cc.moveTo(1,copy_pos)
            ),
            -1
        ));
        let pos_2 = cc.v2(tip_pos.x,Number(tip_pos.y) + (tip_height / 4));
        sp_tip.runAction(cc.repeatForever(
            cc.sequence(
                cc.moveTo(.5,pos_2),
                cc.moveTo(.5,tip_pos)
            ),
            -1
        ));
    },

    stopSpAction:function(){
        if(!this.node) return;
        let sp_copy = this.node.getChildByName("sp_copy");
        let sp_tip = this.node.getChildByName("sp_tip");
        if(!sp_copy || !sp_tip) return;
        sp_copy.position = this.copy_pos;
        sp_tip.position = this.tip_pos;
        sp_copy.stopAllActions();
        sp_tip.stopAllActions();
    },

    // update (dt) {},
    closePublic: function(){
        this.stopSpAction();
        WXGameClub.showGameClubButton();
        if(CF.publicPool) CF.publicPool.put(this.node);

        //刷新首页 授权
        let parent = cc.find("FC_Menu");
        if(parent){
            let p_com = parent.getComponent("FC_Menu");
            // if(p_com && CF.isAuthorBool){
            //     p_com.backToMenuCreateAuthor();
            // }
        }

    },
    copy: function(){
        if(CCGlobal != undefined && CCGlobal.platform == 1){
            if(CCGlobal.apiVer > "1.1.0"){
                wx.setClipboardData({
                    data: 'gameokay',
                    success: function (res) {
                        wx.getClipboardData({
                            success: function (res) {
                                console.log(res.data) // data
                            }
                        })
                    }
                })
            }
        }
    },
});
