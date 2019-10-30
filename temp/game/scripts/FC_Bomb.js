let CF = require("FC_CommFun");
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {
    },
    onEnable: function(){
        this.node.enabled = true;
    },
    start () {
    },
    bombOver: function(){
        if(!this.node) return;
        this.node.getComponent(cc.Animation).stop("bombClip");
        this.node.destroy();
    },
    update (dt) {},
});
