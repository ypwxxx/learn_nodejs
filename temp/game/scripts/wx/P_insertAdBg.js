

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        cc.game.addPersistRootNode(this.node); 
    },

    start () {

    },

    btn_touchBg: function(){
        console.log("-------------btn_touchBg---------------");
        this.node.x = -1000;
    },

});
