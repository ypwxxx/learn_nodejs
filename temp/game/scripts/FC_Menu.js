
let CST = require("FC_Constant");
let CF = require("FC_CommFun");
const CCGlobal = require('CCGlobal')
const CCConst = require('CCConst')
let CCComFun = require("CCComFun");
let FC_Msg = require("FC_Msg");
let FC_UtilFunc = require("FC_UtilFunc");
let Examin = require('Examin');
let Statistics = require("Statistics");
const WXFeedBack = require('WXFeedBack');

cc.Class({
    extends: cc.Component,

    properties: {
        node_start: cc.Node,
        node_authorize: cc.Node,
        icon_start: cc.Node,
        icon_bbdn: cc.Node,
        icon_2048: cc.Node,
        icon_hc: cc.Node,
        rank_bbdn: cc.Node,
        rank_2048: cc.Node,
        rank_hc: cc.Node,
        icon_challenge: cc.Node,

        UISetPrefab: cc.Prefab,
        UIContinuePrefab: cc.Prefab,
        loadUI: cc.Prefab,
        Tips: cc.Prefab,
    },

    onLoad () {
        console.log("Menu onLoad...");
        CF.init();
        // FC.C_MultiPlatform.platform_id = 104;
        // FC.C_MultiPlatform.initPlatformSDK();
        CF.hideBanner();
        G.isLoadScene = false;
        console.log("window.GameConfig.platform: ",window.GameConfig.platform);
    },
    onEnable: function(){
        console.log("Menu onEnable...");

        this.setWXShareShow();
        this.initGlobal();
        this.initBtnTouch(true);
        // this.initGameCircle(true);
        if(!G_FC.FirstLogin){
            G_FC.FirstLogin = true;
        }else{
            this.node_start.x = 0;
        }
        // WXAdsFunc.getNetworkStatusChange();
        // WXAdsFunc.initData();
        // FC_Msg.clearMsg();


        // this.bindMessageCallBack();
        // FC_UtilFunc.getNetworkStatusChange();//监听网络变动
    },

    start: function(){
        console.log("Menu start...");

        this.initExamineShow();//审核 设置
        this.isChangeAuthor = false;
        this.wxAuthorize(); //单机版 授权

        // cc.director.preloadScene("FC_Game",function(){
            
        // });
        console.log("Menu end...");
    },

    initBtnTouch: function(isBool){
        let keys = ["icon_start","icon_bbdn","icon_2048","icon_hc","rank_bbdn","rank_2048","rank_hc","icon_challenge"];
        let funcs = ["btn_start","btn_bbdn","btn_2048","btn_hc","btn_rank_bbdn","btn_rank_2048","btn_rank_hc","btn_challenge"];
        CF.initBtnTouch(keys,funcs,this,isBool);
    },


    showNodeByArr: function(arr,isBool){
        if(!arr || arr.length == 0) return;
        for(let i = 0;i < arr.length; i++){
            let _name = arr[i];
            let _node = this[_name];
            if(!_node || !cc.isValid(_node)) continue;
            _node.active = isBool;
        }
    },
    hideUINode: function(){
        let arr = ["icon_start","icon_bbdn","icon_2048","icon_challenge","icon_hc","rank_bbdn","rank_2048","rank_hc"];
        this.showNodeByArr(arr,false);
    },

    initExamineShow: function(){
        console.log("initExamineShow");
        
        this.hideUINode();

        if(!Examin.firstUse){
            this.setBtnPos();
            this.checkFirstExamin();
            return;
        }else{
            // CF.hideGameClubButton();
            let obj = {
                appId: G_FC.appId,
                sh: CF.sh_version,
                duration: 1200,    //开屏持续时间
                off: () => {
                    console.log("关审核")
                    console.log("审核参数---关：" + Examin.switchState);
    
                    let arr = ["icon_start","icon_bbdn","icon_2048","icon_challenge","icon_hc","rank_bbdn","rank_2048","rank_hc"];
                    this.showNodeByArr(arr,true);
    
                    CF.showGameClubButton();
                    // this.createRanking();
    
                    this.connectWXServer();
                    this.setBtnPos();
                    
                },
                on: () => {
                    console.log("开审核")
                    console.log("审核参数---开：" + Examin.switchState);
                    let arr = ["icon_start","icon_challenge"];
                    this.showNodeByArr(arr,true);
                    this.setBtnPos();
                    CF.showGameClubButton();
                    // this.createRanking();
                },
            }
            Examin.getExamineMsg(obj);
        }
    },

    checkFirstExamin: function(){
        console.log("checkFirstExamin: ");
        let arr;
        if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
            if(Examin.switchState == "0"){
                arr = ["icon_start","icon_bbdn","icon_2048","icon_challenge","icon_hc","rank_bbdn","rank_2048","rank_hc"];
            }else{
                arr = ["icon_start","icon_challenge"];
            }
            
        }else{
            //审核判断
            arr = ["icon_start","icon_challenge"];
        }
        this.showNodeByArr(arr,true);
        CF.showGameClubButton();
        // this.createRanking();
    },

    //按钮位置
    setBtnPos: function(){
        if(Examin.switchState == "0"){
            this.icon_start.position = cc.v2(6,203);
        }else{
            this.icon_start.position = cc.v2(6,0);
        }
    },

    wxAuthorize: function () {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN) {
            var self = this;
            if (CCGlobal.apiVer >= "2.0.5") {
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            let systemInfo = wx.getSystemInfoSync();
                            let h = systemInfo.windowHeight
                            let sizeW = 307 * (systemInfo.windowWidth / 720)
                            let sizeH = 126 * (systemInfo.windowWidth / 720)
                            let challenge = cc.find("challenge",self.node_start);
                            if(!cc.isValid(challenge)) return;
                            let pos = challenge.parent.convertToWorldSpaceAR(challenge);
                            let winH = cc.view.getVisibleSize().height
                            let top = h - (pos.y / winH) * h - sizeW / 2;
                            self.authButton = wx.createUserInfoButton({
                                type: 'text',
                                text: '',
                                style: {
                                    left: pos.x * (systemInfo.windowWidth / 720) - sizeW / 2,
                                    top: h - (pos.y / winH) * h - sizeH / 2,
                                    width: sizeW,
                                    height: sizeH,
                                    lineHeight: 40,
                                    // backgroundColor: '#00BFFF',
                                    // color: '#00BFFF',
                                    textAlign: 'center',
                                    fontSize: 16,
                                    borderRadius: 25
                                }
                            })
                            self.authButton.onTap((res) => {
                                if (res.userInfo) {
                                    self.isChangeAuthor = true;
                                    if(self.authButton) self.authButton.destroy();
                                }else{
                                }
                                
                            })
                            
                        } else {
                        }
                    }
                })
            }
        }
    },

    onDestroy: function(){
        G.isLoadScene = false;

        this.node.off("btn_online_click",this.online_game,this);
        CF.hideGameClubButton();
        // this.destroyAuthor();
        WXFeedBack.hideFeedBackButton();
        if(CF.setPool) CF.setPool.clear();
        if(CF.continuePool) CF.continuePool.clear();
        if(CF.publicPool) CF.publicPool.clear();
    },

    onDisable: function(){
        console.log("Menu onDisable.....");
        CF.hideGameClubButton();
        if(this.authButton) this.authButton.destroy();
        this.initBtnTouch(false);
    },
    // showHXGranking:function(){
    //     this.destroyAuthor();
    //     this.ShowFullRank({
    //        value:'HXG',
    //        title:'倒计时5秒，宇宙最强时间杀手即将现身！',
    //        image:"http://weixin.gzfingertip.cn/wegame/sharepic/lbx2.jpg",
    //     });
    // },

    // showBBDNranking:function(){
    //     this.destroyAuthor();
    //     this.ShowFullRank();

    // },

    btn_rank_bbdn: function(){
        // this.destroyAuthor();
        this.ShowFullRank("BBDN");
    },

    btn_rank_2048: function(){
        // this.destroyAuthor();
        this.ShowFullRank("N2048");
    },

    btn_rank_hc: function(){
        // this.destroyAuthor();
        this.ShowFullRank("HC");
    },

    ShowFullRank:function(_key){
        if(G.isLoadScene) return;

        if(CCGlobal.apiVer > '2.0.2'){
            CF.hideGameClubButton();
        }
        let self = this;
        // if(!this.rankingNode) return;
        let rankingNode1 = cc.find('FC_Menu/WXCommon/rankingUIStart')
        rankingNode1.getComponent("RankingUIStart").showFullList({
            onHide:function(){
                let parent = cc.find("FC_Menu");
                if(parent){
                    CF.showGameClubButton();
                }
            },
            key:_key
        },this);
    },

    // 隐藏排行榜
    hideRankUI: function(){
        let rankingNode1 = cc.find('FC_Menu/WXCommon/rankingUIStart');
        if(cc.isValid(rankingNode1)){
            rankingNode1.getComponent("RankingUIStart").hideRankingUI();
        }
    },
    
    // createRanking: function(){
    // },

    // createAuthorBtn: function(isTip){
    //     console.log("createAuthorBtn.....");

    //     if(!FC_UtilFunc.netState){
    //         console.log("netState false...");
    //         return;
    //     }

    //     if(this.AuthorBtn) return;
    //     console.log("AuthorBtn...null..");
        
    //     if(CCGlobal != undefined &&  CCGlobal.platform == 1){
    //         if(CCGlobal.apiVer <= "2.0.6") return;
    //     }

    //     let that = this;
    //     let btn_online = cc.find("FC_Menu/node_start/btn_online");
    //     if(!btn_online) return;
    //     let sizeW = btn_online.width;
    //     let sizeh = btn_online.height;

    //     let systemInfo = wx.getSystemInfoSync();
    //     let frameSize = cc.view.getFrameSize();
    //     let visibleSize = cc.view.getVisibleSize();

    //     console.log("systemInfo____",systemInfo);
    //     console.log("frameSize____",frameSize);
    //     console.log("visibleSize____",visibleSize);

    //     let pos = btn_online.parent.convertToWorldSpaceAR(btn_online);
    //     let totalY = visibleSize.height;   //渲染高度
    //     let totalX = visibleSize.width;   //渲染宽度

    //     let w = sizeW / 720 * frameSize.width;
    //     let h = sizeh / 2 ;

    //     let t =  (1 - (pos.y / totalY)) * systemInfo.windowHeight - (sizeh / 4);

    //     let l = frameSize.width / 2  - (w / 2);

    //     FC_Msg.isAuthor = false;
    //     this.isTipShow = isTip;
    //     this.AuthorBtn = wx.createUserInfoButton({
    //         type: 'text',
    //         text: '',
    //         style: {
    //             left:  l,
    //             top: t,
    //             width: w,
    //             height: h,
    //             lineHeight: h,
    //             backgroundColor: 'transparent'
    //         }
    //     });

    //     //通知common  创建了授权按钮
    //     CF.addAuthorBtnBool();

    //     //#FF000 #000
    //     this.AuthorBtn.show();
    //     this.AuthorBtn.onTap((res) => {
    //         console.log("onTap: ",res);
    //         console.log("netState: ",FC_UtilFunc.netState);
    //         if(FC_UtilFunc.netState){
    //             //通过授权
    //             if(res.errMsg == "getUserInfo:ok"){
    //                 that.destroyAuthor();
    //                 that.connectWXServer();
    //                 console.log("isAuthor: ",FC_Msg.isAuthor);
    //                 if(!FC_Msg.isAuthor && this.isTipShow){
    //                     wx.showToast({
    //                         title:'授权成功',
    //                         icon:'success',
    //                         duration: 2000,
    //                         mask: false,
    //                     })
    //                 }
    //                 FC_Msg.isAuthor = true;
    //                 //通知 是否真的删除了Menu的author的btn
    //                 CF.removeAuthorBtnBool();
    //             }else{
    //                 that.createAuthor();
    //             }
    //         }else{
    //             that.showTip(16);
    //         }      
    //     })
        
        
    // },

    createAuthor: function(isAuto){
        console.log("createAuthor...",isAuto);
        if(isAuto && !CF.isFirstAuthor){
            if(this.AuthorBtn) return;
            this.createAuthorBtn(false);
            return;
        }
        if(CCGlobal != undefined &&  CCGlobal.platform == 1){
            if(CCGlobal.apiVer <= "2.0.6") return;
        }
        if(!this.node_authorize) return;
        this.node_authorize.x = 0;
        CF.isFirstAuthor = false;
        FC_Msg.isAuthor = false;

        CF.hideGameClubButton();
        if(this.author_timeout){
            clearTimeout(this.author_timeout);
            this.author_timeout = null;
        }

        this.author_timeout = setTimeout(function(){
            console.log("author_timeout...");
            if(this.node_authorize) this.node_authorize.x = -3000;
            this.createAuthorBtn(true);
            let parent = cc.find("FC_Menu");
            if(parent){
                CF.showGameClubButton(); 
            }
             
            clearTimeout(this.author_timeout);
        }.bind(this),2000);

        
    },

    // hideAuthor: function(){
    //     if(this.AuthorBtn){
    //         this.AuthorBtn.hide();
    //     }
    // },

    // destroyAuthor: function(){
    //     console.log("destroyAuthor..");
    //     if(this.AuthorBtn){
    //         this.AuthorBtn.hide();
    //         this.AuthorBtn.destroy();
    //     }
    //     this.AuthorBtn = null;
    // },
    connectWXServer: function(){
        console.log("connectWXServer"); 
        let that = this;
        if(CCGlobal != undefined &&  CCGlobal.platform == 1){
            if(CCComFun){
                CCComFun.login({
                    appId: G_FC.appId,
                    success: res => {
                        console.log("connectWXServer success...");
                        FC_Msg.isWxLogin = true;
                        FC_Msg.openId = res.userInfo.openId;
                        FC_Msg.headUrl = res.userInfo.avatarUrl;
                        FC_Msg.user_name = res.userInfo.nickName;
                        if(!FC_Msg.isConnecting) {
                            FC_Msg.conn();
                        }
                    },
                    fail: res => {
                        console.log("connectWXServer fail...");
                        FC_Msg.isWxLogin = false;
                        wx.getSetting({
                            success: function (res) {
                                console.log("getSetting_res...",JSON.stringify(res));
                                var authSetting = res.authSetting;
                                if(authSetting){
                                    if (authSetting['scope.userInfo'] === true) {
                                        // 用户已授权
                                        // that.destroyAuthor();
                                        that.connectWXServer();
                                    } else if (authSetting['scope.userInfo'] === false){
                                        // 用户已拒绝授权
                                        that.createAuthor(true);
                                    } else {
                                        // 未询问过用户授权
                                        that.createAuthor(true);
                                    } 
                                }
                            }
                        });
                    }
                })
            }
        }
    },

    setWXShareShow: function(){
        // if(CCGlobal != undefined &&  CCGlobal.platform == 1){
        //     wx.showShareMenu({
        //         withShareTicket:true,
        //     })
        //     wx.onShareAppMessage(function () {
        //         return {
        //             title: "您的好友邀请你前来参与",
        //             imageUrl: 'http://weixin.gzfingertip.cn/wegame/sharepic/fxq.jpg',
        //             success: function () {
        //                 wx.showToast({
        //                     title: "分享成功"
        //                 })
        //             },
        //         }
        //     })
        // }
    },

    // showMoreGameIcon: function(isShow){
    //     console.log("------showMoreGameIcon----",isShow);
    //     let sp_more = cc.find("FC_Menu/node_start/sp_more");
    //     if(CCGlobal != undefined &&  CCGlobal.platform == 1){
    //         if(CCGlobal.apiVer > "2.0.2"){
    //             sp_more.opacity = isShow ? 255 : 0;
    //             sp_more.active = true;
    //             this.runMoreGameTip();
    //         }else{
    //             sp_more.opacity = 0;
    //             sp_more.active = true;
    //             this.stopMoreGameTip();
    //         }
    //     }else{
    //         sp_more.opacity = 0;
    //         sp_more.active = true;
    //         this.stopMoreGameTip();
    //     }
        
    // },

    // changeMoreGameIcon: function () {
    //     console.log("--changeMoreGameIcon---",G.moreGameIcon);
    //     var self = this;
    //     if(CCGlobal && CCGlobal.platform == 1) {
    //         //拿APP的配置
    //         CCComFun.getWxServConfig({
    //             appId: G_FC.appId,
    //             success: res => {
    //                 var obj = JSON.parse(res.cfg.QRCodes);    //转换成对象
    //                 G.iconList.length = 0;                 
    //                 for (const k in obj) {
    //                     if (obj.hasOwnProperty(k)) {
    //                         const element = obj[k];
    //                         G.iconList.push(obj[k].iconUrl);     //iconList存储的为图片的url
    //                     }
    //                 }
    //                 self.changeMoreGameIcon2();
    //             },
    //             fail: res => {
    //                 console.log("获取配置失败");
    //             }
    //         })
    //     }
    // },

    // changeMoreGameIcon2: function () {
    //     var self = this;
    //     if(!self.sp_more) return;
    //     if (G.moreGameIcon == -1) {
    //         G.moreGameIcon = Math.round(Math.random() * (G.iconList.length - 1));
    //         var remoteUrl = G.iconList[G.moreGameIcon];
    //         cc.loader.load(remoteUrl, function (err, texture) {                
    //             self.sp_more.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    //         });
    //         return;
    //     } else {
            
    //         let random = Math.random();
    //         let len = G.iconList.length;
    //         G.moreGameIcon = (Math.round( random * Math.ceil( len / 2)) + G.moreGameIcon + 1) % G.iconList.length ;
    //         var remoteUrl = G.iconList[G.moreGameIcon];
    //         cc.loader.load(remoteUrl, function (err, texture) {
    //             self.sp_more.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    //         });
    //         return;
    //     }
    // },

    // runGZHTips: function(){
    //     let sp_ghz = cc.find("FC_Menu/node_start/sp_ghz");
    //     if(!sp_ghz) return;
    //     sp_ghz.stopAllActions();
    //     let width = sp_ghz.width / 2;
    //     let ori_pos = sp_ghz.position;
    //     let new_pos = cc.v2(ori_pos.x - width,ori_pos.y);//this.sp_ghz.y
    //     sp_ghz.runAction(
    //         cc.repeatForever(cc.sequence(
    //             cc.moveTo(1,new_pos),
    //             cc.delayTime(3),
    //             cc.moveTo(1,ori_pos),
    //             cc.delayTime(3),
    //         ),-1)
    //     );
    // },

    // stopGZHTips: function(){
    //     console.log("stopGZHTips...");
    //     let sp_ghz = cc.find("FC_Menu/node_start/sp_ghz");
    //     if(!sp_ghz) return;
    //     sp_ghz.stopAllActions();
    // },


    // btn_like: function(parm,data){
    //     let num = 0;
    //     let str = "like_" + data;
    //     let head =  cc.find("icon_yourlove/" + str,this.node_start);

    //     head.runAction(cc.repeat(
    //         cc.sequence(
    //             cc.scaleTo(0.05, .6),
    //             cc.scaleTo(0.05, .5),
    //             cc.scaleTo(0.05, .4),
    //             cc.scaleTo(0.05, .5),
    //             cc.callFunc(function(){
    //                 num += 1;
    //                 if(num == 2){
    //                     this.runLikeGame(data);
    //                 }
    //             }.bind(this))
    //         ),
    //         2
    //     ));
    // },

    // runLikeGame: function(data){
    //     console.log("runLikeGame: ",data);
    //     let url_arr = ["http://weixin.gzfingertip.cn/wegame/qrConfig/duoniu.jpg",
    //             "http://weixin.gzfingertip.cn/wegame/qrConfig/2048.jpg",
    //             "http://weixin.gzfingertip.cn/wegame/qrConfig/xmbs1116.jpg",
    //             "http://weixin.gzfingertip.cn/wegame/qrConfig/szhrd.jpg"
    //         ];
    //     let id_arr = ["wxc1dedd8e3462f81c",
    //     "wxd88a985aaf017da5",
    //     "wx8166a4201d147672",
    //     "wx2cdfd544ea048378"
    //     ];
    //     let id = id_arr[data];
    //     let url = url_arr[data];
    //     if(!id || !url) return;
    //     if (CCGlobal.platform == 1) {
    //         if (CCGlobal.apiVer >= '2.2.0') {
    //             wx.navigateToMiniProgram({
    //                 appId: id,  //跳到天梨游戏
    //                 path: null,
    //                 extraData: { 'appId': id },
    //                 success: function () {
    //                     console.log('成功转到小程序');
    //                 },
    //                 fail: function (err) {
    //                     console.log('转到小程序失败', err);
    //                     let imglist = [url];
    //                     setTimeout(function(){
    //                         wx.previewImage({
    //                             current: imglist[0],
    //                             urls: imglist // 需要预览的图片http链接列表 
    //                         })
    //                     },600)
    //                 },
    //             })
    //         } else if (CCGlobal.apiVer > '2.0.2' && CCGlobal.apiVer < '2.2.0') {
    //             var imglist = [url];
    //             wx.previewImage({
    //                 current: imglist[0],
    //                 urls: imglist // 需要预览的图片http链接列表 
    //             })
    //         }
    //     }
    // },

    // //设置 下层按钮固定高度
    // setItemHeight: function(){
    //     console.log("setItemHeight");
    //     let size = cc.view.getVisibleSize();
    //     let height = -(size.height * 0.5) + 10;
    //     console.log("height: ",height);
    //     let icon_yourlove = cc.find("icon_yourlove",this.node_start);
    //     icon_yourlove.y = height;

    //     //替换 小游戏图标
    //     let url_arr = ["http://weixin.gzfingertip.cn/wegame/config/image/duoniu.png",
    //                     "http://weixin.gzfingertip.cn/wegame/config/image/2048.png",
    //                     "http://weixin.gzfingertip.cn/wegame/config/image/xmbs.png",
    //                     "http://weixin.gzfingertip.cn/wegame/config/image/huaRongDao.png"
    //                 ];
    //     for(let i = 0; i < url_arr.length; i++){
    //         let url = url_arr[i];
    //         let str_i = "like_" + i;
    //         let head =  cc.find("icon_yourlove/" + str_i,this.node_start);

    //         cc.loader.load({"url": url,type: "png"},function(err,texture){
    //             if(err){
    //                 return;
    //             }
    //             if(head) head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    //         })
    //     }

    // },

    // initGameCircle: function(isFirst){
    //     console.log("initGameCircle...",isFirst);
    //     // this.setItemHeight();
	// 	let gamecircle = cc.find("gamecircle",this.node_start);
    //     if(CCGlobal != undefined &&  CCGlobal.platform == 1){
    //         if(CCGlobal.apiVer > "2.0.2"){
    //             let systemInfo = wx.getSystemInfoSync();
    //             let frameSize = cc.view.getFrameSize();
    //             var sizeW = 85 * (systemInfo.windowWidth / 720);
    //             let pos = gamecircle.parent.convertToWorldSpaceAR(gamecircle);
    //             let total = cc.view.getVisibleSize().height;   //渲染高度
    //             var h = (1 - (pos.y / total)) * systemInfo.windowHeight - (sizeW / 2);
    //             let w = 50 / 720 * systemInfo.windowWidth;

    //             if (frameSize.width == 375 && frameSize.height == 812) {
    //                 h = (1 - (pos.y / total)) * systemInfo.windowHeight;
    //             }
    //             if(!WXGameClub.gameClubButton){
    //                 console.log("1...");
    //                 WXGameClub.createGameClubButton({
    //                     icon: 'white',
    //                     style: {
    //                         left: w,
    //                         top: h,
    //                         width: sizeW,
    //                         height: sizeW
    //                     }
    //                 });
    //             }else{
    //                 console.log("2...");
    //                 if(WXGameClub.gameClubButton.icon == "white"){
    //                     WXGameClub.setButtonStyle({
    //                         left: w,
    //                         top: h,
    //                         width: sizeW,
    //                         height: sizeW,
    //                     });
    //                 }else{
    //                     WXGameClub.destroyGameClubButton();
    //                     WXGameClub.createGameClubButton({
    //                         icon: 'white',
    //                         style: {
    //                             left: w,
    //                             top: h,
    //                             width: sizeW,
    //                             height: sizeW
    //                         }
    //                     });
    //                 }
                    
    //             } 
    //             if(isFirst){
    //                 CF.hideGameClubButton();
    //             }else{
    //                 CF.showGameClubButton();
    //             }

    //         }
    //     }
    // },

    // initFeedBack: function(){
    //     let icon_feedback = cc.find("icon_feedback",this.node);
    //     if(CCGlobal != undefined &&  CCGlobal.platform == 1){
    //         if(WXFeedBack.feedBackButton){
    //             WXFeedBack.showFeedBackButton();
    //             return;
    //         }
    //         let systemInfo = wx.getSystemInfoSync();
    //         let sizeW = 85 * (systemInfo.windowWidth / 720);
    //         let pos = icon_feedback.parent.convertToWorldSpaceAR(icon_feedback.position);
    //         let total = cc.view.getVisibleSize().height;   //渲染高度
    //         let h = (1 - (pos.y / total)) * systemInfo.windowHeight - (sizeW / 2);
    //         let w = 50 / 720 * systemInfo.windowWidth;
    //         let obj = {
    //             type: "image",
    //             style: {
    //                 left: w,
    //                 top: h,
    //                 width: sizeW,
    //                 height: sizeW
    //             }
    //         };
    //         WXFeedBack.createFeedBackButton(obj);
    //     }
    // },

    // initMoreGame: function(){
	// 	let sp_more = cc.find("sp_more",this.node_start);
		
    //     if(CCGlobal != undefined &&  CCGlobal.platform == 1){
    //         if(CCGlobal.apiVer > "2.0.2"){
    //             sp_more.opacity   = 255;
    //             this.runMoreGameTip();
    //         }else{
    //             sp_more.opacity   = 0;
    //             this.stopMoreGameTip();
    //         }   
    //     }else{
    //         sp_more.opacity   = 0;
    //         this.stopMoreGameTip();
    //     }
    // },

    // runMoreGameTip: function(){
	// 	if(!this.sp_more) return;
    //     this.sp_more.stopAllActions();
    //     this.sp_more.runAction(
    //         cc.repeatForever(cc.sequence(
    //             cc.scaleTo(1,1.2),
    //             cc.scaleTo(1,1),
    //             cc.rotateTo(.1,45),
    //             cc.rotateTo(.1,-45),
    //             cc.rotateTo(.1,45),
    //             cc.rotateTo(.1,-45),
    //             cc.rotateTo(.1,0),
    //         ),-1)
    //     );
    // },

    // stopMoreGameTip: function(){
	// 	if(!this.sp_more) return;
    //     this.sp_more.stopAllActions();
    //     this.sp_more.scale = 1;
    // },

    initGlobal: function(){
        CF.resetGlobal();
    },

    btn_start: function(){
        let mark = cc.sys.localStorage.getItem("fc_skin2_playpeople");
        if(!mark){
            Statistics.reportEvent("playpeople","FC","count");
            cc.sys.localStorage.setItem("fc_skin2_playpeople", 1);
        }
        // this.destroyAuthor();
        FC_Msg.setGameType(CST.GAMETYPE.personToperson);
        CF.setMapByType(0);
        //检测是否有记录
        if(CF.checkGameRecord()){
            CF.hideGameClubButton();
            this.showUIContinue();
        }else{
            this.showUISet();
        }
    },

    showTip: function(id){   //修改指令显示

        if(this.root_tips){
            this.root_tips.getComponent("FC_Tips").clear();
        }

        let root_tips = null;
        if(CF.tipsPool){
            if(CF.tipsPool.size() > 0){
                root_tips = CF.tipsPool.get();
            }else{
                root_tips = cc.instantiate(this.Tips);
            }
        }else{
            root_tips = cc.instantiate(this.Tips);
            CF.tipsPool = new cc.NodePool();
        }

        if(!this.node) return;
        if(!root_tips) return;

        this.node.addChild(root_tips,100);
        root_tips.position = cc.v2(0,0);
        this.root_tips = root_tips;
        this.root_tips.getComponent("FC_Tips").showTip(id);
    },

    // //匹配
    // btn_online: function(){
    //     let that = this;
    //     console.log("netState ",FC_UtilFunc.netState);
    //     console.log("isWxLogin___ ",FC_Msg.isWxLogin);

    //     if(!FC_UtilFunc.netState){
    //         this.showTip(16);
    //         return;
    //     }
    //     if(!FC_Msg.isWxLogin){
    //         if(CCGlobal != undefined &&  CCGlobal.platform == 1){
    //             if(CCGlobal.apiVer <= "2.0.6"){
    //                 //showModel界面
    //                 wx.showModal({
    //                     title: '提示',
    //                     content: '游戏需要您授权头像和用户名信息',
    //                     success: function(msg) {    
    //                         console.log("showModal success",JSON.stringify(msg));
    //                         if (msg.confirm) {      
    //                             console.log('yes');
    //                             //设置界面
    //                             wx.openSetting({
    //                                 success:function(res){
    //                                     console.log("openSetting success",JSON.stringify(res));
    //                                     let authSetting = res.authSetting;
    //                                     if(authSetting){
    //                                         if (authSetting['scope.userInfo'] === true) {
    //                                             // 用户已授权
    //                                             // that.destroyAuthor();
    //                                             // that.connectWXServer();
    //                                         } else if (authSetting['scope.userInfo'] === false){
    //                                             // 用户已拒绝授权
    //                                             // that.createAuthor();
                                                
    //                                         } else {
    //                                             // 未询问过用户授权
    //                                         }
    //                                     }
    //                                 },
    //                                 fail: function(){
    //                                     console.log("openSetting fail");
    //                                 },
    //                                 complete: function(){
    //                                     console.log("openSetting complete");
    //                                 }
    //                             })
    //                         }
    //                     }
    //                 })
                    
    //             }else{
    //                 //如果 授权按钮被清理掉 重新创建
    //                 // if(!this.AuthorBtn){
    //                 //     this.createAuthor(true);
    //                 // }
    //             }
    //         }
    //         return;
    //     }
    //     console.log("isConnecting...",FC_Msg.isConnecting);
    //     if(!FC_Msg.isConnecting){
    //         FC_UtilFunc.showLoading(4,15);
    //         this.node.on("btn_online_click",this.online_game,this);
    //         return;
    //     }

    //     //重连中 屏蔽点击 等待重连操作
    //     if(FC_Msg.reconnet){
    //         return;
    //     }

    //     this.online_game();
    // },

    online_game: function(){
        if(G.isLoadScene) return;
        G.isLoadScene = true;

        FC_Msg.setGameType(CST.GAMETYPE.pvp);
        // this.clear();
        //是否已在场景中
        this.hideRankUI();
        let scene = cc.director.getScene();
        if(scene.name != "FC_Game"){
            cc.director.preloadScene("FC_Game",function(){
                setTimeout(function(){
                    cc.director.loadScene("FC_Game");
                },100);
            });
        }
    },

    showUISet: function(){
        CF.hideGameClubButton();
        let ui_set = null;
        if(CF.setPool){
            if(CF.setPool.size() > 0){
                ui_set = CF.setPool.get();
            }else{
                ui_set = cc.instantiate(this.UISetPrefab);
            }
        }else{
            ui_set = cc.instantiate(this.UISetPrefab);
            CF.setPool = new cc.NodePool();
        }
        this.root_set = ui_set;
        if(this.authButton) this.authButton.destroy();
        if(ui_set) this.node.addChild(ui_set);
    },

    showUIContinue: function(){
        let ui_continue = null;
        if(CF.continuePool){
            if(CF.continuePool.size() > 0){
                ui_continue = CF.continuePool.get();
            }else{
                ui_continue = cc.instantiate(this.UIContinuePrefab);
            }
        }else{
            ui_continue = cc.instantiate(this.UIContinuePrefab);
            CF.continuePool = new cc.NodePool();
        }
        this.root_continue = ui_continue;
        if(this.authButton) this.authButton.destroy();
        if(ui_continue) this.node.addChild(ui_continue);
    },

    btn_challenge: function(){
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
            //         console.log("btn_challenge222");
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

    // publicNum: function(){
    //     // this.destroyAuthor();
    //     CF.showGameClubButton();
    //     this.showUIPublic();
    // },

    // showUIPublic: function(){
    //     let ui_public = null;
    //     if(CF.publicPool){
    //         if(CF.publicPool.size() > 0){
    //             ui_public = CF.publicPool.get();
    //         }else{
    //             ui_public = cc.instantiate(this.UIPublicPrefab);
    //         }
    //     }else{
    //         ui_public = cc.instantiate(this.UIPublicPrefab);
    //         CF.publicPool = new cc.NodePool();
    //     }
    //     this.root_public = ui_public;
    //     if(ui_public) this.node.addChild(ui_public);
    // },

    btn_hxg: function(){
        if(G.isLoadScene) return;
        G.isLoadScene = true;

        //暂时用的 六边形多玩法
        CF.hideGameClubButton();
        this.hideRankUI();
        cc.director.preloadScene("HexagonGameScene",function(){
            setTimeout(function(){
                cc.director.loadScene("HexagonGameScene"); 
            },50);
        });
    },

    btn_bbdn: function(){
        if(G.isLoadScene) return;
        G.isLoadScene = true;
        //暂时用的 六边形多玩法
        CF.hideGameClubButton();
        this.hideRankUI();
        cc.director.preloadScene("BBDN_GameScene",function(){
            setTimeout(function(){
                cc.director.loadScene("BBDN_GameScene");
            },50);
        });
    },

    btn_2048: function(){
        if(G.isLoadScene) return;
        G.isLoadScene = true;

        CF.hideGameClubButton();
        this.hideRankUI();
        cc.director.preloadScene("N2048_GamaScene",function(){
            setTimeout(function(){
                cc.director.loadScene("N2048_GamaScene");
            },50);
        });
    },

    btn_hc: function(){
        if(G.isLoadScene) return;
        G.isLoadScene = true;

        CF.hideGameClubButton();
        this.hideRankUI();
        cc.director.preloadScene("HC_GameScene",function(){
            setTimeout(function(){
                cc.director.loadScene("HC_GameScene");
            },50);
        });
    },

    bindMessageCallBack: function(){
        let that = this;
        FC_Msg['0xb011'] = function(msg){
            that.login_success(msg);
        };
        FC_Msg["0xb014"] = function(msg){
            that.login_fail(msg);
        };
        FC_Msg['0xa021'] = function(msg){
            that.getSingePlayerInfo(msg);
        };
        FC_Msg["0xb039"] = function(msg){
            that.gameGMBResult(msg);
        };
        FC_Msg["0xb081"] = function(msg){
            that.requestConnectResult(msg);
        };
        FC_Msg["0x4011"] = function(msg){
            that.ALLplayerInfo_result(msg);
        };
        FC_Msg["0x9025"] = function(msg){
            that.tellRunPiece(msg);
        };
        FC_Msg["0x9050"] = function(msg){
            that.reComeGame(msg);
        };
        FC_Msg["online_open"] = function(){
          that.online_open();  
        };
        FC_Msg["online_close"] = function(){
            that.online_close();  
        };
    },

    online_open: function(){

    },

    online_close: function(){

    },

    login_success: function(msg){
        FC_Msg.setDataByKey(msg,"userInfo");
        FC_UtilFunc.hideLoading();

        wx.showToast({
            title:'微信后台登录成功',
            icon:'success',
            duration: 2000,
            mask: false,
        })

        //通知服务器 修改信息
        //修改昵称 头像(大于128 不上传)
        let url = ""; 
        if(FC_Msg.headUrl){
            if(FC_Msg.headUrl.length > 128){
                url = FC_Msg.headUrl;
            }else{
                url = "";
            }
        }
        let changeMessage = {
            cmdType: '0xa010',
            data: {
                userID: FC_Msg.userInfo["userID"],
                qq_number: "",
                sex: false,
                nick_name: FC_Msg.user_name,
                image_url: url,
                province: "",
                city:"",
            }
        };
        FC_Msg.send(changeMessage);
        //寻问 同步状态
        let message = {
            cmdType: '0xb080',
            data: {
                user_id: FC_Msg.userInfo["userID"],
            }
        };
        FC_Msg.send(message);

        this.node.emit("btn_online_click");

        FC_Msg.runNextMsg();
    },

    login_fail: function(){
        FC_Msg.runNextMsg();
        return;
    },

    gameGMBResult: function(msg){
        FC_Msg.refreshUserGMB(msg);
        FC_Msg.runNextMsg();
    },

    ALLplayerInfo_result: function(msg){
        // FC_Msg.setDataByKey(msg,"playerInfo");
        // FC_Msg.setDataByKey(msg,"enemyInfo");
        // console.log("--t--playerInfo---",FC_Msg.playerInfo);
        // console.log("--t--enemyInfo---",FC_Msg.enemyInfo);
        // FC_Msg.state = 1;
        FC_Msg.state = 1;

        console.log("msg.data length: ",msg.datas.length);
        if(msg.datas.length > 1){
            for(let i in msg.datas){
                let i_data = msg.datas[i];
                if(i_data.userID == FC_Msg.userInfo["userID"]){
                    FC_Msg.setDataByKey(msg,"playerInfo");
                    FC_Msg.setAllPlayerInfo(i_data);
                }else{
                    FC_Msg.setAllPlayerInfo(i_data);
                }
            }
        }else{
            let data = msg.datas[0];
            if(data.userID == FC_Msg.userInfo["userID"]){
                FC_Msg.setDataByKey(msg,"playerInfo");
                FC_Msg.setAllPlayerInfo(data);
            }else{
                FC_Msg.setAllPlayerInfo(data);
            }
        }
        FC_Msg.runNextMsg();
    },

    requestConnectResult: function(msg){ //------------------------寻问 同步状态
        let data = msg.datas[0];
        FC_Msg.state = data.state;
        FC_Msg.runNextMsg();
    },

    tellRunPiece: function(msg){ //-----------------------------通知 行棋
        let data = msg.datas[0];
        FC_Msg.cur_color = data.color;
        FC_Msg.cur_count = data.diceCount;
        console.log("*********tellRunPiece diceCount*********: ",data.diceCount);
        FC_Msg.runNextMsg();
    },

    reComeGame: function(msg){ //--------------------重连游戏状态设置
        console.log("----reComeGame-----",JSON.stringify(msg.datas));
        let data = msg.datas[0];
        //数据刷新
        FC_Msg.reConnectData = data;
        FC_Msg.reconnet = true;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson) return;
        FC_Msg.setGameType(CST.GAMETYPE.pvp);
        this.hideLoading();
        FC_Msg.state = 2;
        // 0：进入游戏大厅 1：进入房间 2: 在桌上游戏
        if(FC_Msg.state == CST.GAMESTATE.seat){
            FC_Msg.state = 2;//游戏中
            FC_Msg.isResetMap = true;
            FC_Msg.gameOver = false;
            FC_Msg.playerColor = data.playerColor;
            console.log("playerColor_________________",data.playerColor); 
            //设置player_idx
            CF.player_idx = data.playerColor[FC_Msg.playerInfo["deskSeatID"]];
            //设置 幸运数
            G_FC.Plane_Active_Type = 1;
            G_FC.OpenIdxArr = [0,0,0,0];
            G_FC.PlayerNum = G_FC.OpenIdxArr.length;

            let scene = cc.director.getScene();
            if(scene.name != "FC_Game"){
                if(G.isLoadScene) return;
                G.isLoadScene = true;
                this.hideRankUI();
                cc.director.preloadScene("FC_Game",function(){
                    setTimeout(function(){
                        cc.director.loadScene("FC_Game");
                    },100);
                });
            }
        }

        FC_Msg.runNextMsg();
    },

    showLoading: function(time,tips){ //等待网络回执 loading、
        CF.hideGameClubButton();
        CF.hideBanner();
        if(time == undefined){
            time = 1;
        }
        if(tips == undefined){
            FC_UtilFunc.tips = -1;
        }else{
            FC_UtilFunc.tips = tips;
        }
        let limitTime = time * 5;

        if(!this.loading){
            this.limitTime = -1;
        }
    
        if(FC_UtilFunc.loading && FC_UtilFunc.loading.children) {
            if(Number(this.limitTime) < Number(limitTime)){
                this.limitTime = limitTime;
            }
            if(!FC_UtilFunc.tips || FC_UtilFunc.tips == "-1"){
                return;
            }else{
                console.log("menu loading: ",FC_UtilFunc.loading);
                let loadCom = FC_UtilFunc.loading.getComponent("FC_LoadMessage");
                if(loadCom){
                    loadCom.showContent();
                }
            }
            return;
        }else{
            if(FC_UtilFunc.isCreating) return;
            this.hideLoading();
            this.limitTime = limitTime;
            if(!this.node) return;
            let node_load = cc.instantiate(this.loadUI);
            FC_UtilFunc.isCreating = true;
            this.loadInter = setTimeout(function(){
                if(node_load){
                    this.node.addChild(node_load,300);
                    FC_UtilFunc.loading = node_load;
                    node_load.position = cc.v2(0,0);
                    FC_UtilFunc.isCreating = false;
                    this.waitTime();
                }
                clearTimeout(this.loadInter);
            }.bind(this),1000);
        }
    },

    waitTime: function(time){
        let that = this;
        if(that.loadInter) clearInterval(this.loadInter);
        if(this.limitTime == 0){
            //一直显示loading
            // this.hideLoading();
            return;
        }
        this.waitInter = setInterval(function(){
            that.limitTime -= 1;
            console.log("waitInter: ",that.limitTime);
            if(that.limitTime <= 0){
                console.log("waitTime hide");
                that.hideLoading();
                clearTimeout(that.waitInter);
            }
        }.bind(that),1000);
    },

    hideLoading: function(){
        if(FC_UtilFunc.loading) FC_UtilFunc.loading.removeFromParent();
        FC_UtilFunc.loading = null;
        clearTimeout(this.loadInter);
        clearInterval(this.waitInter);
        //刷新 游戏圈和广告的显示
        if(this.root_public && this.root_public.isValid){
            CF.hideGameClubButton();
        }else if(this.root_continue && this.root_continue.isValid){
            CF.hideGameClubButton();
        }else if(this.root_set && this.root_set.isValid){
            CF.hideGameClubButton();
            CF.showBanner();
        }else{
            CF.showBanner();
            CF.showGameClubButton();
        }
    },

    // backToMenuCreateAuthor: function(){
    //     if(!CF.isAuthorBool) return;
    //     let that = this;
    //     wx.getSetting({
    //         success: function (res) {
    //             console.log("getSetting_res...",JSON.stringify(res));
    //             var authSetting = res.authSetting;
    //             if(authSetting){
    //                 if (authSetting['scope.userInfo'] === true) {
    //                     // 用户已授权
    //                     // that.destroyAuthor();
    //                 } else if (authSetting['scope.userInfo'] === false){
    //                     // 用户已拒绝授权
    //                     that.createAuthor(true);
    //                 } else {
    //                     // 未询问过用户授权
    //                     that.createAuthor(true);
    //                 } 
    //             }
    //         }
    //     });
    // },
});
