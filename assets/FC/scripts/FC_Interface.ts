import FC_ChessPoint from "./FC_ChessPoint";
import FC_PlaneModel from "./FC_PlaneModel";
import FC_PlayerModel from "./FC_PlayerModel";

// 接口


// 棋手类型棋点 基本
export interface PlayerTypeChessPointBase {
    red: FC_ChessPoint,
    yellow: FC_ChessPoint,
    blue: FC_ChessPoint,
    green: FC_ChessPoint
};

// 棋手类型棋点 数组
export interface PlayerTypeChessPointArray {
    red: FC_ChessPoint[],
    yellow: FC_ChessPoint[],
    blue: FC_ChessPoint[],
    green: FC_ChessPoint[]
};

// 飞机棋子对象类型
export interface PlaneChesserObject {
    red: FC_PlaneModel[],
    yellow: FC_PlaneModel[],
    blue: FC_PlaneModel[],
    green: FC_PlaneModel[]
};
// 玩家对象类型
export interface PlayerObject {
    red: FC_PlayerModel,
    yellow: FC_PlayerModel,
    blue: FC_PlayerModel,
    green: FC_PlayerModel
};