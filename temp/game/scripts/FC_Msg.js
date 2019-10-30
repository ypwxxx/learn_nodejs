const CCGlobal = require('CCGlobal')
const DBTClient = require("CCDBTClient");
const DBTMsgDecoder = require("CCDBTMsgDecoder");
const MsgTypeDefine = require("FC_MsgTypeDefine");  //消息映射定义文件，每个游戏都不同
let FC_CST = require("FC_Constant");
let FC_UtilFunc = require("FC_UtilFunc");
let FC_MSG = {
    connHandle: null,
    isWxLogin: false,
    isConnecting: false,
    state: -1,
    gameType: -1,
    gameId : 11,
    roomId: 110,
    openId: "",
    headUrl: "",
    user_name: "",
    userInfo: {},
    roomInfo: [],

    playerInfo: {},
    allPlayerInfos: {},
    playerColor: [],
    timeOutTimes: [],
    reConnectData: null,
    cur_color: -1,
    cur_count: -1,
    isReplayGame: false,
    isResetMap: false,
    isMatching: false,
    isAuthor: false,
    isBrokenLineReConnect: false,//是否是断线后的 重连
    msgArr: [],

    conn: function(){
		// var aUrl = "wss://192.168.10.88:7221";
		var aUrl = "wss://flyingchess.wss.gamett.net:7221";

		var decoder = DBTMsgDecoder.getDecoder(MsgTypeDefine); //解码器
		var conn_handle = DBTClient.connect(aUrl.toString(), decoder);   //发起连接
		this.connHandle = conn_handle;
		let that = this;
		
		if(this.gameType != -1 && this.gameType) {
			FC_UtilFunc.showLoading(4,15);
		}
		
		conn_handle.onOpen(function () {
			console.log("打开连接成功");
			this.isConnecting = true;
			this.open();
			FC_UtilFunc.hideLoading();
			this.login();//登陆

			//重连 授权问题
			// let scene = cc.director.getScene();
			// if(scene.name == "FC_Menu"){
			//   let parent = cc.find("FC_Menu");
			//   if(parent){
			//     parent.getComponent("FC_Menu").destroyAuthor();
			//   }
			// }

		}.bind(this))
		conn_handle.setReconnectOptions(function(){
				//人人状态 不走loading
				if(this.gameType == FC_CST.GAMETYPE.personToperson) return;
				// FC_UtilFunc.hideLoading();
			},0,function(){
				if(this.gameType == FC_CST.GAMETYPE.personToperson) return;
				console.log("1111");
				// FC_UtilFunc.hideLoading();
				let scene = cc.director.getScene();
				if(scene.name == "FC_Game"){
				cc.director.preloadScene("FC_Menu",function(){
					setTimeout(function(){
						cc.director.loadScene("FC_Menu");
					},50);
				});
			}

		}.bind(this));
		conn_handle.onClose(function () {
			console.log("关闭连接成功");
			that.isConnecting = false;
			that.cur_color = -1;
			that.isBrokenLineReConnect = true;
			console.log("this.gameType... ",this.gameType);

			//断网删除消息队列
			that.clearMsg();
			//断网关闭 授权
			let scene = cc.director.getScene();
			if(scene.name == "FC_Menu"){
			let parent = cc.find("FC_Menu");
			if(parent){
				parent.getComponent("FC_Menu").destroyAuthor();
			}
			}
			if(that.gameType == -1) return;
			if(that.gameType == FC_CST.GAMETYPE.personToperson) return;
			FC_UtilFunc.showLoading(4,14);
		}.bind(this));
		conn_handle.onMessage(function (msg) {
			console.log("收到消息",msg.cmdType);
			console.log(msg);
			that.getMessage(msg);
		}.bind(this))
    },

    open: function(){
		if(typeof this["online_open"] != "function") return;
		this["online_open"]();
    },
    close: function(){
		if(typeof this["online_close"] != "function") return;
		this["online_close"]();
    },

    login: function(){
		let message = {};
		message.cmdType = '0xb010';
		let data = {};
		data.gameID = this.gameId;
		data.logon_type = 2; //平台
		data.register_type = 1; //注册类型
		data.client_type = "A";
		data.hard_id = this.openId; //openid设备id
		data.user_name = "mp_" + this.openId; //玩家名
		data.app_version = "6.6.3";
		data.app_name = "FightChess";
		data.isBreadDev = 0;
		message.data = data;
		this.send(message);
    },

    send: function(obj){
		if(!obj) return;
		if(!this.isConnecting){
			console.log("isConnecting false");
			return;
		}
		console.log("-----send------",obj);
		this.connHandle.send(obj);
    },
    getMessage: function(msg){
		// LWC_UtilFunc.hideLoading();
		if(!msg) return;
		this.addMsg(msg);
		if(!msg.cmdType) return;

		if(this.msgArr.length == 1){
			this["" + msg.cmdType](msg);
		}
    },
    addMsg: function(msg){
		if(typeof this["" + msg.cmdType] != "function") return;
		this.msgArr.push(msg);
		// console.log("addMsg: ",JSON.stringify(this.msgArr));
		console.log("length: ",this.msgArr.length);
    },

    popMsg: function(){
		console.log("popMsg",this.msgArr.length);
		if(this.msgArr.length == 0) return null;
		// console.log("popMsg data: ",this.msgArr[0]);
		return this.msgArr[0];
    },

    shiftMsg: function(){
		console.log("shiftMsg");
		if(this.msgArr.length >= 1){
			let newArr = [];
			for(let i = 0; i < this.msgArr.length; i++){
			if(i == 0) continue;
			newArr.push(this.msgArr[i]);
			}
			this.msgArr = [];
			this.msgArr = newArr;
		}
    },

    runNextMsg: function(){
		console.log("runNextMsg");
		this.shiftMsg();
		let msg = this.popMsg();
		console.log("next msg: ",msg);
		if(!msg) return;
		if(!msg.cmdType) return;
		if(typeof this["" + msg.cmdType] != "function") return;
		this["" + msg.cmdType](msg);
    },
    clearMsg: function(){
		//保留9037的数据
		if(this.msgArr.length > 0){
			let newArr = [];
			for(let i = 0; i < this.msgArr.length; i++){
				let i_data = this.msgArr[i];
				if(!i_data.cmdType) continue;
				if(i_data.cmdType == "9037"){
					newArr.push(i_data);
				}
			}
			if(newArr.length > 0){
				this.msgArr = [];
				for(let k = 0; k < newArr.length; k++){
					if(!newArr[k]) continue;
					this.msgArr.push(newArr[k]);
				}
			}else{
				this.msgArr = [];
			}
		}
    },
    setGameType:function(type){
      	this.gameType = type;
    },
    setDataByKey: function(msg,str_key){
		if(!msg.datas) return;
		if(msg.datas.length == 0) return;
		if(this[str_key] == undefined) return;
		// cc.log("---setDataByKey---",msg.cmdType,str_key);
		let data;
		if(msg.datas.length == 1 || str_key == "enemyInfo" || str_key == "playerInfo"){
			if(msg.datas.length == 1){
				data = msg.datas[0];
			}else{
				// data = msg.datas[1];
				if(str_key == "playerInfo"){
					for(let p in msg.datas){
						if(msg.datas[p].userID == this.userInfo["userID"]) {
							data = msg.datas[p];
							break;
						}
					}
				}else{
					for(let p in msg.datas){
						if(msg.datas[p].userID == this.userInfo["userID"]) continue;
						data = msg.datas[p];
					}
				}
			}
			// cc.log("-----setDataByKey----",data);
			for(let key in data){
				if(typeof data[key] == "object"){
					this[str_key][key] = [];
					for(let k in data[key]){
						this[str_key][key].push(data[key][k]);
					}
				}else{
					this[str_key][key] = data[key];
				}
			}
		}else{
			this[str_key] = [];
			data = msg.datas;
			for(let i in data){
				let i_data = data[i];
				this[str_key][i] = {};
				for(let key in i_data){
					if(typeof i_data[key] == "object"){
						this[str_key][i][key] = [];
						for(let k in i_data[key]){
							this[str_key][i][key].push(i_data[key][k]);
						}
					}else{
						this[str_key][i][key] = i_data[key];
					}
				}
			}
		}
    },

    setAllPlayerInfo: function(data){
		console.log("setAllPlayerInfo: ",data);
		if(!data && data.deskSeatID == undefined) return;
		this.allPlayerInfos["" + data.deskSeatID] = {};
		for(let key in data){
			this.allPlayerInfos["" + data.deskSeatID][key] = data[key];
		}
		// console.log("allPlayerInfos: ",JSON.stringify(this.allPlayerInfos));
    },
    removePlayerInfo: function(data){
		if(!data && data.deskSeatID == undefined) return;
		this.allPlayerInfos["" + data.deskSeatID] = {};
    },
    clearAllPlayerInfo: function(){
		for(let key in this.allPlayerInfos){
			this.allPlayerInfos[key] = {};
		}
    },
	clear: function(){
			console.log("MSG clear...");
	},
};

module.exports = FC_MSG;