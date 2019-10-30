
let CF = require("FC_CommFun");
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        
    },
    onEnable: function(){
        FC.FC_CommFun.isInSet = true;
    },
    start () {

    },

    onDisable: function(){
        FC.FC_CommFun.isInSet = false;
    },

    btn_continue: function(){
        //初始化 game游戏数据
        /*
            1：位置开启
            2：起飞号码
            3：筛子顺序 stockOrder
            4：棋子下标和状态
            5：最后一次筛子数 Stock_num
            6：CF.FinishNum
            7：CF.completeArr
            8：当前stockOrder 是否已经摇过筛子
            9：启用本地记录的标识 isInGame = false
        */
       if(G.isLoadScene) return;
       G.isLoadScene = true;
       CF.continuePool.put(this.node);
       cc.director.preloadScene("FC_Game", function () {
            setTimeout(function(){
                cc.director.loadScene("FC_Game");
            },50)
        });
    },
    btn_newgame: function(){
        CF.removeGameState();
        let parent = this.node.parent;
        CF.continuePool.put(this.node);
        //加载set界面
        if(parent) parent.getComponent("FC_Menu").showUISet();
    },
});
