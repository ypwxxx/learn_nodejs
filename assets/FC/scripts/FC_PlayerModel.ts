/**
 * 玩家类模块
 * 记录玩家的相关数据,控制飞机棋子的运行
 */
import { PLAYER_TYPE, PLANE_TYPE, UI_TYPE } from "./FC_Constant";
import Comm_Model from "../../myCommon/script/Comm_Model";
import FC_GameData from "./FC_GameData";

export default class FC_PlayerModel extends Comm_Model{
    public constructor() {
        super();
    };

    // 玩家名
    private _playerName: string = null;
    // 玩家头像
    private _playerIcon: string = null;
    // 序号
    private _index: number = null;
    // 排名
    private _playerRank: number = null;
    // 骰子结果
    private _diceResults: number[] = null;
    // 玩家类型
    public playerType: PLAYER_TYPE = null;
    // 控制的飞机类型
    public planeType: PLANE_TYPE = null;
    // 是否激活
    public active: boolean = null;
    // UI类型
    public UIType: UI_TYPE = null;

    // 初始化(所控制的飞机类型)
    public init(plane: PLANE_TYPE){
        this.planeType = plane;

        this._playerRank = -1;          // 无排名
        this._diceResults = [];         // 骰子结果
    };

    // 重置(只重置头像/玩家类型/次序...)
    public reset(){
        let playerType = FC_GameData.getInstance().getPlayerType(this.planeType);
        this.playerType = playerType;

        this.active = true;
        if(playerType === PLAYER_TYPE.AI){
            this._playerName = "电脑" + this._index;
        }else if(playerType === PLAYER_TYPE.OFFLINE){
            this._playerName = "玩家" + this._index;
        }else if(playerType === PLAYER_TYPE.ONLINE){
            this._playerName = "";
        }else if(playerType === PLAYER_TYPE.NONE){
            this._playerName = "";
            this.active = false;
        }
    };

    // 是否是连续三次六号骰子
    public get isThreeTimesDiceOfSix(): boolean{
        let results = true;
        if(this._diceResults.length < 3){
            results = false;
        }else{
            for(let i = 0; i < this._diceResults.length; i++){
                if(this._diceResults[i] !== 6){
                    results = false;
                }
            }
        }
        return results;
    };
}
