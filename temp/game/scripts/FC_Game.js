let CST = require("FC_Constant");
let CF = require("FC_CommFun");
let FC_Msg = require("FC_Msg");
let FC_UtilFunc = require("FC_UtilFunc");
let Statistics = require("Statistics");
cc.Class({
    extends: cc.Component,

    properties: {
        PlanePrefab: cc.Prefab,
        BombPrefab: cc.Prefab,
        UISetPrefab: cc.Prefab,
        StockPrefab: cc.Prefab,
        MatchPrefab: cc.Prefab,
        PosPrefab: cc.Prefab,
        Tips:   cc.Prefab,
        loadUI: cc.Prefab,
        pauseViewPrefab: cc.Prefab,
        helpViewPrefab: cc.Prefab,

        node_ori: cc.Node,
        node_start: cc.Node,
        node_out: cc.Node,
        node_in: cc.Node,
        node_plane: cc.Node,
        node_bomb: cc.Node,
        node_command: cc.Node,
        sp_0: cc.Node,
        sp_1: cc.Node,
        sp_2: cc.Node,
        sp_3: cc.Node,
        
        node_game: cc.Node,
        node_over: cc.Node,
        node_stock: cc.Node,
        node_arrow:cc.Node,
        node_head: cc.Node,
        node_time: cc.Node,
        node_pos: cc.Node,
        node_ad: cc.Node,

        orderArr: [cc.SpriteFrame],
        headFrameArr: [cc.SpriteFrame],
        defaultFrameArr: [cc.SpriteFrame],
        timeFrameArray:  [cc.SpriteFrame],
        bgHeadFrameArray:  [cc.SpriteFrame],
        progressFrameArray: [cc.SpriteFrame],

        head_0: cc.Sprite,
        head_1: cc.Sprite,
        head_2: cc.Sprite,
        head_3: cc.Sprite,
    },
    onLoad () {
        console.log("FC_Game onLoad");
        CF.hideBanner();
        G.isLoadScene = false;
        this.enabled = true;
        //绑定服务器回调
        this.bindMessageCallBack();
        this.initCommonData();
        // this.initFinishArr();
        this.initButtonShow();
        this.initOriPos();//初始化 飞机场坐标
        this.initFlyStartPos();//初始化 起飞点坐标
        this.initFlyOutPos();//初始化 飞出去坐标
        this.initFlyInPos();//初始化 飞回来坐标
        this.initArrow(true);//初始化 箭头显示

        // 初始化
        this.pauseViewPool = new cc.NodePool("FC_PauseView");
        this.helpViewPool = new cc.NodePool("FC_HelpView");
        this.pauseViewPool.put(cc.instantiate(this.pauseViewPrefab));
        this.helpViewPool.put(cc.instantiate(this.helpViewPrefab));
        this.pauseView = null;
        this.helpView = null;

        // 统计
        Statistics.reportEvent("playtime","FC","time");
        Statistics.reportEvent("starttimes","FC","count");
    },

    // 显示暂停页面
    showPauseView: function(){
        if(this.pauseViewPool.size() == 0) return;

        this.pauseView = this.pauseViewPool.get({
            pool: this.pauseViewPool,
            restartFunc: this.replay.bind(this),
            helpCallback: this.showHelpView.bind(this),
        })
        this.node.addChild(this.pauseView);
        this.pauseView.setPosition(cc.v2(0, 0));
    },

    // 显示帮助页面
    showHelpView: function(){
        if(this.helpViewPool.size() == 0) return;

        this.helpView = this.helpViewPool.get(this.helpViewPool);
        this.node.addChild(this.helpView);
        this.helpView.setPosition(cc.v2(0, 0));
    },

    onEnable: function(){
        console.log("FC_Game onEnable");

        // 回收暂停/帮助页面
        if(!!this.pauseView && !!this.pauseView.parent){
            this.pauseViewPool.put(this.pauseView);
            this.pauseView = null;
        }
        if(!!this.helpView && !!this.helpView.parent){
            this.helpViewPool.put(this.helpView);
            this.helpView = null;
        }

        this.node_game.x = 0;
        this.node_over.x = 3000;

        this.mapRotationIdx = 0;

        CF.hideGameClubButton();
        CF.initSysStockRecord();//系统检测初始化
        this.initRootStock();
        this.initOrderShow();//初始化 筛子显示
        this.initArrow();//初始化 箭头显示
        this.initTimeCount(); //初始化 倒计时显示
        

        //检测是否需要 继续游戏
        console.log("gameType...",FC_Msg.gameType);
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            let isRecord = CF.checkGameRecord();
            console.log("isReord...",isRecord);
            if(isRecord){
                CF.resetGameState();
                this.initFinishArr();
                CF.resetFinshNum();
            }else{
                this.initFinishArr();
            }
            
            this.initMap();
            this.randomHead();
            this.initPlayerName();
            this.initPlayerHead();
            this.initAllPlaneData();//初始化 所有飞机数据
            this.createAllPlane();//创建 所有飞机模型
            if(isRecord){
                CF.resetPlaneState();
                // CF.setNextOrder();
                CF.changeCommand(CST.Update_Command.Ready,6);
            }else{
                CF.changeCommand(CST.Update_Command.Ready,0);
            }
            
            this.showTip();//指令显示
        }else{
            //设置玩家头像和名字
            if(FC_Msg.isResetMap){
                this.initMap();
                FC_Msg.isResetMap = false;
            }
            this.randomHead();
            this.initFinishArr();
            this.showTip();//指令显示
            this.node_head.active = false; //隐藏单机头像框
            // this.showPlayerHead(false);

            if(!FC_Msg.reConnectData){ //请求房间列表
                this.showPlayerHead(false);
                if(!this.isNewGame){
                    this.request_room_list();
                }
                this.isNewGame = false;
                FC_Msg.runNextMsg();
            }else{ //重连刷新
                //刷新棋子数据
                CF.completeArr = FC_Msg.reConnectData.playerRank;
                
                //颜色
                FC_Msg.playerColor = FC_Msg.reConnectData.playerColor;
                //设置player_idx
                CF.player_idx = FC_Msg.playerColor[FC_Msg.playerInfo["deskSeatID"]];
                
                let seat = FC_Msg.playerInfo["deskSeatID"];
                let user_color = FC_Msg.playerColor[seat];

                //刷新头像
                let headList = FC_Msg.reConnectData.playerUseHead;
                console.log("headList: ",headList);
                if(headList){
                    for(let h = 0; h < headList.length; h++){
                        let h_head = headList[h];
                        let h_color = FC_Msg.playerColor[h];
                        
                        //判定4011 玩家数据是否还在
                        if(FC_Msg.allPlayerInfos["" + h] == undefined || Object.keys(FC_Msg.allPlayerInfos["" + h]).length == 0){
                            console.log("----1----");
                            this.showPlayerHead(false);
                        }else{
                            //完成
                            console.log("----2----");
                            let isIndexOf = FC_Msg.reConnectData.playerRank.indexOf(h_color);
                            if(isIndexOf == "-1"){
                                this.showPlayerHead(true,h,h_head,true);
                            }else{
                                this.showPlayerHead(true,h,h_head);
                            }
                        }
                    }
                }
                //超时次数
                FC_Msg.timeOutTimes = FC_Msg.reConnectData.timeOutTimes;
                console.log("timeOutTimes_____________ ",FC_Msg.timeOutTimes);
                if(FC_Msg.timeOutTimes){
                    for(let t = 0; t < FC_Msg.timeOutTimes.length; t++){
                        let t_time = FC_Msg.timeOutTimes[t];
                        //转换seat
                        // let t_seat = CF.getIdxBySeat(t);
                        console.log("t______________________ ",t);
                        let t_color = FC_Msg.playerColor[t];
                        //判定4011 玩家数据是否还在
                        if(FC_Msg.allPlayerInfos["" + t] == undefined || Object.keys(FC_Msg.allPlayerInfos["" + t]).length == 0){
                            this.showTimeCount(false,t);
                        }else{
                            // let isIndexOf = FC_Msg.reConnectData.playerRank.indexOf(t_color);
                            // console.log("isIndexOf: ",isIndexOf);
                            // //检测完成
                            // if(isIndexOf != -1){ 
                            //     this.showTimeCount(true,t);
                            // }else{
                            //     if(Number(t_time) >= 1){
                            //         this.showTimeCount(true,t,true); //显示超时次数
                            //     }else{
                            //         this.showTimeCount(true,t); //显示超时次数
                            //     }
                            // }
                            if(Number(t_time) >= 1){
                                this.showTimeCount(true,t,true); //显示超时次数
                            }else{
                                this.showTimeCount(true,t); //显示超时次数
                            }
                        }
                        
                    }
                }
                //清除界面所有旗子
                this.clear();
                console.log("-----clear----");
                //重置 棋子位置
                this.initAllPlaneData();//初始化 所有飞机数据
                console.log("-----initAllPlaneData----");
                this.createAllPlane();//创建 所有飞机模型

                //格式化 飞机数据
                let planePos = FC_Msg.reConnectData.planePos;
                console.log("-----planePos----");
                

                let newPosArr = [];
                let arr = [];
                if(planePos){
                    let isGet = false;
                    for(let p = 0; p < planePos.length; p++){
                        if(parseInt(p / 4) == user_color){
                            isGet = true;
                        }
                        if(isGet) {
                            newPosArr.push(planePos[p]);
                        }else{
                            arr.push(planePos[p]);
                        }
                    }

                    //合并数组
                    newPosArr.push.apply(newPosArr,arr);
                    arr = [];
                }
                console.log("newPosArr: ",newPosArr);

                //重置 颜色列表
                let color_arr = [];
                let arr_c = [];
                for(let c = 0; c < FC_Msg.playerColor.length; c++){
                    if(FC_Msg.playerColor[c] == CF.player_idx){
                        color_arr.push(FC_Msg.playerColor[c]);
                    }else{
                        arr_c.push(FC_Msg.playerColor[c]);
                    }
                }
                color_arr.push.apply(color_arr,arr_c);
                arr_c = [];
                console.log("color_arr: ",color_arr);
                console.log("this.Fly_Ori_Pos_Arr: ",CF.Fly_Ori_Pos_Arr);
                if(this.node_plane){
                    let childs = this.node_plane.getChildren();
                    console.log("childs length: ",childs.length);
                    for(let i = 0; i < childs.length; i++){
                        var i_child = childs[i];
                        if(!i_child) continue;
                        // console.log("i__________________",i);
                        let i_pos;
                        var i_type;

                        var i_color = color_arr[parseInt(i / 4)];

                        if(newPosArr[i] == 0){ 
                            
                            //全部完成
                            let indexOf_idx = FC_Msg.reConnectData.playerRank.indexOf(i_color);
                            if(indexOf_idx != -1){
                                //判定rank前方是否有空位 或者说是强退或者超时结束了游戏
                                if(indexOf_idx == 0){
                                    i_type = CST.ActiveType.Back;
                                }else{
                                    let isBack = true;
                                    for(let pp = indexOf_idx; pp >= 0; pp--){
                                        let pp_rank = FC_Msg.reConnectData.playerRank[pp];
                                        if(pp_rank == "0" || pp_rank == "1" || pp_rank == "2" || pp_rank == "3") continue;
                                        isBack = false;
                                    }
                                    console.log("isBack: ",isBack,i_color);
                                    if(isBack){
                                        i_type = CST.ActiveType.Back;
                                    }else{
                                        i_type = CST.ActiveType.unActive;
                                    }
                                }
                            }else{//机场
                                //状态
                                i_type = CST.ActiveType.unActive;
                            }
                            //坐标  
                            i_pos = CF.Fly_Ori_Pos_Arr[i];
                            i_child.data.Current_idx = -1;
                            
                        }else if(newPosArr[i] == 1){ //起飞点
                            //状态
                            i_type = CST.ActiveType.Stand;
                            //坐标 
                            i_pos = CF.Fly_Start_pos[parseInt(i / 4)];
                            i_child.data.Current_idx = -1;
                            i_child.data.FlyLineType = CST.FlyLineType.Line_Start;
                        }else if(newPosArr[i] >= 57){ //已完成
                            //状态
                            i_type = CST.ActiveType.Back;
                            //坐标 
                            i_pos = CF.Fly_Ori_Pos_Arr[i];
                            i_child.data.Current_idx = -1;
                            i_child.data.FlyLineType = CST.FlyLineType.Line_Airport;
                        }else if(newPosArr[i] > 51 && newPosArr[i] < 57){ //内航线
                            //状态
                            i_type = CST.ActiveType.Stand;
                            //坐标 
                            let dis = newPosArr[i] - 51 - 1;
                            i_pos = CF.Fly_In_Pos_Arr[parseInt(i / 4) * 6 + dis];
                            i_child.data.Current_idx = parseInt(i / 4) * 6 + dis;
                            i_child.data.FlyLineType = CST.FlyLineType.Line_in;
                        }else{ //外航线
                            //状态
                            i_type = CST.ActiveType.Stand;
                            //坐标 
                            let cur_idx =  Number(i_child.data.Start_idx) + newPosArr[i] - 2;
                            if(cur_idx > 51){
                                cur_idx = cur_idx - 51 - 1;
                            }
                            i_pos = CF.Fly_Out_Pos_Arr[cur_idx];
                            i_child.data.Current_idx = cur_idx;
                            i_child.data.FlyLineType = CST.FlyLineType.Line_Out;
                        }
                        // console.log("Current_idx: ",i_child.data.Current_idx);
                        // console.log("ActiveType: ",i_type);
                        i_child.data.ActiveType = i_type;
                        i_child.position = i_pos;

                        if(i_child.data.ActiveType == CST.ActiveType.Back){
                            i_child.getComponent("FC_Plane").icon = 4;
                        }else{
                            i_child.getComponent("FC_Plane").icon = i_color;
                            //方向
                            CF.changePlaneDirection(i_child.data.Order);
                        }

                        //颜色
                        console.log("color: ",i_color);
                        //跌机处理
                        CF.dropMachine(i_child);

                    }
                }
                FC_Msg.reConnectData = null;
                setTimeout(function(){
                    FC_Msg.runNextMsg();
                },500)
            }

        }
        FC_Msg.reconnet = false;
        
        //banner
        this.showGameAd();
    },

    start: function(){
        
    },

    onDisable: function(){
    },

    onDestroy: function(){
        this.clear();
    },

    checkCreateBanner: function(){
        let systemInfo = wx.getSystemInfoSync();
        if(systemInfo.windowWidth <= 320 || systemInfo.windowHeight <= 640){
            return false;
        }
        return true;
    },

    showGameAd: function(){

        if(!this.checkCreateBanner()){
            return;
        }
        let ad_pos;
        let ad_key;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            ad_key = "FC_1"
            ad_pos = "banner2"
        }else{
            ad_key = "FC_2"
            ad_pos = "banner2"
        }

        CF.createBanner(this.node_ad,{key: ad_key,pos: ad_pos});
    },

    initButtonShow: function(){
        if(!this.node_game) return;
        let btn_return = this.node_game.getChildByName("btn_return");
        let replay = this.node_game.getChildByName("replay");
        let runaway = this.node_game.getChildByName("runaway");
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(btn_return) btn_return.active = false;   // 2019/10/23 更新去掉
            if(replay) replay.active = false;           // 2019/10/23 更新去掉
            if(runaway) runaway.active = false;
            this.setButtonPos(); //设置 按钮位置
        }else{
            if(btn_return) btn_return.active = false;
            if(replay) replay.active = false;
            if(runaway) runaway.active = true;
        }
    },

    randomHead:function(){
        let arr = [0,1,2,3,4,5,6,7,8,9,10,0,1,2,3,4,5,6,7,8,9,10];
        console.log("randomHead: ",G_FC.OpenIdxArr);
        let ran = parseInt(Math.random() * 11);
        let num = 0;
        let isget = false;
        CF.defaultArr = [];
        for(let i in arr){
            if(arr[i] == ran) isget = true;
            if(isget){
                num += 1 * 1;
                CF.defaultArr.push(arr[i]);
            }
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                if(Number(num) >= G_FC.OpenIdxArr.length) break;
            }else{
                if(Number(num) >= 4) break;
            }
            
        }
        console.log("randomHead...",CF.defaultArr);
    },
    setButtonPos: function(){
        // //返回按钮适配
        // if(!this.node_game) return;
        // let size = cc.view.getFrameSize();
        // if(!size) return;
        // let winSize = cc.view.getVisibleSize();
        // if(size.width != 375 || size.height != 812){
        //     return;
        // }
        // //期望坐标
        // let pos_x = size.width / 20 ;
        // let pos_y = size.height / 10 * 9;
        // var p_y;
        // let pos = cc.v2(pos_x,pos_y);
        // let pos_0 = this.node_game.convertToNodeSpace (pos);
        // if(size.width == 375 && size.height == 812){ //iphone x
        //     p_y = size.height / 10 * 8 / (size.height / winSize.height) / 2;//+ 50
        // }else{
        //     p_y = size.height / 10 * 9 / (size.height / winSize.height) / 2 + 10;
        // }
        
        // //返回按钮适配
        // this.node_game.getChildByName("btn_return").y = p_y;    // 2019/10/23 更新去掉
        // this.node_game.getChildByName("replay").y = p_y;        // 2019/10/23 更新去掉
    },

    initCommonData: function(){
        CF.node_game = this.node_game;
        CF.node_plane = this.node_plane;
        CF.node_bomb = this.node_bomb;
        CF.node_stock = this.node_stock;
        CF.orderArr = this.orderArr;
        CF.bombPrefab = this.BombPrefab;
        CF.node_pos = this.node_pos;
    },
    initFinishArr: function(){
        CF.initFinishArr();
    },
    initRootStock: function(){
        if(!this.root_stock) return;
        this.stockPool.put(this.root_stock);
        this.root_stock = null;
    },
    initOriPos: function(){
        if(!this.node_ori) return;
        let PointNum = CF.getOriPointNum();
        let arr = [];
        for(let i = 0; i < Number(PointNum); i++){
            let str_ori = "ori_" + parseInt(i % CST.Plane_Num);
            let str_part = "part_" + parseInt(i / CST.Player_Max_Num);
            let i_part = this.node_ori.getChildByName(str_part);
            if(!i_part) continue;
            let i_node = i_part.getChildByName(str_ori);
            if(!i_node) continue;
            arr.push(i_node.position);
        }
        CF.initOriPosArr(arr);
    },
    initFlyStartPos: function(){
        if(!this.node_start) return;
        let PointNum = CST.Player_Max_Num;
        let arr = [];
        for(let i = 0; i < Number(PointNum); i++){
            let str_start = "start_" + parseInt(i % CST.Player_Max_Num);
            let i_node = this.node_start.getChildByName(str_start);
			if(!i_node) continue;
            arr.push(i_node.position);
        }
        CF.initFlyStartPosArr(arr);
    },
    initFlyOutPos: function(){
        if(!this.node_out) return;
        let PointNum = CF.getFlyOutPointNum();
        let arr = [];
        for(let i = 0; i < Number(PointNum); i++){
            let str_node = "out_" + i;
            let i_node = this.node_out.getChildByName(str_node);
			if(!i_node) continue;
            arr.push(i_node.position);
        }
        CF.initFlyOutPosArr(arr); 
    },

    initNumText: function(){
        let PointNum = CF.getFlyOutPointNum();
        //得到第三个 位置的起始点和终点
        let ori_idx;
        if(CF.player_idx == 0) ori_idx = 2;
        if(CF.player_idx == 1) ori_idx = 3;
        if(CF.player_idx == 2) ori_idx = 0;
        if(CF.player_idx == 3) ori_idx = 1;

        let start_idx = CF.getStartOut_idx(ori_idx);
        let end_idx = CF.getDestOut_idx(ori_idx);

        let start_num = 2 + (ori_idx) * 13;
        let end_num = 53;

        // let dis_max = PointNum - start_idx;
        this.NumTextArr = [];
        for(let i = 0; i < 52; i++){
            let i_num = start_num * 1 + i;
            let i_falg;
            if(i_num > 51){
                i_falg = i_num - 51 - 1;
            }else{
                i_falg = i_num;
            }
            this.NumTextArr.push(i_falg);
        }
    },

    setNumPos: function(i,pos){
        let root_pos = cc.instantiate(this.PosPrefab);
        if(root_pos) this.node_pos.addChild(root_pos,200,i);
        root_pos.position = pos;
        //根据棋盘 位置设置数字
        root_pos.getComponent("FC_Pos").setNum(this.NumTextArr[i]);
    },
    initNumPos: function(){
        if(!this.node_out) return;
        let PointNum = CF.getFlyOutPointNum();
        for(let i = 0; i < Number(PointNum); i++){
            let str_node = "out_" + i;
            let i_node = this.node_out.getChildByName(str_node);
			if(!i_node) continue;
            this.setNumPos(i,i_node.position);
        }
    },

    initFlyInPos: function(){
        if(!this.node_in) return;
        let PointNum = CF.getFlyInPointNum();
        let arr = [];
        for(let i = 0; i < Number(PointNum); i++){
            let str_ori = "in_" + parseInt(i % CST.Line_Num);
            let str_part = "part_" + parseInt(i / CST.Line_Num);
			let i_part = this.node_in.getChildByName(str_part);
			if(!i_part) continue;
            let i_node = i_part.getChildByName(str_ori);
			if(!i_node) continue;
            arr.push(i_node.position);
        }
        CF.initFlyInPosArr(arr);
    },
    initOrderShow: function(){
        if(!this.node_stock) return;
        let Num = CST.Player_Max_Num;
        for(let i = 0; i < Number(Num); i++){
            let str_i = "stock_" + i;
			let i_stock = this.node_stock.getChildByName(str_i);
			if(!i_stock) continue;
            let i_node = i_stock.getChildByName("order");
			if(!i_node) continue;
            i_node.active = false;
        }
    },
    initArrow: function(isSetPos){
        if(!this.node_arrow) return;
        let Num = CST.Player_Max_Num;
        if(this.arrowPosArr == undefined){
            this.arrowPosArr = [];
        }
        for(let i = 0; i < Number(Num); i++){
            let str_i = "arrow_" + i;
            let i_node = this.node_arrow.getChildByName(str_i);
			if(!i_node) continue;
            i_node.active = false;
            if(isSetPos){
                this.arrowPosArr[i] = cc.v2(i_node.x,i_node.y);
            }
        }
    },
    initTimeCount: function(){
        if(!this.node_time) return;
        let Num = CST.Player_Max_Num;
        for(let i = 0; i < Number(Num); i++){
            let str_i = "part_" + i;
			let i_part = this.node_time.getChildByName(str_i);
            if(!i_part) continue;
            i_part.opacity = 0;
        }
        //初始化 超时次数
        FC_Msg.timeOutTimes = [0,0,0,0];
    },
    showTimeCount: function(isBool,seatId,isOut){
        console.log("showTimeCount: ",isBool,seatId,isOut);
        if(!this.node_time) return;
        let Num = CST.Player_Max_Num;
        let equip_idx;
        if(seatId != undefined){
            equip_idx = CF.getIdxBySeat(seatId);
        }
        for(let i = 0; i < Number(Num); i++){
            if(seatId != undefined){
                if(i != equip_idx) continue;
            }
            let str_i = "part_" + i;
            console.log("part_: ",str_i);
            let i_part = cc.find(str_i,this.node_time);//this.node_time.getChildByName(str_i)
            if(!i_part) continue;
            i_part.opacity = isBool ? 255 : 0;

            let sp_0 = i_part.getChildByName("sp_0");
            let sp_1 = i_part.getChildByName("sp_1");
            let sp_2 = i_part.getChildByName("sp_2");
            if(!sp_0 || !sp_1 || !sp_2) continue;
            if(seatId != undefined){
                //获取位置 超时次数
                let times = FC_Msg.timeOutTimes[seatId];
                // console.log("times: ",times);
                if(isOut){
                    sp_0.getComponent(cc.Sprite).spriteFrame = Number(times) >= 1 ? this.timeFrameArray[1] : this.timeFrameArray[0];
                    sp_1.getComponent(cc.Sprite).spriteFrame = Number(times) >= 2 ? this.timeFrameArray[1] : this.timeFrameArray[0];
                    sp_2.getComponent(cc.Sprite).spriteFrame = Number(times) >= 3 ? this.timeFrameArray[1] : this.timeFrameArray[0];
                }else{
                    sp_0.getComponent(cc.Sprite).spriteFrame = this.timeFrameArray[0];
                    sp_1.getComponent(cc.Sprite).spriteFrame = this.timeFrameArray[0];
                    sp_2.getComponent(cc.Sprite).spriteFrame = this.timeFrameArray[0];
                }
            }else{
                sp_0.getComponent(cc.Sprite).spriteFrame = this.timeFrameArray[0];
                sp_1.getComponent(cc.Sprite).spriteFrame = this.timeFrameArray[0];
                sp_2.getComponent(cc.Sprite).spriteFrame = this.timeFrameArray[0];
            }
        }
    },
    initMap: function(){
        console.log("initMap...",CF.player_idx);
        let map = cc.find("map",this.node_game);
        if(map){
            this.mapRotationIdx = CF.player_idx;
            map.rotation = -1 * 90 * (CF.player_idx);
        }
    },
    initPlayerName:function(){
        console.log("initPlayerName...",G_FC.OpenIdxArr);
        if(!this.node_command) return;
        for(let i = 0; i < G_FC.OpenIdxArr.length; i++){
            let sp_i = this.node_command.getChildByName("sp_" + i);
			if(!sp_i) continue;
            let sp = sp_i.getChildByName("sp");
			if(!sp) continue;
            let rootName = sp_i.getChildByName("name");
            if(!rootName) continue;
            let name = rootName.getComponent(cc.Label)
            if(G_FC.OpenIdxArr[i] == -1){
                rootName.active = false;
                continue;
            }else if(G_FC.OpenIdxArr[i] == 0){
                rootName.active = true;
                name.getComponent(cc.Label).string = CST.PlayerName["" + i];
            }else{
                rootName.active = true;
                name.getComponent(cc.Label).string = CST.CpName["" + i];
            }   
        }
    },
    
    setPlayerNameBySeat: function(){

    },
    initPlayerHead: function(){
        console.log("initPlayerHead...",G_FC.OpenIdxArr);
        if(!this.node_head) return;
        this.node_head.active = true;
        //默认头像 
        for(let i = 0; i < G_FC.OpenIdxArr.length; i++){
            let str_i = "part_" + i;
			let i_part = cc.find(str_i,this.node_head);
			if(!i_part) continue;
			let head = i_part.getChildByName("head");
			if(!head) continue;
            head.active = G_FC.OpenIdxArr[i] == -1? true : false;
			let bg_ori = i_part.getChildByName("bg_ori");
			if(!bg_ori) continue;
            bg_ori.active = G_FC.OpenIdxArr[i] == -1? true : false;
        }
        //随机头像
        for(let i = 0; i < G_FC.OpenIdxArr.length; i++){
            let des_i = "sp_" + i;
			let i_part = cc.find(des_i,this.node_command);
            if(!i_part) continue;
            let sp = i_part.getChildByName("sp");
            if(!sp) continue;
			let head = i_part.getChildByName("sp_head");
			if(!head) continue;
            head.getComponent(cc.Sprite).spriteFrame = this.defaultFrameArr[CF.defaultArr[i]]; 
			
        }
    },
    showPlayerHead: function(isBool,seatId,headId,isStart){
        console.log("showPlayerHead...",seatId,headId);
        if(!this.node_command) return;
        if(CF.defaultArr == undefined){
            CF.defaultArr = [];
        }
        let Num = CST.Player_Max_Num;
        let equip_idx;
        if(seatId != undefined){
            equip_idx  = CF.getIdxBySeat(seatId);
            console.log("equip_idx...",equip_idx);
        }

        for(let i = 0; i < Number(Num); i++){
            if(seatId != undefined){
                // let common_type = CF.returnType(seatId);
                if(i != equip_idx) continue;
                
            }
            let str_i = "sp_" + i;
			let i_part = cc.find(str_i,this.node_command);
            if(!i_part) continue;
            console.log("str_i...",str_i);
            i_part.opacity = isBool ? 255 : 0;
            let i_sp = i_part.getChildByName("sp");
            if(seatId != undefined){
                let i_obj = FC_Msg.allPlayerInfos["" + seatId];
                //名字
                let name = i_part.getChildByName("name");
                let desc = CF.transformName(7,i_obj.nickName);
                if(name) name.getComponent(cc.Label).string = desc;

                //头像
                let head = i_part.getChildByName("sp_head");
                if(!head) continue;
                if(headId != undefined){
                    CF.defaultArr[seatId] = headId;
                    let url;
                    if(i == 0) //自己
                    {
                        url = FC_Msg.headUrl;

                        if(this.mapRotationIdx != CF.player_idx){
                            this.initMap();
                        }

                    }else{
                        url = i_obj.logo_url;
                    }
                    
                    // head.setScale(1);
                    if(!url || url == ""){
                        head.getComponent(cc.Sprite).spriteFrame = this.defaultFrameArr[headId];
                    }else{
                        cc.loader.load({"url": url,type: "png"},function(err,texture){
                            if(err){
                                return;
                            }
                            head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                            // head.setScale(.7);
                        })
                    } 
                    
                }else{
                    if(i == 0){
                        if(!FC_Msg.headUrl || FC_Msg.headUrl == ""){
                            head.getComponent(cc.Sprite).spriteFrame = this.defaultFrameArr[CF.defaultArr[seatId]];
                        }else{
                            cc.loader.load({"url": FC_Msg.headUrl,type: "png"},function(err,texture){
                                if(err){
                                    return;
                                }
                                head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                                // head.setScale(.7);
                            })
                        }
                    }else{
                        head.getComponent(cc.Sprite).spriteFrame = this.defaultFrameArr[CF.defaultArr[seatId]];
                    }
                    
                }
            }
            //头像框
            if(!i_sp) continue;
            if(!isStart){
                i_sp.getComponent(cc.Sprite).spriteFrame = this.bgHeadFrameArray[4];
                //头像框 镜像
                if(i == 0 || i == 1){
                    i_sp.scaleX = 1; 
                }else{
                    i_sp.scaleX = -1; 
                }
            }else{
                if(seatId != undefined){
                    let color = FC_Msg.playerColor[seatId];
                    //默认 -1的方向 和单机相同
                    if(i == 0 || i == 1){
                        if(color == 0 || color == 1){
                            i_sp.scaleX = -1;
                        }else{
                            i_sp.scaleX = 1;
                        }
                         
                    }else{
                        if(color == 0 || color == 1){
                            i_sp.scaleX = 1;
                        }else{
                            i_sp.scaleX = -1;
                        }
                    }
                    i_sp.getComponent(cc.Sprite).spriteFrame = this.bgHeadFrameArray[color];
                }
            }
        }
    },

    showPlayerHeadByIdx: function(idx,isStart){
        let str_i = "sp_" + idx;
        let i_part = cc.find(str_i,this.node_command);
        if(!i_part) return;
        i_part.opacity = 255;
        //名字
        let name = i_part.getChildByName("name");
        let desc = CF.transformName(8,FC_Msg.userInfo["nick_name"]);
        if(name) name.getComponent(cc.Label).string = desc;
        //头像
        let head = i_part.getChildByName("sp_head");
        if(!head) return;
        if(!FC_Msg.headUrl || FC_Msg.headUrl == ""){
            head.getComponent(cc.Sprite).spriteFrame = this.defaultFrameArr[CF.defaultArr[seatId]];
        }else{
            cc.loader.load({"url": FC_Msg.headUrl,type: "png"},function(err,texture){
                if(err){
                    return;
                }
                head.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                // head.setScale(.7);
            })
        }
        let i_sp = i_part.getChildByName("sp");
        if(!i_sp) return;
        if(!isStart){
            i_sp.getComponent(cc.Sprite).spriteFrame = this.bgHeadFrameArray[4];
            //头像框 镜像
            if(idx == 0 || idx == 1){
                i_sp.scaleX = 1; 
            }else{
                i_sp.scaleX = -1; 
            }
        }
    },

    setPlayerHeadBySeat: function(){
        
    },

    initAllPlaneData: function(){ //初始化 飞机数据
        CF.initAllPlaneData();
    },
    createAllPlane:function(){      //创建所有飞机
        CF.createAllPlane(this.PlanePrefab);
    },

    showGameOver: function(isTimeout,isComplete){
        console.log("showGameOver...");
        // CF.stopAllPlaneAction();
        if(this.node_over){
            this.node_over.x = 0;
            this.node_over.getComponent("FC_GameOver").show(isTimeout,isComplete);
        }
    },


    update (dt) {
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            this.singleGame();//单机
        }else{
            this.onLineGame();//联机
        }
    },

    singleGame: function(){
        //判断游戏结束
        if(CF.checkGameOver()){
            this.enabled = false;
            this.node_game.x = 3000;
            this.node_over.x = 0;
            this.showGameOver();
            this.clear();
            CF.removeGameState();
            return;
        }

        //刷新指令显示
        if(CF.isCommandChanged)
        {
            this.showTip();
            
            if(G_FC.Update_Command == CST.Update_Command.Start){
                //创建骰子
                this.createStock();
                this.updateCommand_arrow();
            }
            CF.isCommandChanged = false;

            CF.updateGameState();
        }

        if(G_FC.Update_Command == CST.Update_Command.Static)
        {
            return;
        }else if(G_FC.Update_Command == CST.Update_Command.Ready){
            G_FC.Static_Time -= 1;
            if(Number(G_FC.Static_Time) <= 0){
                CF.changeCommand(CST.Update_Command.Start,4);
             }
             return;
        }else if(G_FC.Update_Command == CST.Update_Command.Start){    //开始游戏
            G_FC.Static_Time -= 1;
            if(Number(G_FC.Static_Time) <= 0){
                //创建骰子
                // this.createStock();
                if(G_FC.OpenIdxArr[G_FC.StockOrder] == CST.OpenType.player)
                {
                    CF.changeCommand(CST.Update_Command.Static,1);
                }else{
                    CF.changeCommand(CST.Update_Command.Stock,5);
                }
             }
            return;
        }else if(G_FC.Update_Command == CST.Update_Command.Stock){  //开始 自动摇骰子
            G_FC.Update_Command = CST.Update_Command.Static;
            this.stockRun();
        }else if(G_FC.Update_Command == CST.Update_Command.PlaneFly){  //飞行
            G_FC.Update_Command = CST.Update_Command.Static;
            CF.PlantFly();
        }else if(G_FC.Update_Command == CST.Update_Command.Pause){    //暂停
            return;
        }
    },

    onLineGame: function(){
        this.enabled = false;

    },

    createStock: function(idx){
        console.log("createStock");
        if(!this.node_stock) return;
        if(this.root_stock)
        {
            if(this.stockPool) {
                this.stockPool.put(this.root_stock);
                this.root_stock = null;
            }
        }
        let newStock = null;
        if(this.stockPool){
            if(this.stockPool.size() > 0){
                newStock = this.stockPool.get();
            }else{
                newStock= cc.instantiate(this.StockPrefab);
            }
        }else{
            newStock= cc.instantiate(this.StockPrefab);
            this.stockPool = new cc.NodePool();
        }

        let common_order ;

        let str_node ;
        if(idx == undefined){
            common_order = G_FC.StockOrder;
        }else{
            common_order = CF.getIdxBySeat(idx);
            FC_Msg.common_order = common_order;
        }
        // console.log("createStock common_order: ",FC_Msg.common_order);
        str_node = "stock_" + common_order;
        newStock.parent = this.node_stock.getChildByName(str_node);
        newStock.getComponent("FC_Stock").icon = G_FC.Stock_num;//默认上个图标

        CF.stockTimes = 1;
        this.root_stock = newStock;
    },

    touchStockHead: function(data,idx){
        console.log("touchStockHead..");

        if(!this.root_stock) return;

        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(idx != G_FC.StockOrder) return;
            if(G_FC.OpenIdxArr[G_FC.StockOrder] != CST.OpenType.player) return;
            if(G_FC.Update_Command == CST.Update_Command.Stock) return;
        }

        if(FC_Msg.gameType == CST.GAMETYPE.pvp){
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            let cur_color = FC_Msg.playerColor[userSeat];
            if(FC_Msg.cur_color != cur_color) return;
        }

        if(CF.stockTimes == 0) return;
        let stockCom = this.root_stock.getComponent("FC_Stock");

        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            G_FC.Update_Command = CST.Update_Command.Stock;
            CF.stockTimes = 0;
        }else{
            stockCom.begainStock();
            // if(this["head_" + idx]) this["head_" + idx].getComponent(cc.Button).interactable = false;
        }
        
    },

    stockRun: function(){
        // if(G_FC.OpenIdxArr[G_FC.StockOrder] == CST.OpenType.cpu){
        //     G_FC.Stock_num = CF.random();
        // }
        G_FC.Stock_num = CF.random();

        if(!this.root_stock) return;
        let stockCom = this.root_stock.getComponent("FC_Stock");
        this.root_stock.runAction(cc.sequence(
            cc.callFunc(function(){
                stockCom.icon = 1;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                stockCom.icon = 2;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                stockCom.icon = 3;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                stockCom.icon = 4;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                stockCom.icon = 5;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                stockCom.icon = 6;
            }),
            cc.delayTime(.1),
            cc.callFunc(function(){
                this.root_stock.stopAllActions();
                stockCom.icon = G_FC.Stock_num;
                this.stockCallBack();
            }.bind(this))
        ));
    },
    stockCallBack: function(){

        let num = -1;
        if(FC_Msg.gameType == CST.GAMETYPE.pvp){
            num = FC_Msg.cur_count;
        }else{
            num = G_FC.Stock_num;
        }

        if(num == CST.Stock_Lucky_Num){
            CF.sysStockRecord += 1;
        }
        if(CF.checkSysStockRecord()){
            CF.unActiveOneSideAllPlane(G_FC.StockOrder);
            return;
        }
        if(G_FC.OpenIdxArr[G_FC.StockOrder] == CST.OpenType.player){ // 机器人
            this.ai_player();
        }else{
            this.ai_cpu();
        }   
    },

    ai_cpu: function(){

        /*
                mark：
                830  修改最新的难度
                1.有飞机能直接到达终点,则优先到达终点
                2.可以撞到敌机,　则优先撞敌机
                3.优先离开停机坪
                4.优先到快速飞点
                5.优先跳
                6.能形成迭机,　则优先形成迭机
                7.选择可飞点前面的点

        
        */

        /*
                1. 优先到达终点
                2. 优先撞敌机
                3. 优先到安全点(内部航线)
                4. 优先起飞
                5. 优先形成迭机(因为迭机可以不被撞回)
                6. 走最前面的飞机
        */
       console.log("ai_cpu....");
       this.waitForCommand = false;
        let stand_arr = CF.getStandPlane();
        if(stand_arr.length == 0){ //是否有激活的飞机
            if(CF.checkPlaneActiveStockNum(G_FC.Stock_num)){
                CF.changeCommand(CST.Update_Command.Static,3);
                let cp_order = CF.getCanActivePlane();
                if(cp_order != -1) CF.activePlane(cp_order);
            }else{
                CF.setNextOrder();
                CF.changeCommand(CST.Update_Command.Ready,6);
            }
        }else{
            // CF.FlyStandPlane(stand_order);//后面做智能ai 选择
            let in_dest_idx = G_FC.StockOrder * CST.Line_Num + (CST.Line_Num - 1);
            let max_idx = CF.getFlyOutPointNum() - 1;
            let childs = this.node_plane.getChildren();
            let isgetAi = false;
            let flag_1 = -1;
            let flag_2 = -1;
            let flag_3 = -1;

            let hasIn = false;
            let hasOut = false;
            let hasStart = false;

            for(let i = 0; i < stand_arr.length; i++){
                let i_plane = CF.getChildByTag(this.node_plane,stand_arr[i]);
                if(i_plane.data.FlyLineType == CST.FlyLineType.Line_in){
                    hasIn = true;
                    if(Number(in_dest_idx) == Number(i_plane.data.Current_idx) + G_FC.Stock_num){ // #1
                        flag_1 = i_plane.data.Order;
                        break;
                    }
                }else if(i_plane.data.FlyLineType == CST.FlyLineType.Line_Out){
                    hasOut = true;
                    let flag_idx = Number(i_plane.data.Current_idx) + G_FC.Stock_num;
                    if(flag_idx > max_idx){
                        flag_idx = flag_idx - max_idx - 1;
                    }
                    if(flag_2 == -1){  // #2
                        for(let k in childs){
                            if(childs[k].data.Order == i_plane.data.Order) continue;
                            if(childs[k].data.PlayerType == i_plane.data.PlayerType) continue;
                            if(childs[k].data.Current_idx == flag_idx){
                                flag_2 = i_plane.data.Order;
                                break;
                            }
                        }
                    }
                    if(flag_3 == -1){  // #3
                        if(Number(i_plane.data.Current_idx) > 0 && Number(i_plane.data.Current_idx) < Number(i_plane.data.Dest_idx)){
                            if(flag_idx > i_plane.data.Dest_idx){
                                flag_3 = i_plane.data.Order;
                            }
                        }
                    }
                }else if(i_plane.data.FlyLineType == CST.FlyLineType.Line_Start){
                    hasStart = true;
                }
            }
            // console.log("flag1: ",flag_1);
            // console.log("flag2: ",flag_2);
            // console.log("flag3: ",flag_3);
            if(flag_1 != -1){
                CF.FlyStandPlane(flag_1);
            }else if(flag_2 != -1){
                CF.FlyStandPlane(flag_2);
            }else if(flag_3 != -1) {
                CF.FlyStandPlane(flag_3);
            }else{
                if(stand_arr.length < CST.Plane_Num && CF.checkPlaneActiveStockNum(G_FC.Stock_num)){ //#4
                    CF.changeCommand(CST.Update_Command.Static,3);
                    let cp_order = CF.getCanActivePlane();
                    if(cp_order != -1){
                        CF.activePlane(cp_order);
                        return;
                    }
                }
                //#5
                //stand_arr  排序
                let flag_4 = -1;
                stand_arr.sort(function(a,b){
                    if(a != b) return a - b;
                });

                if(stand_arr.length == 1){
                    flag_4 = stand_arr[0];
                }else if(stand_arr.length == 2){
                    // let child_1 = this.node_plane.getChildByTag(stand_arr[0]);
                    let child_2 = CF.getChildByTag(this.node_plane,stand_arr[0]);
                    let flag_idx = Number(child_2.data.Current_idx) + G_FC.Stock_num;
                    if(flag_idx > max_idx){
                        flag_idx = flag_idx - max_idx - 1;
                    }
                    if(child_2.data.Current_idx == flag_idx){
                        flag_4 = stand_arr[0];
                        
                    }
                }else{
                    for(let i = 0; i < stand_arr.length; i++){
                        let i_plane = CF.getChildByTag(this.node_plane,stand_arr[i]);
                        let flag_idx = Number(i_plane.data.Current_idx) + G_FC.Stock_num;
                        if(flag_idx > max_idx){
                            flag_idx = flag_idx - max_idx - 1;
                        }
                        for(let k = i * 1 + 1; k < stand_arr.length; k++){
                            let k_plane = CF.getChildByTag(this.node_plane,stand_arr[k]);
                            if(flag_idx == k_plane.data.Current_idx){
                                flag_4 = i_plane.data.Order;
                                break;
                            }
                        }
                        if(flag_4 != -1) break;
                    }
                }
                if(flag_4 != -1){
                    CF.FlyStandPlane(flag_4);
                }else{      //#6
                    let flag_5_1 = -1;
                    let flag_5_2 = -1;
                    let flag_6_1 = -1;
                    let flag_6_2 = -1;
                    for(let i = 0; i < stand_arr.length; i++){
                        let i_plane = CF.getChildByTag(this.node_plane,stand_arr[i]);

                        if(hasIn && (hasOut || hasStart)){
                            if(i_plane.data.FlyLineType == CST.FlyLineType.Line_in) continue;
                        }

                        //最前面的飞机判定 优化 
                        if(Number(i_plane.data.Dest_idx) > Number(i_plane.data.Start_idx)){
                            if(Number(i_plane.data.Current_idx) >= 0 && Number(i_plane.data.Dest_idx)){
                                if(Number(i_plane.data.Current_idx) > flag_5_1 || flag_5_1 == -1){
                                    flag_5_1 = i_plane.data.Current_idx;
                                    flag_6_1 = i_plane.data.Order;
                                }
                            }else{
                                if(flag_5_1 != -1) continue;
                                if(Number(i_plane.data.Current_idx) > flag_5_2 || flag_5_2 == -1){
                                    flag_5_2 = i_plane.data.Current_idx;
                                    flag_6_2 = i_plane.data.Order;
                                }
                            }
                        }else{
                            if(Number(i_plane.data.Current_idx) >= 0 && Number(i_plane.data.Dest_idx)){
                                if(flag_5_1 == -1){
                                    flag_5_1 = i_plane.data.Current_idx;
                                    flag_6_1 = i_plane.data.Order;
                                }else{
                                    if(Number(flag_5_1) > Number(i_plane.data.Start_idx) && Number(flag_5_1) <= 51){
                                        if(Number(i_plane.data.Current_idx) > Number(i_plane.data.Start_idx) && Number(i_plane.data.Current_idx) <= 51){
                                            if(i_plane.data.Current_idx > flag_5_1){
                                                flag_5_1 = i_plane.data.Current_idx;
                                                flag_6_1 = i_plane.data.Order;
                                            }else{
                                                continue;
                                            }
                                        }
                                        if(Number(i_plane.data.Current_idx) > 0 && Number(i_plane.data.Current_idx) <= Number(i_plane.data.Dest_idx)){
                                            flag_5_1 = i_plane.data.Current_idx;
                                            flag_6_1 = i_plane.data.Order;
                                        }else{
                                            continue;
                                        }
                                    }


                                    if(Number(flag_5_1) > 0 && Number(flag_5_1) <= Number(i_plane.data.Dest_idx)){
                                        if(Number(i_plane.data.Current_idx) > 0 && Number(i_plane.data.Current_idx) <= Number(i_plane.data.Dest_idx)){
                                            if(i_plane.data.Current_idx > flag_5_1){
                                                flag_5_1 = i_plane.data.Current_idx;
                                                flag_6_1 = i_plane.data.Order;
                                            }else{
                                                continue;
                                            }
                                        }else{
                                            continue;
                                        }
                                    }
                                }
                            }else{
                                if(flag_5_1 != -1) continue;
                                if(Number(i_plane.data.Current_idx) > flag_5_2 || flag_5_2 == -1){
                                    flag_5_2 = i_plane.data.Current_idx;
                                    flag_6_2 = i_plane.data.Order;
                                }
                            }


                        }

                    }
                    if(flag_5_1 != -1){
                            
                        CF.FlyStandPlane(flag_6_1);
                    }else{
                        CF.FlyStandPlane(flag_6_2);
                    }
                }
            }
            
        }
        
    },

    ai_player: function(count){
        console.log("----ai_player---");
        let num;
        if(count == undefined){
            num = G_FC.Stock_num;
        }else{
            num = count;
        }
        CF.isWaitCommand = false;
        if(CF.isHaveStandPlane()){
            let LastOneOrder = CF.getLastOneStandOrder();
            // console.log("LastOneOrder: ",LastOneOrder);
            if(LastOneOrder != -1){//如果只剩余一个stand 直接移动不用等待command
                if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                    CF.FlyStandPlane(LastOneOrder);
                }else{
                    CF.sendRunAction(LastOneOrder,1);
                }
            }else{

                //判断是否 有和敌人飞机跌机的  强制走子
                let otherColorLapOrder = this.checkOtherColorLap();
                console.log("otherColorLapOrder: ",otherColorLapOrder);
                if(otherColorLapOrder != "-1"){
                    if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                        CF.FlyStandPlane(otherColorLapOrder);
                    }else{
                        CF.sendRunAction(otherColorLapOrder,1);
                    }
                }else{
                    if(CF.checkPlaneActiveStockNum(num)){
                        CF.changeCommand(CST.Update_Command.Static,2);
                        CF.waitForCommand([0,1]);//触发 active/stand
                        CF.isWaitCommand = true;
                    }else{
                        CF.changeCommand(CST.Update_Command.Static,2);
                        CF.waitForCommand([1]);//触发 stand
                        CF.isWaitCommand = true;
                    }
                }
            }
            
         }else{
            if(CF.checkPlaneActiveStockNum(num)){
                console.log("ai_player-111--");
                CF.changeCommand(CST.Update_Command.Static,2);
                if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                    CF.waitForCommand([0,1]);//触发 active/stand
                    CF.isWaitCommand = true;
                }else{
                    let userSeat = FC_Msg.playerInfo["deskSeatID"];
                    let cur_color = FC_Msg.playerColor[userSeat];
                    if(FC_Msg.cur_color == cur_color){
                        CF.waitForCommand([0,1]);//触发 active/stand
                        CF.isWaitCommand = true;
                    }else{
                        //直接走棋
                        
                    }
                }
                
            }else{
                if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                    CF.setNextOrder();
                }else{
                    //发送 行棋结果
                    CF.sendRunAction(-1,-1);
                    CF.sendFinish();
                    this.showTip(6);
                }
                
                CF.changeCommand(CST.Update_Command.Ready,6);
            }
         }
    },


    checkOtherColorLap: function(){
        // console.log("checkOtherColorLap");
        let idx = -1;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            idx = G_FC.StockOrder;
        }else{
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            let cur_color = FC_Msg.playerColor[userSeat];
            idx = CF.returnType(cur_color);
        }
        // console.log("idx: ",idx);
        //获取当前 筛子方  所有棋子的跌机状态（Current_idx位置 棋子数目）
        if(idx == -1) return -1;
        let id_arr = [];
        for(let i = 0; i < CST.Plane_Num; i++){
            let i_order = (idx * 4) + i;
            id_arr.push(i_order);
        }
        // console.log("id_arr: ",id_arr);
        if(!id_arr || id_arr.length == 0) return -1;

        let isGet = false;
        let result_idx = -1;
        let childs = this.node_plane.getChildren();
        for(let k = 0; k < id_arr.length; k++){
            let k_id = id_arr[k];
            let k_child = CF.getChildByTag(this.node_plane,k_id);
            if(!k_child) continue;
            if(k_child.data.ActiveType != CST.ActiveType.Stand) continue;
            if(k_child.data.Current_idx == "-1") continue;
            let k_index = k_child.data.Current_idx;
            let num = 0;
            for(let p in childs){
                let p_child = childs[p];
                if(!p_child) continue;
                if(p_child.data.ActiveType != CST.ActiveType.Stand) continue;
                if(p_child.data.PlayerType == k_child.data.PlayerType) continue;
                if(p_child.data.FlyLineType != k_child.data.FlyLineType) continue;
                if(p_child.data.Current_idx == "-1") continue;
                if(p_child.data.Current_idx == k_child.data.Current_idx){
                    num += 1 * 1;
                }
                if(num >= 2){
                    isGet = true;
                    result_idx = k_child.data.Order;
                    break;
                }
            }
            if(isGet){
                break;
            }
        }
        // console.log("isGet: ",isGet);
        // console.log("result_idx: ",result_idx);
        if(isGet){
            return result_idx;
        }
        if(!isGet) return -1;

    },

    showTip: function(id){   //修改指令显示

        if(this.root_tips){
            this.root_tips.getComponent("FC_Tips").clear();
        }

        let root_tips = null;
        if(CF.tipsPool){
            if(CF.tipsPool.size() > 0){
                root_tips = CF.tipsPool.get();;
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


    updateCommand_arrow: function(idx){
        // console.log("updateCommand_arrow...",idx);
        let Num = CST.Player_Max_Num;
        if(!this.node_arrow) return;
        let common_order;
        if(idx == undefined){
            common_order = G_FC.StockOrder;
        }else{
            common_order = CF.getIdxBySeat(idx);
        }
        for(let i = 0; i < Number(Num); i++){
            let str_i = "arrow_" + i;
            let i_node = cc.find(str_i,this.node_arrow);
            if(!i_node) return;
            i_node.stopAllActions();
            i_node.position = this.arrowPosArr[i];
            if(i == common_order){
                i_node.active = true;
                let old_pos = cc.v2(i_node.x,i_node.y);
                let pos_1 = cc.v2(old_pos.x - 10,old_pos.y);
                let pos_2 = cc.v2(old_pos.x + 10,old_pos.y);
                i_node.runAction(cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(1,pos_2),
                        cc.moveTo(1,pos_1)
                    ),
                    -1
                ));
            }else{
                i_node.active = false;
            }
        }
    },
    clear: function(){
        console.log("FC_Game clear...");
        this.putNode();
        this.clearNode(this.node_bomb);
        this.clearNode(this.node_plane);
        this.clearNode(this.node_pos);
        if(CF.setPool) CF.setPool.clear();
        this.ui_set = null;
        if(this.stockPool){
            while(this.stockPool.size() > 0){
                let node = this.stockPool.get();
                if(cc.isValid(node)){
                    node.destroy();
                }
            }
        }
        this.root_stock = null;
    },
    clearNode: function(node){
        if(node){
            let childs = node.getChildren();
            if(!childs) return;
            if(childs.length == 0) return;
            node.removeAllChildren();
            // let childs = node.getChildren();
            // for(let i in childs){
            //     let i_child = childs[i];
            //     if(!i_child) continue;
            //     i_child.removeFromParent();
            //     i_child.destroy();
            // }
        }
    },
    putNode: function(){
        console.log("putNode...");
        if(this.root_stock){
            this.stockPool.put(this.root_stock);
            this.root_stock = null;
        }
        if(this.ui_set){
            CF.setPool.put(this.ui_set);
            this.ui_set = null;
        }
    },

    reStart: function(){
        console.log("reStart...");
        this.clear();
        CF.changeCommand(CST.Update_Command.Ready,0);
        CF.resetGlobal();
        cc.game.restart();
    },
    return: function(){
        // this.clear();
        // CF.removeGameState();
        cc.director.preloadScene("FC_Menu", function () {
            setTimeout(function(){
                cc.director.loadScene("FC_Menu");
            },50)
        });
        // cc.director.loadScene("FC_Menu");
    },
    replay: function(){
        this.showUISet();
    },

    runAway: function(){
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson) return;

        if(FC_Msg.gameOver){
            this.showGameOver(false,true);
        }else{
            wx.showModal({
                title: '提示',
                content: '确定要放弃这局游戏吗？',
                success: function(msg) {   
                    //确定
                    if (msg.confirm) { 
                        let message = {};
                        message.cmdType = "0x4020";
                        let data = {};
                        data.user_id = FC_Msg.userInfo["userID"];
                        data.room_id = FC_Msg.roomId;
                        data.desk_id = FC_Msg.playerInfo["deskID"];
                        message.data = data;
                        console.log("message...",message);
                        FC_Msg.send(message); 
                        FC_Msg.runNextMsg();
                        cc.director.loadScene("FC_Menu");
                    }else{
    
                    }
                }
            });
        }
    },

    play_Stock: function(event,data){
        if(G_FC.OpenIdxArr[G_FC.StockOrder] != CST.OpenType.player) return;
        G_FC.Stock_num = data;
        G_FC.Update_Command = CST.Update_Command.Stock;
    },
    showUISet: function(){
        let ui_set = null;
        if(CF.setPool){
            if(CF.setPool.size() > 0){
                ui_set = CF.setPool.get();;
            }else{
                ui_set = cc.instantiate(this.UISetPrefab);
            }
        }else{
            ui_set = cc.instantiate(this.UISetPrefab);
            CF.setPool = new cc.NodePool();
        }
        if(ui_set) {
            this.ui_set = ui_set;
            this.node.addChild(ui_set);
        }
    },
    showMatch: function(){
        FC_Msg.isMatching = true;
        let ui_match = cc.instantiate(this.MatchPrefab);
        this.node.addChild(ui_match);
        this.ui_match = ui_match;
    },
    hideMatch: function(){
        FC_Msg.isMatching = false;
        if(this.ui_match){
            this.ui_match.destroy();
            this.ui_match = null;
        }
    },

    bindMessageCallBack: function(){
        let that = this;
        FC_Msg['0xb011'] = function(msg){
            that.login_success(msg);
        };
        FC_Msg["0xa030"] = function(msg){
            that.room_list_result(msg);
        };
        FC_Msg["0xa031"] = function(msg){
            FC_Msg.runNextMsg();
        };
        FC_Msg["0xa041"] = function(msg){
            that.enter_room_result(msg);
        };
        FC_Msg["0x4010"] = function(msg){
            that.playerInfo_result(msg);
        };
        FC_Msg["0x4011"] = function(msg){
            that.playerInfo_result(msg);
        };
        FC_Msg["0x4021"] = function(msg){
            that.playerLeft(msg);
        };
        FC_Msg["0x4022"] = function(msg){
            that.playerReady_result(msg);
        };
        FC_Msg["0x9023"] = function(msg){
            that.setCheckerboard(msg);
        };
        FC_Msg["0x9025"] = function(msg){
            that.tellRunPiece(msg);
        };
        FC_Msg["0x9027"] = function(msg){
            let data = msg.datas[0];
            that.runPieceResult(data);
        };
        FC_Msg["0x9029"] = function(msg){
            that.runStockResult(msg);
        };
        FC_Msg["0x4030"] = function(msg){
            FC_Msg.runNextMsg();
        };
        FC_Msg["0x4031"] = function(msg){
            that.tellRetractResult(msg);
        };
        FC_Msg["0x4032"] = function(msg){
            that.tellHarmony(msg);
        };
        FC_Msg["0x4033"] = function(msg){
            that.tellHarmonyResult(msg);
        };
        FC_Msg["0x4034"] = function(msg){
            that.tellGiveUpResult(msg);
        };
        FC_Msg["0x9037"] = function(msg){
            that.tellGameOver(msg);
        };
        FC_Msg["0xb039"] = function(msg){
            that.gameGMBResult(msg);
        };
        FC_Msg["0xb081"] = function(msg){
            that.requestConnectResult(msg);
        };
        FC_Msg["0x9042"] = function(msg){
            that.runNewGame(msg);
        };
        FC_Msg["0x9045"] = function(msg){
            that.playerTimeOut(msg);
        };
        FC_Msg["0x9050"] = function(msg){
            that.reComeGame(msg);
        };
        FC_Msg["0x9060"] = function(msg){
            that.playerSeat(msg);
        };
        FC_Msg["0x9061"] = function(msg){
            that.userSeat(msg);
        };

        FC_Msg["TimeOut"] = function(){
            that.runPieceTimeout();
        };

    },
    login_success: function(msg){
        console.log("login_success...");

        if(FC_Msg.gameType == CST.GAMETYPE.personToperson) {
            return;
        }
        let data = msg.datas[0];
        FC_Msg.setDataByKey(msg,"userInfo");
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
        console.log("----changeMessage---",changeMessage);
        FC_Msg.send(changeMessage);

        this.showTip(13);
        this.hideLoading();
        //寻问 同步状态
        let message = {
            cmdType: '0xb080',
            data: {
                user_id: FC_Msg.userInfo["userID"],
            }
        };
        FC_Msg.send(message);

        FC_Msg.runNextMsg();
    },
    request_room_list: function(){//------------------------------------请求房间列表
        console.log("request_room_list...",FC_Msg.userInfo);
        if(FC_Msg.gameType != CST.GAMETYPE.pvp) return;
        let message = {};
        message.cmdType = "0xa030";
        let data = {};
        data.game_id = FC_Msg.gameId;
        data.user_id = FC_Msg.userInfo["userID"];
        message.data = data;
        console.log("message...",message);
        FC_Msg.send(message); 
        this.showMatch();
        FC_Msg.runNextMsg();
        
    },
    room_list_result: function(msg){
        FC_Msg.setDataByKey(msg,"roomInfo");
        //进入房间
        
        //房间id 写死
        console.log("room_list_result...",FC_Msg.userInfo);
        FC_Msg.roomId = 110; 
        let message = {
            cmdType: '0xa040',
            data: {
                room_id: FC_Msg.roomId,
                user_id: FC_Msg.userInfo.userID,
            }
        };
        FC_Msg.send(message); 
        //显示玩家自己的头像
        this.showPlayerHeadByIdx(0);
        FC_Msg.runNextMsg();
    },

    enter_room_result: function(msg){
        FC_Msg.runNextMsg();
    },

    //sit消息 callback
    playerInfo_result: function(msg){
        // FC_Msg.state = 1;
        console.log("msg.data length: ",msg.datas.length);
        if(msg.datas.length > 1){
            for(let i in msg.datas){
                let i_data = msg.datas[i];
                if(i_data.userID == FC_Msg.userInfo["userID"]){
                    FC_Msg.setDataByKey(msg,"playerInfo");
                    FC_Msg.setAllPlayerInfo(i_data);
                }else{
                    FC_Msg.setAllPlayerInfo(i_data);
                    this.showPlayerHead(true,i_data.deskSeatID);
                }
            }
        }else{
            let data = msg.datas[0];
            if(data.userID == FC_Msg.userInfo["userID"]){
                FC_Msg.setDataByKey(msg,"playerInfo");
                FC_Msg.setAllPlayerInfo(data);
                this.showPlayerHead(true,data.deskSeatID);
            }else{
                FC_Msg.setAllPlayerInfo(data);
                this.showPlayerHead(true,data.deskSeatID);
            }
    
        }
        
        //如果 数量足够 可以准备开始
        // if(FC_Msg.allPlayerInfos){
        //     if(Object.keys(FC_Msg.allPlayerInfos).length >= 4){
        //         this.hideMatch();
        //     }
        // }
        FC_Msg.runNextMsg();
    },
    playerReady_result: function(msg){ //------------------------有玩家准备
        let data = msg.datas[0];
        FC_Msg.runNextMsg();
    },
    playerLeft: function(msg){ //-------------------------------玩家离开
        let data = msg.datas[0];
        if(data.user_id == FC_Msg.userInfo["userID"]){
            FC_Msg.clearAllPlayerInfo();
            //返回主页
            cc.director.loadScene("FC_Menu");
        }else{
            //刷新界面 隐藏对应head
            this.showPlayerHead(false,data.deskSeatID);
            //超时
            this.showTimeCount(false,data.deskSeatID);

            //游戏中 强退
            console.log("state:   ",FC_Msg.state);
            if(FC_Msg.state == "2"){
                //保留信息  用作结束界面刷新
            }else{
                FC_Msg.removePlayerInfo(data);
            }
            //对应颜色棋子全部回家
            let cur_color = FC_Msg.playerColor[data.deskSeatID];
            let common_type = CF.returnType(cur_color);
            CF.unActiveOneSideAllPlane(common_type);
        }
        FC_Msg.runNextMsg();
    },

    setCheckerboard: function(msg){//--------------------------游戏开始  设置棋盘
        console.log("setCheckerboard...");
        //游戏开始时  关闭匹配界面
        this.hideMatch();
        CF.isWaitCommand = false;
        let data = msg.datas[0];
        FC_Msg.state = 2;//游戏中
        FC_Msg.gameOver = false;
        // LWC_CF.resetPieceData(msg.datas);
        FC_Msg.playerColor = data.playerColor;
        console.log("playerColor_________________",data.playerColor); 
        //设置player_idx
        CF.player_idx = data.playerColor[FC_Msg.playerInfo["deskSeatID"]];
        //设置 幸运数
        G_FC.Plane_Active_Type = 1;
        G_FC.OpenIdxArr = [0,0,0,0];
        G_FC.PlayerNum = G_FC.OpenIdxArr.length;
        //初始化地图
        this.initMap();
        this.initNumText();
        this.initNumPos(); //数字相对坐标
        //头像框 及其颜色刷新
        for(let i in FC_Msg.allPlayerInfos){
            let obj = FC_Msg.allPlayerInfos[i];
            this.showPlayerHead(true,obj.deskSeatID,undefined,true);
        }
        //显示 倒计时
        this.showTimeCount(true,undefined,false);
        //创建棋子
        this.initAllPlaneData();//初始化 所有飞机数据
        this.createAllPlane();//创建 所有飞机模型
        //显示开始游戏
        this.showTip(10);

        FC_Msg.runNextMsg();
    },
    setOrderByColor: function(color){
        if(FC_Msg.playerColor && color != undefined){
            for(let i = 0; i < FC_Msg.playerColor.length; i++){
                if(FC_Msg.playerColor[i] == color){
                    G_FC.StockOrder = i;
                    break;
                }
            }
        }
    },
    tellRunPiece: function(msg,isContinue){ //-----------------------------通知 行棋
        let data = msg.datas[0];
        // console.log("tellRunPiece playerColor: ",FC_Msg.playerColor);
        console.log("***********tellRunPiece color***********",data.color);
        CF.isWaitCommand = false;
        //设置 order
        let stock_order = -1;
        if(FC_Msg.playerColor && data.color != undefined){
            for(let i = 0; i < FC_Msg.playerColor.length; i++){
                if(FC_Msg.playerColor[i] == data.color){
                    stock_order = i;
                    break;
                }
            }
        }
        //显示箭头
        this.updateCommand_arrow(stock_order);
        // //创建筛子
        this.createStock(stock_order);
        // let userSeat = FC_Msg.playerInfo["deskSeatID"];
        // if(stock_order != userSeat){
        //     if(this.root_stock){
        //         this.root_stock.getComponent("FC_Stock").startEffect(stock_order,data.diceCount);
        //     }
        // }
        if(FC_Msg.cur_color == data.color){
            this.showTip(7);
        }
        FC_Msg.cur_color = data.color;
        FC_Msg.cur_count = data.diceCount;
        console.log("*********tellRunPiece diceCount*********: ",data.diceCount);
        FC_Msg.runNextMsg();
    },

    runPieceResult: function(data,isLast){ //------------------------------行棋 结果
        console.log("runPieceResult..");
        if(this.root_stock){
            //设置 order
            this.setOrderByColor(data.color);
            G_FC.Stock_num = data.diceCount;
            G_FC.StockOrder = this.setOrderByColor(data.color);

            // 停止摇筛子
            // CF.stopAllPlaneAction(data.color);

            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            let cur_color = FC_Msg.playerColor[userSeat];
            //其他玩家 9027 停止摇筛子
            // if(cur_color != data.color){
            //     this.root_stock.getComponent("FC_Stock").stopEffect(data.diceCount);
            // }
            // this.root_stock.getComponent("FC_Stock").icon = data.diceCount;

            let idx = CF.returnType(data.color);
            console.log("idx: ",idx);
            let order = idx * 4 + data.planeTag; 
            console.log("order: ",order);
            console.log("actionTag: ",data.actionTag);

            if(data.actionTag == "1"){
                //设置 飞机mapPos
                let cur_plane = CF.getChildByTag(this.node_plane,order);
                if(cur_plane){
                    let plane_numText = cur_plane.getChildByName("mapPos");
                    plane_numText.getComponent(cc.Label).string = data.mapPos;
                }
            }

            if(data.actionTag == "0"){
                CF.activePlane(order,true);
                CF.PlantFly(order);
            }else if(data.actionTag == "1"){
                //为了测试 优化处理
                let cur_child = CF.getChildByTag(this.node_plane,order);
                if(cur_child){
                    if(cur_child.data.FlyLineType == CST.FlyLineType.Line_Airport){
                        // cur_child.data.FlyLineType = CST.FlyLineType.Line_Out;
                        // cur_child.data.ActiveType = CST.ActiveType.Stand;
                        // cur_child.data.Current_idx = cur_child.data.Start_idx - 1;
                        // if(cur_child.data.Current_idx < 0){
                        //     cur_child.data.Current_idx = 51;
                        // }
                        CF.activePlane(order,true);
                        CF.PlantFly(order);
                    }else if(cur_child.data.ActiveType != CST.ActiveType.Back){
                        CF.FlyStandPlane(order);
                    }
                }
                
            }else if(data.actionTag == "-1"){
                this.showTip(6);
                FC_Msg.runNextMsg();
            }
        }

        
    },

    runStockResult: function(msg){//------------------------------通知摇筛子
        console.log("runStockResult...");
        //摇筛子
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        if(FC_Msg.common_order != userSeat){
            if(this.root_stock){
                this.root_stock.getComponent("FC_Stock").startEffect(FC_Msg.common_order,FC_Msg.cur_count);
            }
        }else{
            FC_Msg.runNextMsg();
        }
        
    },
    runPieceTimeout: function(){
        //修改 自己超时数据
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let cur_color = FC_Msg.playerColor[userSeat];
        if(FC_Msg.cur_color != cur_color) return;
        let cur_time = FC_Msg.timeOutTimes[userSeat];
        //第三次 超时刷新
        if(cur_time >= 2){
            FC_Msg.timeOutTimes[userSeat] += 1 * 1; 
            this.showTimeCount(true,userSeat,true);
        }
        FC_Msg.runNextMsg();
    },
    tellGameOver: function(msg){
        console.log("tellGameOver.....");
        let data = msg.datas[0];
        if(!data) return;

        CF.completeArr = [];
        CF.completeArr = CF.completeArr.concat(data.rank);
        console.log("CF.completeArr: 1",CF.completeArr);

        for(let i in CF.completeArr){
            let i_color = CF.completeArr[i];
            CF.completeArr[i] = CF.returnType(i_color);
        }
        console.log("CF.completeArr: 2",CF.completeArr);

        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let userColor = FC_Msg.playerColor[userSeat];


        //检测游戏是不是彻底结束了
        let isAllOver = true;
        if(data.rank && data.rank.length > 0){
            for(let i = 0; i < data.rank.length; i++){
                let i_seat = data.rank[i];
                if(i_seat == "0" || i_seat == "1" || i_seat == "2" || i_seat == "3") continue;
                isAllOver = false;
                break;
            }
        }

        //对手离开
        if(data.overUserColor != userColor) {
            //清除筛子
            this.initRootStock();
            //清除箭头
            this.initArrow();
            let leftSeat = CF.getSeatByColor(data.overUserColor);
            this.showPlayerHead(false,leftSeat);
            //添加到 逃跑数组
            this.showTimeCount(false,leftSeat);
            
            if(isAllOver){
                this.showGameOver(false,true);
            }
            FC_Msg.runNextMsg();
            return;
        }
        
        this.runPieceTimeout();
        
        //游戏结束
        let cur_times = FC_Msg.timeOutTimes[userSeat];
        if(cur_times >= 3 && data.overType == "2"){ //超时
            FC_Msg.state = 0;
            //清除筛子
            this.initRootStock();
            //清除箭头
            this.initArrow();
            this.showGameOver(true);
            FC_Msg.runNextMsg();
        }else if(data.overType == "3"){ //强退
            FC_Msg.state = 0;
            //清除筛子
            this.initRootStock();
            //清除箭头
            this.initArrow();
            FC_Msg.runNextMsg();
            cc.director.loadScene("FC_Menu"); 
        }else{
            //正常游戏结束
            if(data.overType == "1"){
                //游戏结束  需要等待走棋完成
                FC_Msg.gameOver = true;

                if(isAllOver){
                    this.showGameOver(false,true);
                }else{
                    if(CF.checkPlayerComplete(data.overUserColor)){
                        CF.setPlayerComplete(data.overUserColor);
                    }
                }
            }
            FC_Msg.runNextMsg();
        }
        
    },
    requestConnectResult: function(msg){ //------------------------反馈 同步状态
        let data = msg.datas[0];
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson) return;
        FC_Msg.state = data.state;
        console.log("requestConnectResult",data);
        //游戏id 游戏房间设置  // 0：进入游戏大厅 1：进入房间 2: 在桌上游戏
        FC_Msg.state = data.state;
        console.log("FC_Msg.isMatching: ",FC_Msg.isMatching);
        console.log("FC_Msg.isReplayGame: ",FC_Msg.isReplayGame);
        if(FC_Msg.isReplayGame){
            FC_Msg.isReplayGame = false;
            if(FC_Msg.state == 0){
                FC_Msg.clearAllPlayerInfo();
                this.clear();
                this.onEnable();
            }else{
                let message = {
                    cmdType: "0x9042",
                    data: {
                        data_head: {
                            iRoomID: FC_Msg.roomId,
                            iDeskID: FC_Msg.playerInfo["deskID"],
                            iUserID: FC_Msg.userInfo["userID"],
                        },
                        data_main: {}
                    }
                };
                FC_Msg.send(message); 
            }
        }

        if(FC_Msg.isMatching){
            if(FC_Msg.gameType != CST.GAMETYPE.pvp) return;
            let message = {};
            message.cmdType = "0xa030";
            let data = {};
            data.game_id = FC_Msg.gameId;
            data.user_id = FC_Msg.userInfo["userID"];
            message.data = data;
            console.log("message...",message);
            FC_Msg.send(message); 
        }
        FC_Msg.runNextMsg();
    },
    playerTimeOut: function(msg){//--------------------游戏超时
        let data = msg.datas[0];
        console.log("playerTimeOut...");
        CF.isWaitCommand = false;
        //获取玩家 seatId
        let outColor = data.outPlayerColor;
        let seatId;
        for(let i = 0; i < FC_Msg.playerColor.length; i++){
            if(outColor == FC_Msg.playerColor[i]){
                seatId = i;
                break;
            }
        }
        //更新 超时数据(自己单独处理)
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let times = FC_Msg.timeOutTimes[seatId];
        
        
        FC_Msg.timeOutTimes[seatId] += 1 * 1;
        //超时 图标显示
        if(seatId == userSeat){
            this.showTimeCount(true,seatId,true);
        }else{
            if(FC_Msg.timeOutTimes[seatId] >= 3){
                this.showTimeCount(false,seatId);
            }else{
                this.showTimeCount(true,seatId,true);
            }
        }
        //停止 动画
        CF.stopAllPlaneAction(data.outPlayerColor);


        if(FC_Msg.timeOutTimes[seatId] >= 3){
            if(seatId == userSeat){
                FC_Msg.runNextMsg();
                return;
            }else{
                //棋子全部回家
                let common_type = CF.returnType(data.outPlayerColor);
                CF.unActiveOneSideAllPlane(common_type);
            }
        }
        //提示
        if(seatId != userSeat){
            this.showTip(12);
        }else{
            this.showTip(11);
        }
        //直接走 9025逻辑
        this.tellRunPiece(msg);

        FC_Msg.runNextMsg();
    },

    tellRetractResult: function(msg){ //断线重来
        FC_Msg.runNextMsg();
    },

    reComeGame: function(msg){ //--------------------重连游戏状态设置
        console.log("----reComeGame-----",JSON.stringify(msg.datas));
        //如果是没有断线的重连（玩家完成后的）
        if(!FC_Msg.isBrokenLineReConnect){
            FC_Msg.runNextMsg();
            return;
        }
        let data = msg.datas[0];
        FC_Msg.isBrokenLineReConnect = false;
        //数据刷新
        FC_Msg.reConnectData = data;
        FC_Msg.reconnet = true;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson) return;
        FC_Msg.setGameType(CST.GAMETYPE.pvp);
        
        FC_Msg.state = 2;
        let scene = cc.director.getScene();
        console.log("scene.name...",scene.name);
        if(scene.name == "FC_Game"){
            this.hideMatch();
            this.clearNode(this.node_bomb);
            this.clearNode(this.node_plane);
            // this.onLoad();
            this.onEnable();
            //重置 棋盘坐标号
            this.initNumText();
            this.initNumPos(); //数字相对坐标
            this.hideLoading();
        }
        // FC_Msg.runNextMsg();
    },

    getPlayerData: function(id){
        if(FC_Msg.allPlayerInfos == undefined) return null;
        for(let i in FC_Msg.allPlayerInfos){
            let obj = FC_Msg.allPlayerInfos[i];
            if(obj.userID == id){
                return obj;
            }
        }
        return null;
    },

    playerSeat: function(msg){
        let data = msg.datas[0];
        let obj = this.getPlayerData(data.userID);
        //显示 玩家信息（头像框和名字）
        this.showPlayerHead(true,obj.deskSeatID,data.useHeadType,false);
        //倒计时
        this.showTimeCount(false,obj.deskSeatID);

        FC_Msg.runNextMsg();
    },

    userSeat:function(msg){
        let data = msg.datas[0];
        let obj = this.getPlayerData(FC_Msg.userInfo["userID"]);
        console.log("userSeat: ",obj);
        if(!obj) return;
        let headType = data.useHeadType[obj.deskSeatID];
        //显示 玩家信息（头像框和名字）
        this.showPlayerHead(true,obj.deskSeatID,headType,false);
        //倒计时
        this.showTimeCount(false,obj.deskSeatID);

        FC_Msg.runNextMsg();
    },
    runNewGame: function(msg){
        this.node_over.x = 3000;
        CF.hideGameClubButton();

        FC_Msg.playerColor = [-1,-1,-1,-1]
        //隐藏掉所有玩家 
        this.showPlayerHead(false);
        //显示玩家自己
        this.showPlayerHeadByIdx(0);

        this.isNewGame = true;

        let scene = cc.director.getScene();
        if(scene.name == "FC_Game"){
            this.onEnable();
        }
        FC_Msg.runNextMsg();
    },


    showLoading: function(time,tips){ //等待网络回执 loading、
        //隐藏 游戏圈和广告
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
            this.limitTime = 0;
        }
        if(FC_UtilFunc.loading && FC_UtilFunc.loading.children) {
            if(Number(this.limitTime) < Number(limitTime)){
                this.limitTime = limitTime;
            }
            if(!FC_UtilFunc.tips || FC_UtilFunc.tips == "-1"){
                return;
            }else{
                console.log("FC_UtilFunc.loading: ",FC_UtilFunc.loading);
                let loadCom = FC_UtilFunc.loading.getComponent("FC_LoadMessage");
                if(loadCom){
                    loadCom.showContent();
                }
            }
            return;
        }else{
            if(FC_UtilFunc.isCreating) return;
            this.hideLoading();
            this.limitTime = 0;
            if(!this.node) return;
            FC_UtilFunc.isCreating = true;
            console.log("FC_Game showLoading");
            let self = this;
            this.loadInter = setTimeout(function(){
                let node_load = cc.instantiate(self.loadUI);
                FC_UtilFunc.loading = node_load;
                if(node_load){
                    self.node.addChild(node_load,300);
                    node_load.position = cc.v2(0,0);
                    FC_UtilFunc.isCreating = false;
                }
            },1000);
            
        }
    },
    hideLoading: function(){
        console.log("FC_Game showLoading");
        clearTimeout(this.loadInter);
        if(FC_UtilFunc.loading) FC_UtilFunc.loading.destroy();
        FC_UtilFunc.loading = null;
        //刷新 游戏圈和广告的显示
        if(this.node_over.x == 0){
            CF.showGameClubButton();
            CF.showBanner();
        }else{
            CF.showBanner();
        }
    },
});
