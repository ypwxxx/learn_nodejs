const TTRecord=require("TTRecord")

cc.Class({
    extends : cc.Component,
    properties : {
        record:cc.Sprite,
        startSprite : cc.SpriteFrame,
        endSprite : cc.SpriteFrame,
        tipNode: cc.Node,
    },
    onLoad: function(){
        cc.game.addPersistRootNode(this.node);
        TTRecord.init({
            onStart:()=>{
                this.record.spriteFrame = this.endSprite;
                this.tipNode.active = true;
                this.tipNode.opacity = 0;
                this.tipNode.runAction(cc.repeatForever(cc.sequence(
                    cc.fadeIn(0.8),
                    cc.fadeOut(1.0)
                )));
            },
            onStop:()=>{
                this.record.spriteFrame = this.startSprite;
                this.tipNode.stopAllActions();
                this.tipNode.active = false;
            },
            onReset: () => {
                this.flushState();
            },
            recordNode:this.node,
        });

        this.flushState();
        this.tipNode.active = false;

        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    },

    touchStart: function(){

    },

    touchMove: function(){

    },

    touchEnd: function(){

    },

    flushState: function(){
        if(TTRecord.recordState==1){
            this.record.spriteFrame = this.startSprite;
        }else if(TTRecord.recordState==2){
            this.record.spriteFrame = this.endSprite;
        }
    },

    recordAction(event) {
        console.log('TTRecord.recordState = ', TTRecord.recordState, 'record: ', JSON.stringify(TTRecord.TTRecord));
        if(TTRecord.TTRecord){
            if(TTRecord.recordState==1){
                TTRecord.startVideo();
            }else if(TTRecord.recordState==2){
                TTRecord.stopVideo();
            }
        }
    },

});






























