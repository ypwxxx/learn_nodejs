// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let that = this;
        that.node.on("touchend",(e)=>{     
            e.stopPropagation();
            let iconMsg = e.currentTarget;  
            let skipType = iconMsg.skipType;
            
            if (skipType == 1) {
                let skipBuff = iconMsg.codeImg;
                let arr = [];
                arr.push(skipBuff);
                wx.previewImage({
                  current: arr[0], // 当前显示图片的http链接  
                  urls: arr // 需要预览的图片http链接列表  
                })
            } else if (skipType == 0) {
                let skipBuff = iconMsg.appId;
                wx.navigateToMiniProgram({
                    appId: skipBuff,
                })
            }    
            console.log(iconMsg)
        })
    },
    start () {

    },

    // update (dt) {},
});
