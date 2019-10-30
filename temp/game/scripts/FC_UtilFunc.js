const CCGlobal = require('CCGlobal')
let CCComFun = require("CCComFun");
let FC_UtilFunc = {
    listener: null,
    loading : null,
    load_prefab: null,
    bannerAd: null,
    cur_Scene: null,
    limitTime: 0,
    tips: -1,
    isCreating: false,
    netState: true,


    showLoading: function(time,tips){ //等待网络回执 loading、
        let node = cc.director.getScene();
        let parent;
        if(node.name == "FC_Menu"){
            parent = cc.find("FC_Menu");
            if(parent) parent.getComponent("FC_Menu").showLoading(time,tips);
        }
        if(node.name == "FC_Game"){
            parent = cc.find("FC_Game");
            if(parent) parent.getComponent("FC_Game").showLoading(time,tips);
        }
        return;
    },


    waitTime: function(time){
        let that = this;
        if(that.timeOut) clearInterval(this.timeOut);
        this.startAction();
        if(time == 0){
            //一直显示loading
            return;
        }
        this.timeOut = setInterval(function(){
            that.limitTime -= 1;
            console.log("timeOut: ",that.limitTime);
            if(that.limitTime <= 0){
                console.log("waitTime hide");
                that.stopAction();
                that.hideLoading();
            }
        },1000);
    },

    startAction: function(){
        if(!this.loading) return;
        var action = cc.repeatForever(cc.rotateBy(1,360));
        let sp = this.loading.getChildByName("sp");
        if(!sp) return;
        sp.runAction(action);
    },
    stopAction: function(){
        if(!this.loading) return;
        let sp = this.loading.getChildByName("sp");
        if(!sp) return;
        sp.stopAllActions();
    },
    hideLoading: function(){
        console.log("hideLoading...");
        let node = cc.director.getScene();
        let parent;
        if(node.name == "FC_Menu"){
            parent = cc.find("FC_Menu");
            if(parent) parent.getComponent("FC_Menu").hideLoading();
        }
        if(node.name == "FC_Game"){
            parent = cc.find("FC_Game");
            if(parent) parent.getComponent("FC_Game").hideLoading();
        }

        if(this.loading){
            this.loading.removeFromParent();
        }

    },

    getNetworkStatusChange:function(){
        console.log("getNetworkStatusChange");
        if (CCGlobal != undefined &&  CCGlobal.platform == 1) {
            if(CCGlobal.apiVer>="1.1.0"){     
                wx.onNetworkStatusChange(res => {
                    console.log("net____________：" + res.isConnected);
                    this.netState = res.isConnected;
                    //断网关闭 授权
                    let scene = cc.director.getScene();
                    if(scene.name == "FC_Menu"){
                        let parent = cc.find("FC_Menu");
                        if(!this.netState && parent){
                            parent.getComponent("FC_Menu").destroyAuthor();
                        }else{
                            parent.getComponent("FC_Menu").createAuthor(true);
                        }
                    }   
                })                
                return this.netState;
            }
        }
    },

    clear: function(){
        // this.limitTime = 0;
        console.log("Loading clear...");
        this.load_prefab = null;
        if(this.timeOut) clearInterval(this.timeOut);
        this.timeOut = null;

        if(!this.loading) return;
        this.loading.removeFromParent();
        this.loading  = null;
    },

};

module.exports = FC_UtilFunc;