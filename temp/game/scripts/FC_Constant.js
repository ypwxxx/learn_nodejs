
//全局常量
var CST = {
    Player_Max_Num:4,       // 最大玩家数量
    Plane_Num:4,            // 每位玩家飞机数量
    Polygon_Num: 8,     // 多边形 边数
    Polygon_Long: 8,    // 长边 步数
    Polygon_Short: 5,   // 短边 步数
    Line_Num: 6,        // 直线 步数
    Stock_Lucky_Num: 6,
    Static_Time: 60,
    MapType:{
        Red: 0,
        Green: 1,
        Blue: 2,
        Yellow: 3,
    },
    PlayerType: {//玩家参数
        player_1: 0,
        player_2: 1,
        player_3: 2,
        player_4: 3,
    },
    PlayerName: {
        "0": "玩家1",
        "1": "玩家2",
        "2": "玩家3",
        "3": "玩家4",
    },
    CpName: {
        "0": "电脑1",
        "1": "电脑2",
        "2": "电脑3",
        "3": "电脑4",
    },
    CommandName:{
        "0": "红",
        "1": "黄",
        "2": "蓝",
        "3": "绿",
    },
    OpenType: {//玩家参数
        default: -1,
        player: 0,
        cpu: 1,
    },
    GAMETYPE: {
        pvp: 0,
        personToperson: 1,
    },
    GAMESTATE: {
        "hall": 0,
        "room": 1,
        "seat": 2,
    },
    HeadType: {//头像类型
        Red: 0,
        Yellow: 1,
        Blue: 2,
        Green: 3,
    },
    ActiveType: {   //飞机状态
        unActive: 0,
        Stand: 1,
        Fly: 2,
        Back: 3,
    },
    FlagIndex: {    //飞机场下标（原点和回归点标志）
        First: 0,
        Second: 1,
        Third:2,
        Fourth:3
   },
    FlyLineType: {  //航线类型
        Line_Airport: 0,
        Line_Start: 1,
        Line_Out: 2,
        Line_in: 3
    },
    PlaneDirection: {
        Up: 0,
        Right: 1,
        Down: 2,
        Left:3
    },
    FlyDirection: { //循环方向
        Clockwise: 0,
        Anti_Clockwise: 1,
    },
    Update_Command: { //刷新 指令
        Static: -1, //静止
        Ready: 0, //准备
        Start:  1, //开始游戏
        Stock: 2, //摇骰子
        PlaneFly: 3, //飞行
        Pause: 4, //暂停
    },
    Command_Tips: {
        "0":    "#获取先行机会",
        "1":    "请点击股子 \n 进行投掷",
        "2":    "请选择一枚 \n 可移动的棋子",
        "3":    "#方行棋",
        "4":    "轮到#方投掷",
        "5":    "#方投掷中",
        "6":    "无法起飞",
        "7":    "#方再投一次",
        "8":    "游戏结束",
        "9":    "系统检测连续三次幸运6 \n 遣返当前所有棋子",
        "10":   "游戏开始",
        "11":   "已超时*次，再超时\n &次将被移出游戏",
        "12":   "#方超时",
        "13":   "连接成功",
        "14":   "连接服务器失败，正在努力重连",
        "15":   "正在连接服务器...",
        "16":   "无法连接网络",
    },
    Plane_Active_Num: {
        "0": [2,4,6],
        "1": [5,6],
        "2": [6]
    },
    LuckyNumLimit: 3,

    moveDistime: 0.12,
    jumpDistime: 0.2,
};

module.exports = CST;