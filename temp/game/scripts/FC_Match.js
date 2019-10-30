let WXGameClub = require("WXGameClub");
cc.Class({
    extends: cc.Component,

    properties: {
        point_0: cc.Node,
        point_1: cc.Node,
        point_2: cc.Node,
    },

    onLoad () {
        this.num = 0;
        WXGameClub.hideGameClubButton();
    },
    onEnable: function(){
        this.inter = setInterval(function(){
            this.point_0.opacity = Number(this.num) >= 1 ? 255 : 0;
            this.point_1.opacity = Number(this.num) >= 2 ? 255 : 0;
            this.point_2.opacity = Number(this.num) >= 3 ? 255 : 0;
            this.num += 1 * 1;
            if(Number(this.num) >= 4) this.num = 0;
        }.bind(this),300);
    },
    onDestroy: function(){
        if(this.inter) clearInterval(this.inter);
        this.inter = null;
    },
});
