
let CST = require("FC_Constant");
let FC_Msg = require("FC_Msg");
let CCGlobal = require("CCGlobal");
let AdsFunc = require("AdsFunc");
let WXGameClub = require("WXGameClub");
let CF = {
    version: "1.2.81",
    sh_version: "sh12",

    Player_Max_Num : CST.Player_Max_Num,
    Plane_Num: CST.Plane_Num,
    Line_Num: CST.Line_Num,
    node_game: null,
    node_plane: null,
    node_bomb: null,
    node_stock: null,
    orderArr: null,
    bombPrefab: null,
    isFirstAuthor: true,
    Fly_Ori_Pos_Arr: [],
    Fly_Start_pos: [],
    Fly_Out_Pos_Arr: [],
    Fly_In_Pos_Arr: [],
    node_pos: null,
    player_idx: 0,

    stockTimes: 0,
    isWaitCommand: false,
    isAuthorBool: true,

    isShowVideo: false,
    isInShare: false,
    isInSet: false,

    isInit: false,

    init: function(){
        if(this.isInit) return;
        this.isInit = true;
        //监听前后台切换
       cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("游戏进入后台: ",this.isShowVideo,this.isInShare);
            this.isShowInsert = true;
            if(this.isShowVideo || this.isInShare){
                this.isShowInsert = false;
            }
        }, this);

        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("重新返回游戏: ",this.isShowVideo,this.isInShare);

            // if(MoreGameBanner.event){
            //     MoreGameBanner.event.emit("skipSuccess");
            // }
            // if(ClickToDemo.event){
            //     ClickToDemo.event.emit("skipSuccess_demo");
            // }

            if(this.isInShare){
                this.isShowInsert = false;
                this.isInShare = false;
                return;
            }
            if(this.isShowInsert){
                if(cc.director.getScene().name == "FC_Menu"){
                    //设置界面
                    if(this.isInSet){
                        this.isShowInsert = true;
                    }else{
                        this.isShowInsert = false;
                    }
                }else{
                    this.isShowInsert = true;
                } 

                if(this.isShowInsert){
                    // this.showInsertAdBg(true);
                    AdsFunc.createInsertAd();
                    this.isShowInsert = false;
                }

            }   
            this.isShowVideo = false;         
        }, this);
    },

    showInsertAdBg: function(isBool){
        console.log("showInsertAdBg: ",isBool);
        if(window.GameConfig.platform != 1) return;
        let bg = cc.find('P_insertAdBg');
        bg.active = isBool ? true : false;
        bg.position = cc.v2(360,780);
    },

    initSysStockRecord: function(){
        this.sysStockRecord = 0;
    },
    initFinishArr: function(){
        this.FinishNumArr = [];
        for(let i = 0; i < G_FC.OpenIdxArr.length; i++){
            this.FinishNumArr[i] = 0;
        }
        this.completeArr = [];
        this.completeArr.length = 0;
    },
    checkSysStockRecord: function(){
        if(Number(this.sysStockRecord) >= CST.LuckyNumLimit) return true;
        return false;
    },
    getOriPointNum: function(){//获取 机场点数
        return Number(CST.Plane_Num) * CST.Player_Max_Num;
    },
    getFlyInPointNum: function(){//获取 飞回来点数
        return Number(CST.Line_Num) * CST.Player_Max_Num;
    },
    getFlyOutPointNum: function(){ //获取飞出去 点数
        return Number(CST.Polygon_Long + CST.Polygon_Short) * (CST.Polygon_Num / 2);
    },
    getFinishStepNum: function(){//完成 一次步数
        return Number(CST.Polygon_Long + CST.Polygon_Short) * (CST.Polygon_Num / 2) + CST.Line_Num - parseInt(CST.Polygon_Short / 2);
    },
    initOriPosArr: function(arr){//设置飞机场 坐标
        if(arr.length == 0) return;
        for(let i in arr){
            this.Fly_Ori_Pos_Arr.push(arr[i]);
        }
        return this.Fly_Ori_Pos_Arr;
    },
    initFlyStartPosArr: function(arr){//初始化 起点所有坐标
        if(arr.length == 0) return;
        for(let i in arr){
            this.Fly_Start_pos.push(arr[i]);
        }
        arr.length = 0;
        return this.Fly_Start_pos;
    },
    initFlyOutPosArr: function(arr){//初始化 飞出去航线所有坐标
        if(arr.length == 0) return;
        for(let i in arr){
            this.Fly_Out_Pos_Arr.push(arr[i]);
        }
        arr.length = 0;
        return this.Fly_Out_Pos_Arr;
    },
    initFlyInPosArr: function(arr){//初始化 飞出去航线所有坐标
        if(arr.length == 0) return;
        for(let i in arr){
            this.Fly_In_Pos_Arr.push(arr[i]);
        }
        arr.length = 0;
        return this.Fly_In_Pos_Arr;
    },
    
    getStartOut_idx: function(type){//设置飞出去航线 起始点 下标
        let flagType = this.returnType(type);
        if(flagType == 0){
            flagType = 2;
        }else if(flagType == 1) flagType = 3;
        else if(flagType == 2) flagType = 0;
        else if(flagType == 3) flagType = 1;
        if(Number(flagType) < Number(CST.Player_Max_Num)) return Number(flagType % CST.Player_Max_Num) * (CST.Polygon_Long + CST.Polygon_Short);
        return -1;
    },
    getDestOut_idx: function(flag_type){//获取飞出去航线  终点 下标
        let type = flag_type;
        if(type == 0) type = 2;
        if(type == 1) type = 3;
        if(type == 2) type = 0;
        if(type == 3) type = 1;
        if(Number(type) <= Number(CST.Player_Max_Num)){
            let ori_idx = this.getStartOut_idx(flag_type);
            let Total_num = Number(CST.Polygon_Long + CST.Polygon_Short) * (CST.Polygon_Num / 2);
            let max_idx = Number(ori_idx) + Total_num - parseInt(CST.Polygon_Short / 2) - 1;
            if(Number(max_idx) < Total_num){
                return max_idx;
            }else{
                if(G_FC.FlyDirection == CST.FlyDirection.Clockwise){//顺时针方向
                    return ori_idx - parseInt(CST.Polygon_Short / 2) - 1;
                }else{
                    return ori_idx + parseInt(CST.Polygon_Short / 2) + 1;
                }
            }
        }
        return -1;
    },

    getPositionByDic: function(obj){ //通过pos字典 获取具体坐标
        if(this.isNull(obj)) return;
        let pos;
        switch(obj.type){
            case CST.FlyLineType.Line_Airport:
            {
                pos = this.Fly_Ori_Pos_Arr[obj.idx];
            }
                break;
            case CST.FlyLineType.Line_Start:
            {
                pos = this.Fly_Start_pos[obj.idx];
            }
                break;
            case CST.FlyLineType.Line_Out:
            {
                pos = this.Fly_Out_Pos_Arr[obj.idx];
            }
                break;
            case CST.FlyLineType.Line_in:
            {
                pos = this.Fly_In_Pos_Arr[obj.idx];
            }
                break;
        }
        return pos;
    },  
    //棋盘 对应位置颜色
    getColorByIdx: function(idx){
        let flag = idx % CST.Player_Max_Num;
        // console.log("getColorByIdx...",idx,flag);
        let arr = [0,1,2,3,0,1,2,3];
        let num = 0;
        let getIdx = false;
        let newArr = [];
        for(let i = 0;i < arr.length; i++){
            if(this.player_idx == arr[i]){
                getIdx = true;
            }
            if(getIdx){
                newArr.push(arr[i]);
                num += 1 * 1;
            }
            if(Number(num) >= 4){
                break;
            }
        }
        let type = newArr[flag];
        let color;
        switch(type){
            case 0:
            {
                color = CST.HeadType.Yellow;
            }
                break;
            case 1:
            {
                color = CST.HeadType.Blue;
            }
                break;
            case 2:
            {
                color = CST.HeadType.Green;
            }
                break;
            case 3:
            {
                color = CST.HeadType.Red;
            }
                break;
        }
        return color;
    },
    getPlayerIdxArr: function(){
        let idxArr = [];
        for(let i = 0; i < G_FC.OpenIdxArr.length; i++){
            if(G_FC.OpenIdxArr[i] != -1){
                for(let k = i * CST.Plane_Num; k < (i * CST.Plane_Num + 4); k++){
                    idxArr.push(k);
                }
            }
        }
        return idxArr;
    },

    setPlayerIdxArr: function(idx){
        
    },

    setMapByType: function(type){
        this.player_idx = type;
    },
    //根据自己棋子颜色 转换playerType
    transformType: function(type){
        let typeArr = [0,1,2,3,0,1,2,3];
        let idx = 0;
        for(let i = 0; i < typeArr.length; i++){
            if(typeArr[i] == this.player_idx){
                idx = i;
                break;
            }
        }
        let new_idx = Number(type) + this.player_idx;
        let new_type = typeArr[new_idx];
        return new_type;
    },
    //根据 type 转换下标
    returnType: function(type){
        let typeArr = [0,1,2,3,0,1,2,3];
        let newArr = [];
        let num = 0;
        let getIdx = false;

        for(let i = 0; i < typeArr.length; i++){
            if(this.player_idx == typeArr[i]){
                getIdx = true;
            }
            if(getIdx){
                newArr.push(typeArr[i]);
                num += 1 * 1;
            }
            if(Number(num) >= 4){
                break;
            }
        }
        let idx = -1;
        for(let k = 0; k < newArr.length; k++){
            if(newArr[k] == type){
                idx = k;
                break;
            }
        }
        // console.log("returnType... ",this.player_idx,idx);
        return idx;
    },

    initAllPlaneData: function(random_idx){ //初始化 飞机数据
        let PointNum = this.getOriPointNum();
        if(PointNum <= 0) return;
        if(this.PlaneDataArr == undefined) this.PlaneDataArr = [];
        this.PlaneDataArr.length = 0;
        
        //根据数量
        let idxArr = this.getPlayerIdxArr();
        console.log("initAllPlaneData...",idxArr);
        for(let i = 0; i < Number(idxArr.length); i++)
        {
            let type1 = this.transformType(parseInt(idxArr[i] / CST.Player_Max_Num));//parseInt(idxArr[i] / CST.Player_Max_Num)
            let type2 = 0;
            let idx = idxArr[i];
            let i_data = this.createPlaneData(idxArr[i],type1,type2,idx);
            this.PlaneDataArr.push(i_data);
        }
    },
    createPlaneData: function(order,type1,type2,idx){//初始化 飞机(属性同步到  预制对象中)
        let obj = {};
        obj.Order = order;
        obj.PlayerType = type1;
        obj.OpenType = G_FC.OpenIdxArr[type1];
        obj.HeadType = type2;
        obj.ActiveType = CST.ActiveType.unActive;
        obj.Ori_idx = idx;
        obj.Current_idx = -1;
        obj.Start_idx = this.getStartOut_idx(type1);
        obj.Dest_idx = this.getDestOut_idx(type1);;
        obj.FlyLineType = CST.FlyLineType.Line_Airport;
        obj.OverLap = 0;
        obj.lapBack = false;
        obj.FlyPosArr = [];
        return obj;
    },
    createAllPlane:function(prefab){  //创建所有飞机
        let PointNum = this.getOriPointNum();
        if(PointNum <= 0) return;
        if(this.isNull(G_FC.OpenIdxArr)) return;
        //获取实际可用的idx
        let idxArr = this.getPlayerIdxArr();
        //console.log("----idxArr----",idxArr);
        for(let i = 0; i < Number(idxArr.length); i++)
        {
            let newPlane = newPlane = cc.instantiate(prefab);
            if(!newPlane) continue;
            this.node_plane.addChild(newPlane,100);
            newPlane.tag1 = idxArr[i];
            let i_pos = this.Fly_Ori_Pos_Arr[idxArr[i]];
            newPlane.position = i_pos;
            
            let i_data = this.PlaneDataArr[i];
            newPlane.data = {};
            for(let k in i_data){
                newPlane.data[k] = i_data[k];
            }
            newPlane.getComponent("FC_Plane").icon = parseInt(idxArr[i] / CST.Plane_Num);
            this.changePlaneDirection(idxArr[i]);
        }
    },

    backToPassPlane: function(order){//还原飞机初始状态
        //console.log("----backToPassPlane-----");
        let obj = this.getChildByTag(this.node_plane,order);
        if(this.PlaneDataArr == undefined || this.PlaneDataArr.length == 0) return;
        let ori_data;
        for(let i in this.PlaneDataArr){
            let i_data = this.PlaneDataArr[i];
            if(i_data.Order == obj.data.Order)
            {
                ori_data = i_data;
                break;
            }
        }
        if(ori_data == undefined) return;
        for(let k in ori_data){
            obj.data[k] = ori_data[k];
        }
        this.changePlaneDirection(order);
    },

    activePlane: function(order,notice){//激活 飞机
        let obj = this.getChildByTag(this.node_plane,order);
        if(!obj) return;
		if(!obj.data) return;
        if(obj.data.ActiveType == CST.ActiveType.unActive) obj.data.ActiveType = CST.ActiveType.Stand;
        let type = this.returnType(obj.data.PlayerType);
        let pos = {
            type: CST.FlyLineType.Line_Start,
            idx: type
        };
        //起点 没有color属性
        obj.data.FlyPosArr = [];
        obj.data.FlyPosArr.push(pos);
        this.changeCommand(CST.Update_Command.PlaneFly,3);
    },

    sendRunAction: function(order,tag){
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let cur_color = FC_Msg.playerColor[userSeat];
        if(FC_Msg.cur_color != cur_color) return;
        let message = {
            cmdType: "0x9026",
            data : {
                data_head: {
                    iRoomID: FC_Msg.roomId,
                    iDeskID: FC_Msg.playerInfo["deskID"],
                    iUserID: FC_Msg.userInfo["userID"],
                },
                data_main: {
                    planeTag: order % 4,
                    actionTag: tag
                },
            }
        };
        FC_Msg.send(message);
        FC_Msg.runNextMsg();
    },

    sendFinish: function(){
        let userSeat = FC_Msg.playerInfo["deskSeatID"];
        let cur_color = FC_Msg.playerColor[userSeat];
        if(FC_Msg.cur_color != cur_color) return;
        let message = {
            cmdType: "0x9028",
            data:{
                data_head: {
                    iRoomID: FC_Msg.roomId,
                    iDeskID: FC_Msg.playerInfo["deskID"],
                    iUserID: FC_Msg.userInfo["userID"],
                },
                data_main: {}
            }
        };
        FC_Msg.send(message);
        FC_Msg.runNextMsg();
    },

    unActivePlane: function(order){//睡眠 飞机
        let obj = this.getChildByTag(this.node_plane,order);
        let pos = this.Fly_Ori_Pos_Arr[obj.data.Ori_idx];
        obj.stopAllActions();
        if(!cc.isValid(obj)) return;
        obj.runAction(cc.sequence(
            cc.moveTo(.5,pos),
            cc.callFunc(function(){
                this.backToPassPlane(order);
            }.bind(this))
        ));
        
    },
    unActiveOneSideAllPlane: function(type,idx){
        console.log("----unActiveOneSideAllPlane---",type,idx);
        this.changeCommand(CST.Update_Command.Static,9);
        let childs = this.node_plane.getChildren();
        for (let i in childs) {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            if(i_child.data.ActiveType == CST.ActiveType.Back) continue;
            if(i_child.data.ActiveType == CST.ActiveType.unActive) continue;
            if(type == undefined){ //撞击 跌机
                if(i_child.data.FlyLineType != CST.FlyLineType.Line_Out) continue;
                if(i_child.data.Current_idx == idx){
                    this.unActivePlane(i_child.data.Order);
                }
            }
            if(idx == undefined){ //系统检测
                let common_type = this.returnType(i_child.data.PlayerType);
                if(common_type == type){
                    this.unActivePlane(i_child.data.Order);
                }
            }
            
        }
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            setTimeout(function(){
                this.setNextOrder();
                this.changeCommand(CST.Update_Command.Start,4);
            }.bind(this),1000);
        }
           
    },
    backPlane: function(order){ //飞机返航
        let obj = this.getChildByTag(this.node_plane,order);
        if(!obj) return;
        if(!obj.data) return;
        if(obj.data.ActiveType) obj.data.ActiveType = CST.ActiveType.Back;
        let pos = this.Fly_Ori_Pos_Arr[obj.data.Ori_idx];
        obj.stopAllActions();
        obj.runAction(cc.sequence(
            cc.moveTo(.2,pos),
            cc.callFunc(function(){
                obj.data.FlyLineType = CST.FlyLineType.Line_Airport;
                this.changePlaneDirection(order);
                let common_type = this.returnType(obj.data.PlayerType);
                this.FinishNumArr[Number(common_type)] += 1;
                //检测是否全部 返航
                if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                    if(this.checkPlayerComplete(obj.data.PlayerType)){
                        //加入完成数组
                        this.completeArr.push(common_type);
                        this.setPlayerComplete(obj.data.PlayerType);
                        //检测游戏完成
                        if(this.checkGameOver()){
                            this.changeCommand(CST.Update_Command.Static,8);
                            return;
                        }else{
                            this.setNextOrder();
                            this.changeCommand(CST.Update_Command.Start,4);
                        }
                        
                    }else{
                        this.checkLuckNum();
                    }
                }else{
                    // if(FC_Msg.cur_count != CST.Stock_Lucky_Num){
                    //     this.sendFinish();    
                    // }
                    this.sendFinish();
                }
                obj.stopAllActions();
            }.bind(this))
        ));
    },

    checkPlayerComplete:function(type){
        let common_type = this.returnType(type);
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(Number(this.FinishNumArr[common_type]) >= Number(CST.Plane_Num)) return true;
        }else{
            if(this.completeArr.length > 0){
                for(let i = 0; i < this.completeArr.length; i++){
                    if(common_type == this.completeArr[i]) return true;
                }
            }
        }
        return false;
    },
    setPlayerComplete: function(type){
        //设置显示
        let common_type = this.returnType(type);
        let order = -1;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            order = this.completeArr.length - 1;
        }else{
            order = this.completeArr.indexOf(common_type);
        }
        console.log("-----common_type----",common_type);
        console.log("-----setPlayerComplete----",order);
        if(order == -1) return;
        if(!this.node_stock) return;
        let stock_node = this.node_stock.getChildByName("stock_" + common_type);
        if(!stock_node) return;
        let root_stock = stock_node.getChildByName("order");
        if(!root_stock) return;
        if(Number(order) > 2){
            root_stock.active = false;
        }else{
            root_stock.active = true;
            root_stock.getComponent(cc.Sprite).spriteFrame = this.orderArr[order];
        }
    },


    checkGameOver: function() {
        // console.log("-----checkGameOver----");
        //检测玩家
        let player_num = 0;
        let cpu_num = 0;
        let playerType_arr = [];
        let cpuType_arr = [];
        for(let i in G_FC.OpenIdxArr){
            if(G_FC.OpenIdxArr[i] == CST.OpenType.player){
                player_num += 1 * 1;
                playerType_arr.push(i);
            }else if(G_FC.OpenIdxArr[i] == CST.OpenType.cpu){
                cpu_num += 1 * 1;
                cpuType_arr.push(i);
            }
        }
        let player_max = Number(player_num) + Number(cpu_num);
        let player_complete_num = 0;
        let cpu_complete_num = 0;

        let isOver = false;

        for(let k in this.completeArr){
            if(playerType_arr.length > 0){
                for(let m in playerType_arr){
                    if(this.completeArr[k] == playerType_arr[m]){
                        player_complete_num += 1 * 1;
                    }
                }
                if(cpuType_arr.length > 0){
                    for(let m in cpuType_arr){
                        if(this.completeArr[k] == cpuType_arr[m]){
                            cpu_complete_num += 1 * 1;
                        }
                    }
                }
                if(playerType_arr.length == 1){ //只有一个玩家
                    if(Number(player_complete_num) >= Number(player_num)){
                        isOver = true;
                        break;
                    }
                    if(Number(cpu_complete_num) >= Number(cpu_num)){
                        isOver = true;
                        break;
                    }
                }else{//多个玩家 全部到达结束
                    if(Number(player_complete_num) >= Number(player_num)){
                        isOver = true;
                        break;
                    }
                }

                //如果只剩一个人 那就表示已经完成
                let complete_max = Number(player_complete_num) + Number(cpu_complete_num);
                if(Number(complete_max) >= Number(player_max) - 1){
                    isOver = true;
                    break;
                } 
            
            }else{ //只有cpu
                for(let m in cpuType_arr){
                    if(this.completeArr[k] == cpuType_arr[m]){
                        cpu_complete_num += 1 * 1;
                    }    
                }
                if(Number(cpu_complete_num) >= Number(cpu_num)){
                    isOver = true;
                    break;
                }
                //如果只剩一个人 那就表示已经完成
                let complete_max = Number(player_complete_num) + Number(cpu_complete_num);
                if(Number(complete_max) >= Number(player_max) - 1){
                    isOver = true;
                    break;
                } 
            }
            if(isOver) break;
        }
        
        // console.log("-----completeArr----",JSON.stringify(this.completeArr));
        
        //整理排名
        if(isOver){
            let flag_arr = [];

            for(let i in playerType_arr){
                let flag = {};
                flag.idx = playerType_arr[i];
                let isComplete = false;
                for(let k in this.completeArr){
                    if(flag.idx == this.completeArr[k]){
                        isComplete = true;
                        break;
                    }
                }
                if(!isComplete){
                    flag.num = this.FinishNumArr[playerType_arr[i]];
                    flag_arr.push(flag);
                }
            }

            for(let i in cpuType_arr){
                let flag = {};
                flag.idx = cpuType_arr[i];
                let isComplete = false;
                for(let k in this.completeArr){
                    if(flag.idx == this.completeArr[k]){
                        isComplete = true;
                        break;
                    }
                }
                if(!isComplete){
                    flag.num = this.FinishNumArr[cpuType_arr[i]];
                    flag_arr.push(flag);
                }
            }

            flag_arr.sort(function(a,b){
                return b.num - a.num;
            });
            for(let k in flag_arr){
                this.completeArr.push(Number(flag_arr[k].idx));
            }
        }

        return isOver;
    },

    getStandPlane: function(){
        let childs = this.node_plane.getChildren();
        let stand_arr = [];
        for(let i in childs)
        {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            let type = this.returnType(i_child.data.PlayerType);
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                if(type != G_FC.StockOrder) continue;
            }else{
                if(i_child.data.PlayerType != FC_Msg.cur_color) continue;
            }
            if(i_child.data.ActiveType == CST.ActiveType.Stand){
                stand_arr.push(i_child.data.Order);
            }
        }
        return stand_arr;
    },

    FlyStandPlane: function(order){
        // console.log("----FlyStandPlane----",order);
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(G_FC.Stock_num == 0) return;
        }
        this.cancelOverLap(order);
        this.parsePlanePos(order);
        this.changePlaneDirection(order);
        this.changeCommand(CST.Update_Command.PlaneFly,3);
        if(FC_Msg.gameType == CST.GAMETYPE.pvp){
            this.PlantFly(order);
        }
    },

    parsePlanePos: function(order){   //棋子坐标对象化
        let obj = this.getChildByTag(this.node_plane,order);
        // console.log("----parsePlanePos---",order);
        let max_num = this.getFlyOutPointNum();
        let dis_idx = max_num - parseInt(CST.Polygon_Short / 2);
        let max_step = this.getFinishStepNum();
        // console.log("----parsePlanePos--data--",JSON.stringify(obj.data));
        let out_dest_idx = obj.data.Dest_idx;
        let in_dest_idx;
        let stockNum;

        let common_type = this.returnType(obj.data.PlayerType);
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            in_dest_idx = G_FC.StockOrder * CST.Line_Num + (CST.Line_Num - 1);
            stockNum = G_FC.Stock_num;
        }else{
            in_dest_idx = common_type * CST.Line_Num + (CST.Line_Num - 1);
            stockNum = FC_Msg.cur_count;
        }

        let out_start_idx = obj.data.Start_idx;

        let cur_idx = obj.data.Current_idx;
        if(cur_idx == -1){
            cur_idx = Number(obj.data.Current_idx) + Number(out_start_idx);
        }
        let vir_idx = Number(cur_idx) + Number(stockNum) ;

        obj.data.FlyPosArr = [];
        
        // console.log("----common_type--",common_type);
        // console.log("----FlyLineType--",obj.data.FlyLineType);

        // console.log("-----cur_idx--",cur_idx);
        // console.log("-----vir_idxr--",vir_idx);


        for(let i = 0; i < Number(stockNum); i++){
            let i_num = Number(cur_idx) + i + 1;
            let pos = {};
            if(obj.data.FlyLineType == CST.FlyLineType.Line_Out || obj.data.FlyLineType == CST.FlyLineType.Line_Start){
                if(Number(out_dest_idx) > Number(out_start_idx)){
                    if(Number(vir_idx) > Number(out_dest_idx)){
                        if(Number(i_num) > Number(out_dest_idx)){
                            pos.type = CST.FlyLineType.Line_in;
                            pos.color = this.getColorByIdx(common_type);
                            pos.idx = i_num - out_dest_idx - 1 + (common_type * CST.Line_Num);
                        }else{
                            let cr = this.getColorByIdx(i_num);
                            pos.type = CST.FlyLineType.Line_Out;
                            pos.color = cr;
                            pos.idx = i_num;
                        }
                    }else{
                        let cr = this.getColorByIdx(i_num);
                        pos.type = CST.FlyLineType.Line_Out;
                        pos.color = cr;
                        pos.idx = i_num;
                    }
                    // console.log("pos.color___0 ",pos.color);
                }else{
                    
                    if(Number(i_num) > max_num - 1){
                        i_num = i_num - max_num;
                    }
                    // console.log("-----cur_idx-after--",cur_idx);
                    // console.log("-----vir_idx--after-",vir_idx);

                    if(Number(cur_idx) <= Number(out_dest_idx) &&  Number(vir_idx) > Number(out_dest_idx)){ //跨越

                        if(Number(i_num) > out_dest_idx){
                            let cr = this.getColorByIdx(common_type);
                            pos.type = CST.FlyLineType.Line_in;
                            pos.color = cr;
                            pos.idx = common_type * CST.Line_Num + Number(i_num) - out_dest_idx - 1;
                        }else{
                            let cr = this.getColorByIdx(i_num);
                            pos.type = CST.FlyLineType.Line_Out;
                            pos.color = cr;
                            pos.idx = i_num;
                        }
                    }else{
                        let cr = this.getColorByIdx(i_num);
                        pos.type = CST.FlyLineType.Line_Out;
                        pos.color = cr;
                        pos.idx = i_num;
                    }
                    // console.log("pos.color___1 ",pos.color);
                }    
            }else if(obj.data.FlyLineType == CST.FlyLineType.Line_in){
                if(Number(vir_idx) > Number(in_dest_idx)){
                    if(Number(i_num) > Number(in_dest_idx)){
                        pos.type = CST.FlyLineType.Line_in;
                        pos.color = this.getColorByIdx(common_type);
                        pos.idx = in_dest_idx - (i_num - in_dest_idx);
                    }else{
                        pos.type = CST.FlyLineType.Line_in;
                        pos.color = this.getColorByIdx(common_type);
                        pos.idx = i_num;
                    }
                    // console.log("pos.color___2 ",pos.color);
                }else{
                    pos.type = CST.FlyLineType.Line_in;
                    pos.color = this.getColorByIdx(common_type);
                    pos.idx = i_num;
                    // console.log("pos.color___3 ",pos.color);
                }
            }
            //注意检测  pos 是否是空对象
            obj.data.FlyPosArr.push(pos);
        }   
    },

    changePlaneDirection: function(order,jumpdir){
        let obj = this.getChildByTag(this.node_plane,order);
        if(!obj) return;
        if(!obj.data) return;
        let type = obj.data.FlyLineType;
        let idx = obj.data.Current_idx;
        let planeType = this.returnType(obj.data.PlayerType); 

        let objCom = obj.getComponent("FC_Plane");
        if(jumpdir != undefined && jumpdir){//虚线跳跃
            if(planeType == 0) objCom.direction = CST.PlaneDirection.Right;
            if(planeType == 1) objCom.direction = CST.PlaneDirection.Down;
            if(planeType == 2) objCom.direction = CST.PlaneDirection.Left;
            if(planeType == 3) objCom.direction = CST.PlaneDirection.Up;
            return;
        }

        if(type == CST.FlyLineType.Line_Airport)
        {
            if(obj.data.ActiveType == CST.ActiveType.Back){
                objCom.icon = 4;
            }else{
                //与起飞位置 同向
                if(planeType == 0) objCom.direction = CST.PlaneDirection.Up;
                if(planeType == 1) objCom.direction = CST.PlaneDirection.Right;
                if(planeType == 2) objCom.direction = CST.PlaneDirection.Down;
                if(planeType == 3) objCom.direction = CST.PlaneDirection.Left;
            }
        }else if(type == CST.FlyLineType.Line_Start){
            if(planeType == 0) objCom.direction = CST.PlaneDirection.Up;
            if(planeType == 1) objCom.direction = CST.PlaneDirection.Right;
            if(planeType == 2) objCom.direction = CST.PlaneDirection.Down;
            if(planeType == 3) objCom.direction = CST.PlaneDirection.Left;
        }else if(type == CST.FlyLineType.Line_in){
            let flag = parseInt(idx / CST.Line_Num)
            if(flag == 0) objCom.direction = CST.PlaneDirection.Up;
            if(flag == 1) objCom.direction = CST.PlaneDirection.Right;
            if(flag == 2) objCom.direction = CST.PlaneDirection.Down;
            if(flag == 3) objCom.direction = CST.PlaneDirection.Left;
        }else{

            if(idx == obj.data.Dest_idx){
                if(planeType == 0) objCom.direction = CST.PlaneDirection.Up;
                if(planeType == 1) objCom.direction = CST.PlaneDirection.Right;
                if(planeType == 2) objCom.direction = CST.PlaneDirection.Down;
                if(planeType == 3) objCom.direction = CST.PlaneDirection.Left;
                return;
            }

            let max_num = this.getFlyOutPointNum();
            let flag = idx;
            if(Number(flag) >= Number(max_num / 2)){
                flag = flag - (max_num / 2);
            }
            let flag_1 = parseInt(flag / (CST.Polygon_Long + CST.Polygon_Short));
            let flag_2 = flag - (flag_1 * (CST.Polygon_Long + CST.Polygon_Short));
            let flag_3 = Number(flag_2 / Number(CST.Polygon_Long / 2 - 1));

            if(flag_1 == 0){
                if(flag_3 > 0 && flag_3 < 1){
                    objCom.direction = Number(idx) < Number(max_num / 2)?CST.PlaneDirection.Down : CST.PlaneDirection.Up;
                }else if(flag_3 >= 1 && flag_3 <= 2){
                    objCom.direction = Number(idx) < Number(max_num / 2)?CST.PlaneDirection.Right : CST.PlaneDirection.Left;
                }else{
                    objCom.direction = Number(idx) < Number(max_num / 2)?CST.PlaneDirection.Down : CST.PlaneDirection.Up;
                }
            }else{
                if(flag_3 > 0 && flag_3 < 1){
                    objCom.direction = Number(idx) < Number(max_num / 2)?CST.PlaneDirection.Left : CST.PlaneDirection.Right;
                }else if(flag_3 >= 1 && flag_3 <= 2){
                    objCom.direction = Number(idx) < Number(max_num / 2)?CST.PlaneDirection.Down : CST.PlaneDirection.Up;
                }else{
                    objCom.direction = Number(idx) < Number(max_num / 2)?CST.PlaneDirection.Left : CST.PlaneDirection.Right;
                }
            }

        }
    },

    isHaveStandPlane: function(){
        let childs =  this.node_plane.getChildren();
        for(let i in childs)
        {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                let type = this.returnType(i_child.data.PlayerType);
                if(type != G_FC.StockOrder) continue;
            }else{
                if(i_child.data.PlayerType != FC_Msg.cur_color) continue;
            }
            
            if(i_child.data.ActiveType == CST.ActiveType.Stand) return true;
        }
        return false;
    },

    getLastOneStandOrder: function(){
        let childs =  this.node_plane.getChildren();
        let num = 0;
        let order;
        let unActive_num = 0;
        for(let i in childs)
        {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                let type = this.returnType(i_child.data.PlayerType);
                if(type != G_FC.StockOrder) continue;
            }else{
                if(i_child.data.PlayerType != FC_Msg.cur_color) continue;
            }
            
            if(i_child.data.ActiveType == CST.ActiveType.unActive){
                unActive_num += 1 * 1;
            }
            if(i_child.data.ActiveType != CST.ActiveType.Stand) continue;
            num += 1 * 1;
            order = i_child.data.Order;
        }
        console.log("unActive_num: ",unActive_num);
        console.log("num: ",num);
        if(Number(num) == 1){
            if(Number(unActive_num) == 0) return order;
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                if(!this.checkPlaneActiveStockNum(G_FC.Stock_num)) return order;
            }else{
                if(!this.checkPlaneActiveStockNum(FC_Msg.cur_count)) return order;
            }
        }else{
            
        }
        return -1;
    },

    waitForCommand: function(cmd,color){
        let plane_num = CST.Plane_Num;
        let childs = this.node_plane.getChildren();
        
        if(FC_Msg.gameType == CST.GAMETYPE.pvp){
            let userSeat = FC_Msg.playerInfo["deskSeatID"];
            let cur_color = FC_Msg.playerColor[userSeat];
            if(FC_Msg.cur_color != cur_color) return;
        }
        
        for(let i in childs)
        {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            i_child.stopAllActions();
            
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                let type = this.returnType(i_child.data.PlayerType);
                if(type != G_FC.StockOrder) continue;
            }else{
                if(i_child.data.PlayerType != FC_Msg.cur_color) continue;
            }
            
            console.log("waitForCommand: ",color);
            if(cmd == undefined)
            {
                //激活 可点击
                i_child.getComponent("FC_Plane").interactable = true;
                i_child.getComponent(cc.Animation).play("planeScale");
            }else{
                for(let k in cmd)
                {
                    if(i_child.data.ActiveType == cmd[k]){
                        //激活 可点击
                        i_child.getComponent("FC_Plane").interactable = true;
                        i_child.getComponent(cc.Animation).play("planeScale");
                        break;
                    }
                }
            }
        }
        
    },
    stopAllPlaneAction: function(color){
        console.log("stopAllPlaneAction_______");
        let childs = this.node_plane.getChildren();
        for(let i in childs)
        {
            let i_child = childs[i];
            if(FC_Msg.gameType == CST.GAMETYPE.pvp){
                if(!i_child || !i_child.data) continue;
                if(color != undefined && color != i_child.data.PlayerType) continue;
            }
            if(i_child.data.ActiveType == CST.ActiveType.Back) continue;
            i_child.stopAllActions();
            i_child.getComponent("FC_Plane").interactable = false;
            i_child.getComponent(cc.Animation).stop("planeScale");
            i_child.scale = 1;
        }
    },
    random: function(){
        let rand = Math.random() * 100;
        if(rand < 10 ) return 1;
        if(rand < 30) return 2;
        if(rand < 50) return 3;
        if(rand < 70) return 4;
        if(rand < 90) return 5;
        return 6;
    },

    setNextOrder: function(){ //设置 摇骰子order
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            // console.log("setNextOrder...: ",G_FC.OpenIdxArr,this.FinishNumAr);
            let idxArr = [];
            for(let k = 0; k < 2; k++){
                for(let i = 0;i < G_FC.OpenIdxArr.length; i++){
                    if(G_FC.OpenIdxArr[i] == -1) continue;
                    if(Number(this.FinishNumArr[i]) >= Number(CST.Plane_Num) && i == G_FC.StockOrder){
                        idxArr.push(i);
                    }
                    if(Number(this.FinishNumArr[i]) < Number(CST.Plane_Num)){
                        idxArr.push(i);
                    }
                }
            }
            for(let m = 0; m < idxArr.length / 2; m++){
                if(G_FC.StockOrder == idxArr[m]) G_FC.StockOrder = idxArr[++m];
            }
            this.sysStockRecord = 0;
        }else{
            //后面
        }
    },

    checkPlaneActiveStockNum: function(num){    //激活点数
        // console.log("checkPlaneActiveStockNum--------------",JSON.stringify(num));
        if(this.isNull(G_FC.Plane_Active_Type)) return false;
        let arr = CST.Plane_Active_Num[G_FC.Plane_Active_Type];
        // console.log("arr: ",arr);
        for(let i = 0; i < arr.length; i++){
            if(num == arr[i]) return true;
        }
        return false;
    },

    getCanActivePlane: function(){ //获取可以激活的飞机
        let childs = this.node_plane.getChildren();
        for(let i in childs)
        {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            if(i_child.data.ActiveType != CST.ActiveType.unActive) continue;
            let type = this.returnType(i_child.data.PlayerType);
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                if(type != G_FC.StockOrder) continue;
            }else{
                if(i_child.data.PlayerType != FC_Msg.cur_color) continue;
            }
            
            return i_child.data.Order;
        }
        return -1;
    },
    PlantFly: function(order){
        let childs = this.node_plane.getChildren();
        // console.log("----PlantFly---",order);
        // console.log("----StockOrder---",G_FC.StockOrder);
        let moveTime = CST.moveDistime * 1;
        let isFly = false;
        for(let i in childs)
        {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            let i_data = i_child.data;
            
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                let flagType = this.returnType(i_data.PlayerType);
                if(flagType != G_FC.StockOrder) continue;
            }else{
                if(i_data.PlayerType != FC_Msg.cur_color) continue;
            }
            
            // console.log("ActiveType.. ",i_data.ActiveType);
            if(i_data.ActiveType == CST.ActiveType.Fly) continue;
            if(i_data.FlyPosArr.length == 0) continue;
            // console.log("FlyPosArr.. ",i_data.FlyPosArr.length);
            // console.log("FlyPosArr.. ",JSON.stringify(i_data.FlyPosArr));
            let dest_pos = this.getPositionByDic(i_data.FlyPosArr[0]);

            isFly = true;

            i_child.runAction(
                cc.sequence(
                    cc.callFunc(function(){
                        i_child.data.ActiveType = CST.ActiveType.Fly;
                    }),
                    cc.moveTo(moveTime,dest_pos),
                    cc.delayTime(moveTime),
                    cc.callFunc(function(){
                        let pos_data = i_data.FlyPosArr[0];
                        if(!pos_data) return;
                        let color = pos_data.color;
                        let type = pos_data.type;
                        // console.log("-----back---stock----",JSON.stringify(i_data.FlyPosArr[0]));
                        if(type){
                            i_child.data.FlyLineType = type;
                        }else{
                            console.log("#####################type undefined#######################");
                        }
                        
                        if(type == CST.FlyLineType.Line_Out || type == CST.FlyLineType.Line_in){
                            i_child.data.Current_idx = Number(i_data.FlyPosArr[0].idx);
                        }else{
                            i_child.data.Current_idx = -1;//idx归-1
                        }
                        //检测 敌方跌机
                        if(i_child.data.FlyLineType == CST.FlyLineType.Line_Out && !i_child.data.lapBack){
                            let EnemyOverLapArr = this.getOtherOverLap(i_child.data.Current_idx,i_child.data.PlayerType);
                            // console.log("----EnemyOverLapArr---",JSON.stringify(EnemyOverLapArr));
                            if(EnemyOverLapArr.length > 0){
                                this.planeOverLap(i_child.data.Order,EnemyOverLapArr);
                                // FC_Msg.runNextMsg();
                                return;
                            }
                        }

                        //最后一步是否颜色相同
                        if(i_data.FlyPosArr.length == 1)
                        {
                            if(type != CST.FlyLineType.Line_Start && 
                                type != CST.FlyLineType.Line_Airport && 
                                type != CST.FlyLineType.Line_in &&
                                color == i_data.PlayerType)
                            {
                                if(i_child.data.lapBack){
                                    i_child.data.lapBack = false;
                                    this.PlaneStop(i_child.data.Order);
                                }else{
                                    if(i_child.data.Current_idx != i_child.data.Dest_idx){
                                        //直接飞行
                                        this.planeJump(i_child.data.Order);
                                    }else{
                                        this.PlaneStop(i_child.data.Order);
                                    }
                                }
                            }else{
                                this.PlaneStop(i_child.data.Order);
                            }
                        }else{
                            //继续
                            this.PlaneStop(i_child.data.Order);
                        }
                    }.bind(this))
                )
            );
            break;
        }
        if(!isFly){
            FC_Msg.runNextMsg();
        }
    },

    planeOverLap: function(order,arr){ //前方跌机
        console.log("planeOverLap...",arr.length);
        let cur_obj = this.getChildByTag(this.node_plane,order);
        let lap_obj = this.getChildByTag(this.node_plane,arr[0]);

		if(!cur_obj || !lap_obj) return;
		
        let cur_idx = cur_obj.data.Current_idx;
        console.log("cur_idx: ",cur_idx);
        this.changePlaneDirection(cur_obj.data.Order);
        cur_obj.data.ActiveType = CST.ActiveType.Stand;
        let common_type = this.returnType(cur_obj.data.PlayerType);

        if(cur_obj.data.FlyPosArr.length == 1){ //正好形成撞机
            cur_obj.data.FlyPosArr.length = 0;
            this.BombEffect(cur_obj.position);
            this.unActiveOneSideAllPlane(undefined,cur_idx);
            setTimeout(function(){
                FC_Msg.runNextMsg();
            },1000);
        }else{
            let num = -1;
            if(FC_Msg.gameType == CST.GAMETYPE.pvp){
                num = FC_Msg.cur_count;
            }else{
                num = G_FC.Stock_num;
            }
            if(num == CST.Stock_Lucky_Num){ //形成跌机
                //更改飞机 朝向
                cur_obj.data.FlyPosArr.length = 0;
                //跌机 位置
                let lap_num = arr.length;
                let direction = cur_obj.getComponent("FC_Plane").direction;
                if(direction == CST.PlaneDirection.Up) cur_obj.x += lap_num * 10;
                if(direction == CST.PlaneDirection.Down) cur_obj.x -= lap_num * 10;
                if(direction == CST.PlaneDirection.Right) cur_obj.y -= lap_num * 10;
                if(direction == CST.PlaneDirection.Left) cur_obj.y += lap_num * 10;
                this.checkLuckNum();
                FC_Msg.runNextMsg();
            }else{ //倒退

                if(cur_obj.data.FlyPosArr.length == 1){
                    cur_obj.data.FlyPosArr = [];
                }else{
                    this.removeId0(cur_obj.data.FlyPosArr);
                }
                let left_step = cur_obj.data.FlyPosArr.length;
                cur_obj.data.FlyPosArr.length = 0;
                console.log("-----left_step----",left_step);
                let start_idx = cur_obj.data.Start_idx;
                let dest_idx = cur_obj.data.Dest_idx;
                let max_idx = this.getFlyOutPointNum() - 1;

                //确定后退方向
                let lapDirection = 0;//默认回退 1：反向后退 前进
                let back_idx = -1;
                let k = 0;
                for(let i = 0; i < Number(left_step); i++){
                    let flag_idx = -1;
                    if(lapDirection == 0 && cur_obj.data.lapBack != true){
                        flag_idx = cur_idx - i - 1;
                    }else{
                        flag_idx = back_idx + k + 1;
                        k += 1 * 1;
                    }
                    let pos = {};

                    if(Number(start_idx) > Number(dest_idx)){ 
                        if(flag_idx < 0){
                            flag_idx = this.getFlyOutPointNum()  + flag_idx;
                        }
                        if(Number(cur_idx) >= 0 && Number(cur_idx) <= Number(dest_idx)){
                            let cr = this.getColorByIdx(flag_idx);
                            pos.type = CST.FlyLineType.Line_Out;
                            pos.color = cr;
                            pos.idx = flag_idx;
                        }else{
                            if(Number(flag_idx) < Number(cur_obj.data.Start_idx)){
                                flag_idx = -1;
                                pos.type = CST.FlyLineType.Line_Start;
                                pos.idx = common_type;
                            }else{
                                let cr = this.getColorByIdx(flag_idx);
                                pos.type = CST.FlyLineType.Line_Out;
                                pos.color = cr;
                                pos.idx = flag_idx;
                            }
                        }
                        
                    }else{
                        if(flag_idx < 0){
                            flag_idx = -1;
                            pos.type = CST.FlyLineType.Line_Start;
                            pos.idx = cur_obj.data.PlayerType;
                        }else{
                            let cr = this.getColorByIdx(flag_idx);
                            pos.type = CST.FlyLineType.Line_Out;
                            pos.color = cr;
                            pos.idx = flag_idx;
                        }
                    }
                    cur_obj.data.FlyPosArr.push(pos);
                    console.log("flag_idx: ",flag_idx);
                    //flag_idx 还有跌机  需要反向回退
                    let EnemyOverLapArr = this.getOtherOverLap(flag_idx,cur_obj.data.PlayerType);
                    if(EnemyOverLapArr.length > 0){
                        lapDirection = 1;
                        back_idx = flag_idx;
                        console.log("---back_idx---",back_idx);
                    }

                    //最多只能退回起点
                    // if(pos.type == CST.FlyLineType.Line_Start) break;
                    // (12-14纠正：最多只能到第一个走棋位置)
                    if(pos.idx == cur_obj.data.Start_idx) break;
                }
                cur_obj.data.lapBack = true;//后退判定值
                this.PlantFly(cur_obj.data.Order);
                
            }
        }
    },

    //检测前方跳跃区间 是否有跌机
    checkJumpOverLop: function(type,obj){

        if(type == undefined || !obj) return false;
        let start_idx = obj.data.Start_idx;
        let cur_idx = obj.data.Current_idx;
        let dest_idx = obj.data.Dest_idx;
        let checkArr = [];  
        let max_idx = this.getFlyOutPointNum() - 1;
        //前方三个位置 是否有跌机
        if(type == "0"){
            let num_1 = Number(cur_idx) + 1;
            let num_2 = Number(cur_idx) + 2;
            let num_3 = Number(cur_idx) + 3;
            if(Number(num_1) > max_idx) num_1 = num_1 - max_idx - 1;
            if(Number(num_2) > max_idx) num_2 = num_2 - max_idx - 1;
            if(Number(num_3) > max_idx) num_3 = num_3 - max_idx - 1;
            checkArr.push(num_1);
            checkArr.push(num_2);
            checkArr.push(num_3);
        }
        //如果虚线跳跃  是否一个位置有跌机
        if(type == "1"){
            let num_4 = Number(start_idx) + CST.Polygon_Long + CST.Polygon_Short + (CST.Polygon_Long / 2);
            if(Number(num_4) > max_idx) num_4 = num_4 - max_idx - 1;
            checkArr.push(num_4);
        }

        //起点 位置是否有跌机
        if(type == "2"){
            let num_5 = Number(start_idx);
            if(Number(num_5) > max_idx) num_5 = num_5 - max_idx - 1;
            checkArr.push(num_5);
        }

        if(checkArr.length == 0) return false;
        let isOverLop = false;
        for(let i = 0; i < checkArr.length; i++){
            let i_idx = checkArr[i];
            let collode_arr = this.getPlaneCollide(i_idx,obj.data.PlayerType,obj.data.FlyLineType);
            if(collode_arr.length >= 2){
                isOverLop = true;
                break;
            }
        }
        return isOverLop;
    },

    planeJump: function(order){
        console.log("planeJump...");
        G_FC.Update_Command = CST.Update_Command.Static;
        let obj = this.getChildByTag(this.node_plane,order);
        obj.data.ActiveType = CST.ActiveType.Fly;
        obj.data.FlyPosArr.length = 0;
        obj.stopAllActions();

        let jumpTime = CST.jumpDistime * 1;

        //未跳跃前 第一次 检测撞机
        let collode_arr = this.getPlaneCollide(obj.data.Current_idx,obj.data.PlayerType,obj.data.FlyLineType);
        if(collode_arr.length > 0){
            console.log("collode_arr length",collode_arr.length);
            this.BombEffect(obj.position);
            if(collode_arr.length == 1){
                this.unActivePlane(collode_arr[0]); //被撞方返回
            }else{
                this.unActiveOneSideAllPlane(undefined,obj.data.Current_idx); //跌机情况 全部返回
                setTimeout(function(){
                    FC_Msg.runNextMsg();
                }.bind(this),1000);
                return;
            }
        }

        //获取跳跃点  判定是否是虚线区域
        
        let start_idx = obj.data.Start_idx;
        let cur_idx = obj.data.Current_idx;
        let dest_idx = obj.data.Dest_idx;
        console.log("-------planeJump----",cur_idx);
        let jump_idx ;
        let vir_idx ;

        if(Number(start_idx) < Number(dest_idx)){
            jump_idx = Number(cur_idx) + (CST.Polygon_Long / 2);
            vir_idx = Number(start_idx) + CST.Polygon_Long + CST.Polygon_Short + (CST.Polygon_Long / 2);
        }else{
            jump_idx = Number(cur_idx) + (CST.Polygon_Long / 2);
            vir_idx = Number(start_idx) + CST.Polygon_Long + CST.Polygon_Short + (CST.Polygon_Long / 2);
        }

        let max_idx = this.getFlyOutPointNum() - 1;
    
        if(Number(jump_idx) > Number(max_idx)){  //越界处理
            jump_idx = jump_idx - max_idx - 1 ;
        }

        if(Number(vir_idx) > Number(max_idx)){  //虚线越界处理
            vir_idx = vir_idx - max_idx - 1;
        }

        let that = this;
        if(cur_idx == vir_idx){ // 第一步虚线跳跃 两次
            that.changePlaneDirection(obj.data.Order,true);
            // jump_idx
            jump_idx = Number(cur_idx) + CST.Polygon_Short + CST.Polygon_Long  - 1;
            if(Number(jump_idx) > Number(max_idx)){
                jump_idx = jump_idx - max_idx - 1;
            }
            let jump_pos = this.Fly_Out_Pos_Arr[jump_idx];

            let dest_idx = Number(jump_idx) + (CST.Polygon_Long / 2);
            if(Number(dest_idx) > Number(max_idx)){
                dest_idx = dest_idx - max_idx - 1;
            }
            // dest_idx
            let dest_pos = this.Fly_Out_Pos_Arr[dest_idx];
            function continuego(){
                obj.stopAllActions();
                setTimeout(function(){
                    obj.runAction(cc.sequence(
                        cc.delayTime(jumpTime),
                        cc.moveTo(jumpTime,dest_pos),
                        cc.callFunc(function(){
                            obj.data.Current_idx = dest_idx;
                            let arr_2 = that.getPlaneCollide(dest_idx,obj.data.PlayerType,obj.data.FlyLineType);
                            //终点检测
                            if(arr_2.length > 0){
                                console.log("arr_2 length",arr_2.length);
                                that.BombEffect(obj.position);
                                if(arr_2.length == 1){//检测 跳跃点撞机
                                    that.unActivePlane(arr_2[0]);
                                    that.PlaneStop(obj.data.Order);
                                }else{//检测跳跃点 跌机
                                    that.unActiveOneSideAllPlane(undefined,dest_idx);
                                    setTimeout(function(){
                                        FC_Msg.runNextMsg();
                                    }.bind(this),1000);
                                    return;
                                }
                            }else{
                                that.PlaneStop(obj.data.Order);
                            }
                        })
                    ));
                },0);
            };



            obj.runAction(cc.sequence(
                cc.delayTime(jumpTime),
                cc.moveTo(jumpTime,jump_pos),
                cc.callFunc(function(){
                    obj.data.Current_idx = jump_idx;
                    
                    //获取虚线 跳跃内行线 撞机点
                    let vir_idx = that.getVirCollideIdx(obj.data.PlayerType);
                    let arr_3 = that.getPlaneCollide(vir_idx,obj.data.PlayerType,CST.FlyLineType.Line_in);
                    //内行线 检测
                    if(arr_3.length > 0){
                        console.log("arr_3 length",arr_3.length);
                        that.BombEffect(obj.position);
                        if(arr_3.length == 1){//撞机
                            that.unActivePlane(arr_3[0]);
                        }else{// 跌机
                            that.unActivePlane(obj.data.Order);
                            that.unActiveOneSideAllPlane(undefined,vir_idx);
                            setTimeout(function(){
                                FC_Msg.runNextMsg();
                            }.bind(this),1000);
                            return;
                        }
                    }

                    let arr_1 = that.getPlaneCollide(jump_idx,obj.data.PlayerType,obj.data.FlyLineType);
                    if(arr_1.length > 0){
                        console.log("arr_1 length",arr_1.length);
                        that.BombEffect(obj.position);
                        if(arr_1.length == 1){//检测 跳跃点撞机
                            that.unActivePlane(arr_1[0]);
                            //如果前方3个位置跌机 不能跳跃
                            if(that.checkJumpOverLop("0",obj)){
                                obj.data.FlyPosArr.length = 0;
                                that.PlaneStop(obj.data.Order);
                                FC_Msg.runNextMsg();
                                return;
                            }
                            continuego();
                        }else{//检测跳跃点 跌机
                            that.unActiveOneSideAllPlane(undefined,jump_idx);
                            setTimeout(function(){
                                FC_Msg.runNextMsg();
                            }.bind(this),1000);
                        }
                    }else{
                        //如果前方3个位置跌机 不能跳跃
                        if(that.checkJumpOverLop("0",obj)){
                            obj.data.FlyPosArr.length = 0;
                            that.PlaneStop(obj.data.Order);
                            FC_Msg.runNextMsg();
                            return;
                        }
                        continuego();
                    }
                })
            ));
        }else{
            if(jump_idx == vir_idx){ //间接虚线跳跃 两次
                that.changePlaneDirection(obj.data.Order,true);
                // jump_idx
                let jump_pos = this.Fly_Out_Pos_Arr[jump_idx];
                let dest_idx = Number(jump_idx) + CST.Polygon_Short + CST.Polygon_Long  - 1 ;//当前位置到虚线
                if(Number(dest_idx) > Number(max_idx)){
                    dest_idx = dest_idx - max_idx - 1;
                }
                // dest_idx
                let dest_pos = this.Fly_Out_Pos_Arr[dest_idx];
                function continuego_1(){
                    obj.stopAllActions();
                    setTimeout(function(){
                        if(!cc.isValid(obj)) return;
                        obj.runAction(cc.sequence(
                            cc.delayTime(jumpTime),
                            cc.moveTo(jumpTime,dest_pos),
                            cc.callFunc(function(){
                                obj.data.Current_idx = dest_idx;
                                
                                //获取虚线 跳跃内行线 撞机点
                                let vir_idx = that.getVirCollideIdx(obj.data.PlayerType);
                                let arr_3 = that.getPlaneCollide(vir_idx,obj.data.PlayerType,CST.FlyLineType.Line_in);
                                //内行线 检测
                                if(arr_3.length > 0){
                                    that.BombEffect(obj.position);
                                    if(arr_3.length == 1){//撞机
                                        that.unActivePlane(arr_3[0]);
                                    }else{// 跌机
                                        that.unActivePlane(obj.data.Order);
                                        that.unActiveOneSideAllPlane(undefined,vir_idx);

                                        setTimeout(function(){
                                            FC_Msg.runNextMsg();
                                        }.bind(this),1000);
                                        return;
                                    }
                                }
                                //终点检测
                                let arr_2 = that.getPlaneCollide(dest_idx,obj.data.PlayerType,obj.data.FlyLineType);
                                if(arr_2.length > 0){
                                    that.BombEffect(obj.position);
                                    if(arr_2.length == 1){//检测 跳跃点撞机
                                        that.unActivePlane(arr_2[0]);
                                        that.PlaneStop(obj.data.Order);
                                    }else{//检测跳跃点 跌机
                                        that.unActiveOneSideAllPlane(undefined,dest_idx);

                                        setTimeout(function(){
                                            FC_Msg.runNextMsg();
                                        }.bind(this),1000);
                                        return;
                                    }
                                }else{
                                    that.PlaneStop(obj.data.Order);
                                }
                            })
                        ));
                            
                
                    },0);
                    
                };

                //如果前方3个位置跌机 不能跳跃
                if(that.checkJumpOverLop("0",obj)){
                    obj.data.FlyPosArr.length = 0;
                    that.PlaneStop(obj.data.Order);
                    FC_Msg.runNextMsg();
                    return;
                }
                obj.runAction(cc.sequence(
                    cc.delayTime(jumpTime),
                    cc.moveTo(jumpTime,jump_pos),
                    cc.callFunc(function(){
                        obj.data.Current_idx = jump_idx;
                        let arr_1 = that.getPlaneCollide(jump_idx,obj.data.PlayerType,obj.data.FlyLineType);
                        if(arr_1.length > 0){
                            that.BombEffect(obj.position);
                            if(arr_1.length == 1){//检测 跳跃点撞机
                                that.unActivePlane(arr_1[0]);
                                continuego_1();
                            }else{//检测跳跃点 跌机
                                that.unActiveOneSideAllPlane(undefined,jump_idx);
                                setTimeout(function(){
                                    FC_Msg.runNextMsg();
                                }.bind(this),1000);
                            }
                        }else{
                            continuego_1();
                        }
                    })
                ));

            }else{ //跳跃一次
                // jump_idx
                that.changePlaneDirection(obj.data.Order);

                //如果前方3个位置跌机 不能跳跃
                if(this.checkJumpOverLop("0",obj)){
                    obj.data.FlyPosArr.length = 0;
                    that.PlaneStop(obj.data.Order);
                    FC_Msg.runNextMsg();
                    return;
                }

                let jump_pos = this.Fly_Out_Pos_Arr[jump_idx];
                obj.runAction(cc.sequence(
                    cc.moveTo(jumpTime,jump_pos),
                    cc.callFunc(function(){
                        obj.data.Current_idx = jump_idx;
                        that.PlaneStop(obj.data.Order);
                    })
                ));
            }
        }
    },

    getVirCollideIdx: function(type){
        let common_type = this.returnType(type);
        let arr = [];
        for(let i = 0; i < 2; i++){
            for(let k = 0; k < Number(CST.Player_Max_Num); k++){
                arr.push(k);
            }
        }
        let flag_idx = -1;
        for(let m = 0; m < arr.length / 2; m++){
            if(common_type == arr[m]) flag_idx = arr[m + 2];
        }
        if(flag_idx != -1){
            flag_idx = (flag_idx % CST.Player_Max_Num) * CST.Line_Num + Number(CST.Line_Num / 2) - 1;
        }
        return flag_idx;
    },

    PlaneStop: function(order){
        // console.log("----planeStop---",order);
        let obj = this.getChildByTag(this.node_plane,order);
        //更改飞机 朝向
        this.changePlaneDirection(order);
        obj.data.ActiveType = CST.ActiveType.Stand;
        // obj.stopAllActions();
        if(obj.data.FlyPosArr.length == 1){
            obj.data.FlyPosArr = [];
        }else{
            this.removeId0(obj.data.FlyPosArr);
        }
        if(obj.data.FlyPosArr.length == 0)
        {
            //关掉  回退状态
            obj.data.lapBack = false;

            //是否到达终点
            if(obj.data.FlyLineType == CST.FlyLineType.Line_in){
                if(this.checkFinishedFly(order)){
                    this.backPlane(order);
                    //留下0.6s返航时间
                    setTimeout(function(){
                        FC_Msg.runNextMsg();
                    },600);
                    return;
                }
            }
            
             //友方跌机检测
             this.dropMachine(obj);
             
            //终点撞机检测
            if(obj.data.FlyLineType == CST.FlyLineType.Line_Out && obj.data.Current_idx != -1){
                let collode_arr = this.getPlaneCollide(obj.data.Current_idx,obj.data.PlayerType,obj.data.FlyLineType);
                // console.log("---collode_arr-----",collode_arr);
                if(collode_arr.length > 0){
                    this.BombEffect(obj.position);
                    //10-29  撞击后 随机出现 去撞的飞机 未返回
                    if(collode_arr.length == 1){
                        this.unActivePlane(collode_arr[0]); //被撞方返回
                    }else{
                        this.unActiveOneSideAllPlane(undefined,obj.data.Current_idx); //跌机情况 全部返回
                    }

                    if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                        this.checkLuckNum();
                    }else{
                        this.sendFinish();
                        //确保当前color和棋子color一样(mark: 上个没走完，下个已经开始)
                        if(obj.data.PlayerType == FC_Msg.cur_color){
                            //确保飞机 走完再停止action
                            this.stopPlaneInter = setTimeout(function(){
                                this.stopAllPlaneAction(obj.data.PlayerType);
                                clearTimeout(this.stopPlaneInter);
                                FC_Msg.runNextMsg();
                            }.bind(this),1000);
                        }
                    }
                    return;
                }
            }
            if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
                this.checkLuckNum();
            }else{
                //确保当前color和棋子color一样
                if(obj.data.PlayerType == FC_Msg.cur_color){
                    // this.stopAllPlaneAction(obj.data.PlayerType);
                    this.sendFinish();
                    this.stopPlaneInter = setTimeout(function(){
                        this.stopAllPlaneAction(obj.data.PlayerType);
                        clearTimeout(this.stopPlaneInter);
                        FC_Msg.runNextMsg();
                    }.bind(this),600);
                }
            }

            
        }else{
            this.PlantFly(obj.data.Order);
        }
    },

    dropMachine: function(obj){
        if(!obj) return;
        if(obj.data.FlyLineType != CST.FlyLineType.Line_Airport){
            let childs = this.node_plane.getChildren();
            let isFriendLap = false;
            let lap_num = 0;
            for(let k in childs){
                let k_child = childs[k];
                if(k_child.data.PlayerType != obj.data.PlayerType) continue;
                if(obj.data.Order == k_child.data.Order) continue;
                if(k_child.data.FlyLineType == CST.FlyLineType.Line_Airport) continue;
                if(k_child.data.FlyLineType != obj.data.FlyLineType) continue;
                if(k_child.data.Current_idx == obj.data.Current_idx){
                    k_child.data.OverLap = 1;
                    k_child.zIndex = lap_num * 10;
                    isFriendLap = true;
                    lap_num += 1 * 1;
                }
                // if(k_child.data.FlyLineType == CST.FlyLineType.Line_Start) continue;
            }
            if(isFriendLap){
                obj.data.OverLap = 1;
                //跌机位置调整 结合数量和方向
                obj.zIndex = lap_num * 10;
                let direction = obj.getComponent("FC_Plane").direction;
                if(direction == CST.PlaneDirection.Up) obj.x += lap_num * 10;
                if(direction == CST.PlaneDirection.Down) obj.x -= lap_num * 10;
                if(direction == CST.PlaneDirection.Right) obj.y -= lap_num * 10;
                if(direction == CST.PlaneDirection.Left) obj.y += lap_num * 10;
             }else{
                obj.data.OverLap = 0;
             }
         }
    },

    cancelOverLap: function(order){
        let obj = this.getChildByTag(this.node_plane,order);
        if(!obj || !obj.data) return;

        let common_order = this.returnType(obj.data.PlayerType);

        //如果是跌机状态
        if(obj.data.OverLap == 1){
            let overlap_arr = this.getOverLap(common_order,obj.data.Current_idx,obj.data.FlyLineType);
            obj.data.OverLap = 0;
            obj.zIndex = 0;
            if(overlap_arr.length == 2){
                //取消跌机状态
                let flag_order = -1;
                if(obj.data.Order == overlap_arr[0]) flag_order = overlap_arr[1];
                if(obj.data.Order == overlap_arr[1]) flag_order = overlap_arr[0];
                let obj_2 = this.getChildByTag(this.node_plane,flag_order);
                if(obj_2) obj_2.data.OverLap = 0;
            }
            //自动调整 跌机位置
            if(overlap_arr.length > 1){
                let lap_num = 0;
                let flag_idx = obj.data.Current_idx;
                let dir = obj.getComponent("FC_Plane").direction;
                let normal_pos;
                if(obj.data.FlyLineType == CST.FlyLineType.Line_Start){
                    normal_pos = this.Fly_Start_pos[common_order * 1];
                }else if(obj.data.FlyLineType == CST.FlyLineType.Line_Out){
                    normal_pos = this.Fly_Out_Pos_Arr[flag_idx * 1];
                }else if(obj.data.FlyLineType == CST.FlyLineType.Line_in){
                    normal_pos = this.Fly_In_Pos_Arr[flag_idx * 1];
                }else{
                }
                if(normal_pos == undefined) return;

                
                for(let i in overlap_arr){
                    if(order == overlap_arr[i]) continue;
                    let i_lapNode = this.getChildByTag(this.node_plane,overlap_arr[i]);
                    i_lapNode.zIndex = lap_num * 10;
                    if(dir == CST.PlaneDirection.Up){
                        i_lapNode.x = Number(normal_pos.x) + (lap_num * 10);
                    }else if(dir == CST.PlaneDirection.Down){
                        i_lapNode.x = Number(normal_pos.x) - (lap_num * 10);
                    }else if(dir == CST.PlaneDirection.Right){
                        i_lapNode.y = Number(normal_pos.y) - (lap_num * 10);
                    }else{
                        i_lapNode.y = Number(normal_pos.y) + (lap_num * 10);
                    }
                    lap_num += 1 * 1;
                }
            }

        }
        
    },

    getOverLap: function(order,idx,lineType){
        let childs = this.node_plane.getChildren();
        let lap_arr = [];lap_arr.length = 0;
        for (let i in childs) {
            let i_child = childs[i];
            if(i_child.data.OverLap != 1) continue;
            if(i_child.data.FlyLineType != lineType) continue;
            let common_type = this.returnType(i_child.data.PlayerType);
            if(common_type != order) continue;
            if (i_child.data.Current_idx == idx) {
                lap_arr.push(i_child.data.Order);
            }
        }
        return lap_arr;
    },
    getOtherOverLap: function(idx,type){
        let childs = this.node_plane.getChildren();
        let lap_arr = [];
        for (let i in childs) {
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            if(i_child.data.FlyLineType != CST.FlyLineType.Line_Out) continue;
            if(i_child.data.PlayerType == type) continue;
            if(i_child.data.Current_idx == -1) continue;
            if(i_child.data.ActiveType == CST.ActiveType.unActive || i_child.data.ActiveType == CST.ActiveType.Back) continue;
            if(i_child.data.OverLap != 1) continue;
            if (i_child.data.Current_idx == idx) {
                lap_arr.push(i_child.data.Order);
            }
        }
        return lap_arr;
    },

    getPlaneCollide: function(idx,type,flyLine){ //检测撞机
        let childs = this.node_plane.getChildren();
        let order_arr = [];
        for(let i in childs){
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            if(i_child.data.Current_idx == -1) continue;
            if(i_child.data.ActiveType != CST.ActiveType.Stand) continue;
            if(i_child.data.Current_idx != idx) continue;
            if(i_child.data.PlayerType == type) continue;
            if(i_child.data.FlyLineType == flyLine) {
                order_arr.push(i_child.data.Order);
            }
        }
       return order_arr;
    },

    BombEffect: function(pos){
        console.log("BombEffect add");
        let effect = cc.instantiate(this.bombPrefab);
        if(effect) {
            this.node_bomb.addChild(effect,200);
            effect.position = pos;
            effect.getComponent(cc.Animation).play("bombClip");
        }
    },

    checkLuckNum: function(){ //幸运数字 监测
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            if(G_FC.Stock_num != CST.Stock_Lucky_Num){ //如果不是幸运数字
                this.setNextOrder();//修改 order
                this.changeCommand(CST.Update_Command.Start,4);
            }else{
                this.changeCommand(CST.Update_Command.Start,7);
            }
        }
    },

    checkFinishedFly: function(order){
        let obj = this.getChildByTag(this.node_plane,order);
        if(this.isNull(obj)) return;
        let common_type = this.returnType(obj.data.PlayerType);
        let idx = obj.data.Current_idx;
        let type = obj.data.FlyLineType;
        let flag = common_type * CST.Line_Num + (CST.Line_Num - 1);
        if(type == CST.FlyLineType.Line_in){
            if(flag == idx){
                return true;
            }
        }
        return false;
    },

    resetGlobal: function(){ //重置gloal数据
        G_FC.PlayerNum = 0;
        G_FC.FlyDirection = 0;
        G_FC.OpenIdxArr = [];
        this.Fly_Ori_Pos_Arr = [];
        this.Fly_Start_pos = [];
        this.Fly_Out_Pos_Arr = [];
        this.Fly_In_Pos_Arr = [];
        G_FC.Stock_num = 1;
        G_FC.StockOrder = 0;
        G_FC.PlaneDataArr = [];
        G_FC.Plane_Active_Type = 0;
        G_FC.Command_Tip_Id = 0;
        G_FC.Update_Command = CST.Update_Command.Static;
        G_FC.Static_Time = CST.Static_Time;
    },
    isNull: function(obj){
        if(obj == undefined || obj == null) return true;
        return false;
    },
    removeId0: function(arr){
        if(arr.length == 0) return;
        if(arr.length == 1){
            arr.length = 0;
            return;
        }
        for(let i = 0,k = 0; i < arr.length; i++){
            if(i < arr.length - 1)
            {
                arr[i] = arr[i + 1];
            }
        }
        arr.length -= 1;
    },
    isCommandChanged: false,
    changeCommand: function(cmd,id){
        // console.log("----changeCommand----",cmd);
        this.isCommandChanged = true;
        G_FC.Update_Command = cmd;
        if(id != undefined)
        {
            G_FC.Command_Tip_Id = id;
        }
        //刷新时间调增
        if(cmd == CST.Update_Command.Ready)
        {
            G_FC.Static_Time = Number(CST.Static_Time);
        }else{
            G_FC.Static_Time = CST.Static_Time;
        }
    },
    checkGameRecord: function(){
        let str_record = cc.sys.localStorage.getItem("Record");
        if(!str_record) return false;
        let record = JSON.parse(str_record);
        if(!record) return false;
        if(record.isInGame) return true;
        return false;
    },

    checkGameState: function(){
        //检测是否 有游戏记录
        if(this.checkGameRecord()){
            cc.director.loadScene("FC_Game");
        }
    },

    removeGameState: function(){
        cc.sys.localStorage.removeItem("Record");
    },

    updateGameState: function(){
        let record = {};   
        record.Plane_Active_Type = G_FC.Plane_Active_Type;
        record.StockOrder = G_FC.StockOrder;
        record.Stock_num = G_FC.Stock_num;
        if(G_FC.OpenIdxArr) record.OpenIdxArr = G_FC.OpenIdxArr.concat();
        if(this.FinishNumArr) record.FinishNumArr = this.FinishNumArr.concat();
        if(this.completeArr) record.completeArr = this.completeArr.concat();
        //planeState
        record.planeState = {};
        let childs = this.node_plane.getChildren();
        for(let i in childs){
            let i_child = childs[i];
            if(!i_child) continue;
            if(!i_child.data) continue;
            record.planeState[i_child.data.Order] = {};
            record.planeState[i_child.data.Order].ActiveType = i_child.data.ActiveType;
            record.planeState[i_child.data.Order].Current_idx = i_child.data.Current_idx;
            record.planeState[i_child.data.Order].FlyLineType = i_child.data.FlyLineType;
            record.planeState[i_child.data.Order].OverLap = i_child.data.OverLap;
        }
        record.isInGame = true;
        cc.sys.localStorage.setItem("Record",JSON.stringify(record));
    },

    resetGameState: function(){ //重置游戏数据
        let str_record = cc.sys.localStorage.getItem("Record");
        let record = JSON.parse(str_record);
        if(!record.isInGame) return;
    
        console.log("-----record.StockOrder---",record.StockOrder);
        if(record.Plane_Active_Type) G_FC.Plane_Active_Type = record.Plane_Active_Type;
        if(record.StockOrder) G_FC.StockOrder = record.StockOrder;
        if(record.Stock_num) G_FC.Stock_num = record.Stock_num;
        if(record.OpenIdxArr) G_FC.OpenIdxArr = record.OpenIdxArr.concat();
        
    },
    resetFinshNum: function(){
        let str_record = cc.sys.localStorage.getItem("Record");
        let record = JSON.parse(str_record);
        if(record.FinishNumArr) this.FinishNumArr = record.FinishNumArr.concat();
        if(record.completeArr) this.completeArr = record.completeArr.concat();
    },
    resetPlaneState: function(){ //重置飞机数据
        let str_record = cc.sys.localStorage.getItem("Record");
        let record = JSON.parse(str_record);
        console.log("----resetPlaneState---",record);
        //planeState
        // Order ActiveType  Current_idx OverLap
        if(!record.planeState) return;
        let childs = this.node_plane.getChildren();

        let OverLapData = [];

        for(let key in childs){
            let key_child = childs[key];
            if(!key_child) continue;
            if(!key_child.data) continue;
            let key_state = record.planeState[key_child.data.Order];
            if(!key_state) continue;
            if(key_state.ActiveType) key_child.data.ActiveType = key_state.ActiveType;
            key_child.data.Current_idx = key_state.Current_idx;
            key_child.data.FlyLineType = key_state.FlyLineType;
            key_child.data.OverLap = key_state.OverLap;

           
            let common_type = this.returnType(key_child.data.PlayerType);
            //设置plane位置
            if(key_child.data.ActiveType == CST.ActiveType.unActive || key_child.data.ActiveType == CST.ActiveType.Back){
                let pos = this.Fly_Ori_Pos_Arr[key_child.data.Ori_idx];
                key_child.position = pos;
                //icon更新
                if(key_child.data.ActiveType == CST.ActiveType.Back){
                    key_child.getComponent("FC_Plane").icon = 4;
                }
            }else{
                if(key_child.data.FlyLineType == CST.FlyLineType.Line_Start){
                    let pos = this.Fly_Start_pos[common_type];
                    key_child.position = pos;
                }else if(key_child.data.FlyLineType == CST.FlyLineType.Line_Out){
                    let pos = this.Fly_Out_Pos_Arr[key_child.data.Current_idx];
                    key_child.position = pos;
                }else if(key_child.data.FlyLineType == CST.FlyLineType.Line_in){
                    let pos = this.Fly_In_Pos_Arr[key_child.data.Current_idx];
                    key_child.position = pos;
                }else{
                    let pos = this.Fly_Ori_Pos_Arr[key_child.data.Ori_idx];
                    key_child.position = pos;
                }
            }

             //跌机位置调整
             if(key_child.data.OverLap == 1){
                 let data = {};
                 data.direction = key_child.getComponent("FC_Plane").direction;
                 data.Current_idx = key_child.data.Current_idx;
                 data.FlyLineType = key_child.data.FlyLineType;
                 data.PlayerType = key_child.data.PlayerType;
                 if(OverLapData.length == 0){
                     OverLapData.push(data);
                 }else{
                     //检测是否 是跌机队友
                     let OverLap_num = 0;
                     for(let i in OverLapData){
                         let i_data = OverLapData[i];
                         if(data.FlyLineType == CST.FlyLineType.Line_Airport) continue;
                         if(i_data.Current_idx != data.Current_idx) continue;
                         if(i_data.FlyLineType != data.FlyLineType) continue;
                         if(i_data.PlayerType != data.PlayerType) continue;
                         OverLap_num += 1 * 1;
                     }
                     if(Number(OverLap_num) > 0){
                         if(data.direction == CST.PlaneDirection.Up) key_child.x += OverLap_num * 10;
                         if(data.direction == CST.PlaneDirection.Down) key_child.x -= OverLap_num * 10;
                         if(data.direction == CST.PlaneDirection.Right) key_child.y -= OverLap_num * 10;
                         if(data.direction == CST.PlaneDirection.Left) key_child.y += OverLap_num * 10;
                     }
                     OverLapData.push(data);
                 }
             }

        }
    },
    transformSeat: function(seat){
        let seatArr = [0,1,2,3,0,1,2,3];
        //根据自己的seat定
        
    },
    //处理名字过长
    transformName: function(limitLen,_string){
        console.log("transformName...",_string);
        //limitLen 英文字符 限制长度
        if(!_string) return;
        let len = 0;
        let str = "";
        if(_string.length == 0) return str;
        for(var i=0; i < _string.length; i++){
            var character = _string.substr(i,1);
            var temp = character.charCodeAt();
            if(0 <= temp && temp <= 47){ //和字母大小差不多的字符
                len += 1 * 1;
            }else if (48 <= temp && temp <= 57){ //数字
                len += 1 * 1;
            }else if(58 <= temp && temp <= 64){ //和字母大小差不多的字符
                len += 1 * 1;
            }else if(65 <= temp && temp <= 122){ //字母
                len += 1 * 1;
            }else if(19968 <= temp && temp <= 40869){ //中文
                len += 1 * 2;
            }else{
                len += 1 * 1;
            }
            str += character;
            if(Number(len) >= Number(limitLen)){
                str += "...";
                break;
            }
        }
        console.log("str.....: ",str);
        return str;
    },
    getSeatByColor: function(color){
        if(color == undefined) return -1;
        if(FC_Msg.playerColor){
            for(let i = 0; i < FC_Msg.playerColor.length; i++){
                if(FC_Msg.playerColor[i] == color){
                    return i;
                }
            }
        }
    },
    getIdxBySeat: function(seat){
        //根据player_idx  deskSeatID
        if(seat == undefined) return -1;
        let arr = [0,1,2,3,0,1,2,3];
        // console.log("user seat: ",FC_Msg.playerInfo["deskSeatID"]);
        if(FC_Msg.playerInfo){
            if(FC_Msg.playerInfo["deskSeatID"] == undefined) return 0;
            let newArr = [];
            let isget = false;
            for(let i = 0; i < arr.length; i++){
                if(newArr.length >= 4) break;
                if(FC_Msg.playerInfo["deskSeatID"] == arr[i]){
                    newArr.push(arr[i]);
                    isget = true;
                }else{
                    if(!isget) continue;
                    newArr.push(arr[i]);
                }
            }
            // console.log("newArr...",newArr);
            if(newArr.length > 0){
                for(let k = 0; k < newArr.length; k++){
                    if(newArr[k] == seat){
                        return k;
                    }
                }
            }

        }else{
            return 0;
        }
        return -1;
    },

    checkElementInArr: function(element,arr){
        if(element == undefined || arr == undefined) return false;
        if(arr.length == 0) return false;
        for(let i = 0; i < arr.length; i++){
            if(element == arr[i]){
                return true;
            }
        }
        return false;
    },

    getChildByTag: function(node,tag){
        if(!node || tag == undefined) return null;
        let childs = node.getChildren();
        for(let i in childs){
            if(childs[i].tag1 == tag) return childs[i];
        }
        return null;
    },

    addAuthorBtnBool: function(){
        this.isAuthorBool = true;
    },
    removeAuthorBtnBool: function(){
        this.isAuthorBool = true;
    },
    initBtnTouch: function(keys,funcs,target,isBool){
        if(!target) return;
        if(!keys || keys.length == 0) return;
        if(!funcs || funcs.length == 0) return;      
        for(let i = 0; i < keys.length; i++){
            let _key = keys[i];
            let _func = funcs[i];
            if(!target[_key]) continue;
            if(!target[_func]) continue;
            if(isBool){
                if(!target[_key].hasEventListener(cc.Node.EventType.TOUCH_END)) target[_key].on(cc.Node.EventType.TOUCH_END,target[_func].bind(target));
            }else{
                target[_key].targetOff(target[_key]);
            }
        }
    },

    showBanner: function(){
        AdsFunc.showBanner();
    },

    hideBanner: function(){
        AdsFunc.hideBanner();
    },

    removeBanner: function(){
        AdsFunc.removeBanner();
    },

    createBanner: function(node,obj){
        AdsFunc.initBannerNode(node);
        if(!this.canShowBanner(node)) return;
        AdsFunc.createBanner({
            model: obj
        });
    },

    hideGameClubButton: function(){
        // if(window.GameConfig.platform != 1) return;
        WXGameClub.hideGameClubButton();
    },
    showGameClubButton: function(){
        // if(window.GameConfig.platform != 1) return;
        // if(CCGlobal.apiVer > '2.0.2'){
        //     WXGameClub.showGameClubButton();
        // }
        WXGameClub.showGameClubButton();
    },
    canShowBanner(adNode){
        if(adNode == null) return true;

        let size = cc.view.getFrameSize();
        let y = adNode.getPosition().y;
        let realHeight = size.height * cc.view.getDesignResolutionSize().width / size.width;
        let h = realHeight / 2 + y;
        let adH = cc.view.getDesignResolutionSize().width / size.width * 104;
        console.log('h: ', h, 'adH: ', adH);
        if(h < adH){
            return false;
        }else{
            return true;
        }
    }
}

module.exports = CF;
