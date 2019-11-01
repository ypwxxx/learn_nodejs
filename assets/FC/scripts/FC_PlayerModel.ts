/**
 * 玩家类模块
 * 记录玩家的相关数据,控制飞机棋子的运行
 */
import { PLAYER_TYPE, PLANE_TYPE } from "./FC_Constant";
import FC_PlaneModel from "./FC_PlaneModel";
import Comm_Model from "../../myCommon/script/Comm_Model";

export default class FC_PlayerModel extends Comm_Model{
    public constructor() {
        super();
    };

    // 玩家名
    private _playerName: String = null;
    // 玩家头像
    private _playerIcon: any = null;
    // 骰子点数
    private _dicePoint: Number = null;
    // 排名
    private _playerRank: Number = null;
    // 玩家类型
    private _playerType: PLAYER_TYPE = null;
    // 飞机类型
    private _planeType: PLANE_TYPE = null;
    // 飞机
    private _planes: FC_PlaneModel[] = null;

    
}
