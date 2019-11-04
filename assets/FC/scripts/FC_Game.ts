import FC_GameData from "./FC_GameData";
import { PLANE_TYPE, GAME_BASE_DATA, FC_EVENT } from "./FC_Constant";
import FC_PlaneModel from "./FC_PlaneModel";
import { PlaneChesserObject } from "./FC_Interface";
import Comm_Model from "../../myCommon/script/Comm_Model";
import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import Comm_Binder from "../../myCommon/script/Comm_Binder";
import FC_Chess from "./FC_Chess";
import { NOTIFICATION } from "../../myCommon/script/Comm_Modules";

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

    // 飞机池
    private _planePool: cc.NodePool = null;
    // 飞机对象
    private _planesObj: PlaneChesserObject = {
        red: [],
        yellow: [],
        blue: [],
        green: [],
    };

    public onLoad(){

        // 初始化棋盘
        FC_Chess.getInstance().init();
        // 初始化飞机对象池
        let planesMax = GAME_BASE_DATA.player_max_count * GAME_BASE_DATA.player_chesser_count;
        for(let i = 0; i < planesMax; i++){
            let plane = cc.instantiate(this.planePrefab);
            this._planePool.put(plane);
        }
        // 初始化飞机 确认玩家人数及类型
        let info = FC_GameData.getInstance().getStartInfo();
        for(let i = 0; i < info.count; i++){
            if(info.types[i] === PLANE_TYPE.THE_RED){
                this._createChessers(info.types[i], this._planesObj.red);
            }else if(info.types[i] === PLANE_TYPE.THE_YELLOW){
                this._createChessers(info.types[i], this._planesObj.yellow);
            }else if(info.types[i] === PLANE_TYPE.THE_BLUE){
                this._createChessers(info.types[i], this._planesObj.blue);
            }else if(info.types[i] === PLANE_TYPE.THE_GREEN){
                this._createChessers(info.types[i], this._planesObj.green);
            }
        }


        // 接收玩家的骰子数
        // NOTIFICATION.on(FC_EVENT.PLAYER_DICE_NUM, this._checkDiceNum, this);
    };

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
            chesser.init(stopPoint);
        }
    };

    private _bindMC(m: Comm_Model, c: Comm_ContronllerComponent | cc.Node){
        Comm_Binder.getInstance().bindMC(m, c);
    };
}
