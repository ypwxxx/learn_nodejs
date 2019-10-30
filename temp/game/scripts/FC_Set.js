
let CST = require("FC_Constant");
let CF = require("FC_CommFun");
let WXGameClub = require("WXGameClub");
let WXFeedBack = require("WXFeedBack");
let Statistics = require("Statistics");

cc.Class({
    extends: cc.Component,

    properties: {
        root_set: cc.Node,
        btn_start: cc.Button,
        node_ad: cc.Node,
        planeArray: [cc.SpriteFrame],
        LightNumberArray: [cc.SpriteFrame],
        GrayNumberArray: [cc.SpriteFrame],
    },
    start: function(){
    },
    onLoad () {
        console.log("Set onLoad...");
        this.player_select = [0,1,1,1];//玩家 cpu 。。。
        this.playerArray = ["玩家1","玩家2","玩家3","玩家4","关闭"];
        this.cpArray = ["电脑1","电脑2","电脑3","电脑4"];
        this.active_num = 0;
        this.replaceFrame();
        this.setUI_set_return();
    },
    onEnable: function(){
        console.log("Set onEnable...");
        CF.hideGameClubButton();
        this.showGameAd();

        FC.FC_CommFun.isInSet = true;
    },

    onDisable: function(){
        CF.hideBanner();
        FC.FC_CommFun.isInSet = false;
    },

    showGameAd: function(){
        CF.createBanner(this.node_ad,{key: "FC_1",pos: "banner1"});
    },

    setUI_set_return: function(){
        //返回按钮适配
        let size = cc.view.getFrameSize();
        let winSize = cc.view.getVisibleSize();
        if(size.width != 375 || size.height != 812){
            return;
        }
        //期望坐标
        let pos_x = size.width / 20 ;
        let pos_y = size.height / 10 * 9;
        var p_y;
        let pos = cc.v2(pos_x,pos_y);
        let pos_0 = this.node.convertToNodeSpace (pos);
        if(size.width == 375 && size.height == 812){ //iphone x
            p_y = size.height / 10 * 8 / (size.height / winSize.height) / 2 + 50;
        }else{
            p_y = size.height / 10 * 9 / (size.height / winSize.height) / 2 + 10;
        }
        
        //返回按钮适配
		let btn_return = this.node.getChildByName("btn_return");
        if(btn_return) {
			btn_return.x = -316;
			btn_return.y = p_y;
		}
    },

    replaceFrame: function(){
        console.log("replaceFrame");
		if(!this.root_set) return;
        for(let i = 0; i < this.player_select.length; i++)
        {
            let str_i = "sp_" + i;
			let sp = this.root_set.getChildByName(str_i);
			if(!sp) continue;
            let i_desc = sp.getChildByName("desc");
			if(!i_desc) continue;
            if(this.player_select[i] == -1){
                i_desc.getComponent(cc.Label).string = this.playerArray[this.player_select.length];
            }else if(this.player_select[i] == 0){
                i_desc.getComponent(cc.Label).string = this.playerArray[i];
            }else{
                i_desc.getComponent(cc.Label).string = this.cpArray[i];
            }
        }
        
    },
    show_start: function(){
        if(this.checkSelect()){
            this.btn_start.node.active = true;
        }else{
            this.btn_start.node.active = false;
        }
    },
    touchPlayer: function(event,i){
        if(this.player_select[i] == -1)
        {
            this.player_select[i] = 0;
        }else if(this.player_select[i] == 0){
            this.player_select[i] = 1;
        }else{
            this.player_select[i] = -1;
        }
        this.show_start();
        this.replaceFrame();
    },
    touchNumber: function(event,i){
        // if(this.active_num == i) return;
        this.active_num = i;
        let max = Object.keys(CST.Plane_Active_Num).length;
        for(let k = 0; k < Number(max); k++){
            let str_k = "num_" + k;
            let k_num = this.root_set.getChildByName(str_k);
			if(!k_num) continue;
            if(i == k){
                k_num.getComponent(cc.Sprite).spriteFrame = this.LightNumberArray[k];
            }else{
                k_num.getComponent(cc.Sprite).spriteFrame = this.GrayNumberArray[k];
            }
        }
    },
    randfunc: function(num,length){
        if(length == 4){
            if(num < 25) return 0;
            if(num < 50) return 1;
            if(num < 75) return 2;
            return 3;
        }else if(length == 3){
            if(num < 30) return 0;
            if(num < 70) return 1;
            if(num < 100) return 2;
            return 0;
        }else if(length == 2){
            if(num < 50) return 0;
            return 1;
        }else{
            return 0;
        }
    },
    randomStockOrder: function(){
        let rand = Math.random() * 100;
        let idxArr = [];
        idxArr.length = 0;
        for(let k = 0; k < 2; k++){
            for(let i = 0;i < G_FC.OpenIdxArr.length; i++){
                if(G_FC.OpenIdxArr[i] == -1) continue;
                idxArr.push(i);
            }
        }
        //玩家优化
        var newArr = [];
        for(let i = 0; i < idxArr.length; i++){
            if(G_FC.OpenIdxArr[i] == CST.OpenType.player) newArr.push(i);
        }
        let flag_idx;
        if(newArr.length > 0){
            flag_idx = this.randfunc(rand,newArr.length);
            G_FC.StockOrder = newArr[flag_idx];
        }else{
            flag_idx = this.randfunc(rand,idxArr.length);
            G_FC.StockOrder = idxArr[flag_idx];
        }
    },
    
    initData: function(){
        //设置global数据
        G_FC.Plane_Active_Type = this.active_num;
        G_FC.OpenIdxArr = [];
        G_FC.OpenIdxArr.length = 0;
        for(let i in this.player_select){
            G_FC.OpenIdxArr[i] = this.player_select[i];
        }
        G_FC.PlayerNum = G_FC.OpenIdxArr.length;
        // cc.log("----OpenIdxArr----",JSON.stringify(G_FC.OpenIdxArr));
    },
    checkSelect: function(){
        var player_num = 0;
        let num = 0;
        for(let i in this.player_select){
            if(this.player_select[i] != -1){
                num += 1 * 1;
            }
            if(this.player_select[i] == 0){
                player_num += 1 * 1;
            }
            if(Number(num) > 1 && player_num >= 1){
                return true;
            }
        }
        return false;
    },
    back:function(){

        if(CF.setPool) {
            CF.setPool.put(this.node);
        }
        let scene = cc.director.getScene();
        console.log("back ",scene.name);
        if(scene.name == "FC_Menu"){
            WXGameClub.showGameClubButton();
            WXFeedBack.showFeedBackButton();
            CF.hideBanner();
            //刷新首页 授权
            let parent = cc.find("FC_Menu");
            if(parent){
                // let p_com = parent.getComponent("FC_Menu");
                // if(p_com && CF.isAuthorBool){
                //     if(!p_com.isChangeAuthor){
                //         p_com.wxAuthorize();
                //     }
                //     p_com.backToMenuCreateAuthor();
                // }
            }
        }
        if(scene.name == "FC_Game"){
            //广告重刷
            let parent = cc.find("FC_Game");
            if(parent){
                parent.getComponent("FC_Game").showGameAd();
            }
        }
    },
    startGame: function(){
        if(G.isLoadScene) return;
        G.isLoadScene = true;
        this.initData();
        this.randomStockOrder();
        
        CF.removeGameState();

        let cur_name = cc.director.getScene().name;
        let cur_scene = cc.find(cur_name);
        if(CF.setPool) CF.setPool.put(this.node);

        if(cur_name == "FC_Menu"){
            CF.hideBanner();
            cc.director.preloadScene("FC_Game", function () {
                setTimeout(function(){
                    cc.director.loadScene("FC_Game");
                },50)
            });
        }else{
            Statistics.reportEvent("playtime","FC","time");
            Statistics.reportEvent("overtime","FC","count");
            Statistics.reportEvent("playtime","FC","time");
            Statistics.reportEvent("starttimes","FC","count");

            G.isLoadScene = false;
            cur_scene.getComponent("FC_Game").clear();
            cur_scene.getComponent("FC_Game").onEnable();
        }
    },
});
