
var DataStruct = new Array();

DataStruct["data_head"] = {
  iRoomID: {'type': 'INT32'},
  iDeskID: {'type': 'INT32'},
  iUserID: {'type': 'INT32'},
};

//心跳
DataStruct["0xb070"]  = {
  'req': {

  },
  'resp': {

  },
};
// 0xb010 登录
DataStruct["0xb010"] = {
  'req':{
    gameID:           {'type': 'INT32'},
    logon_type:       {'type': 'INT32'},
    register_type:    {'type': 'INT32'},
    user_name:        {'type': 'STRING', 'length':64},
    md5_pwd:          {'type': 'STRING', 'length':50},
    hard_id:          {'type': 'STRING', 'length':50},
    client_type:      {'type': 'STRING', 'length':1},
    app_version:      {'type': 'STRING', 'length':32},
    app_name:         {'type': 'STRING', 'length':64},
    isBreadDev:       {'type':'INT32'},
    data:             {'type':'UINT32_ARRAY','length':128}
  },
  'resp': {
  
  }
};
// 0xb011 登录 成功
DataStruct["0xb011"] = {
  'req': {
    
  },
  "resp": {
    userID:           {'type': 'INT32'},
    nick_name:        {'type': 'STRING', 'length':64},
    sex:              {'type': 'BOOL'},
    user_name:        {'type': 'STRING', 'length':64},
    experience:       {'type': 'INT64'},
    gold:             {'type': 'INT64'},
    diamond:          {'type': 'INT64'},
    qq_number:        {'type': 'STRING', 'length':64},
    id_audite:        {'type': 'INT32'},
    vip_state:        {'type': 'INT32'},
    vip_give_gold:    {'type': 'INT32'},
    serverQQ:         {'type': 'STRING', 'length':24},
    data:             {'type':'UINT32_ARRAY','length':128}
  }
};

//0xb014 登陆失败
DataStruct["0xb014"] = {
  'req': {
  },
  "resp": {
  }
};
// 0xa010 修改QQ userInfo
DataStruct["0xa010"] = {
  'req': {
    userID:         {'type': 'INT32'},
    qq_number:      {'type': 'STRING', 'length':64},
    sex:            {'type': 'BOOL'},
    nick_name:      {'type': 'STRING', 'length':64},
    image_url:      {'type': 'STRING', 'length':128},
    province:       {'type': 'STRING', 'length':64},
    city:           {'type': 'STRING', 'length':64},
    data:           {'type': 'UINT32_ARRAY','length':64}
  },
  "resp": {
  }
};
// 0xa029 游戏准备
DataStruct["0xa029"] = {
  'req': {
    iRoomID:          {'type': 'INT32' },
    iUserID:          {'type': 'INT32' },
  },
  'resp': {
    
  }
};

//0xa030 寻找房间
DataStruct["0xa030"] = {
  'req': {
    game_id:       {'type': 'INT32'},
    user_id:       {'type': 'INT32'},
    data:          {'type': 'UINT32_ARRAY','length':12},
  },
  'resp': {
    game_id:          {'type': 'INT32' },
    room_id:          {'type': 'INT32' },
    room_type:        {'type': 'INT32' },
    room_jetton_type: {'type': 'INT32' },
    online_people:    {'type': 'INT32' },
    base_point:       {'type': 'INT32' },
    min_jetton:       {'type': 'INT32' },
    max_jetton:       {'type': 'INT32' },
    room_rule:        {'type': 'INT32' },
    sortID:           {'type': 'INT32' },
    tablecharge:      {'type': 'INT32' },
    show_ad:          {'type': 'BOOL' },
    data:             {'type': 'UINT32_ARRAY','length':64},
  }
};
//0xa031 寻找房间结果
DataStruct["0xa031"] = {
  'req': {

  },
  'resp': {
    game_id:          {'type': 'INT32' },
    room_id:          {'type': 'INT32' },
    room_type:        {'type': 'INT32' },
    room_jetton_type: {'type': 'INT32' },
    online_people:    {'type': 'INT32' },
    base_point:       {'type': 'INT32' },
    min_jetton:       {'type': 'INT32' },
    max_jetton:       {'type': 'INT32' },
    room_rule:        {'type': 'INT32' },
    sortID:           {'type': 'INT32' },
    tablecharge:      {'type': 'INT32' },
    show_ad:          {'type': 'BOOL' },
    data:             {'type': 'UINT32_ARRAY','length':64},
  }
};

//0xa040 选择房间
DataStruct["0xa040"] = {
  'req': {
    room_id:          {'type': 'INT32' },
    user_id:          {'type': 'INT32' },
    data:             {'type': 'UINT32_ARRAY','length':12},
  },
  'resp': {
    
  }
};
//0xa041 成功进入房间
DataStruct["0xa041"] = {
  'req': {
    
  },
  'resp': {
    userID:           {'type': 'INT32' },
    game_id:          {'type': 'INT32' },
    experience:       {'type': 'INT64' },
    gold:             {'type': 'INT64' },
    diamond:          {'type': 'INT64' },
    win:              {'type': 'INT32' },
    lost:             {'type': 'INT32' },
    escape:           {'type': 'INT32' },
    drawn_game:       {'type': 'INT32' },
    max_experience:   {'type': 'INT64' },
    data:             {'type': 'UINT32_ARRAY','length':22},
  }
};

//0xc011   //所有游戏的相关信息,战绩
DataStruct["0xa020"] = {
  'req': {
    userId:           {'type': 'INT32' },
    data:             {'type': 'UINT32_ARRAY','length':12},
  },
  'resp': {
  }
};

// 0xc012;    //所有游戏的相关信息,战绩结果
DataStruct["0xa021"] = {
  'req': {
    
  },
  'resp': {
    userID:           {'type': 'INT32' },
    game_id:          {'type': 'INT32' },
    experience:       {'type': 'INT64' },
    gold:             {'type': 'INT64' },
    diamond:          {'type': 'INT64' },
    win:              {'type': 'INT32' },
    lost:             {'type': 'INT32' },
    escape:           {'type': 'INT32' },
    drawn_game:       {'type': 'INT32' },
    max_experience:   {'type': 'INT64' },
    data:             {'type': 'UINT32_ARRAY','length':22},
  }
};

// 0xb080 客户端寻求同步状态
DataStruct["0xb080"] = {
  'req': {
    user_id:          {'type': 'INT32' },
    data:             {'type': 'UINT32_ARRAY','length':12}
  },
  'resp': {

  },
};

// 0xb081 客户端寻求同步状态
DataStruct["0xb081"] = {
  'req': {
    
  },
  'resp': {
    user_id:          {'type': 'INT32' },
    game_id:          {'type': 'INT32' },
    room_id:          {'type': 'INT32' },
    state:            {'type': 'INT32' },
    data:             {'type': 'UINT32_ARRAY','length':24}
  },
};

//0x4010 玩家坐下
DataStruct["0x4010"] = {
  'req': {

  },
  'resp': {
    userID:           {'type': 'INT32' },
    game_id:          {'type': 'INT32' },
    point:            {'type': 'INT64' },
    winCount:         {'type': 'INT32' },
    lostCount:        {'type': 'INT32' },
    cutCount:         {'type': 'INT32' },
    midCount:         {'type': 'INT32' },
    deskID:           {'type': 'INT32' },
    deskSeatID:       {'type': 'INT32' },
    gold:             {'type': 'INT64' },
    diamond:          {'type': 'INT64' },
    boy:              {'type': 'BOOL' },
    nickName:         {'type': 'STRING', 'length':64},
    logo_url:         {'type': 'STRING', 'length':128},
    vip_state:        {'type': 'INT32' },
    touxiangkuangID:  {'type': 'INT32' },
    max_experience:   {'type': 'INT64' },
    data:             {'type': 'UINT32_ARRAY','length':24},
  }
};
//0x4011 匹配桌子上其他玩家的信息（服务器发过来 两个人的数据）
DataStruct["0x4011"] = {
  'req': {

  },
  'resp': {
    userID:           {'type': 'INT32' },
    game_id:          {'type': 'INT32' },
    point:            {'type': 'INT64' },
    winCount:         {'type': 'INT32' },
    lostCount:        {'type': 'INT32' },
    cutCount:         {'type': 'INT32' },
    midCount:         {'type': 'INT32' },
    deskID:           {'type': 'INT32' },
    deskSeatID:       {'type': 'INT32' },
    gold:             {'type': 'INT64' },
    diamond:          {'type': 'INT64' },
    boy:              {'type': 'BOOL' },
    nickName:         {'type': 'STRING', 'length':64},
    logo_url:         {'type': 'STRING', 'length':128},
    vip_state:        {'type': 'INT32' },
    touxiangkuangID:  {'type': 'INT32' },
    max_experience:   {'type': 'INT64' },
    data:             {'type': 'UINT32_ARRAY','length':24},
  }
};

//0x4020 玩家离开
DataStruct["0x4020"] = {
  'req': {
    user_id:          {'type': 'INT32' },
    room_id:          {'type': 'INT32' },
    desk_id:          {'type': 'INT32' },
    data:             {'type': 'UINT32_ARRAY','length':20},
  },
  'resp': {
    
  }
};

//0x4021 有玩家准备
DataStruct["0x4021_struct"] = {
  user_id:          {'type': 'INT32'},
  desk_id:          {'type': 'INT32'},
  seat_id:          {'type': 'INT32'},
  prepare:          {'type': 'BOOL'},
  data:             {'type': 'UINT32_ARRAY','length':20},
};
DataStruct["0x4021"] = {
'req': {
  'DONT_FILL_PLACE':  true,
  "data_head":        {'type': 'STRUCT','structName': 'data_head'},
  "data_main":             {'type': 'STRUCT','structName': '0x4021_struct'},
},
'resp': {
  user_id:          {'type': 'INT32' },
  deskSeatID:       {'type': 'INT32' },
  type:             {'type': 'INT32' },
  data:             {'type': 'UINT32_ARRAY','length':23},
}
};

//对手掉线
DataStruct["0x4030"] = {
  'req': {
    
  },
  'resp': {
    user_id:        {'type': 'INT32'},
    deskSeatID:     {'type': 'INT32'},
    type:           {'type': 'INT32'},
    data:           {'type': 'INT32_ARRAY','length':23},
  }
};

//0x4031 对手离开 重新进入游戏
DataStruct["0x4031"] = {
  'req': {
    
  },
  'resp': {
    user_id:        {'type': 'INT32'},
    deskSeatID:     {'type': 'INT32'},
    type:           {'type': 'INT32'},
    data:           {'type': 'INT32_ARRAY','length':23},
  }
};


//0x9023 开始游戏
DataStruct["0x9023"] = {
  'req': {
    
  },
  'resp': {
    playerNum:        {'type': 'INT8'},
    playerColor:      {'type': 'UINT8_ARRAY','length': 4},
    playerUsePiece:   {'type': 'UINT32_ARRAY','length': 4},
    playerUseHead:    {'type': 'UINT32_ARRAY','length': 4},
    playerUseFrame:   {'type': 'UINT32_ARRAY','length': 4},
    playerUseDice:    {'type': 'UINT32_ARRAY','length': 4},
    ticketGold:       {'type': 'INT32'},
    data:             {'type': 'UINT8_ARRAY','length':12}
  },
};

//0x9025 通知玩家落子
DataStruct["0x9025"] = {
  'req': {

  },
  'resp': {
    color:          {'type': "INT8"},
    diceCount:      {'type': "INT8"},
    secondTime:     {'type': "INT8"},
    data:           {'type': 'INT32_ARRAY','length':20},
  }
};

//0x9026 玩家开始走子 发送
DataStruct["0x9026_struct"] = {
  planeTag:       {'type': "INT8"},
  actionTag:      {'type': "INT8"},
  data:           {'type': 'INT32_ARRAY','length':12},
};
DataStruct["0x9026"] = {
  'req': {
    'DONT_FILL_PLACE':  true,
    "data_head":        {'type': 'STRUCT','structName': 'data_head'},
    "data_main":        {'type': 'STRUCT','structName': '0x9026_struct'},
  },
  'resp': {
    
  }
};
//0x9027 玩家开始走子结果
//pos:            {'type': 'INT8' },
//mapPos:         {'type': 'INT8' },

//data:           {'type': 'INT32_ARRAY','length':12},
DataStruct["0x9027"] = {
  'req': {
  },
  'resp': {
    color:          {'type': "INT8"},
    planeTag:       {'type': "INT8"},
    actionTag:      {'type': "INT8"},
    goldChange:     {'type': 'INT32_ARRAY','length':4},
    diceCount:      {'type': "INT8"},
    pos:            {'type': 'INT8' },
    mapPos:         {'type': 'INT8' },
    data:           {'type': 'INT8_ARRAY','length':46},
  }
};

//0x9028 玩家自己行动结束
DataStruct["0x9028_struct"] = {

};
DataStruct["0x9028"] = {
  'req': {
    'DONT_FILL_PLACE':  true,
    "data_head":        {'type': 'STRUCT','structName': 'data_head'},
    "data_main":        {'type': 'STRUCT','structName': '0x9028_struct'},
  },
  'resp': {
  }
};

//0x9029 摇筛子
DataStruct["0x9029_struct"] = {
  
};
DataStruct["0x9029"] = {
  'req': {
    'DONT_FILL_PLACE':  true,
    "data_head":        {'type': 'STRUCT','structName': 'data_head'},
    "data_main":        {'type': 'STRUCT','structName': '0x9029_struct'},
  },
  'resp': {
    
  }
};

//0x9037 玩家结束
DataStruct["0x9037"] = {
  'req': {

  },
  'resp': {
    experience:       {'type': "INT64_ARRAY",'length': 4},
    gold:             {'type': "INT64_ARRAY",'length': 4},
    diamond:          {'type': "INT64_ARRAY",'length': 4},
    overType:         {'type': 'INT32' },
    result:           {'type': 'INT32' },
    overUserColor:    {'type': 'INT32' },
    rank:             {'type': 'INT32_ARRAY','length':4},
    data:             {'type': 'INT32_ARRAY','length':20},
  }
};


//0x9042 再来一局
DataStruct["0x9042_struct"] = {
    
};
DataStruct["0x9042"] = {
  'req': {
    'DONT_FILL_PLACE':  true,
    "data_head":        {'type': 'STRUCT','structName': 'data_head'},
    "data_main":        {'type': 'STRUCT','structName': '0x9042_struct'},
  },
  'resp': {
    iUserID:           {'type': 'INT32' },
    deskCount:         {'type': 'INT32' },
    data:              {'type': 'INT32_ARRAY','length':12},
  } 
};

//0x9045 走棋超时
DataStruct["0x9045"] = {
  'req': {
    
  },
  'resp': {
    color:            {'type': 'INT8' },
    diceCount:        {'type': 'INT8' },
    secondTime:       {'type': 'INT8' },
    outPlayerColor:   {'type': 'INT8' },
    data:             {'type': 'UINT32_ARRAY','length':20}
  },
};

//0x9050 重连
DataStruct["0x9050"] = {
  'req': {

  },
  'resp': {
    gameStation:      {'type': 'INT32' },
    data1:            {'type': 'UINT32_ARRAY','length':23},
    playerNum:        {'type': 'INT8'},
    playerColor:      {'type': 'UINT8_ARRAY','length': 4},
    playerUseHead:    {'type': 'UINT8_ARRAY','length': 4},
    planePos:         {'type': 'UINT8_ARRAY','length': 16},
    leftSecond:       {'type': 'INT8'},
    timeOutTimes:     {'type': 'UINT8_ARRAY','length': 4},
    strikeNum:        {'type': 'UINT8_ARRAY','length': 4},
    playerRank:       {'type': 'UINT8_ARRAY','length': 4},
    playerUsePiece:   {'type': 'UINT32_ARRAY','length': 4},
    playerUseFrame:   {'type': 'UINT32_ARRAY','length': 4},
    playerUseDice:    {'type': 'UINT32_ARRAY','length': 4},
    data:             {'type': 'UINT32_ARRAY','length':24}
  }
};

//0x9060 所有玩家头像
DataStruct["0x9060"] = {
  'req': {
    
  },
  'resp': {
    userID:           {'type': 'INT32' },
    useHeadType:      {'type': 'INT32' },
    useFrameType:     {'type': 'INT32' },
    useDiceType:      {'type': 'INT32' },
    data:             {'type': 'UINT32_ARRAY','length':12}
  },
};

//0x9061 所有玩家头像
DataStruct["0x9061"] = {
  'req': {
    
  },
  'resp': {
    useHeadType:      {'type': 'UINT8_ARRAY','length':4},
    useHeadFrame:     {'type': 'UINT8_ARRAY','length':4},
    playerUserID:     {'type': 'UINT32_ARRAY','length':4},
    data:             {'type': 'UINT8_ARRAY','length':12}
  },
};

var MsgTypeDefine = {
  //大版本号
  getBigVer: function(){
    return 100;
    },
  //小版本号
  getLittleVer:function(){
    return 0;
  },
  //结构体定义
  getDataStruct:function(){
    return DataStruct;
  },
  //心跳
  getHeartBeatCode:function(){
    return '0xb070';
  }
}
//0xc005 0xb070
module.exports = MsgTypeDefine;
