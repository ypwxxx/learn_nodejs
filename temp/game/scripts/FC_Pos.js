
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.setNum(0);
    },

    start () {

    },

    setNum: function(value){
        if(value == undefined) return;
        let num = this.node.getChildByName("num");
        if(num) num.getComponent(cc.Label).string = value;
    },

    // update (dt) {},
});
