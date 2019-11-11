import FC_GameData from "./FC_GameData";
import { PLANE_TYPE, GAME_BASE_DATA, FC_EVENT, PLAYER_TYPE } from "./FC_Constant";
import FC_PlaneModel from "./FC_PlaneModel";
import { PlaneChesserObject, PlayerObject } from "./FC_Interface";
import Comm_Model from "../../myCommon/script/Comm_Model";
import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import Comm_Binder from "../../myCommon/script/Comm_Binder";
import FC_Chess from "./FC_Chess";
import { NOTIFICATION } from "../../myCommon/script/Comm_Modules";
import Comm_Log from "../../myCommon/script/Comm_Log";
import FC_PlayerModel from "./FC_PlayerModel";

/**
 * 游戏类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_Game extends cc.Component {

    @property(cc.Node)
    thePlayerRed: cc.Node = null;
    @property(cc.Node)
    thePlayerYellow: cc.Node = null;
    @property(cc.Node)
    thePlayerBlue: cc.Node = null;
    @property(cc.Node)
    thePlayerGreen: cc.Node = null;
    @property(cc.Prefab)
    planePrefab: cc.Prefab = null;
    @property(cc.Animation)
    crashFallAnim: cc.Animation = null;

    // 飞机池
    private _planePool: cc.NodePool = null;
    // 飞机对象
    private _planesObj: PlaneChesserObject = {
        red: [],
        yellow: [],
        blue: [],
        green: [],
    };
    // 回合数
    private _round: number[] = [0,0];
    // 玩家数
    private _playerCount: number = null;
    // 玩家对象
    private _playerObj: PlayerObject = {
        red: null,
        yellow: null,
        blue: null,
        green: null
    }

    public onLoad(){
        // 初始化棋盘
        FC_Chess.getInstance().init();
        // 初始化飞机对象池
        let planesMax = GAME_BASE_DATA.player_max_count * GAME_BASE_DATA.player_chesser_count;
        for(let i = 0; i < planesMax; i++){
            let plane = cc.instantiate(this.planePrefab);
            this._planePool.put(plane);
        }
        // 初始化飞机
        let info = FC_GameData.getInstance().getStartInfo();
        this._playerCount = info.count;
        for(let i = 0; i < info.count; i++){
            let planes = this._getPlanesByType(info.planeTypes[i]);
            this._createChessers(info.planeTypes[i], planes);
        }
        // 初始化玩家(玩家与控制的飞机固定,红-红,黄-黄...)
        // 红
        this._playerObj.red = new FC_PlayerModel();
        Comm_Binder.getInstance().bindMC(this._playerObj.red, this.thePlayerRed);
        this._playerObj.red.init(PLANE_TYPE.THE_RED);

        // 黄
        this._playerObj.yellow = new FC_PlayerModel();
        Comm_Binder.getInstance().bindMC(this._playerObj.yellow, this.thePlayerYellow);
        this._playerObj.yellow.init(PLANE_TYPE.THE_YELLOW);

        // 蓝
        this._playerObj.blue = new FC_PlayerModel();
        Comm_Binder.getInstance().bindMC(this._playerObj.blue, this.thePlayerBlue);
        this._playerObj.blue.init(PLANE_TYPE.THE_BLUE);

        // 绿
        this._playerObj.green = new FC_PlayerModel();
        Comm_Binder.getInstance().bindMC(this._playerObj.green, this.thePlayerGreen);
        this._playerObj.green.init(PLANE_TYPE.THE_GREEN);

        // 重置游戏
        this._resetGame();


        // 接收玩家的骰子数
        NOTIFICATION.on(FC_EVENT.PLAYER_DICE_NUM, this._checkDiceNum, this);
    };

    public start(){
        // 开始游戏, 检查是否为继续游戏


        // 回合开始
        this._startRound(this._round);
    };

    // 重置游戏
    private _resetGame(){
        // 重置游戏数据(不重置绑定器)
        this._round = [1,0];                    // 回合数

        // 重置用户数据


        // 重置飞机


        // 重置棋盘


        // 重置玩家

    };

    // 开始回合
    private _startRound(round: number[]){
        if(round[1] === this._playerCount){
            // 已完成一个回合
            round[0]++;         // 回合数加一
            round[1] = 0;       // 轮转归零
        }else{
            // 还未完成一个回合
            
        }
    };

    // 检查骰子
    private _checkDiceNum(num: number, player: FC_PlayerModel){
        let planeType = player.planeType;
        let playerType = player.playerType;
        let planes = this._getPlanesByType(planeType);

        // 检查是否是连续三个6 遣返所有棋子
        if(player.isThreeTimesDiceOfSix){
            for(let i = 0; i < planes.length; i++){
                if(!planes[i].inStopArea){
                    planes[i].backToStopArea();
                }
            }
        }

        // 检查是否可以起飞飞机
        let canLaunchPlane = false;
        let launchNum = FC_GameData.getInstance().launchPlaneNums;
        for(let i = 0; i < launchNum.length; i++){
            if(num === launchNum[i]){
                canLaunchPlane = true;
                break;
            }
        }

        // 在停驻区的飞机
        let inStopPlanes: FC_PlaneModel[] = [];
        // 在等待区的飞机
        let inWaitPlanes: FC_PlaneModel[] = [];
        // 在航线上的飞机
        let inRoutesPlanes: FC_PlaneModel[] = [];
        // 已经完成的飞机
        let hasFinishPlanes: FC_PlaneModel[] = [];

        // 检查所有飞机状态
        for(let i = 0; i < planes.length; i++){
            let plane = planes[i];
            if(plane.inStopArea){
                inStopPlanes.push(plane);
            }else if(plane.inWaitArea){
                inWaitPlanes.push(plane);
            }else if(plane.inRoutes){
                inRoutesPlanes.push(plane);
            }else if(plane.inEndArea){
                hasFinishPlanes.push(plane);
            }
        }
        // 检查检查的飞机状态是否正常
        if((inStopPlanes.length + inWaitPlanes.length + inRoutesPlanes.length + hasFinishPlanes.length) !== 4){
            // 所有状态的飞机之和应等于4
            Comm_Log.error('' + planeType + '飞机的状态之和不等于4!存在飞机处于多个不耦合状态!', `
                stop: ${inStopPlanes},wait: ${inWaitPlanes},inRout: ${inRoutesPlanes},finish: ${hasFinishPlanes}
            `);
            return;
        }

        // 判断玩家类型 如果是真人,只做等待操作,否则,走AI逻辑
        if(playerType === PLAYER_TYPE.ONLINE || playerType === PLAYER_TYPE.OFFLINE){
            // 线上或者线下的真人

            // 可起飞,并且存在停驻的飞机
            if(canLaunchPlane && inStopPlanes.length > 0){
                for(let i = 0; i < inStopPlanes.length; i++){
                    
                }
            }
            // 存在可以
        }else if(playerType === PLAYER_TYPE.AI){
            // AI

        }

    };

    /**
     * 获取planes
     * @param type 
     */
    private _getPlanesByType(type: PLANE_TYPE){
        let planes: FC_PlaneModel[];
        if(type === PLANE_TYPE.THE_RED){
            planes = this._planesObj.red;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            planes = this._planesObj.yellow;
        }else if(type === PLANE_TYPE.THE_BLUE){
            planes = this._planesObj.blue;
        }else if(type === PLANE_TYPE.THE_GREEN){
            planes = this._planesObj.green;
        }
        return planes;
    }

    /**
     * 创建棋子
     * @param type 类型
     */
    private _createChessers(type: PLANE_TYPE, group: FC_PlaneModel[]){
        for(let i = 0; i < 4; i++){
            // 新建飞机棋子
            let chesser = new FC_PlaneModel(type, i);
            group.push(chesser);
            // 绑定
            let planeContronller = this._planePool.get(this._planePool);
            this._bindMC(chesser, planeContronller);
            // 获取停驻点,进行初始化
            let stopPoint = FC_Chess.getInstance().getStopPoint(type, i);
            let waitPoint = FC_Chess.getInstance().getWaitPoint(type);
            chesser.init([stopPoint, waitPoint]);
        }
    };

    private _bindMC(m: Comm_Model, c: Comm_ContronllerComponent | cc.Node){
        Comm_Binder.getInstance().bindMC(m, c);
    };
}
