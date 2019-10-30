const CCGlobal = require('CCGlobal')
let CCComFun = require("CCComFun");
let CST = require("FC_Constant");
let WXGameClub = require("WXGameClub");
let CF = require("FC_CommFun");
let FC_Msg = require("FC_Msg");
let AdsFunc = require("AdsFunc");
let Statistics = require("Statistics");

cc.Class({
    extends: cc.Component,

    properties: {
        sp_more: cc.Node,
        more_game: cc.Node,
        node_ad: cc.Node,

        numFrames: [cc.SpriteFrame],
    },


    onLoad () {
    },

    start () {

    },
    showGameCircle: function(){
        console.log("showGameCircle...");
        if(!this.node) return;
        let gamecircle = this.node.getChildByName("gamecircle");
        if(CCGlobal != undefined &&  CCGlobal.platform == 1){
            if(CCGlobal.apiVer > "2.0.2"){
                gamecircle.opacity = 0;
                let systemInfo = wx.getSystemInfoSync();
                let frameSize = cc.view.getFrameSize();
                var sizeW = 100 * (systemInfo.windowWidth / 720);
                let pos = gamecircle.parent.convertToWorldSpaceAR(gamecircle);
                let total = cc.view.getVisibleSize().height;   //渲染高度
                var h = (1 - (pos.y / total)) * systemInfo.windowHeight - sizeW / 2;
                let w = 560 / 720 * systemInfo.windowWidth;
                
                if (frameSize.width == 375 && frameSize.height == 812) {
                    h = (1 - (pos.y / total)) * systemInfo.windowHeight - sizeW / 2;
                }
                if(!WXGameClub.gameClubButton){
                    console.log("1...");
                    let obj = {
                        icon: 'white',
                        style: {
                            left: w,
                            top: h,
                            width: sizeW,
                            height: sizeW
                        }
                    };
                    WXGameClub.createGameClubButton(obj);
                }else{
                    console.log("2...");
                    WXGameClub.setButtonStyle({
                        left: w,
                        top: h,
                        width: sizeW,
                        height: sizeW,
                    });
                } 
                
                WXGameClub.showGameClubButton();
            }else{
                gamecircle.opacity = 0;
            }
        }
    },

    addGameForIOS: function(){
        let sp_add = this.node.getChildByName("sp_add");
        if(!sp_add) return;
        let sp_height = sp_add.height;
        sp_add.y = 1560 / 2 - (sp_height / 2);

        //版本 和 设备控制（ios专有）
        if(true){ //CCGlobal.system == 1
            if(CCGlobal != undefined &&  CCGlobal.platform == 1){
                // version
                let systemInfo = wx.getSystemInfoSync();
                if(systemInfo.version >= "6.7.1"){
                    sp_add.opacity = 255;
                }else{
                    sp_add.opacity = 0;
                    return;
                }
            }
        }
        

        let frameSize = cc.view.getFrameSize();
        let winSize = cc.view.getVisibleSize();

        let h = sp_add.y / 1560 * winSize.height - (sp_height / 2);
        let w = 0;
        if (frameSize.width == 375 && frameSize.height == 812) {// iphone x
            h = sp_add.y / 1560 * winSize.height - 90;
        }
        sp_add.position = cc.v2(w,h);
        this.startAddGameAction();
    },

    startAddGameAction: function(){
        let sp_add = this.node.getChildByName("sp_add");
        if(!sp_add) return;
        sp_add.stopAllActions();
        if(sp_add.opacity == 0) return;
        this.ori_pos = sp_add.position;
        let new_pos = cc.v2(sp_add.x + 50, sp_add.y);
        sp_add.runAction(
            cc.repeatForever(cc.sequence(
                cc.moveTo(1,new_pos),
                cc.moveTo(1,this.ori_pos)
            ),-1)
        );
    },
    show: function(isTimeout,isComplete){
        console.log("show...",G_FC.OpenIdxArr);
        if(!this.node) return;
        this.addGameForIOS();
        let open_num = 0;
        for(let i in G_FC.OpenIdxArr){
            if(G_FC.OpenIdxArr[i] != -1) open_num += 1 * 1;
        }
        //结束字
        let sp_over = this.node.getChildByName("sp_over");
        if(sp_over) sp_over.opacity = !isComplete ? 255 : 0;

        //排名底框
        let bg_rank = this.node.getChildByName("bg_rank");
        if(bg_rank) bg_rank.opacity = !isComplete ? 255 : 0;

        //显示控制
        let sp_timeout = this.node.getChildByName("sp_timeout");
        if(sp_timeout) sp_timeout.opacity = isTimeout && !isComplete ? 255 : 0;

        //超时 和 观看模式 屏蔽
        for(let k = 0; k < CST.Player_Max_Num; k++){
            let k_root = this.node.getChildByName("sp_" + k);
            if(!k_root) continue;
            if(isTimeout || isComplete){
                k_root.opacity = 0;
                continue;
            }
            k_root.enabled = k < open_num ? true : false;
            let head = k_root.getChildByName("head");
            let name = k_root.getChildByName("name");
            let plane = k_root.getChildByName("plane");
            let rank = k_root.getChildByName("rank");

            if(head) head.getComponent(cc.Sprite).enabled = k < open_num ? true : false;
            if(name) name.getComponent(cc.Label).enabled = k < open_num ? true : false;
            if(plane) plane.getComponent(cc.Sprite).enabled = k < open_num ? true : false;
            if(k >= 2){
                if(rank) rank.getComponent(cc.Label).enabled = k < open_num ? true : false;
            }else{
                if(rank) rank.getComponent(cc.Sprite).enabled = k < open_num ? true : false;
            }
            
        }

        //超时 和 观看模式 屏蔽
        if(!isTimeout && !isComplete){
            //对应显示
            let FC_Game = this.node.parent.getComponent("FC_Game");
            let headFrameArr = FC_Game.headFrameArr;
            let defaultFrameArr = FC_Game.defaultFrameArr;
            console.log("CF.defaultArr...",CF.defaultArr);
            console.log("CF.completeArr...",CF.completeArr);
            for(let m = 0; m < open_num; m++){
                let m_idx = CF.completeArr[m];
                let m_root = this.node.getChildByName("sp_" + m);
                if(!m_root) continue;
    
                let head = m_root.getChildByName("head");
                let name = m_root.getChildByName("name");
                let plane = m_root.getChildByName("plane");
                let rank = m_root.getChildByName("rank");
    
                if(!head || !name || !plane || !rank) return;
    
                let common_type = CF.transformType(m_idx);//棋子颜色
                let seatID = CF.getSeatByColor(common_type); //座位号
                console.log("common_type....",common_type);
                console.log("seatID....",seatID);
                //head
                let obj = FC_Msg.allPlayerInfos["" + seatID];
                console.log("obj...",obj);
                let url = "";
                if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                    url = "";
                }else{
                    if(seatID == FC_Msg.playerInfo["deskSeatID"]){
                        url = FC_Msg.headUrl;
                    }else{
                        if(!obj){
                            url = "";
                        }else{
                            url = obj.logo_url;
                            if(!obj.logo_url) url = "";
                            if(obj.logo_url && obj.logo_url.length > 128) url = "";
                        }
                        
                    }
                }
                
                if(!url || url == ""){
                    head.getComponent(cc.Sprite).spriteFrame = defaultFrameArr[CF.defaultArr[m_idx]];
                }else{
                    cc.loader.load({"url": url,type: "png"},function(err,texture){
                        head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                        // head.setScale(.7);
                    })
                }
                //plane
                plane.getComponent(cc.Sprite).spriteFrame = headFrameArr[common_type];
                //name
                if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                    if(G_FC.OpenIdxArr[m_idx] == CST.OpenType.player){
                        name.getComponent(cc.Label).string = CST.PlayerName[m_idx];
                    }else{
                        name.getComponent(cc.Label).string = CST.CpName[m_idx];
                    }
                }else{
                    name.getComponent(cc.Label).string = obj["nickName"];
                }
            }
        }

        
        // this.runGameCenterTip();
        //观战模式 游戏结束
        let node_complete = this.node.getChildByName("node_complete");
        node_complete.opacity = isComplete ? 255 : 0;

        if(isComplete){
            let rank_num = this.getUserRank();
            console.log("rank_num: ",rank_num);
            //名次刷新
            let icon_num = node_complete.getChildByName("icon_num");
            if(icon_num && rank_num != -1){
                icon_num.getComponent(cc.Sprite).spriteFrame = this.numFrames[rank_num];
            }
            //名次logo
            let rank_logo_1 = node_complete.getChildByName("rank_logo_1");
            let rank_logo_2 = node_complete.getChildByName("rank_logo_2");
            if(rank_logo_1 && rank_logo_2){
                rank_logo_1.opacity = 0;
                rank_logo_2.opacity = 0;
                if(rank_num == 0){
                    rank_logo_1.opacity = 255;
                }
                if(rank_num == 1){
                    rank_logo_2.opacity = 255;
                }
            }
        }
        

        //天梨游戏  和 游戏中心 动画
        this.initMoreGame();
        
        //游戏圈
        this.showGameCircle();
        //更多游戏
        // MoreGame.creatDemoBtn({node:this.sp_more});
        // MoreGame.creatMiniBtn({node:this.more_game});
        //广告
        this.showGameAd();

        //插屏广告
        AdsFunc.createInsertAd();
    },

    getUserRank: function(){
        let rank = -1;
        for(let m = 0; m < 4; m++){
            let m_idx = CF.completeArr[m];
            let common_type = CF.transformType(m_idx);//棋子颜色
            let seatID = CF.getSeatByColor(common_type); //座位号
            if(seatID == FC_Msg.playerInfo["deskSeatID"]){
                rank = m;
                break;
            }
        }
        return rank;
    },

    showGameAd: function(){
        CF.createBanner(this.node_ad,{key: "FC_1",pos: "banner4"});
    },


    share: function(){
        if(CCGlobal != undefined && CCGlobal.platform == 1){
            
            wx.shareAppMessage({
                title: "您的好友邀请你前来参与",
                imageUrl: 'http://weixin.gzfingertip.cn/wegame/sharepic/fxq.jpg',
                success: function () {
                    wx.showToast({
                        title: "分享成功"
                    })
                },
            })
            // wx.getUserInfo({
            //     success: function(res) {
            //         let nickName = res.userInfo.nickName;
            //         wx.shareAppMessage({
            //             title: "" + nickName + "邀请你前来参与",
            //             imageUrl: 'http://weixin.gzfingertip.cn/wegame/sharepic/fxq.jpg',
            //             success: function () {
            //                 wx.showToast({
            //                     title: "分享成功"
            //                 })
            //             },
            //         })
            //     }
            // })
        }
    },
    // runMoreGameTip: function(){
    //     this.sp_more.stopAllActions();
    //     this.sp_more.scale = .6;
    //     this.sp_more.runAction(
    //         cc.repeatForever(cc.sequence(
    //             cc.scaleTo(1,.8),
    //             cc.scaleTo(1,.6)
    //         ),-1)
    //     );
    // },

    stopMoreGameTip: function(){
        this.sp_more.stopAllActions();
        this.sp_more.scale = .6;
    },

    runGameCenterTip: function(){
		if(!this.more_game) return;
        this.more_game.stopAllActions();
        this.more_game.scale = .6;
        this.more_game.runAction(
            cc.repeatForever(cc.sequence(
                cc.scaleTo(1,.8),
                cc.scaleTo(1,.6),
                cc.rotateTo(.1,45),
                cc.rotateTo(.1,-45),
                cc.rotateTo(.1,45),
                cc.rotateTo(.1,-45),
                cc.rotateTo(.1,0),
            ),-1)
        );
    },

    runMoreGameTip: function(){
		if(!this.sp_more) return;
        this.sp_more.stopAllActions();
        this.sp_more.scale = .6;
        this.sp_more.runAction(
            cc.repeatForever(cc.sequence(
                cc.scaleTo(1,.8),
                cc.scaleTo(1,.6),
                cc.rotateTo(.1,45),
                cc.rotateTo(.1,-45),
                cc.rotateTo(.1,45),
                cc.rotateTo(.1,-45),
                cc.rotateTo(.1,0),
            ),-1)
        );
    },



    initMoreGame: function(){
        console.log("initMoreGame...");
        if(CCGlobal != undefined &&  CCGlobal.platform == 1){
            if(CCGlobal.apiVer > "2.0.2"){
                this.sp_more.opacity   = 255;
                this.runMoreGameTip();
            }else{
                this.sp_more.opacity   = 0;
                this.stopMoreGameTip();
            }   
        }else{
            this.sp_more.opacity   = 0;
            this.stopMoreGameTip();
        }
    },



    changeMoreGameIcon: function () {
        console.log("--changeMoreGameIcon---",G.moreGameIcon);
        this.initMoreGame();
        var self = this;
        if(CCGlobal && CCGlobal.platform == 1) {
            if(CCGlobal.apiVer > "2.0.2"){
                //拿APP的配置
                CCComFun.getWxServConfig({
                    appId: G_FC.appId,
                    success: res => {                    
                        var obj = JSON.parse(res.cfg.QRCodes);    //转换成对象
                        G.iconList.length = 0;                 
                        for (const k in obj) {
                            if (obj.hasOwnProperty(k)) {
                                const element = obj[k];
                                G.iconList.push(obj[k].iconUrl);     //iconList存储的为图片的url
                            }
                        }                    
                        self.changeMoreGameIcon2();
                    },
                    fail: res => {
                        console.log("获取配置失败");
                    }
                })
            }
        }
       
    },
    changeMoreGameIcon2: function () {
        var self = this;
        if (G.moreGameIcon == -1) {
            G.moreGameIcon = Math.round(Math.random() * (G.iconList.length - 1));
            var remoteUrl = G.iconList[G.moreGameIcon];
            cc.loader.load(remoteUrl, function (err, texture) {                
                self.sp_more.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
            return;
        } else {
            
            let random = Math.random();
            let len = G.iconList.length;
            G.moreGameIcon = (Math.round( random * Math.ceil( len / 2)) + G.moreGameIcon + 1) % G.iconList.length ;
            var remoteUrl = G.iconList[G.moreGameIcon];
            cc.loader.load(remoteUrl, function (err, texture) {
                self.sp_more.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
            return;
        }
    },

    moreGame: function(){
    },

    back: function(){
        Statistics.reportEvent("playtime","FC","time");
        Statistics.reportEvent("overtime","FC","count");

        if(FC_Msg.gameType == CST.GAMETYPE.pvp){
            let message = {};
            message.cmdType = "0x4020";
            let data = {};
            data.user_id = FC_Msg.userInfo["userID"];
            data.room_id = FC_Msg.roomId;
            data.desk_id = FC_Msg.playerInfo["deskID"];
            message.data = data;
            console.log("message...",message);
            FC_Msg.send(message); 
        }else{
            cc.sys.localStorage.removeItem("Record");
        }
        FC_Msg.clearMsg();
        cc.director.loadScene("FC_Menu");
    },
    newGame: function(){
        CF.hideBanner();
        if(FC_Msg.gameType == CST.GAMETYPE.pvp){

            // FC_Msg.clearAllPlayerInfo();
            //清理掉 游戏界面
            let parent = cc.find("FC_Game");
            if(parent){
                let pCom = parent.getComponent("FC_Game");
                if(pCom) pCom.clear();
            }
            FC_Msg.isReplayGame = true;
            let message = {
                cmdType: '0xb080',
                data: {
                    user_id: FC_Msg.userInfo["userID"],
                }
            };
            FC_Msg.send(message);

            FC_Msg.clearMsg();
        }else{
            Statistics.reportEvent("playtime","FC","time");
            Statistics.reportEvent("overtime","FC","count");

            cc.sys.localStorage.removeItem("Record");
            cc.director.loadScene("FC_Game");
        }
    },
    btn_close: function(){
        console.log("btn_close");
        
        WXGameClub.hideGameClubButton();
        CF.hideBanner();

        //返回游戏界面加新广告
        let parent = cc.find("FC_Game");
        if(parent){
            let pCom = parent.getComponent("FC_Game");
            pCom.node_over.x = 3000;
            pCom.node_game.x = 0;
            pCom.showGameAd();
        }

    },
});
